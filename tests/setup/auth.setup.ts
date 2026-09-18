import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

/**
 * Auth setup — Playwright `setup` project (playwright.config.ts → project `setup`).
 *
 * What this demonstrates (for hiring managers):
 *   - Shows knowledge of `storageState` as a suite optimisation. In a real
 *     cookie/localStorage AUT, this would let every test reuse a single login
 *     instead of logging in N times.
 *   - Intentionally kept as a *smoke* only: it writes `playwright/.auth/user.json`
 *     so the pattern is visible, but e2e specs still log in themselves because
 *     SauceDemo keeps its session in `sessionStorage`, which `storageState`
 *     does NOT restore. This nuance is called out so reviewers see senior-level
 *     awareness of auth gotchas rather than a naïve global login.
 *
 * For colleagues:
 *   - Don't add `dependencies: ['setup']` or `storageState` to e2e projects
 *     for SauceDemo — it gives a false sense of reuse. If you fork to an AUT
 *     that uses cookies, wire it via `use: { storageState: 'playwright/.auth/user.json' }`
 *     in playwright.config.ts and make the `setup` project a dependency.
 *   - This file is matched by `testMatch: /.*\.setup\.ts/` and ignored by
 *     browser projects via `testIgnore` — so it never runs as a regular test.
 */

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Use the same POM as e2e specs — proves the POM works before the suite runs.
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEnvDefaults(); // reads TEST_USERNAME/PASSWORD or falls back to standard_user
  await loginPage.assertLoggedIn();

  // Double-guard: ensure the inventory title rendered before snapshots storage.
  await expect(page.locator('.title')).toHaveText('Products');

  // Write storage state — even though e2e won't consume it, the artifact proves the flow.
  await page.context().storageState({ path: authFile });
});
