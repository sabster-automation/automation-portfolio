import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — abstract foundation for every Page Object in this portfolio.
 *
 * Why this class exists:
 *   - Enforces a single place for cross-page helpers so 5 POMs stay DRY.
 *   - Demonstrates POM inheritance to hiring managers: specs never touch
 *     `page` directly; they call typed POM methods instead.
 *   - Holds the shared `page` instance injected per test worker (isolated).
 *
 * For colleagues: extend this when adding a new AUT page. Keep selectors
 * and assertions inside the POM — specs should read like business steps.
 */
export abstract class BasePage {
  /** Playwright page for this test worker — protected so child POMs can use it, specs cannot. */
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to `baseURL` (from playwright.config.ts / environments.ts).
   * Default `/` goes to the AUT root. Override in child POMs for page-specific guards.
   */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  /** Wait for DOM content — lighter than `networkidle`, sufficient for most SauceDemo navigations. */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Convenience assertion: title contains text (case-insensitive regex). */
  async assertTitleContains(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text, 'i'));
  }

  /**
   * Full-page screenshot to `test-results/screenshots/<name>.png`.
   * Useful for debugging outside the visual suite (which uses toHaveScreenshot baselines).
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
