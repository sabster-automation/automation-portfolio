import { Page, expect } from '@playwright/test';

/**
 * Generic UI helpers — small, reusable assertions and waits.
 *
 * Keep this file free of AUT-specific logic. SauceDemo/DemoQA details belong
 * in pages/*. For hiring managers: this shows the portfolio keeps cross-cutting
 * utilities separate from Page Objects (single responsibility).
 */

/** Wait for full network idle — heavier than `domcontentloaded`; use sparingly for API-driven pages. */
export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

/** Assert current URL contains a fragment (regex) — lighter than full URL check. */
export async function assertUrlContains(page: Page, fragment: string) {
  await expect(page).toHaveURL(new RegExp(fragment));
}

/** Parse a price string like `"$29.99"` into a number. Trims whitespace for safety. */
export async function getPriceValue(text: string): Promise<number> {
  return parseFloat(text.replace('$', '').trim());
}

/** Log-friendly env tag e.g. `[ENV=staging]` — use in console or report attachments. */
export function envTag() {
  return `[ENV=${process.env.ENV || 'dev'}]`;
}
