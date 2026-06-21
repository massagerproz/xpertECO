import { test, expect } from '@playwright/test';

test.describe('CLEAR Climate OS Core Workflow', () => {
  test('end-to-end evidence extraction and reporting', async ({ page }) => {
    // Increase test timeout just in case the AI calls take longer
    test.setTimeout(120000);

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
        await page.waitForTimeout(1000); // let UI update
        pendingCount = await page.getByRole('button', { name: 'Approve' }).count();
    }

    // New Step: Theory of Change
    const generateTocBtn = page.getByRole('button', { name: 'Generate Map' });
    await expect(generateTocBtn).toBeEnabled();
    await generateTocBtn.click({ force: true });

    // Check that pending ToC items appear. Wait for check icon to be visible
    await page.waitForTimeout(1000); // Wait for fetch
    let pendingTocCount = await page.locator('button > svg.lucide-check').count();
    while (pendingTocCount > 0) {
        await page.locator('button > svg.lucide-check').first().click({ force: true });
        await page.waitForTimeout(1000);
        pendingTocCount = await page.locator('button > svg.lucide-check').count();
    }

    // New Step: Systems Thinking
    const generateSystemsBtn = page.getByRole('button', { name: 'Extract Systems Map' });
    await expect(generateSystemsBtn).toBeEnabled();
    await generateSystemsBtn.click({ force: true });

    // Check that pending systems thinking items appear. Wait for check icon to be visible
    await page.waitForTimeout(1000);
    let pendingSystemsCount = await page.locator('button > svg.lucide-check').count();
    while (pendingSystemsCount > 0) {
        await page.locator('button > svg.lucide-check').first().click({ force: true });
        await page.waitForTimeout(1000);
        pendingSystemsCount = await page.locator('button > svg.lucide-check').count();
    }

    // New Step: Stakeholder Mapping
    const generateStakeholdersBtn = page.getByRole('button', { name: 'Extract Stakeholders' });
    await expect(generateStakeholdersBtn).toBeEnabled();
    await generateStakeholdersBtn.click({force: true});

    await page.waitForTimeout(1000);
    let pendingStakeholdersCount = await page.locator('button > svg.lucide-check').count();
    while (pendingStakeholdersCount > 0) {
        await page.locator('button > svg.lucide-check').first().click({ force: true });
        await page.waitForTimeout(1000);
        pendingStakeholdersCount = await page.locator('button > svg.lucide-check').count();
    }

    // New Step: Resource Tracker
    const generateResourcesBtn = page.getByRole('button', { name: 'Extract Resources' });
    await expect(generateResourcesBtn).toBeEnabled();
    await generateResourcesBtn.click({force: true});

    await page.waitForTimeout(1000);
    let pendingResourcesCount = await page.locator('button > svg.lucide-check').count();
    while (pendingResourcesCount > 0) {
        await page.locator('button > svg.lucide-check').first().click({ force: true });
        await page.waitForTimeout(1000);
        pendingResourcesCount = await page.locator('button > svg.lucide-check').count();
    }

    // 3. Generate Report
    const generateBtn = page.getByRole('button', { name: 'Generate Report' });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click({ force: true });

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
