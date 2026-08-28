import { test, expect } from '../../fixtures/test-fixtures';
import { users, products, checkoutData } from '../../test-data/users';

test.describe('Checkout E2E Journey @regression', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
  });

  test('complete checkout journey - happy path @smoke', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.goToCart();
    await cartPage.assertCartItemCount(2);
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo(
      checkoutData.valid.firstName,
      checkoutData.valid.lastName,
      checkoutData.valid.postalCode
    );
    await checkoutPage.assertOverviewPage();
    await checkoutPage.assertTotalPriceVisible();
    await expect(page.locator('.inventory_item_name').first()).toBeVisible();
    await checkoutPage.completeOrder();
    await expect(page.locator('.complete-header')).toBeVisible();
    await expect(checkoutPage.backHomeButton).toBeVisible();
  });

  test('should show validation error when checkout info is empty', async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.continueButton.click();
    await checkoutPage.assertValidationError();
    await expect(checkoutPage.errorMessage).toContainText('Error: First Name is required');
  });

  test('should show error when postal code is missing', async ({ inventoryPage, cartPage, checkoutPage }) => {
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
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo('John', 'Doe', '12345');
    await checkoutPage.cancelButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('should calculate correct total with tax', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo('John', 'Doe', '12345');
    const subtotalText = await page.locator('.summary_subtotal_label').textContent();
    const taxText = await page.locator('.summary_tax_label').textContent();
    const totalText = await page.locator('.summary_total_label').textContent();
    expect(subtotalText).toContain('$29.99');
    expect(taxText).toBeTruthy();
    expect(totalText).toBeTruthy();
    const subtotal = parseFloat(subtotalText!.match(/\$([\d.]+)/)![1]);
    const tax = parseFloat(taxText!.match(/\$([\d.]+)/)![1]);
    const total = parseFloat(totalText!.match(/\$([\d.]+)/)![1]);
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });
});
