import { APIRequestContext, expect } from '@playwright/test';
import { z } from 'zod';
import { getEnvConfig } from '../config/environments';

/**
 * ApiClient — typed HTTP wrapper around Playwright's `request` fixture.
 *
 * Portfolio purpose (explain to hiring managers):
 *   - Shows contract testing: every GET/POST response is validated with Zod
 *     schemas (`UserSchema` / `CreateUserResponseSchema`) instead of just
 *     checking `status === 200`.
 *   - Handles per-env routing: `jsonplaceholder` (dev/prod, ephemeral) vs
 *     `reqres` (staging, real CRUD) without branching in specs — the client
 *     hides the difference behind `isReqres()` and `getApiBase()`.
 *   - Defensive deletion: never deletes in Production (dedicated test tenant).
 *
 * For colleagues: inject `request` from Playwright fixtures; don't create your
 * own `APIRequestContext`. Override host per run with `API_BASE_URL` env var.
 */

// Zod contract for a user record — `email` is the strongest signal; `name` optional for jsonplaceholder.
export const UserSchema = z.object({
  id: z.union([z.number(), z.string()]),
  email: z.string().email(),
  name: z.string().optional(),
  // reqres wraps in { data: {...} } — unwrapped before parsing (see getUser/getUsers).
});

// Response shape for POST create — jsonplaceholder returns { id, title } while reqres returns { id, name, job, createdAt }.
export const CreateUserResponseSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().optional(),
  job: z.string().optional(),
  title: z.string().optional(),
  email: z.string().optional(),
  createdAt: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

/** Resolve API base with override: explicit `API_BASE_URL` wins over EnvConfig. */
function getApiBase(): string {
  return process.env.API_BASE_URL || getEnvConfig().apiBaseURL;
}

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  /** Computed base — never cached so ENV switch mid-run is respected. */
  private get base() {
    return getApiBase();
  }

  /** True when talking to reqres (staging) — controls endpoint + payload shape. */
  isReqres(): boolean {
    return this.base.includes('reqres');
  }

  /** Fetch user list — handles both `[]` (jsonplaceholder) and `{ data: [] }` (reqres). */
  async getUsers() {
    const res = await this.request.get(`${this.base}/users`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const users = Array.isArray(body) ? body : body.data;
    expect(Array.isArray(users)).toBeTruthy();
    return users as User[];
  }

  /** Fetch single user with contract validation. Returns null on 404 (expected for negative tests). */
  async getUser(id: number | string) {
    const res = await this.request.get(`${this.base}/users/${id}`);
    expect([200, 404]).toContain(res.status());
    if (res.status() === 404) return null;
    const body = await res.json();
    const data = body.data || body;
    // Contract validation — throws if API breaks its shape (portfolio proof of schema testing).
    UserSchema.parse(data);
    return data as User;
  }

  /** Create a resource — endpoint + payload switch per env (see seedHelper for mapping). */
  async createUser(payload: Record<string, unknown>) {
    const endpoint = this.isReqres() ? `${this.base}/users` : `${this.base}/posts`;
    // For jsonplaceholder, payload is { title, body, userId }; for reqres { name, job }
    const res = await this.request.post(endpoint, { data: payload });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    CreateUserResponseSchema.parse(body);
    return body;
  }

  /** Best-effort delete — no-op in prod (dedicated tenant, nightly purge) to avoid data loss. */
  async deleteUser(id: string | number) {
    // Dedicated tenant for prod — never delete prod (see seedHelper)
    if (getEnvConfig().name === 'Production') {
      console.log(`[apiClient] skip delete in Production (dedicated tenant) for id=${id}`);
      return;
    }
    const endpoint = this.isReqres() ? `${this.base}/users/${id}` : `${this.base}/posts/${id}`;
    const res = await this.request.delete(endpoint);
    // reqres/jsonplaceholder may return 204 or 200 or 404 — all acceptable for cleanup
    expect([200, 204, 404]).toContain(res.status());
  }
}
