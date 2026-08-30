import { faker } from '@faker-js/faker';

/**
 * Test Data Factories for seeding via API
 * Location: test-data/factories/customerFactory.ts
 * Depends on: @faker-js/faker (added to package.json, run npm ci)
 *
 * GOAL: Replace hardcoded test-data/users.ts with per-env, isolated, realistic data.
 *
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ WHY FACTORIES + SEEDING?                                                  │
 * │ 1. Isolation: each test gets unique data → no collisions in parallel runs │
 * │ 2. Realism: faker generates valid emails, phones, addresses vs "John Doe"  │
 * │ 3. Maintainability: one place to change shape, not 20 spec files           │
 * │ 4. Per-env: dev/staging/prod can have different constraints                │
 * └─────────────────────────────────────────────────────────────────────────────┘
 *
 * PROCESS (implemented — see below):
 *
 * 1. FACTORY (this file) — pure function, no I/O
 *    export function createCustomer(overrides?) => Customer
 *    Uses faker.person, faker.internet.email, faker.phone.number
 *    Accepts overrides for edge cases: createCustomer({ email: 'invalid' })
 *
 * 2. SEEDING VIA API (next file: apiClient.ts / seedHelper.ts)
 *    - In playwright.config.ts we already have getEnvConfig() + apiBaseURL
 *    - Example: POST ${apiBaseURL}/users (jsonplaceholder) or /api/users (reqres)
 *    - Should be called in:
 *        a) test.beforeAll() for suite-level seed, OR
 *        b) custom fixture: test.extend({ seededCustomer: async ({request}, use) => {...}})
 *    - Must handle:
 *        • Auth: if API needs token, fetch via request.newContext() with login
 *        • Idempotency: generate unique email via faker + Date.now()
 *        • Cleanup: afterAll() DELETE ${apiBaseURL}/users/{id} or use ephemeral data
 *
 * 3. PER-ENV EXAMPLE:
 *    - dev (jsonplaceholder): POST /users → returns { id: 11 } (fake, not persisted)
 *    - staging (reqres): POST /api/users → returns { id, createdAt } (persisted for session)
 *    - prod: never seed — use read-only fixtures or dedicated test tenant
 *
 * 4. USAGE IN TEST:
 *    // Factory-only (DemoQA — no API):
 *    import { createCustomer } from '../test-data/factories/customerFactory';
 *    const customer = createCustomer({ state: 'NCR' });
 *    await form.fillBasicInfo(customer);
 *
 *    // Seeded via API (SauceDemo/API — see utils/seedHelper.ts):
 *    import { seedCustomerViaAPI } from '../utils/seedHelper';
 *    const { id } = await seedCustomerViaAPI(request, customer);
 *    // ... fill form with customer.firstName etc.
 *
 * 5. IMPLEMENTED:
 *    - [x] Factory (this file) — pure function with faker
 *    - [x] utils/apiClient.ts — typed wrapper with Zod (UserSchema, CreateUserResponseSchema)
 *    - [x] utils/seedHelper.ts — seedCustomerViaAPI + cleanupCustomer (hybrid: DELETE for dev/staging, no-op for prod tenant)
 *    - [x] fixtures/test-fixtures.ts — seededCustomer fixture
 *    - [ ] Next: migrate demoqa-practice-form.spec.ts from hardcoded 'Sebastian Cichon' to getDemoQACustomer()/createCustomer()
 */

// NOTE: users.ts will be deprecated once all specs migrate to factories

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  dateOfBirth: string; // "10 Jan 1990"
  subject: string;
  hobby: 'Sports' | 'Reading' | 'Music';
  address: string;
  state: string;
  city: string;
  picturePath?: string;
}

export interface CheckoutCustomer extends Customer {
  postalCode: string;
}

/**
 * Factory: generates a realistic customer for DemoQA / SauceDemo
 */
export function createCustomer(overrides: Partial<Customer> = {}): Customer {
  // Use faker for realism; fallback to hardcoded if faker not yet installed in CI
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    firstName,
    lastName,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    gender: faker.helpers.arrayElement(['Male', 'Female', 'Other'] as const),
    mobile: faker.string.numeric(10), // 10 digits for DemoQA
    dateOfBirth: '10 Jan 1990', // keep static for now — date picker is flaky with random dates
    subject: faker.helpers.arrayElement(['Maths', 'Computer Science', 'Physics']),
    hobby: faker.helpers.arrayElement(['Sports', 'Reading', 'Music'] as const),
    address: faker.location.streetAddress(),
    state: 'NCR', // DemoQA valid: NCR/Uttar Pradesh/Haryana/Rajasthan
    city: 'Delhi', // must match state
    ...overrides,
  };
}

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
