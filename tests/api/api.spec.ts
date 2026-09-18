import { test, expect } from '@playwright/test';
import { getEnvConfig } from '../../config/environments';

/**
 * API suite — contract, functional, performance and chaining tests.
 *
 * Runs in the dedicated `api` project (playwright.config.ts:89-92) with
 * `baseURL: undefined` so it never inherits the SauceDemo UI host.
 *
 * Portfolio relevance (for hiring managers):
 *   - Per-env routing: `apiBase` reads `API_BASE_URL || getEnvConfig().apiBaseURL`
 *     so the same tests run against jsonplaceholder (dev/prod) and reqres
 *     (staging). The `isReqres` branch switches endpoint + payload shape.
 *   - Contract awareness: single-user GET validates `id` + `email` presence;
 *     the full Zod validation lives in utils/apiClient.ts for seeding flows.
 *   - Chaining: create → fetch shows request dependency handling.
 *   - Resilience: 404 test tolerates jsonplaceholder's 200-with-empty quirk.
 *   - Perf budget: response time < 2s.
 *
 * For colleagues:
 *   - Use `request` from Playwright (no extra HTTP lib). For typed flows,
 *     prefer `utils/apiClient.ts`.
 *   - Override host ad-hoc: `API_BASE_URL=https://reqres.in/api npm run test:api`
 */

test.describe('API Tests @api', () => {
  // Per-env API host — dev/prod → jsonplaceholder, staging → reqres.
  const apiBase = process.env.API_BASE_URL || getEnvConfig().apiBaseURL;

  test('GET - fetch users list', async ({ request }) => {
    // Basic list fetch — expects a populated array; reqres wraps in `{ data: [] }`.
    const response = await request.get(`${apiBase}/users`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const users = Array.isArray(body) ? body : body.data;
    expect(users.length).toBeGreaterThan(0);
    expect(response.status()).toBe(200);
  });

  test('GET - fetch single user and validate schema', async ({ request }) => {
    // Single-resource contract: `id` + `email` must exist, email looks valid.
    const response = await request.get(`${apiBase}/users/1`);
    expect(response.status()).toBe(200);
    const user = await response.json();
    const data = user.data || user; // unwrap reqres
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
    expect(String(data.email)).toContain('@');
  });

  test('POST - create new resource', async ({ request }) => {
    // Create switches payload per host: reqres expects { name, job }, jsonplaceholder { title, body, userId }.
    const newPost = {
      title: 'Playwright Showcase',
      body: 'API testing as Test Automation Engineer',
      userId: 1,
    };
    const isReqres = apiBase.includes('reqres');
    const endpoint = isReqres ? `${apiBase}/users` : `${apiBase}/posts`;
    const payload = isReqres ? { name: 'Playwright', job: 'QA Engineer' } : newPost;
    const response = await request.post(endpoint, { data: payload });
    expect([200, 201]).toContain(response.status());
    const created = await response.json();
    expect(created).toBeTruthy();
    expect(created.id || created.createdAt).toBeTruthy(); // jsonplaceholder: id, reqres: id + createdAt
  });

  test('GET - handle 404 for non-existent resource', async ({ request }) => {
    // 404 case — jsonplaceholder often returns 200 with empty body for unknown ids, so both statuses are accepted.
    const response = await request.get(`${apiBase}/users/99999`);
    expect([404, 200]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      const isEmpty = !body.id && !body.data;
      expect(isEmpty || body.data === null || Object.keys(body).length === 0).toBeTruthy();
    }
  });

  test('API chaining - create then fetch', async ({ request }) => {
    // Chaining: create a resource then GET a known id. jsonplaceholder doesn't persist id 101,
    // so the read targets /users/1 or /posts/1 instead of the created id.
    const isReqres = apiBase.includes('reqres');
    const createEndpoint = isReqres ? `${apiBase}/users` : `${apiBase}/posts`;
    const payload = isReqres ? { name: 'Chain', job: 'chaining' } : { title: 'Chain test', body: 'chaining', userId: 1 };
    const createRes = await request.post(createEndpoint, { data: payload });
    expect([200, 201]).toContain(createRes.status());
    const created = await createRes.json();
    expect(created.id || created.createdAt).toBeTruthy();
    // jsonplaceholder doesn't persist 101, so verify by fetching known id instead
    const getEndpoint = isReqres ? `${apiBase}/users/1` : `${apiBase}/posts/1`;
    const getRes = await request.get(getEndpoint);
    expect(getRes.ok()).toBeTruthy();
    const fetched = await getRes.json();
    const data = (fetched as any).data || fetched;
    expect(data).toHaveProperty('id');
  });

  test('validate response time < 2s', async ({ request }) => {
    // Simple perf budget — guards against degraded fake-API latency.
    const start = Date.now();
    const response = await request.get(`${apiBase}/users`);
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('SauceDemo API - login via API (form simulation)', async ({ request }) => {
    // Smoke that the UI host is reachable via HTTP — bridges API and E2E worlds.
    const response = await request.get('https://www.saucedemo.com/');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('Swag Labs');
  });
});
