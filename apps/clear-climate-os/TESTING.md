# Testing Guide for CLEAR Climate OS

This document explains the testing strategy for the `apps/clear-climate-os` application.

## End-to-End Testing (Frontend)

We use Playwright for robust End-to-End (E2E) testing of the frontend and its integration with the backend and Convex database.

### Running E2E Tests

1. Ensure both the FastAPI backend and Convex dev servers are running.
2. From the `apps/clear-climate-os/frontend` directory, run:
   ```bash
   npx playwright test
   ```

### Test Coverage

The `workflow.spec.ts` test covers the core user journey:
1. **Upload & Extract**: Submitting meeting notes and waiting for the AI extraction.
2. **Review**: Interacting with the real-time pending evidence queue and approving items.
3. **Generate**: Triggering the AI to draft a report based solely on approved evidence.
4. **QA**: Running the AI QA review to verify the generated report against evidence constraints.

## Backend Unit Testing

Backend endpoints are tested using `pytest` to ensure the Pydantic schemas and mock logic (or AI logic) respond as expected.

### Running Backend Tests

From the `apps/clear-climate-os/backend` directory:
```bash
source venv/bin/activate
pytest test_main.py
```