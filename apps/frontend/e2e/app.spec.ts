import { test, expect } from '@playwright/test';

test.describe('LexiQuiz Application E2E Critical Flows', () => {
  test('should load landing page and display title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LexiQuiz|WordForge/i);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Log In');
    await expect(page).toHaveURL(/\/login/);
  });
});
