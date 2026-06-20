import { test, expect } from '@playwright/test';

test.describe('CLEAR Climate OS Core Workflow', () => {
  test('end-to-end evidence extraction and reporting', async ({ page }) => {
    // Increase test timeout just in case the AI calls take longer
    test.setTimeout(60000);

    // 0. Setup: Go to app
    await page.goto('http://localhost:5173');

    // Wait for Convex/initial render
    await page.waitForTimeout(2000);

    // 1. Input Notes
    await page.locator('select').selectOption('meeting_note');
    await page.locator('textarea').fill('Test Playwright E2E: Supply chain delays for batteries.');

    // Click extract and wait for the AI/mock to return
    await page.getByRole('button', { name: 'Extract Evidence' }).click();

    // Check that we see some pending items appear
    // The "Approve" button appears inside the pending evidence list.
    await expect(page.getByRole('button', { name: 'Approve' }).first()).toBeVisible({ timeout: 15000 });

    // 2. Review & Approve Evidence
    // Because convex is realtime, list updates dynamically. Re-fetch all buttons before clicking.
    let pendingCount = await page.getByRole('button', { name: 'Approve' }).count();
    while (pendingCount > 0) {
        await page.getByRole('button', { name: 'Approve' }).first().click();
        await page.waitForTimeout(500); // let UI update
        pendingCount = await page.getByRole('button', { name: 'Approve' }).count();
    }

    // 3. Generate Report
    const generateBtn = page.getByRole('button', { name: 'Generate Report' });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();

    // Wait for the report draft to appear in the DOM
    await expect(page.getByRole('button', { name: 'Run AI QA Review' }).first()).toBeVisible({ timeout: 15000 });

    // 4. Run QA Review
    await page.getByRole('button', { name: 'Run AI QA Review' }).first().click();

    // Wait for the QA flag display or completion
    await page.waitForTimeout(3000);

    // Final screenshot for proof
    await page.screenshot({ path: 'e2e/test-results/final_state.png' });
  });
});
