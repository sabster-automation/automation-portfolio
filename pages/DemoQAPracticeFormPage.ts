import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DemoQAPracticeFormPage — Page Object for https://demoqa.com/automation-practice-form
 *
 * Why a second AUT matters (portfolio story for hiring managers):
 *   - SauceDemo is e-commerce (inventory/cart/checkout); DemoQA is a complex
 *     form (file upload, date picker, radio/checkbox, react-select, modal).
 *   - Together they prove the framework is AUT-agnostic: same fixtures/config
 *     pattern works for any site, not just one demo app.
 *   - This page showcases hard problems: ad flakiness, react-datepicker,
 *     react-select, and modal handling.
 *
 * Stability techniques:
 *   - Block ad networks via `page.route` → abort (doubleclick, googlesyndication, adplus).
 *   - Remove fixed banners/footers/iframes via `evaluate` before interacting.
 *   - Date via keyboard (Control+A → type → Enter) — clicking the calendar is brittle.
 *   - react-select via `div[id^="react-select-3-option"]` scoped click.
 *
 * For colleagues: this is the reference for "how to tame a flaky third-party
 * demo site." Follow the same evaluate + route blocking pattern if you add
 * another AUT.
 */
export class DemoQAPracticeFormPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  /** Gender radios — resolved via `getByText` so label clicks work even if input is hidden. */
  readonly genderRadio: (gender: 'Male' | 'Female' | 'Other') => Locator;
  readonly mobile: Locator;
  /** react-datepicker input — set via keyboard, not calendar clicks. */
  readonly dateOfBirth: Locator;
  readonly subjectsInput: Locator;
  readonly hobbiesCheckbox: (hobby: string) => Locator;
  readonly uploadPicture: Locator;
  readonly currentAddress: Locator;
  /** react-select wrappers for State / City. */
  readonly stateSelect: Locator;
  readonly citySelect: Locator;
  readonly submitButton: Locator;
  /** Success modal. */
  readonly modalTitle: Locator;
  readonly modalClose: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.locator('#firstName');
    this.lastName = page.locator('#lastName');
    this.email = page.locator('#userEmail');
    this.genderRadio = (g) => page.getByText(g, { exact: true });
    this.mobile = page.locator('#userNumber');
    this.dateOfBirth = page.locator('#dateOfBirthInput');
    this.subjectsInput = page.locator('#subjectsInput');
    this.hobbiesCheckbox = (h) => page.getByText(h, { exact: true });
    this.uploadPicture = page.locator('#uploadPicture');
    this.currentAddress = page.locator('#currentAddress');
    this.stateSelect = page.locator('#state');
    this.citySelect = page.locator('#city');
    this.submitButton = page.locator('#submit');
    this.modalTitle = page.locator('#example-modal-sizes-title-lg');
    this.modalClose = page.locator('#closeLargeModal');
  }

  /**
   * Navigate to the form with ad defenses.
   * - Aborts ad network requests before they load.
   * - Removes fixed banner/footer/iframes that cover the submit button.
   * - Asserts firstName visible so the form is truly ready.
   */
  async goto(): Promise<void> {
    // Block google ads to reduce flakiness — these requests often hang and delay domcontentloaded.
    await this.page.route('**/*doubleclick.net/**', (route) => route.abort());
    await this.page.route('**/*googlesyndication.com/**', (route) => route.abort());
    await this.page.route('**/*adplus.js**', (route) => route.abort());

    await this.page.goto('https://demoqa.com/automation-practice-form');
    await this.page.waitForLoadState('domcontentloaded');

    // Remove fixed banner, footer and ads that obscure the form — DemoQA injects them late.
    await this.page.evaluate(() => {
      document.querySelector('#close-fixedban')?.dispatchEvent(new Event('click'));
      document.getElementById('fixedban')?.remove();
      document.querySelector('footer')?.remove();
      document.querySelectorAll('iframe').forEach((el) => el.remove());
      // Hide ad containers that may reappear via JS
      document.querySelectorAll('[id^="ad-"], [class*="ad-"]').forEach((el) => ((el as HTMLElement).style.display = 'none'));
    });
    await expect(this.firstName).toBeVisible();
  }

  /** Fill the required top section — keeps specs focused on the scenario, not locator order. */
  async fillBasicInfo(data: { firstName: string; lastName: string; email: string; gender: 'Male' | 'Female' | 'Other'; mobile: string }) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.genderRadio(data.gender).click();
    await this.mobile.fill(data.mobile);
  }

  /**
   * Set birth date via keyboard (not calendar widget).
   * Verifies year substring was applied — guards against partial typing failures.
   * @param date e.g. "10 Jan 1990" — must match `faker` / factory default.
   */
  async setDateOfBirth(date: string) {
    // react-datepicker: select via keyboard to avoid calendar clicks
    await this.dateOfBirth.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.type(date);
    await this.page.keyboard.press('Enter');
    // Verify value was set
    await expect(this.dateOfBirth).toHaveValue(new RegExp(date.split(' ')[2])); // year
  }

  /** Type a subject and press Enter to select from autocomplete (e.g., "Maths"). */
  async addSubject(subject: string) {
    await this.subjectsInput.fill(subject);
    await this.subjectsInput.press('Enter');
  }

  /**
   * Upload a file via the hidden input.
   * Verifies attachment by checking the input's value contains the filename stem.
   */
  async uploadFile(filePath: string) {
    await this.uploadPicture.setInputFiles(filePath);
    // Verify file was attached
    await expect(this.uploadPicture).toHaveValue(new RegExp(filePath.split(/[\\/]/).pop()!.split('.')[0]));
  }

  /**
   * Submit the form. Re-hides ads that may have reappeared and forces the click
   * (the footer often re-injects and covers the button during fill).
   */
  async submit(): Promise<void> {
    // Re-hide ads that may have reappeared and ensure button is clickable
    await this.page.evaluate(() => {
      document.getElementById('fixedban')?.remove();
      document.querySelector('footer')?.remove();
    });
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click({ force: true });
  }

  /** Select a state from react-select (valid: NCR / Uttar Pradesh / Haryana / Rajasthan). */
  async selectState(state: string) {
    await this.stateSelect.click();
    await this.page.locator('div[id^="react-select-3-option"]').filter({ hasText: state }).click();
    await expect(this.stateSelect).toContainText(state);
  }

  /** Select a city (must match the chosen state — e.g., NCR → Delhi). */
  async selectCity(city: string) {
    await this.citySelect.click();
    await this.page.locator('div[id^="react-select-4-option"]').filter({ hasText: city }).click();
    await expect(this.citySelect).toContainText(city);
  }

  /** Assert the success modal title and content are visible after submit. */
  async assertSuccessModalVisible() {
    await expect(this.modalTitle).toHaveText(/Thanks for submitting the form/i);
    await expect(this.page.locator('.modal-content')).toBeVisible();
  }

  async closeModal() {
    await this.modalClose.click();
  }
}
