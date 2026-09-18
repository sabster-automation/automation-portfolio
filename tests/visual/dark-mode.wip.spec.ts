import { test, expect } from '../../fixtures/test-fixtures';
import { enableDarkMode, assertDarkModeActive } from '../../utils/theme';

/**
 * WIP — Dark-mode visual baselines @visual @dark
 * Location: tests/visual/dark-mode.wip.spec.ts
 * Project: visual-dark (playwright.config.ts → use: { colorScheme: 'dark' })
 *
 * Context (for hiring managers / colleagues):
 *   SauceDemo/DemoQA have no native dark theme. Rather than leaving a gap in
 *   visual coverage, this scaffolding demonstrates the *technique* for
 *   dark-mode testing: emulate `prefers-color-scheme: dark` via
 *   `page.emulateMedia` and inject a lightweight CSS `invert(0.92) hue-rotate`
 *   filter in `utils/theme.ts`. The baselines use relaxed thresholds
 *   (0.3–0.35, 150–250 px) because inversion is intentionally coarse — a real
 *   product with a native theme would use tighter values.
 *
 *   The suite is intentionally SKIPPED until baselines are committed. This
 *   signals work-in-progress honestly (a portfolio best practice) while keeping
 *   the main CI green.
 *
 * Status:
 *  - [x] Scaffolding: helper + project + skipped suite
 *  - [ ] Generate baselines: npx playwright test --project=visual-dark --update-snapshots
 *  - [ ] Stabilize diff thresholds per page (login vs inventory need different maxDiffPixels)
 *  - [ ] Add to CI (visual job) after baselines are committed
 *
 * Activation:
 *   Remove `.skip` from `test.describe.skip`, rename to `dark-mode.spec.ts`,
 *   then run `npx playwright test --project=visual-dark --update-snapshots`
 *   on a Linux runner and commit the `*-dark.png` snapshots.
 */

test.describe.skip('Dark-mode visual baselines — WIP @visual @dark', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure dark is emulated before any navigation for correct media query
    await page.emulateMedia({ colorScheme: 'dark' });
  });

  test('login page — dark @visual-dark', async ({ page, loginPage }) => {
    // Dark baseline: login via helper then screenshot with relaxed threshold.
    await loginPage.goto();
    await enableDarkMode(page); // emulate + inject invert filter + 200ms repaint
    await assertDarkModeActive(page); // guards that emulation landed
    // WIP: baseline not yet committed — run with --update-snapshots to create login-dark.png
    await expect(page).toHaveScreenshot('login-dark.png', { maxDiffPixels: 150, threshold: 0.3 });
  });

  test('inventory page — dark @visual-dark', async ({ page, loginPage }) => {
    // Inventory dark — covers grid + sort + cart affordances.
    await loginPage.goto();
    await loginPage.loginWithEnvDefaults();
    await enableDarkMode(page);
    await expect(page).toHaveScreenshot('inventory-dark.png', { maxDiffPixels: 200, threshold: 0.3 });
  });

  test('demoqa practice form — dark @visual-dark', async ({ page }) => {
    // DemoQA dark — heavier threshold + mask for fixed banners that survive inversion.
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
