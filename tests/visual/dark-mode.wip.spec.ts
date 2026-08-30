import { test, expect } from '../../fixtures/test-fixtures';
import { enableDarkMode, assertDarkModeActive } from '../../utils/theme';

/**
 * WIP — Dark-mode visual baselines @visual @dark
 * Location: tests/visual/dark-mode.wip.spec.ts
 * Project: visual-dark (playwright.config.ts → use: { colorScheme: 'dark' })
 *
 * Why WIP: SauceDemo/DemoQA have no native dark theme — we emulate
 * `prefers-color-scheme: dark` via page.emulateMedia and an injected
 * CSS invert filter (see utils/theme.ts). Baselines need separate
 * `*-dark.png` snapshots: login-dark, inventory-dark, etc.
 *
 * Status:
 *  - [x] Scaffolding: helper + project + skipped suite
 *  - [ ] Generate baselines: npx playwright test --project=visual-dark --update-snapshots
 *  - [ ] Stabilize diff thresholds per page (login vs inventory need different maxDiffPixels)
 *  - [ ] Add to CI (visual job) after baselines are committed
 *
 * This suite is intentionally SKIPPED until baselines exist.
 * Remove `.skip` and rename to `dark-mode.spec.ts` when ready.
 */

test.describe.skip('Dark-mode visual baselines — WIP @visual @dark', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure dark is emulated before any navigation for correct media query
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('login page — dark @visual-dark', async ({ page, loginPage }) => {
    await loginPage.goto();
    await enableDarkMode(page);
    await assertDarkModeActive(page);
    // WIP: baseline not yet committed — run with --update-snapshots to create login-dark.png
    await expect(page).toHaveScreenshot('login-dark.png', { maxDiffPixels: 150, threshold: 0.3 });
  });

  test('inventory page — dark @visual-dark', async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.loginWithEnvDefaults();
    await enableDarkMode(page);
    await expect(page).toHaveScreenshot('inventory-dark.png', { maxDiffPixels: 200, threshold: 0.3 });
  });

  test('demoqa practice form — dark @visual-dark', async ({ page }) => {
    await page.goto('https://demoqa.com/automation-practice-form');
    await page.emulateMedia({ colorScheme: 'dark' });
    await enableDarkMode(page);
    // DemoQA has heavy ads — mask if needed
    await expect(page).toHaveScreenshot('demoqa-dark.png', {
      maxDiffPixels: 250,
      threshold: 0.35,
      mask: [page.locator('#fixedban'), page.locator('footer')],
    });
  });

  test.fixme('cart page — dark persists after navigation', async ({ page, loginPage }) => {
    // TODO: verify dark persists after add-to-cart → cart navigation
    // await loginPage.goto();
    // await loginPage.loginWithEnvDefaults();
    // await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    // await page.emulateMedia({ colorScheme: 'dark' });
    // await enableDarkMode(page);
    // await expect(page).toHaveScreenshot('cart-dark.png');
  });
});
