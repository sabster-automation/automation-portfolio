import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CartPage — Page Object for SauceDemo cart (`/cart.html`).
 *
 * Design notes for reviewers:
 *   - Selectors use `data-test` for checkout/continue-shopping and semantic
 *     `.cart_item` for list items — both resilient to styling changes.
 *   - Assertions are inside the POM so specs read as intent ("assert item in
 *     cart") rather than low-level locator checks.
 *
 * For colleagues: chain with InventoryPage — `inventory.goToCart()` asserts
 * URL before you call any CartPage method.
 */
export class CartPage extends BasePage {
  /** Primary checkout button. */
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  /** List of cart rows (`.cart_item`). */
  readonly cartItems: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartItems = page.locator('.cart_item');
  }

  /** Assert a product row with given name is visible in the cart. */
  async assertItemInCart(productName: string): Promise<void> {
    await expect(this.page.locator('.cart_item').filter({ hasText: productName })).toBeVisible();
  }

  /** Assert exact number of rows — uses `toHaveCount` which auto-waits. */
  async assertCartItemCount(expected: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(expected);
  }

  /** Remove a specific product by its card's button (Remove). */
  async removeItem(productName: string): Promise<void> {
    const item = this.page.locator('.cart_item').filter({ hasText: productName });
    await item.locator('button').click();
  }

  /** Proceed to checkout Step One and guard URL (`checkout-step-one.html`). */
  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }
}
