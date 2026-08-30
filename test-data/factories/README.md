# Test Data Factories

**Status:** Implemented (`test-data/factories/customerFactory.ts` + `utils/apiClient.ts` + `utils/seedHelper.ts` + `seededCustomer` fixture). Factory-only for DemoQA, API-seeded for SauceDemo/API.

## Why this exists (vs `test-data/users.ts` hardcoded)

| Problem with hardcoded | Factory solution |
|---|---|
| Same email `sabster89@gmail.com` collides in parallel runs | `faker.internet.email()` + `Date.now()` → unique per test |
| Change shape → edit 20 files | Change `Customer` interface once |
| Prod vs dev constraints differ | Factory accepts `overrides: { state: 'NCR', city: 'Delhi' }` per-env |

## Seeding process

We generate data in-memory **and** seed via API so the AUT has the same data (where applicable):

```
[Factory] --createCustomer()--> [Seed via API] --POST /users--> [AUT DB] --then UI test reads same customer-->
```

### Implemented:

1. **Factory** (`customerFactory.ts`) — pure, no I/O. Uses `faker`.
2. **API Client** (`utils/apiClient.ts`) — typed wrapper with Zod (`UserSchema`), handles `getEnvConfig().apiBaseURL` per `ENV=dev|staging|prod`.
3. **Seed Helper** (`utils/seedHelper.ts`):
   ```ts
   export async function seedCustomerViaAPI(request, overrides) {
     const customer = createCustomer(overrides);
     const res = await new ApiClient(request).createUser(payload);
     return { ...customer, id: res.id, seeded: true };
   }
   export async function cleanupCustomer(request, id) {
     if (getEnvConfig().name === 'Production') return; // dedicated tenant
     await new ApiClient(request).deleteUser(id); // best-effort
   }
   export function getDemoQACustomer(overrides) { return createCustomer({ state: 'NCR', city: 'Delhi', ...overrides }); }
   ```
4. **Fixture** (`fixtures/test-fixtures.ts`):
   ```ts
   seededCustomer: async ({ request }, use) => {
     const customer = await seedCustomerViaAPI(request, {});
     await use(customer);
     await cleanupCustomer(request, customer.id);
   }
   ```
5. **Usage:**
   ```ts
   // DemoQA — factory-only
   const customer = getDemoQACustomer();
   await form.fillBasicInfo(customer);

   // SauceDemo/API — seeded
   test('with seeded', async ({ seededCustomer }) => {
     await form.fillBasicInfo(seededCustomer);
   });
   ```

### Decisions made:
- **DemoQA = factory-only** (no API to seed), **SauceDemo/API = factory + API seeding**
- **Cleanup:** `DELETE` for dev/staging (best-effort), **no-op for prod** (dedicated tenant, nightly purge)

### Next:
- Migrate `demoqa-practice-form.spec.ts` from hardcoded `Sebastian Cichon` to `getDemoQACustomer()`
