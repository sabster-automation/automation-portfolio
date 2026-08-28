import { test, expect } from '../../fixtures/test-fixtures';
import { users, products } from '../../test-data/users';

test.describe('Visual Regression @visual', () => {
  test('login page visual comparison', async ({ page, loginPage }) => {
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixels: 100 });
  });

  test('inventory page visual comparison', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveScreenshot('inventory-page.png', { maxDiffPixels: 100 });
  });

  test('single product card visual', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    const card = page.locator('.inventory_item').first();
    await expect(card).toHaveScreenshot('product-card.png');
  });

  test('cart page with items visual', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.goToCart();
    await expect(page).toHaveScreenshot('cart-with-items.png');
  });

  test('checkout overview visual', async ({ page, loginPage, inventoryPage, cartPage, checkoutPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo('John', 'Doe', '12345');
    await expect(page).toHaveScreenshot('checkout-overview.png');
  });

  test('responsive - mobile visual', async ({ page, loginPage }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login-mobile.png');
  });

  test('inventory with masked dynamic cart badge', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart(products.backpack);
    await expect(page).toHaveScreenshot('inventory-masked.png', {
      mask: [page.locator('.shopping_cart_badge')],
      threshold: 0.2,
    });
  });
});
