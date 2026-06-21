import { test, expect } from '@playwright/test';

test('has components', async ({ page }) => {
  await page.goto('/');

  // Verify Theory of Change is present
  await expect(page.locator('text=Theory of Change Map')).toBeVisible();

  // Verify Systems Thinking is present
  await expect(page.locator('text=Systems Thinking')).toBeVisible();

  // Verify Stakeholder Mapping is present
  await expect(page.locator('text=Stakeholder Mapping')).toBeVisible();

  // Verify Resource Tracker is present
  await expect(page.locator('text=Resource Tracker')).toBeVisible();

  // Verify Risk Assessment is present
  await expect(page.locator('text=Risk Assessment')).toBeVisible();
});
