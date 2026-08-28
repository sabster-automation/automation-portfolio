import { test, expect } from '../../fixtures/test-fixtures';
import { DemoQAPracticeFormPage } from '../../pages/DemoQAPracticeFormPage';
import path from 'path';

/**
 * WIP — DemoQA Practice Form @wip @demoqa
 * Intent: show second AUT work without making README look finished.
 * This suite is intentionally SKIPPED in CI (test.skip + .wip.spec.ts + playwright.config ignore will also handle).
 * Remove .skip / rename to .spec.ts once stable.
 *
 * AUT: https://demoqa.com/automation-practice-form
 * Covers: POM, file upload, date picker, react-select, modal assertion
 *
 * Status:
 *  - ✅ Basic info + gender + mobile + subjects + modal flow
 *  - ⚠️ Date picker flaky (TODO keyboard type)
 *  - ⏳ File upload needs temp file generation
 *  - ⏳ State/City dependent dropdown not yet stable
 */

test.describe.skip('DemoQA Practice Form — WIP @wip @demoqa', () => {
  let form: DemoQAPracticeFormPage;

  test.beforeEach(async ({ page }) => {
    form = new DemoQAPracticeFormPage(page);
    await form.goto();
  });

  test('should submit practice form with valid data @smoke', async ({ page }) => {
    await form.fillBasicInfo({
      firstName: 'Sebastian',
      lastName: 'Cichon',
      email: 'sabster89@gmail.com',
      gender: 'Male',
      mobile: '1234567890',
    });

    await form.setDateOfBirth('10 Jan 1990');
    await form.addSubject('Computer Science');

    // Hobby
    await page.locator('label:has-text("Sports")').click();

    await form.currentAddress.fill('123 Test Street, Warsaw, PL');

    // State/City — WIP: react-select requires extra wait
    // TODO: select 'NCR' → 'Delhi' reliably
    await form.stateSelect.click();
    await page.locator('div[id^="react-select"]').filter({ hasText: 'NCR' }).click().catch(() => {});

    await form.submit();
    await form.assertSuccessModalVisible();

    // Verify submitted data appears in modal table
    await expect(page.locator('table')).toContainText('Sebastian Cichon');
    await expect(page.locator('table')).toContainText('sabster89@gmail.com');
  });

  test.fixme('should upload picture and show file name in modal', async () => {
    // TODO: generate temp file e.g. path.join(process.cwd(), 'test-data/sample.txt')
    // await form.uploadFile(path.join(__dirname, '../../test-data/sample.txt'));
    // await form.submit();
    // await expect(page.locator('table')).toContainText('sample.txt');
  });

  test('should show validation on empty required fields @negative', async ({ page }) => {
    await form.submit();
    // DemoQA uses HTML5 validation + red borders
    await expect(page.locator('#firstName:invalid')).toBeVisible();
    // TODO: assert border-color or :invalid count === 3 (firstName, lastName, mobile)
  });

  test.skip('visual — practice form layout @visual @wip', async ({ page }) => {
    // Intent: add to visual project once stable
    // await expect(page).toHaveScreenshot('demoqa-practice-form.png', { maxDiffPixels: 150 });
  });

  test('a11y — practice form should not have critical violations @a11y @wip', async ({ page }) => {
    // Placeholder for AxeBuilder — keep skipped until form stable
    test.skip(true, 'Enable after a11y baseline for DemoQA — currently has known color-contrast issues');
    // const results = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze();
    // expect(results.violations.filter(v=>v.impact==='critical')).toEqual([]);
  });
});
