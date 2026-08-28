import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartItems = page.locator('.cart_item');
  }

  async assertItemInCart(productName: string): Promise<void> {
    await expect(this.page.locator('.cart_item').filter({ hasText: productName })).toBeVisible();
  }

  async assertCartItemCount(expected: number): Promise<void> {
    await expect(this.cartItems).toHaveCount(expected);
  }

  async removeItem(productName: string): Promise<void> {
    const item = this.page.locator('.cart_item').filter({ hasText: productName });
    await item.locator('button').click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
  }
}
