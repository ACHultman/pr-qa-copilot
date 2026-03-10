import { test, expect } from '@playwright/test';

// This is a *local dev* example.
// Run:
//   BASE_URL=https://example.com npx playwright test
//
// In the GitHub Action, Playwright is driven from src/run.js instead.

test('captures a couple of screenshots (example)', async ({ page }) => {
  const baseUrl = process.env.BASE_URL || 'https://example.com';

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Example Domain/i);

  await page.screenshot({ path: 'artifacts/example-home.png', fullPage: true });
});
