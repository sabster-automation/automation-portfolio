import { test, expect } from '../../fixtures/test-fixtures';
import { users, products } from '../../test-data/users';

/**
 * Visual Regression suite — Playwright `toHaveScreenshot` baselines.
 *
 * Project: `visual` (playwright.config.ts:78-82) — chromium only, matched by
 * `testMatch: /.*visual.*\.spec\.ts/` and ignored by browser E2E projects.
 * Separate `visual-dark` project handles dark-mode WIP baselines.
 *
 * Portfolio showcase (for hiring managers):
 *   - Demonstrates screenshot baselines, threshold tuning, masking of dynamic
 *     regions (cart badge), responsive viewports, and locator-level screenshots.
 *   - Baselines are committed under `tests/visual/visual.spec.ts-snapshots/` as
 *     `*-linux.png` (CI OS). Local Windows snapshots get `-win32` suffix, so
 *     local `--update-snapshots` will not satisfy CI — use the
 *     `visual-update.yml` workflow on Linux.
 *   - CI `visual` job runs only on pull_request and skips if the snapshot
 *     dir is missing (so new forks don't red-fail immediately).
 *
 * For colleagues:
 *   - Keep thresholds low (0.2 / 100px) for desktop SauceDemo; relax only for
 *     dark-mode or heavy-ad pages.
 *   - Mask dynamic badges via `{ mask: [page.locator('.shopping_cart_badge')] }`
 *     instead of bumping thresholds globally.
 *   - Update baselines on Linux: `Actions → Update Visual Baselines` or
 *     `npx playwright test --project=visual --update-snapshots` on a Linux runner.
 */

test.describe('Visual Regression @visual', () => {
  test('login page visual comparison', async ({ page, loginPage }) => {
    // Baseline: login form — logo, inputs, button. Full page, strict diff.
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixels: 100 });
  });

  test('inventory page visual comparison', async ({ page, loginPage }) => {
    // Inventory shell — product grid, sort, header. Captures after login.
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(page).toHaveScreenshot('inventory-page.png', { maxDiffPixels: 100 });
  });

  test('single product card visual', async ({ page, loginPage }) => {
    // Locator-level screenshot — isolates one `.inventory_item` for focused diff.
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    const card = page.locator('.inventory_item').first();
    await expect(card).toHaveScreenshot('product-card.png');
  });

  test('cart page with items visual', async ({ page, loginPage, inventoryPage }) => {
    // Cart state visual — add two items, navigate, full-page baseline.
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.addToCart(products.bikeLight);
    await inventoryPage.goToCart();
    await expect(page).toHaveScreenshot('cart-with-items.png');
  });

  test('checkout overview visual', async ({ page, loginPage, inventoryPage, cartPage, checkoutPage }) => {
    // Overview step visual — after Step One fill, shows totals.
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await checkoutPage.fillCustomerInfo('John', 'Doe', '12345');
    await expect(page).toHaveScreenshot('checkout-overview.png');
  });

  test('responsive - mobile visual', async ({ page, loginPage }) => {
    // Responsive check — iPhone viewport before navigation to catch layout breakpoints.
    await page.setViewportSize({ width: 375, height: 812 });
    await loginPage.goto();
    await expect(page).toHaveScreenshot('login-mobile.png');
  });

  test('inventory with masked dynamic cart badge', async ({ page, loginPage, inventoryPage }) => {
    // Masking demo: hide the animated cart badge so only the surrounding UI is compared.
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addToCart(products.backpack);
    await expect(page).toHaveScreenshot('inventory-masked.png', {
      mask: [page.locator('.shopping_cart_badge')],
      threshold: 0.2,
    });
  });
});
