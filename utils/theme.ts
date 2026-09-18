import { Page, expect } from '@playwright/test';

/**
 * Theme helpers for dark-mode visual testing — WIP scaffolding.
 * Location: utils/theme.ts
 *
 * Context for reviewers:
 *   SauceDemo and DemoQA don't ship a native dark theme. To still showcase
 *   visual-testing skills, we emulate `prefers-color-scheme: dark` and inject
 *   a minimal CSS invert filter. This creates a meaningful diff for the
 *   portfolio while keeping the technique honest (not a full theming solution).
 *
 * Project wiring: `visual-dark` in playwright.config.ts uses
 * `colorScheme:'dark'` and matches `dark-mode.wip.spec.ts`. Remove `.skip`
 * and run `--project=visual-dark --update-snapshots` to generate `*-dark.png`.
 *
 * Usage in visual-dark project:
 *   await enableDarkMode(page);
 *   await expect(page).toHaveScreenshot('inventory-dark.png');
 */

/** Emulate OS dark preference + inject lightweight invert filter for non-themed apps. */
export async function enableDarkMode(page: Page): Promise<void> {
  // Emulate OS dark preference — informs `matchMedia` queries.
  await page.emulateMedia({ colorScheme: 'dark' });
  // Inject a minimal dark stylesheet so non-themed apps show a visible diff
  // (kept intentionally minimal — portfolio should show technique, not full theming)
  await page.addStyleTag({
    content: `
      html { filter: invert(0.92) hue-rotate(180deg) !important; }
      img, video { filter: invert(1) hue-rotate(180deg) !important; }
    `,
  });
  // Allow repaint — avoids racing the screenshot before filter applies.
  await page.waitForTimeout(200);
}

/** Reset to light for tests that toggle themes. */
export async function enableLightMode(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'light' });
}

/** Assert the dark media query is active — smoke that emulation worked. */
export async function assertDarkModeActive(page: Page): Promise<void> {
  const scheme = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  expect(scheme).toBeTruthy();
}

/** Helper: optionally enable dark then take a themed baseline with relaxed thresholds. */
export async function takeThemedScreenshot(page: Page, name: string, dark = false) {
  if (dark) await enableDarkMode(page);
  // Separate baselines: login-light.png vs login-dark.png via `colorScheme` in playwright.config
  await expect(page).toHaveScreenshot(name, { maxDiffPixels: 150, threshold: 0.3 });
}
