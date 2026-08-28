import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly menuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.locator('.title');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  inventoryItem(name: string): Locator {
    return this.page.locator('.inventory_item').filter({ hasText: name });
  }

  addToCartButton(productName: string): Locator {
    return this.inventoryItem(productName).locator('button');
  }

  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
  }

  async getCartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text || '0', 10);
  }

  async assertCartCount(expected: number): Promise<void> {
    if (expected === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(expected));
    }
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  async goToCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
    await expect(this.page).toHaveURL('/');
  }

  async getAllProductNames(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  async getAllPrices(): Promise<number[]> {
    const texts = await this.page.locator('.inventory_item_price').allTextContents();
    return texts.map((t) => parseFloat(t.replace('$', '')));
  }
}
