import { APIRequestContext } from '@playwright/test';
import { getEnvConfig } from '../config/environments';
import { ApiClient } from './apiClient';
import { createCustomer, createCheckoutCustomer, type Customer } from '../test-data/factories/customerFactory';

/**
 * Seed helpers — bridge between test-data factories and real APIs.
 *
 * Strategy (important for portfolio reviewers):
 *   - DemoQA: factory-only (UI fill) — no API to seed, so `getDemoQACustomer()`
 *     generates realistic data in-memory and the spec fills the form directly.
 *   - SauceDemo/API: factory + API seeding — `seedCustomerViaAPI()` creates
 *     data via ApiClient so the AUT has matching state, then returns the same
 *     customer for UI assertions. Demonstrates seeding + contract + cleanup.
 *
 * Cleanup policy:
 *   - dev/staging: best-effort DELETE via ApiClient (404 is tolerated).
 *   - prod: no-op — dedicated test tenant, purged nightly. Keeps prod safe
 *     and allows debugging failed runs without losing evidence.
 *
 * Fixture wiring: `fixtures/test-fixtures.ts` exposes `seededCustomer` that
 * calls `seedCustomerViaAPI` before `use(customer)` and `cleanupCustomer`
 * after — even when the test fails.
 */

export interface SeededCustomer extends Customer {
  /** Server-assigned id (or synthetic fallback for jsonplaceholder's fake persistence). */
  id: string | number;
  /** Marker so specs/fixtures can distinguish seeded vs factory-only customers. */
  seeded: boolean;
}

/**
 * Generate a customer with `createCustomer()` then POST it via ApiClient.
 * Payload shape switches per env (reqres vs jsonplaceholder) to match the API's contract.
 * Returns the merged object — UI specs use `firstName`/`email` for form fill, teardown uses `id`.
 */
export async function seedCustomerViaAPI(
  request: APIRequestContext,
  overrides: Partial<Customer> = {}
): Promise<SeededCustomer> {
  const customer = createCustomer(overrides);
  const client = new ApiClient(request);

  // Per-env payload mapping — keeps specs AUT-agnostic while client handles API differences.
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

/** Checkout variant — currently reuses same endpoint (demo purpose); extend for order-specific seeding. */
export async function seedCheckoutCustomerViaAPI(
  request: APIRequestContext,
  overrides: Partial<Customer> = {}
): Promise<SeededCustomer> {
  // For checkout we reuse same endpoint — demo purpose
  return seedCustomerViaAPI(request, overrides);
}

/**
 * Delete seeded data — prod-guarded. Dev/staging failures are warned, not thrown,
 * so test teardown never masks the real test result.
 */
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

// ---------------------------------------------------------------------------
// DemoQA helper — factory-only, no API
// ---------------------------------------------------------------------------

/**
 * Generate a DemoQA-valid customer without hitting any API.
 * Forces `state:NCR, city:Delhi` default (DemoQA's valid pair) but respects
 * overrides — e.g., `getDemoQACustomer({ state:'Haryana', city:'Karnal' })`.
 */
export function getDemoQACustomer(overrides: Partial<Customer> = {}): Customer {
  // Factory-only for DemoQA (no API to seed)
  return createCustomer({
    state: 'NCR',
    city: 'Delhi',
    ...overrides,
  });
}
