import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage — Page Object for SauceDemo login (https://www.saucedemo.com).
 *
 * Portfolio showcase:
 *   - Uses stable `data-test` selectors (SauceDemo convention) — hiring managers
 *     see resilient locators, not fragile XPath.
 *   - Encapsulates login + error assertions so specs stay declarative.
 *   - `loginWithEnvDefaults()` bridges `.env` credentials (TEST_USERNAME/PASSWORD)
 *     so the same test runs per-env without editing code.
 *
 * For colleagues: all login flows should go through this POM. Never copy
 * `page.locator('[data-test="username"]')` into a spec — import the fixture
 * `loginPage` instead (fixtures/test-fixtures.ts).
 */
export class LoginPage extends BasePage {
  /** Stable input selectors — SauceDemo ships `data-test` attributes for automation. */
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  /** Error banner shown on failed login (locked user, wrong password, empty). */
  readonly errorMessage: Locator;
  /** Top logo — used as a readiness guard in goto(). */
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.logo = page.locator('.login_logo');
  }

  /**
   * Navigate to `/` and wait until the login form is ready.
   * Asserts `logo` visible so callers never race a `fill()` before render.
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.logo).toBeVisible();
  }

  /** Fill username + password and submit. No assertion — composable for positive and negative cases. */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Login using credentials from `.env` (TEST_USERNAME / TEST_PASSWORD) with
   * safe fallback to `standard_user / secret_sauce` so `npm test` works with
   * zero setup. Used by the `authenticatedPage` fixture.
   */
  async loginWithEnvDefaults(): Promise<void> {
    const username = process.env.TEST_USERNAME || 'standard_user';
    const password = process.env.TEST_PASSWORD || 'secret_sauce';
    await this.login(username, password);
  }

  /** Assert the error banner is visible and contains the expected SauceDemo message. */
  async assertLoginError(expectedText: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  /**
   * Assert successful login: URL is inventory and page title is Products.
   * Both checks guard against soft redirects that only change one signal.
   */
  async assertLoggedIn(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.page.locator('.title')).toHaveText('Products');
  }
}
