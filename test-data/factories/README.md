# Test Data Factories — WIP

**Status:** Scaffolding only (`test-data/factories/customerFactory.ts`). Not yet wired into specs.

## Why this exists (vs `test-data/users.ts` hardcoded)

| Problem with hardcoded | Factory solution |
|---|---|
| Same email `sabster89@gmail.com` collides in parallel runs | `faker.internet.email()` + `Date.now()` → unique per test |
| Change shape → edit 20 files | Change `Customer` interface once |
| Prod vs dev constraints differ | Factory accepts `overrides: { state: 'NCR', city: 'Delhi' }` per-env |

## Seeding process — read before implementing

We will **not** just generate data in-memory; we will **seed via API** so the AUT has the same data:

```
[Factory] --createCustomer()--> [Seed via API] --POST /users--> [AUT DB] --then UI test reads same customer-->
```

### Steps (detailed in `customerFactory.ts` header):

1. **Factory** (`customerFactory.ts`) — pure, no I/O. Already scaffolded.
2. **API Client** (`utils/apiClient.ts` — TODO) — typed wrapper around `Playwright request` with Zod schemas (next roadmap item). Handles `getEnvConfig().apiBaseURL` per `ENV=dev|staging`.
3. **Seed Helper** (`utils/seedHelper.ts` — TODO):
   ```ts
   export async function seedCustomerViaAPI(request: APIRequestContext, customer: Customer) {
     const res = await request.post(`${apiBaseURL}/users`, { data: customer });
     expect(res.ok()).toBeTruthy();
     return await res.json(); // { id, ... }
   }
   export async function cleanupCustomer(request: APIRequestContext, id: string) {
     await request.delete(`${apiBaseURL}/users/${id}`);
   }
   ```
4. **Fixture** (`fixtures/test-fixtures.ts` — TODO):
   ```ts
   test.extend<{ customer: Customer }>({
     customer: async ({ request }, use) => {
       const c = createCustomer();
       const seeded = await seedCustomerViaAPI(request, c);
       await use(seeded);
       await cleanupCustomer(request, seeded.id);
     }
   })
   ```
5. **Usage** in spec:
   ```ts
   test('demoqa with seeded customer', async ({ page, customer }) => {
     await form.fillBasicInfo(customer);
   });
   ```

### Decisions needed (your call before we code):
- DemoQA has no real API — should we keep DemoQA as factory-only (UI fill) and only seed for SauceDemo/API AUTs?
- Cleanup strategy: `afterAll` delete vs ephemeral data vs dedicated test tenant for `prod`?

**Next commit:** `utils/apiClient.ts` + `utils/seedHelper.ts` (after your approval).
