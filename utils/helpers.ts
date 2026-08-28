import { Page, expect } from '@playwright/test';

export async function waitForNetworkIdle(page: Page) {
  await page.waitForLoadState('networkidle');
}

export async function assertUrlContains(page: Page, fragment: string) {
  await expect(page).toHaveURL(new RegExp(fragment));
}

export async function getPriceValue(text: string): Promise<number> {
  return parseFloat(text.replace('$', '').trim());
}

export function envTag() {
  return `[ENV=${process.env.ENV || 'dev'}]`;
}
