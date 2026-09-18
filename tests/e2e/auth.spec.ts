import { test, expect } from '../../fixtures/test-fixtures';
import { users } from '../../test-data/users';

/**
 * Authentication suite — SauceDemo login/logout/session behaviour.
 *
 * Portfolio relevance (for hiring managers):
 *   - Covers both positive (valid login) and negative paths (locked, wrong
 *     password, empty) — shows negative-testing mindset.
 *   - Demonstrates POM usage (`loginPage`) and `test-data/users.ts` constants
 *     so the suite is data-driven, not hardcoded inline.
 *   - Tags: `@auth` + `@regression` allow selective runs (`--grep @auth`);
 *     `@smoke` marks the logout test for fast smoke gating in CI.
 *
 * For colleagues:
 *   - Every test starts from `loginPage.goto()` in beforeEach — keeps tests
 *     isolated for `fullyParallel:true`. Don't hoist login into beforeAll.
 *   - SauceDemo's session lives in sessionStorage; logout clears it and
 *     redirects to `/`. The "persist after reload" test proves that.
 */

test.describe('Authentication @auth @regression', () => {
  // Fresh login page per test — isolation for parallel workers.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    // Positive path: standard user logs in and lands on inventory.
    await loginPage.login(users.standard.username, users.standard.password);
    await loginPage.assertLoggedIn(); // guards URL + title
    await expect(page.locator('.shopping_cart_link')).toBeVisible(); // cart icon appears only when logged in
  });

  test('should show error for locked out user', async ({ loginPage }) => {
    // Negative: SauceDemo returns a specific lockout banner for this demo account.
    await loginPage.login(users.locked.username, users.locked.password);
    await loginPage.assertLoginError('Epic sadface: Sorry, this user has been locked out.');
  });

  test('should show error for invalid password', async ({ loginPage }) => {
    // Negative: wrong password for an existing user yields mismatch error.
    await loginPage.login(users.standard.username, 'wrong_password');
    await loginPage.assertLoginError('Epic sadface: Username and password do not match');
  });

  test('should show error for empty credentials', async ({ loginPage }) => {
    // Negative: empty username triggers required-field error.
    await loginPage.login('', '');
    await loginPage.assertLoginError('Epic sadface: Username is required');
  });

  test('should logout successfully @smoke', async ({ loginPage, inventoryPage, page }) => {
    // Smoke for the full login → logout cycle — fast signal in CI smoke stage.
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.logout(); // via hamburger menu
    await expect(page).toHaveURL('/'); // back on login
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should persist session after reload', async ({ loginPage, inventoryPage, page }) => {
    // SauceDemo session survives a hard reload (sessionStorage) — proves session handling.
    await loginPage.login(users.standard.username, users.standard.password);
    await loginPage.assertLoggedIn();
    await page.reload();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
