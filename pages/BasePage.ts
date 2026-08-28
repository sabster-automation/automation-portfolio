import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text, 'i'));
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
