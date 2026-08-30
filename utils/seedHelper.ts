import { APIRequestContext } from '@playwright/test';
import { getEnvConfig } from '../config/environments';
import { ApiClient } from './apiClient';
import { createCustomer, createCheckoutCustomer, type Customer } from '../test-data/factories/customerFactory';

/**
 * Seed helpers — factory-only for DemoQA, API-seeded for SauceDemo/API
 *
 * Strategy agreed:
 * - DemoQA: factory-only (page.fill) — no API
 * - SauceDemo/API: factory + API seeding via ApiClient
 *
 * Cleanup:
 * - dev/staging: DELETE via ApiClient (best-effort, ignore 404)
 * - prod: no-op (dedicated tenant, purged nightly via cron)
 */

export interface SeededCustomer extends Customer {
  id: string | number;
  seeded: boolean;
}

export async function seedCustomerViaAPI(
  request: APIRequestContext,
  overrides: Partial<Customer> = {}
): Promise<SeededCustomer> {
  const customer = createCustomer(overrides);
  const client = new ApiClient(request);

  // Per-env payload mapping
  const payload = client.isReqres()
    ? { name: `${customer.firstName} ${customer.lastName}`, job: customer.subject, email: customer.email }
    : { title: `${customer.firstName} ${customer.lastName}`, body: customer.email, userId: 1 };

  const created = await client.createUser(payload);

  return {
    ...customer,
    id: created.id ?? `temp-${Date.now()}`,
    seeded: true,
  };
}

export async function seedCheckoutCustomerViaAPI(
  request: APIRequestContext,
  overrides: Partial<Customer> = {}
): Promise<SeededCustomer> {
  // For checkout we reuse same endpoint — demo purpose
  return seedCustomerViaAPI(request, overrides);
}

export async function cleanupCustomer(request: APIRequestContext, id: string | number) {
  const env = getEnvConfig();
  if (env.name === 'Production') {
    // Dedicated test tenant — don't delete, let nightly purge handle it
    // This keeps prod safe and allows debugging failed runs
    console.log(`[seedHelper] skip cleanup in Production for id=${id}`);
    return;
  }
  // dev/staging: best-effort DELETE
  try {
    const client = new ApiClient(request);
    await client.deleteUser(id);
  } catch (e) {
    console.warn(`[seedHelper] cleanup failed for id=${id}`, e);
  }
}

// DemoQA helper — factory-only, no API
export function getDemoQACustomer(overrides: Partial<Customer> = {}): Customer {
  // Factory-only for DemoQA (no API to seed)
  return createCustomer({
    state: 'NCR',
    city: 'Delhi',
    ...overrides,
  });
}
