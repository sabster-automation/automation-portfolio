import { faker } from '@faker-js/faker';

/**
 * Customer factories — realistic, isolated test data via @faker-js/faker.
 * Location: test-data/factories/customerFactory.ts
 *
 * Why factories matter (portfolio narrative for hiring managers):
 *   Hardcoded data (`test-data/users.ts`) causes collisions in parallel runs
 *   ("John Doe" twice) and ties every env to the same shape. Factories solve
 *   four problems:
 *     1. Isolation: faker + uniqueness → no cross-test interference in `fullyParallel` runs.
 *     2. Realism: valid emails/phones/addresses vs "test@test.com".
 *     3. Maintainability: change Customer interface once, not in 20 spec files.
 *     4. Per-env flexibility: overrides like `{ state:'NCR', city:'Delhi' }` satisfy DemoQA constraints.
 *
 * Architecture:
 *   1. Factory (this file) — pure function, no I/O, deterministic with faker seed if needed.
 *      `createCustomer(overrides?) => Customer` — merges faker defaults with overrides for edge cases.
 *   2. Seeding (utils/seedHelper.ts + utils/apiClient.ts) — POSTs factory data to per-env API
 *      (`jsonplaceholder` / `reqres` via `getEnvConfig().apiBaseURL`) then returns `{...customer, id}`.
 *      Called via `seededCustomer` fixture so UI tests can fill forms with the same data.
 *   3. Fixture (fixtures/test-fixtures.ts) — `seededCustomer` handles create before `use()` and
 *      `cleanupCustomer` after, even on failure. Prod cleanup is no-op (dedicated tenant).
 *
 * Usage:
 *   // Factory-only (DemoQA — no API):
 *   import { createCustomer, getDemoQACustomer } from '@data/factories/customerFactory';
 *   const customer = getDemoQACustomer(); // forces valid NCR/Delhi pair
 *   await form.fillBasicInfo(customer);
 *
 *   // Seeded via API (SauceDemo/API):
 *   test('with seeded', async ({ seededCustomer }) => { await form.fillBasicInfo(seededCustomer); });
 *
 * For colleagues: add fields to `Customer` here first, then update seedHelper payload mapping.
 * Keep `dateOfBirth` static ("10 Jan 1990") — random dates flake on react-datepicker keyboard flow.
 */

// NOTE: users.ts will be deprecated once all specs migrate to factories

/** Core customer shape — shared by SauceDemo checkout and DemoQA practice form. */
export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  dateOfBirth: string; // "10 Jan 1990" — keep static; date picker is flaky with random dates
  subject: string; // DemoQA: Maths / Computer Science / Physics (autocomplete)
  hobby: 'Sports' | 'Reading' | 'Music';
  address: string;
  state: string; // DemoQA valid: NCR / Uttar Pradesh / Haryana / Rajasthan
  city: string; // must match state (e.g., NCR → Delhi)
  picturePath?: string;
}

/** Checkout variant adds postalCode for SauceDemo Step One. */
export interface CheckoutCustomer extends Customer {
  postalCode: string;
}

/**
 * Generate a realistic customer. Overrides win over faker defaults — e.g.,
 * `createCustomer({ email:'invalid' })` for negative validation tests.
 */
export function createCustomer(overrides: Partial<Customer> = {}): Customer {
  // Faker provides realism; keep firstName/lastName linked to email for consistency.
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    gender: faker.helpers.arrayElement(['Male', 'Female', 'Other'] as const),
    mobile: faker.string.numeric(10), // 10 digits — DemoQA validates length
    dateOfBirth: '10 Jan 1990', // static for now — date picker is flaky with random dates
    subject: faker.helpers.arrayElement(['Maths', 'Computer Science', 'Physics']),
    hobby: faker.helpers.arrayElement(['Sports', 'Reading', 'Music'] as const),
    address: faker.location.streetAddress(),
    state: 'NCR', // DemoQA valid: NCR/Uttar Pradesh/Haryana/Rajasthan
    city: 'Delhi', // must match state — default NCR → Delhi
    ...overrides,
  };
}

/** Convenience for checkout tests — adds realistic 5-digit ZIP. */
export function createCheckoutCustomer(overrides: Partial<CheckoutCustomer> = {}): CheckoutCustomer {
  const base = createCustomer(overrides);
  return {
    ...base,
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}

// Example:
// const customer = createCustomer({ gender: 'Male', state: 'NCR', city: 'Delhi' });
// const seeded = await seedCustomerViaAPI(request, customer); // for API-seeded suites
