import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * InventoryPage — Page Object for SauceDemo inventory (Products) page.
 *
 * What this showcases to hiring managers:
 *   - Scoped locators: `inventoryItem(name)` filters the correct card before
 *     acting, so `addToCart("Backpack")` never clicks the wrong button.
 *   - Resilient cart-badge handling: hidden when count is 0 (no flake on `toHaveText("0")`).
 *   - Data helpers (`getAllPrices` / `getAllProductNames`) that enable sort
 *     assertions without duplicating parsing logic in specs.
 *
 * For colleagues: prefer `addToCart(productName)` over raw `page.click`. If
 * SauceDemo changes its DOM, only this file needs updating — not every spec.
 */
export class InventoryPage extends BasePage {
  /** Page title "Products" — also used for login guard assertions. */
  readonly title: Locator;
  /** Sort dropdown (`data-test="product-sort-container"`) — options: az/za/lohi/hilo. */
  readonly sortDropdown: Locator;
  /** Red badge with item count — hidden when cart is empty (assertCartCount handles both). */
  readonly cartBadge: Locator;
  /** Cart icon link. */
  readonly cartLink: Locator;
  /** Hamburger menu and logout link inside it. */
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

  /** Locate a specific product card by its visible name — foundation for product-scoped actions. */
  inventoryItem(name: string): Locator {
    return this.page.locator('.inventory_item').filter({ hasText: name });
  }

  /** The Add/Remove button inside a specific product card. */
  addToCartButton(productName: string): Locator {
    return this.inventoryItem(productName).locator('button');
  }

  /** Click add-to-cart for a product by name (delegates to scoped button). */
  async addToCart(productName: string): Promise<void> {
    await this.addToCartButton(productName).click();
  }

  /**
   * Read numeric cart count. Returns 0 when badge is hidden (empty cart) so
   * callers don't need to branch on visibility.
   */
  async getCartCount(): Promise<number> {
    if (!(await this.cartBadge.isVisible())) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text || '0', 10);
  }

  /**
   * Assert cart count with correct hidden vs text expectation.
   * Why: `expect(badge).toHaveText("0")` flares when SauceDemo hides the badge instead.
   */
  async assertCartCount(expected: number): Promise<void> {
    if (expected === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(expected));
    }
  }

  /** Sort products — `az`/`za` alphabetical, `lohi`/`hilo` by price. */
  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }

  /** Navigate to cart and guard URL so next POM step never runs on wrong page. */
  async goToCart(): Promise<void> {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  /** Logout via hamburger menu and assert redirect to login. */
  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.click();
    await expect(this.page).toHaveURL('/');
  }

  /** All product names in current DOM order — used to verify sorting. */
  async getAllProductNames(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allTextContents();
  }

  /** All product prices as numbers (strips "$") — used to verify lohi/hilo sorting. */
  async getAllPrices(): Promise<number[]> {
    const texts = await this.page.locator('.inventory_item_price').allTextContents();
    return texts.map((t) => parseFloat(t.replace('$', '')));
  }
}
