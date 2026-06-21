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

class TOCContext(BaseModel):
    notes: str

class TOCItem(BaseModel):
    category: str # 'input', 'activity', 'output', 'outcome', 'impact'
    description: str

class TOCDraft(BaseModel):
    items: List[TOCItem]

class SystemsContext(BaseModel):
    notes: str

class SystemVariable(BaseModel):
    name: str
    description: str

class SystemLink(BaseModel):
    source: str
    target: str
    effect: str # 'positive', 'negative'
    description: str

class SystemsDraft(BaseModel):
    variables: List[SystemVariable]
    links: List[SystemLink]

class Stakeholder(BaseModel):
    name: str
    role: str
    influence: str # 'high', 'medium', 'low'
    interest: str # 'high', 'medium', 'low'

class StakeholderDraft(BaseModel):
    stakeholders: List[Stakeholder]

class ResourceItem(BaseModel):
    name: str
    category: str # 'financial', 'human', 'material', 'time'
    status: str # 'secured', 'needed', 'at_risk'
    description: str

class ResourceDraft(BaseModel):
    resources: List[ResourceItem]

class RiskItem(BaseModel):
    name: str
    impact: str # 'high', 'medium', 'low'
    likelihood: str # 'high', 'medium', 'low'
    mitigation: str

class RiskDraft(BaseModel):
    risks: List[RiskItem]

class ActionItem(BaseModel):
    task: str
    owner: str
    deadline: str
    priority: str # 'high', 'medium', 'low'

class ActionItemDraft(BaseModel):
    actions: List[ActionItem]

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

@app.post("/generate_toc", response_model=TOCDraft)
async def generate_toc(payload: TOCContext):
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant mapping project inputs into a Theory of Change (ToC). Categorize elements into 'input', 'activity', 'output', 'outcome', and 'impact'. Do not invent facts."},
                    {"role": "user", "content": f"Context:\n{payload.notes}"}
                ],
                response_format=TOCDraft,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI ToC generation failed: {e}")
            # Fall through to mock logic on error

    return TOCDraft(
        items=[
            TOCItem(category="input", description="Funding for solar panels"),
            TOCItem(category="activity", description="Install 500kW solar capacity"),
            TOCItem(category="output", description="500kW of solar power installed and operational"),
            TOCItem(category="outcome", description="Reduced reliance on fossil fuel grids for local community"),
            TOCItem(category="impact", description="Lower carbon emissions and increased energy resilience")
        ]
    )

@app.post("/generate_systems_map", response_model=SystemsDraft)
async def generate_systems_map(payload: SystemsContext):
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an assistant specialized in systems thinking. Extract key variables and causal relationships (positive or negative links) from the context. Build a causal loop diagram draft."},
                    {"role": "user", "content": f"Context:\n{payload.notes}"}
                ],
                response_format=SystemsDraft,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI Systems Map generation failed: {e}")
            # Fall through to mock logic on error

    return SystemsDraft(
        variables=[
            SystemVariable(name="Solar Adoption", description="Adoption rate of solar technology"),
            SystemVariable(name="Energy Costs", description="Cost of electricity for the community")
        ],
        links=[
            SystemLink(source="Solar Adoption", target="Energy Costs", effect="negative", description="Higher adoption reduces energy costs over time")
        ]
    )

@app.post("/generate_stakeholders", response_model=StakeholderDraft)
async def generate_stakeholders(payload: NotesPayload):
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant mapping stakeholders from project inputs. Identify key stakeholders, their roles, and classify their influence and interest as 'high', 'medium', or 'low'."},
                    {"role": "user", "content": f"Context:\n{payload.notes}"}
                ],
                response_format=StakeholderDraft,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI Stakeholder generation failed: {e}")
            # Fall through to mock logic on error

    return StakeholderDraft(
        stakeholders=[
            Stakeholder(name="Local Government", role="Regulator and approver", influence="high", interest="medium"),
            Stakeholder(name="Community Members", role="Beneficiaries", influence="medium", interest="high")
        ]
    )

@app.post("/generate_resources", response_model=ResourceDraft)
async def generate_resources(payload: NotesPayload):
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an assistant tracking resources. Identify resource needs from the context, categorize them ('financial', 'human', 'material', 'time'), and specify their status ('secured', 'needed', 'at_risk')."},
                    {"role": "user", "content": f"Context:\n{payload.notes}"}
                ],
                response_format=ResourceDraft,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI Resource generation failed: {e}")
            # Fall through to mock logic on error

    return ResourceDraft(
        resources=[
            ResourceItem(name="$50k Grant", category="financial", status="secured", description="Initial funding for the solar project"),
            ResourceItem(name="Solar Panels", category="material", status="at_risk", description="Supply chain delays affecting delivery")
        ]
    )

@app.post("/generate_risks", response_model=RiskDraft)
async def generate_risks(payload: NotesPayload):
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant mapping project risks. Extract key risks from the context, categorize their impact and likelihood ('high', 'medium', 'low'), and propose a brief mitigation strategy."},
                    {"role": "user", "content": f"Context:\n{payload.notes}"}
                ],
                response_format=RiskDraft,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI Risk generation failed: {e}")
            # Fall through to mock logic on error

    return RiskDraft(
        risks=[
            RiskItem(name="Supply Chain Delay", impact="high", likelihood="high", mitigation="Diversify battery suppliers immediately."),
            RiskItem(name="Community Opposition", impact="medium", likelihood="low", mitigation="Hold town hall meetings to address concerns transparently.")
        ]
    )

@app.post("/generate_action_items", response_model=ActionItemDraft)
async def generate_action_items(payload: NotesPayload):
    if not payload.notes:
        raise HTTPException(status_code=400, detail="Notes cannot be empty")

    if os.getenv("OPENAI_API_KEY"):
        try:
            completion = await client.beta.chat.completions.parse(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant mapping project action items. Extract explicit tasks, assign an owner if implied (or 'Unassigned'), identify deadlines, and categorize priority ('high', 'medium', 'low')."},
                    {"role": "user", "content": f"Context:\n{payload.notes}"}
                ],
                response_format=ActionItemDraft,
            )
            return completion.choices[0].message.parsed
        except Exception as e:
            print(f"OpenAI Action Items generation failed: {e}")
            # Fall through to mock logic on error

    return ActionItemDraft(
        actions=[
            ActionItem(task="Finalize budget approval", owner="Finance Team", deadline="Next Friday", priority="high"),
            ActionItem(task="Schedule community outreach", owner="PR Manager", deadline="End of month", priority="medium")
        ]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
