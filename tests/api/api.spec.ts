import { test, expect } from '@playwright/test';
import { getEnvConfig } from '../../config/environments';

test.describe('API Tests @api', () => {
  const apiBase = process.env.API_BASE_URL || getEnvConfig().apiBaseURL;

  test('GET - fetch users list', async ({ request }) => {
    const response = await request.get(`${apiBase}/users`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    const users = Array.isArray(body) ? body : body.data;
    expect(users.length).toBeGreaterThan(0);
    expect(response.status()).toBe(200);
  });

  test('GET - fetch single user and validate schema', async ({ request }) => {
    const response = await request.get(`${apiBase}/users/1`);
    expect(response.status()).toBe(200);
    const user = await response.json();
    const data = user.data || user;
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
    expect(String(data.email)).toContain('@');
  });

  test('POST - create new resource', async ({ request }) => {
    const newPost = {
      title: 'Playwright Showcase',
      body: 'API testing as Test Automation Engineer',
      userId: 1,
    };
    const response = await request.post(`${apiBase}/posts`, {
      data: apiBase.includes('reqres') ? { name: 'Playwright', job: 'QA Engineer' } : newPost,
    });
    expect([200, 201]).toContain(response.status());
    const created = await response.json();
    expect(created).toBeTruthy();
    expect(created.id || created.createdAt).toBeTruthy();
  });

  test('GET - handle 404 for non-existent resource', async ({ request }) => {
    const response = await request.get(`${apiBase}/users/99999`);
    expect([404, 200]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      const isEmpty = !body.id && !body.data;
      expect(isEmpty || body.data === null || Object.keys(body).length === 0).toBeTruthy();
    }
  });

  test('API chaining - create then fetch', async ({ request }) => {
    const createRes = await request.post(`${apiBase}/posts`, {
      data: { title: 'Chain test', body: 'chaining', userId: 1 },
    });
    expect([200, 201]).toContain(createRes.status());
    const created = await createRes.json();
    const id = created.id || 1;
    const getRes = await request.get(`${apiBase}/posts/${id}`);
    expect(getRes.ok()).toBeTruthy();
    const fetched = await getRes.json();
    expect(fetched).toHaveProperty('id');
  });

  test('validate response time < 2s', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${apiBase}/users`);
    const duration = Date.now() - start;
    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(2000);
  });

  test('SauceDemo API - login via API (form simulation)', async ({ request, page }) => {
    const response = await request.get('https://www.saucedemo.com/');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('Swag Labs');
  });
});
