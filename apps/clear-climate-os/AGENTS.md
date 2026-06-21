# AGENTS Guide for CLEAR Climate Copilot / OS

This document outlines the rules and conventions for developing within the isolated `apps/clear-climate-os` module.

## Core Purpose

The CLEAR Climate OS converts scattered project information (meeting notes, activity updates, etc.) into structured reporting evidence for climate, ESG, conservation, NGO, and donor-funded project teams. AI outputs must always be treated as drafts requiring human approval. Do not invent facts in generated reports.

## Architecture & Tech Stack

This module uses an **Agent-Worker Hybrid Architecture** isolated from the core Xpert AI upstream system.

*   **Backend (`apps/clear-climate-os/backend`)**: Python FastAPI.
    *   Used for heavier agent-worker logic (AI extraction, report generation, QA reviews).
    *   **Rule**: Always use `pydantic` for request/response schema validation.
    *   **Rule**: Mock/draft AI logic should be kept lightweight and well-typed.

*   **Frontend (`apps/clear-climate-os/frontend`)**: React + TypeScript + Vite.
    *   **Rule**: Use `zod` for any client-side schema validation (if needed beyond Convex).
    *   **Rule**: Prefer Tailwind utility classes directly on HTML elements.
    *   **Rule**: Use `framer-motion` for complex UI micro-interactions, layout transitions (`<motion.div layout>`), and staggered list reveals (`<AnimatePresence>`).
    *   **Rule**: The UI implements a Glassmorphism rendering pipeline. Use `.glass-panel` and `.glass-header` utility classes (defined in `index.css`) rather than solid background colors where possible.

*   **State Management (`apps/clear-climate-os/frontend/convex`)**: Convex.
    *   Used for real-time workflow state (notes, evidence tracking, report drafting, QA flags, theory of change items, systems thinking variables/links, stakeholders, resources, risks, and action items).
    *   **Rule**: Human approval is strictly required before extracted evidence is fully committed to the tracker.
    *   **Rule**: Always define strong `v.*` schemas for tables.
    *   **Rule**: Note schemas use `sourceType` (e.g., `meeting_note`, `activity_update`, `stakeholder_input`, `field_report`).

## Features
- **Evidence Extraction**: Automatically extract evidence strings categorizing them into risks, decisions, etc., from unstructured notes.
- **Report Generation**: Synthesize a donor-funded project report based solely on approved evidence items.
- **QA Reviews**: Automated AI check on generated reports to flag unsupported claims or weak linkages.
- **Theory of Change**: Map unstructured inputs and project notes into categorized components: `input`, `activity`, `output`, `outcome`, and `impact`.
- **Systems Thinking**: Automatically generate draft causal loops, extracting variables and establishing positive/negative causal links between them.
- **Stakeholder Mapping**: Extract key project stakeholders, their roles, and classify their influence and interest (high, medium, low).
- **Resource Tracker**: Identify financial, human, and material resource needs and their statuses (secured, needed, at risk) from context.
- **Risk Assessment**: Map identified project risks, classify impact and likelihood, and provide actionable mitigation strategies.
- **Action Items**: Extract actionable tasks, map responsible owners, define strict deadlines, and assign prioritization levels (high, medium, low).

## Deployment & Routing
- When deploying to **Vercel** or any SPA host, ensure the `vercel.json` contains routing fallback rules (`"source": "/(.*)", "destination": "/index.html"`) so that direct links to routes do not return 404s.

## Testing Requirements
*   **Backend**: Execute `pytest test_main.py` in the backend directory to verify endpoint logic.
*   **Frontend E2E**: Utilize Playwright (`npx playwright test`) inside the frontend directory for End-to-End coverage. Document procedures in `TESTING.md`.

## General Engineering Principles

*   **Isolation**: Keep changes small and surgical. Do not rewrite unrelated parts of the upstream `xpert` repo.
*   **Dependencies**: Only add dependencies when fully justified. Do not add Postgres/pgvector as a first dependency (use Convex first).
*   **Verification**: Run backend tests (`pytest`) and frontend builds (`tsc -b && vite build`) after changes.

## Setup & Running

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npx convex dev
npm run dev
```