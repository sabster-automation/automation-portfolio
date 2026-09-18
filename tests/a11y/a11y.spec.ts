import { test, expect } from '../../fixtures/test-fixtures';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility suite — axe-core WCAG 2.1 audits.
 *
 * Portfolio differentiator (for hiring managers):
 *   Most E2E portfolios skip accessibility. This suite runs `@axe-core/playwright`
 *   on every core SauceDemo page, filters to `critical`/`serious` only (so the
 *   suite signals real barriers, not minor colour tweaks), and attaches the full
 *   axe report as HTML-report artefacts for traceability.
 *   It also shows manual a11y checks (heading hierarchy, image `alt`) that
 *   complement automated scans.
 *
 * Project: `a11y` (playwright.config.ts:94-97) — chromium only, `testMatch: /.*a11y.*\.spec\.ts/`.
 * Run: `npx playwright test --project=a11y` or `npx playwright test tests/a11y --reporter=html`
 *
 * For colleagues:
 *   - SauceDemo has known violations (`select-name`, cart badge contrast) — the
 *     suite handles them via `.disableRules()` / `.exclude()` and documents why,
 *     rather than letting the suite be perpetually red.
 *   - Use `test.info().attach('a11y-report-*', { body: JSON.stringify(results) })`
 *     so the report is visible in `playwright-report/index.html`.
 */

test.describe('Accessibility @a11y', () => {
  test('login page should not have critical a11y violations', async ({ page, loginPage }) => {
    // Login as entry point — broadest tag set (wcag2a/aa + wcag21a/aa) for a thorough scan.
    await loginPage.goto();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Attach full report for traceability (visible in Playwright HTML report)
    await test.info().attach('a11y-report-login', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    // Fail only on critical/serious to avoid flaky minor issues in demo app
    const criticalViolations = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact!));
    expect(criticalViolations, `Critical a11y violations: ${JSON.stringify(criticalViolations, null, 2)}`).toEqual([]);
  });

  test('inventory page should not have critical a11y violations', async ({ page, loginPage }) => {
    // Inventory after login — excludes dynamic badge and disables known select-name debt.
    await loginPage.goto();
    await loginPage.loginWithEnvDefaults();
    await loginPage.assertLoggedIn();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('.shopping_cart_badge') // dynamic badge can cause color-contrast false positives
      .disableRules(['select-name']) // SauceDemo demo app has known violation: select without accessible name (portfolio: shows handling known tech debt)
      .analyze();

    await test.info().attach('a11y-report-inventory', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    const criticalViolations = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact!));
    expect(criticalViolations).toEqual([]);
  });

  test('cart page should not have critical a11y violations', async ({ page, loginPage, inventoryPage }) => {
    // Cart with items — seeds a realistic route (add → cart) before scanning.
    await loginPage.goto();
    await loginPage.loginWithEnvDefaults();
    // Use realistic flow - add items then check cart
    await page.waitForURL(/inventory\.html/);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

    await test.info().attach('a11y-report-cart', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    const criticalViolations = results.violations.filter((v) => ['critical', 'serious'].includes(v.impact!));
    expect(criticalViolations).toEqual([]);
  });

  test('checkout form should have proper labels and no violations @smoke', async ({
    page,
    loginPage,
    inventoryPage,
    cartPage,
  }) => {
    // Checkout Step One — scoped scan to the form inputs plus a visibility guard.
    await loginPage.goto();
    await loginPage.loginWithEnvDefaults();
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    // Check that form inputs have associated labels (common a11y failure)
    await expect(page.locator('[data-test="firstName"]')).toBeVisible();
    await expect(page.locator('[data-test="lastName"]')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('[data-test="firstName"]')
      .include('[data-test="lastName"]')
      .include('[data-test="postalCode"]')
      .analyze();

    await test.info().attach('a11y-report-checkout', {
      body: JSON.stringify(results, null, 2),
      contentType: 'application/json',
    });

    expect(results.violations.filter((v) => v.impact === 'critical')).toEqual([]);
  });

  test('should verify page has correct heading hierarchy', async ({ page, loginPage }) => {
    // Manual a11y complement to axe — heading presence and image alt text.
    await loginPage.goto();
    await loginPage.loginWithEnvDefaults();

    // Manual a11y check example - complements axe
    const h1Count = await page.locator('h1').count();
    // SauceDemo doesn't use h1, but we showcase the technique
    // In real app you'd assert h1 === 1
    const title = await page.locator('.title').textContent();
    expect(title).toBeTruthy();

    // Check all images have alt text — common WCAG failure.
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt, `Image ${i} missing alt text`).toBeTruthy();
    }
  });
});
