import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Page Object for https://demoqa.com/automation-practice-form
 * Showcases AUT-agnostic design vs SauceDemo
 * Covers: file upload, date picker, modal, radio, checkbox, react-select
 *
 * Completed: locators stable, ad handling via JS removal + route blocking, date via keyboard, state/city via react-select
 */
export class DemoQAPracticeFormPage extends BasePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly genderRadio: (gender: 'Male' | 'Female' | 'Other') => Locator;
  readonly mobile: Locator;
  readonly dateOfBirth: Locator;
  readonly subjectsInput: Locator;
  readonly hobbiesCheckbox: (hobby: string) => Locator;
  readonly uploadPicture: Locator;
  readonly currentAddress: Locator;
  readonly stateSelect: Locator;
  readonly citySelect: Locator;
  readonly submitButton: Locator;
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

  async goto(): Promise<void> {
    // Block google ads to reduce flakiness
    await this.page.route('**/*doubleclick.net/**', (route) => route.abort());
    await this.page.route('**/*googlesyndication.com/**', (route) => route.abort());
    await this.page.route('**/*adplus.js**', (route) => route.abort());

    await this.page.goto('https://demoqa.com/automation-practice-form');
    await this.page.waitForLoadState('domcontentloaded');

    // Remove fixed banner, footer and ads that obscure the form
    await this.page.evaluate(() => {
      document.querySelector('#close-fixedban')?.dispatchEvent(new Event('click'));
      document.getElementById('fixedban')?.remove();
      document.querySelector('footer')?.remove();
      document.querySelectorAll('iframe').forEach((el) => el.remove());
      // Hide ad containers
      document.querySelectorAll('[id^="ad-"], [class*="ad-"]').forEach((el) => ((el as HTMLElement).style.display = 'none'));
    });
    await expect(this.firstName).toBeVisible();
  }

  async fillBasicInfo(data: { firstName: string; lastName: string; email: string; gender: 'Male' | 'Female' | 'Other'; mobile: string }) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    await this.email.fill(data.email);
    await this.genderRadio(data.gender).click();
    await this.mobile.fill(data.mobile);
  }

  async setDateOfBirth(date: string) {
    // react-datepicker: select via keyboard to avoid calendar clicks
    await this.dateOfBirth.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.type(date);
    await this.page.keyboard.press('Enter');
    // Verify value was set
    await expect(this.dateOfBirth).toHaveValue(new RegExp(date.split(' ')[2])); // year
  }

  async addSubject(subject: string) {
    await this.subjectsInput.fill(subject);
    await this.subjectsInput.press('Enter');
  }

  async uploadFile(filePath: string) {
    await this.uploadPicture.setInputFiles(filePath);
    // Verify file was attached
    await expect(this.uploadPicture).toHaveValue(new RegExp(filePath.split(/[\\/]/).pop()!.split('.')[0]));
  }

  async submit(): Promise<void> {
    // Re-hide ads that may have reappeared and ensure button is clickable
    await this.page.evaluate(() => {
      document.getElementById('fixedban')?.remove();
      document.querySelector('footer')?.remove();
    });
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click({ force: true });
  }

  async selectState(state: string) {
    await this.stateSelect.click();
    await this.page.locator('div[id^="react-select-3-option"]').filter({ hasText: state }).click();
    await expect(this.stateSelect).toContainText(state);
  }

  async selectCity(city: string) {
    await this.citySelect.click();
    await this.page.locator('div[id^="react-select-4-option"]').filter({ hasText: city }).click();
    await expect(this.citySelect).toContainText(city);
  }

  async assertSuccessModalVisible() {
    await expect(this.modalTitle).toHaveText(/Thanks for submitting the form/i);
    await expect(this.page.locator('.modal-content')).toBeVisible();
  }

  async closeModal() {
    await this.modalClose.click();
  }
}
