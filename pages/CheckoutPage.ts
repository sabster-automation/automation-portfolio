import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
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

  async fillCustomerInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async assertOverviewPage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await expect(this.page.locator('.title')).toHaveText('Checkout: Overview');
  }

  async assertTotalPriceVisible(): Promise<void> {
    await expect(this.page.locator('.summary_total_label')).toBeVisible();
  }

  async completeOrder(): Promise<void> {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  async assertValidationError(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
