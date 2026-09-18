import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * CheckoutPage — Page Object for SauceDemo checkout flow.
 *
 * Covers three URLs:
 *   1. Step One  `/checkout-step-one.html` — customer form (firstName/lastName/postalCode)
 *   2. Step Two  `/checkout-step-two.html` — overview (totals + Finish)
 *   3. Complete `/checkout-complete.html` — confirmation
 *
 * Portfolio points:
 *   - Single POM for all steps keeps the checkout journey cohesive; methods
 *     assert the expected URL/title so navigation bugs fail fast.
 *   - `fillCustomerInfo` bundles fill×3 + continue — the happy-path building block.
 *   - `completeOrder` asserts the success header hiring managers expect to see
 *     in E2E demos.
 */
export class CheckoutPage extends BasePage {
  /** Step One inputs. */
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  /** Step navigation. */
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  /** Error banner for missing fields. */
  readonly errorMessage: Locator;
  /** Complete page success header. */
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.completeHeader = page.locator('.complete-header');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
  }

  /** Fill Step One form and click Continue — caller asserts overview next. */
  async fillCustomerInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  /** Assert we landed on Step Two overview. */
  async assertOverviewPage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.page.locator('.title')).toHaveText('Checkout: Overview');
  }

  /** Total price label exists — detailed math checked in checkout.spec.ts. */
  async assertTotalPriceVisible(): Promise<void> {
    await expect(this.page.locator('.summary_total_label')).toBeVisible();
  }

  /** Click Finish and assert complete page + success text. */
  async completeOrder(): Promise<void> {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  /** Validation banner is visible (e.g., "First Name is required"). */
  async assertValidationError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
