from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="CLEAR Climate OS API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)

class NotesPayload(BaseModel):
    notes: str

class ExtractedEvidence(BaseModel):
    id: str
    type: str  # e.g., 'meeting_note', 'activity_update', 'risk'
    content: str
    source_reference: str

class EvidencePayload(BaseModel):
    evidence_ids: List[str]

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

@app.post("/extract_evidence", response_model=List[ExtractedEvidence])
async def extract_evidence(payload: NotesPayload):
    # Mock AI logic to extract structured evidence from notes
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    # Simple mock response
    return [
        ExtractedEvidence(
            id="ev-1",
            type="meeting_note",
            content="Discussed the new solar panel installation timeline.",
            source_reference="Meeting on Oct 24"
        ),
        ExtractedEvidence(
            id="ev-2",
            type="risk",
            content="Supply chain delays for batteries.",
            source_reference="Meeting on Oct 24"
        )
    ]

@app.post("/generate_report", response_model=ReportDraft)
async def generate_report(payload: EvidencePayload):
    # Mock AI logic to generate report from approved evidence
    if not payload.evidence_ids:
        raise HTTPException(status_code=400, detail="No evidence provided for report generation")

    return ReportDraft(
        title="Draft Donor Report Q3",
        body="This period, we advanced the solar panel installation despite supply chain delays for batteries."
    )

@app.post("/qa_review", response_model=QAReview)
async def qa_review(payload: ReportPayload):
    # Mock QA review logic
    if not payload.report_content:
         raise HTTPException(status_code=400, detail="Report content cannot be empty")

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
