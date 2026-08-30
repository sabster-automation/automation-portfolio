import { Page, expect } from '@playwright/test';

/**
 * Theme helpers for dark-mode visual testing — WIP scaffolding
 * Location: utils/theme.ts
 *
 * SauceDemo and DemoQA don't ship a native dark theme, so we emulate
 * `prefers-color-scheme: dark` and optionally inject a CSS override to
 * make the visual diff meaningful for the portfolio.
 *
 * Usage in visual-dark project:
 *   await enableDarkMode(page);
 *   await expect(page).toHaveScreenshot('inventory-dark.png');
 */

export async function enableDarkMode(page: Page): Promise<void> {
  // Emulate OS dark preference
  await page.emulateMedia({ colorScheme: 'dark' });
  // Inject a minimal dark stylesheet so non-themed apps show a visible diff
  // (kept intentionally minimal — portfolio should show technique, not full theming)
  await page.addStyleTag({
    content: `
      html { filter: invert(0.92) hue-rotate(180deg) !important; }
      img, video { filter: invert(1) hue-rotate(180deg) !important; }
    `,
  });
  // Allow repaint
  await page.waitForTimeout(200);
}

export async function enableLightMode(page: Page): Promise<void> {
  await page.emulateMedia({ colorScheme: 'light' });
}

export async function assertDarkModeActive(page: Page): Promise<void> {
  const scheme = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  expect(scheme).toBeTruthy();
}

export async function takeThemedScreenshot(page: Page, name: string, dark = false) {
  if (dark) await enableDarkMode(page);
  // Separate baselines: login-light.png vs login-dark.png via `colorScheme` in playwright.config
  await expect(page).toHaveScreenshot(name, { maxDiffPixels: 150, threshold: 0.3 });
}
