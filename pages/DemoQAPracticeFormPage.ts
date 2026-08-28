import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * WIP Page Object for https://demoqa.com/automation-practice-form
 * Showcases AUT-agnostic design vs SauceDemo
 * Covers: file upload, date picker, modal, radio, checkbox, react-select
 *
 * Status: WIP — locators refined, flows partially implemented
 * TODO: handle OS file chooser, auto-complete subjects, stable date picker
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
    this.genderRadio = (g) => page.locator(`label:has-text("${g}")`);
    this.mobile = page.locator('#userNumber');
    this.dateOfBirth = page.locator('#dateOfBirthInput');
    this.subjectsInput = page.locator('#subjectsInput');
    this.hobbiesCheckbox = (h) => page.locator(`label:has-text("${h}")`);
    this.uploadPicture = page.locator('#uploadPicture');
    this.currentAddress = page.locator('#currentAddress');
    this.stateSelect = page.locator('#state');
    this.citySelect = page.locator('#city');
    this.submitButton = page.locator('#submit');
    this.modalTitle = page.locator('#example-modal-sizes-title-lg');
    this.modalClose = page.locator('#closeLargeModal');
  }

  async goto(): Promise<void> {
    await this.page.goto('https://demoqa.com/automation-practice-form');
    // DemoQA has ads/iframes that can obscure form — close if needed
    await this.page.waitForLoadState('domcontentloaded');
    // Dismiss cookie banner / fixed ads if visible (best-effort)
    await this.page.evaluate(() => {
      document.querySelector('#close-fixedban')?.dispatchEvent(new Event('click'));
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
    // WIP: react-datepicker — current implementation is flaky
    // TODO: picks date via keyboard: Ctrl+A → type → Enter
    await this.dateOfBirth.click();
    await this.page.keyboard.press('Control+A');
    await this.page.keyboard.type(date);
    await this.page.keyboard.press('Enter');
  }

  async addSubject(subject: string) {
    await this.subjectsInput.fill(subject);
    await this.subjectsInput.press('Enter');
  }

  async uploadFile(filePath: string) {
    // Requires real file on disk; in CI use a generated txt
    await this.uploadPicture.setInputFiles(filePath);
  }

  async submit(): Promise<void> {
    // Form footer can be covered by ad — scroll + force click
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click({ force: true });
  }

  async assertSuccessModalVisible() {
    await expect(this.modalTitle).toHaveText(/Thanks for submitting the form/i);
  }

  async closeModal() {
    await this.modalClose.click();
  }
}
