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

*   **State Management (`apps/clear-climate-os/frontend/convex`)**: Convex.
    *   Used for real-time workflow state (notes, evidence tracking, report drafting, QA flags).
    *   **Rule**: Human approval is strictly required before extracted evidence is fully committed to the tracker.
    *   **Rule**: Always define strong `v.*` schemas for tables.

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