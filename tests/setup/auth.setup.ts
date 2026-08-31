import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

const authFile = 'playwright/.auth/user.json';

/**
 * Auth setup — writes playwright/.auth/user.json.
 * SauceDemo stores the session in sessionStorage, which storageState does not
 * restore, so e2e specs still log in themselves. This project is a smoke that
 * login works and that the state file can be written; it is not a suite-wide
 * session cache.
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
