import { test, expect } from '../../fixtures/test-fixtures';
import { users, products, checkoutData } from '../../test-data/users';

/**
 * Checkout E2E Journey — SauceDemo purchase flow from inventory to completion.
 *
 * Portfolio story (for hiring managers):
 *   - Demonstrates a full business journey (not just page clicks): add → cart
 *     → form → overview → finish, with both happy path and validation/cancel
 *     branches.
 *   - Includes a tax-math assertion (`subtotal + tax ≈ total`) that shows
 *     data-integrity testing, not just UI clicks.
 *   - All steps use Page Objects; the spec reads like a manual test case,
 *     which is exactly how a stakeholder should be able to follow it.
 *
 * For colleagues:
 *   - beforeEach logs in via `loginPage` — each test is self-contained for
 *     `fullyParallel` workers.
 *   - Use `checkoutPage.fillCustomerInfo()` for Step One; don't fill inputs
 *     directly unless testing a single field's validation.
 */

test.describe('Checkout E2E Journey @regression', () => {
  // Login once per test — checkout always starts authenticated on inventory.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
  });

  test('complete checkout journey - happy path @smoke', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    // Happy path: 2 items → cart → checkout Step One → overview → finish → confirmation.
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.goToCart();
    await cartPage.assertCartItemCount(2);
    await cartPage.proceedToCheckout(); // → checkout-step-one.html
    await checkoutPage.fillCustomerInfo(
      checkoutData.valid.firstName,
      checkoutData.valid.lastName,
      checkoutData.valid.postalCode
    );
    await checkoutPage.assertOverviewPage(); // guards step-two URL + title
    await checkoutPage.assertTotalPriceVisible();
    await expect(page.locator('.inventory_item_name').first()).toBeVisible(); // overview lists items
    await checkoutPage.completeOrder(); // → Thank you for your order!
    await expect(page.locator('.complete-header')).toBeVisible();
    await expect(checkoutPage.backHomeButton).toBeVisible(); // back-to-products affordance
  });

  test('should show validation error when checkout info is empty', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    // Negative: submit empty Step One — error banner appears for First Name.
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.continueButton.click(); // no fill
    await checkoutPage.assertValidationError();
    await expect(checkoutPage.errorMessage).toContainText('Error: First Name is required');
  });

  test('should show error when postal code is missing', async ({ inventoryPage, cartPage, checkoutPage }) => {
    // Negative: partial fill — First + Last without Postal still errors.
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.firstNameInput.fill('Jane');
    await checkoutPage.lastNameInput.fill('Doe');
    await checkoutPage.continueButton.click();
    await checkoutPage.assertValidationError();
    await expect(checkoutPage.errorMessage).toContainText('Error: Postal Code is required');
  });

  test('should cancel checkout and return to cart', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    // Cancel from Step One → back to cart (not inventory) — preserves cart state.
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/cart\.html/);
  });

  test('should cancel from overview and return to inventory', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
    page,
  }) => {
    // Cancel from Step Two overview → back to inventory (products).
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo('John', 'Doe', '12345');
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('should calculate correct total with tax', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    // Data integrity: parse displayed subtotal/tax/total and assert total ≈ subtotal + tax.
    // Shows portfolio can test business math, not just screen presence.
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo('John', 'Doe', '12345');
    const subtotalText = await page.locator('.summary_subtotal_label').textContent();
    const taxText = await page.locator('.summary_tax_label').textContent();
    const totalText = await page.locator('.summary_total_label').textContent();
    expect(subtotalText).toContain('$29.99'); // known price for backpack
    expect(taxText).toBeTruthy();
    expect(totalText).toBeTruthy();
    const subtotal = parseFloat(subtotalText!.match(/\$([\d.]+)/)![1]);
    const tax = parseFloat(taxText!.match(/\$([\d.]+)/)![1]);
    const total = parseFloat(totalText!.match(/\$([\d.]+)/)![1]);
    expect(total).toBeCloseTo(subtotal + tax, 2); // floating tolerance
  });
});
