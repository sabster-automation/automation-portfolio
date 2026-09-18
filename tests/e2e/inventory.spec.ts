import { test, expect } from '../../fixtures/test-fixtures';
import { users, products } from '../../test-data/users';

/**
 * Inventory & Cart suite — SauceDemo product catalogue behaviour.
 *
 * Why hiring managers care:
 *   - Covers add/remove, sorting (algorithmic verification), and cart
 *     navigation — the commerce core beyond login.
 *   - Sort tests read prices/names via InventoryPage helpers and re-sort
 *     locally with JS `[...].sort()` to assert correctness — shows data
 *     validation, not just click verification.
 *   - Cart-badge assertions handle the hidden-badge edge case (0 items) that
 *     many portfolios miss.
 *
 * For colleagues:
 *   - beforeEach logs in via the POM so every test starts on inventory —
 *     keeps parallel workers isolated.
 *   - Use `products` constants from test-data/users.ts; don't inline strings.
 *   - Prefer `inventoryPage.addToCart()` over raw locators so DOM changes
 *     only touch the POM.
 */

test.describe('Inventory & Cart @regression', () => {
  // Login via POM before every test — ensures inventory is ready and isolated per worker.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await loginPage.assertLoggedIn();
  });

  test('should display all products correctly', async ({ inventoryPage, page }) => {
    // Guard: inventory title + exactly 6 product cards (SauceDemo catalogue size).
    await expect(inventoryPage.title).toHaveText('Products');
    const items = page.locator('.inventory_item');
    await expect(items).toHaveCount(6);
  });

  test('should add single product to cart and show badge @smoke', async ({ inventoryPage }) => {
    // Single add — badge flips from hidden to "1". Smoke tags this for fast gating.
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.assertCartCount(1);
  });

  test('should add multiple products and verify cart count', async ({ inventoryPage }) => {
    // Multiple distinct products — count accumulates correctly (not just last click).
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.addToCart(products.boltTShirt);
    await inventoryPage.assertCartCount(3);
  });

  test('should remove product from cart via inventory page', async ({ inventoryPage, page }) => {
    // Add then remove via the same inventory button (toggles to "Remove") — badge hides and add button reappears.
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.assertCartCount(1);
    await inventoryPage.addToCartButton(products.backpack).click(); // click Remove
    await inventoryPage.assertCartCount(0);
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible();
  });

  test('should sort products by price low to high', async ({ inventoryPage }) => {
    // Sort lohi then compare live prices against a JS-sorted copy — algorithmic check.
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getAllPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('should sort products by price high to low', async ({ inventoryPage }) => {
    // Inverse sort guard — same helper, descending compare.
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getAllPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('should sort products by name A-Z', async ({ inventoryPage }) => {
    // Alphabetical sort — reads names and compares to JS locale sort.
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getAllProductNames();
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  test('should navigate to cart and verify added items', async ({ inventoryPage, cartPage }) => {
    // End-to-end inventory → cart: add two items, navigate, verify rows exist.
    await inventoryPage.addToCart(products.fleeceJacket);
    await inventoryPage.addToCart(products.onesie);
    await inventoryPage.goToCart(); // asserts /cart.html
    await cartPage.assertCartItemCount(2);
    await cartPage.assertItemInCart(products.fleeceJacket);
    await cartPage.assertItemInCart(products.onesie);
  });
});
