import { test, expect } from '../../fixtures/test-fixtures';
import { users, products } from '../../test-data/users';

test.describe('Inventory & Cart @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await loginPage.assertLoggedIn();
  });

  test('should display all products correctly', async ({ inventoryPage, page }) => {
    await expect(inventoryPage.title).toHaveText('Products');
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  test('should add single product to cart and show badge @smoke', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.assertCartCount(1);
  });

  test('should add multiple products and verify cart count', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.addToCart(products.boltTShirt);
    await inventoryPage.assertCartCount(3);
  });

  test('should remove product from cart via inventory page', async ({ inventoryPage, page }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.assertCartCount(1);
    await inventoryPage.addToCartButton(products.backpack).click();
    await inventoryPage.assertCartCount(0);
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  });

  test('should sort products by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getAllPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('should sort products by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getAllPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('should sort products by name A-Z', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getAllProductNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('should navigate to cart and verify added items', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.fleeceJacket);
    await inventoryPage.addToCart(products.onesie);
    await inventoryPage.goToCart();
    await cartPage.assertCartItemCount(2);
    await cartPage.assertItemInCart(products.fleeceJacket);
    await cartPage.assertItemInCart(products.onesie);
  });
});
