import { test, expect } from '../../fixtures/test-fixtures';
import { users } from '../../test-data/users';

test.describe('Authentication @auth @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should login successfully with valid credentials', async ({ loginPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await loginPage.assertLoggedIn();
    await expect(page.locator('.shopping_cart_link')).toBeVisible();
  });

  test('should show error for locked out user', async ({ loginPage }) => {
    await loginPage.login(users.locked.username, users.locked.password);
    await loginPage.assertLoginError('Epic sadface: Sorry, this user has been locked out.');
  });

  test('should show error for invalid password', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, 'wrong_password');
    await loginPage.assertLoginError('Epic sadface: Username and password do not match');
  });

  test('should show error for empty credentials', async ({ loginPage }) => {
    await loginPage.login('', '');
    await loginPage.assertLoginError('Epic sadface: Username is required');
  });

  test('should logout successfully @smoke', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.logout();
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should persist session after reload', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await loginPage.assertLoggedIn();
    await page.reload();
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
