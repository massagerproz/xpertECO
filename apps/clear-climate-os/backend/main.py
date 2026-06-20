from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

app = FastAPI(title="CLEAR Climate OS API", version="0.1.0")

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", "dummy-key"))

app = FastAPI(title="CLEAR Climate OS API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)

class NotesPayload(BaseModel):
    notes: str
    source_type: str = "meeting_note"

class ExtractedEvidence(BaseModel):
    id: str
    type: str  # 'activity_update', 'stakeholder_input', 'risk', 'decision', 'follow_up_action'
    content: str
    source_reference: str

class EvidencePayload(BaseModel):
    evidence_items: List[dict]

class ReportDraft(BaseModel):
    title: str
    body: str

class ReportPayload(BaseModel):
    report_content: str

class QAReviewItem(BaseModel):
    issue_type: str # e.g., 'unsupported_claim', 'weak_linkage', 'missing_evidence', 'overclaiming'
    description: str

class QAReview(BaseModel):
    flags: List[QAReviewItem]

class ExtractedEvidenceList(BaseModel):
    items: List[ExtractedEvidence]

@app.post("/extract_evidence", response_model=List[ExtractedEvidence])
async def extract_evidence(payload: NotesPayload):
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant extracting structured evidence from project inputs. Categorize evidence strictly into one of these types: 'activity_update', 'stakeholder_input', 'risk', 'decision', or 'follow_up_action'. Generate a unique id starting with 'ev-' for each, and a short source_reference summary."},
                    {"role": "user", "content": f"Source Type: {payload.source_type}\n\nContent:\n{payload.notes}"}
                ],
                response_format=ExtractedEvidenceList,
            )
            return completion.choices[0].message.parsed.items
        except Exception as e:
            print(f"OpenAI extraction failed: {e}")
            # Fall through to mock logic on error

    # Simple mock response fallback
    return [
        ExtractedEvidence(
            id=f"ev-{uuid.uuid4().hex[:8]}",
            type="decision",
            content="Approved the revised solar panel installation timeline.",
            source_reference=payload.source_type
        ),
        ExtractedEvidence(
            id=f"ev-{uuid.uuid4().hex[:8]}",
            type="risk",
            content="Supply chain delays for batteries continue to pose a threat to Q4 delivery.",
            source_reference=payload.source_type
        )
    ]

@app.post("/generate_report", response_model=ReportDraft)
async def generate_report(payload: EvidencePayload):
    if not payload.evidence_items:
        raise HTTPException(status_code=400, detail="No evidence provided for report generation")

    if os.getenv("OPENAI_API_KEY"):
        try:
            evidence_str = "\n".join([f"- [{item.get('type', 'info')}] {item.get('content', '')}" for item in payload.evidence_items])
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are generating a donor report draft based ONLY on the provided approved evidence. Do not invent facts. Write a professional, concise summary."},
                    {"role": "user", "content": f"Evidence:\n{evidence_str}"}
                ],
                response_format=ReportDraft,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI report generation failed: {e}")
            # Fall through to mock logic on error

    return ReportDraft(
        title="Draft Donor Report Q3",
        body="This period, we advanced the solar panel installation despite supply chain delays for batteries."
    )

@app.post("/qa_review", response_model=QAReview)
async def qa_review(payload: ReportPayload):
    if not payload.report_content:
         raise HTTPException(status_code=400, detail="Report content cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a QA reviewer for a climate NGO report. Identify any issues like 'unsupported_claim', 'weak_linkage', 'missing_evidence', or 'overclaiming'. Only flag actual problems."},
                    {"role": "user", "content": payload.report_content}
                ],
                response_format=QAReview,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI QA review failed: {e}")
            # Fall through to mock logic on error

    return QAReview(
        flags=[
             QAReviewItem(
                 issue_type="weak_linkage",
                 description="The claim about battery delays needs more direct evidence from supplier communications."
             )
        ]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
