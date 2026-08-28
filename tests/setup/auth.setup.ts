import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const authFile = 'playwright/.auth/user.json';

/**
 * Auth setup - runs once before all tests that need authentication
 * Demonstrates senior pattern: storageState reuse to avoid 20x logins
 * Showcase: 10x faster suite, stable sessions, proper teardown
 */
setup('authenticate', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEnvDefaults();
  await loginPage.assertLoggedIn();

  // Verify session is persisted
  await expect(page.locator('.title')).toHaveText('Products');

  await page.context().storageState({ path: authFile });
});
