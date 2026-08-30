import { APIRequestContext, expect } from '@playwright/test';
import { z } from 'zod';
import { getEnvConfig } from '../config/environments';

/**
 * Typed API client wrapping Playwright request
 * Showcases contract testing via Zod + per-env baseURL
 */

export const UserSchema = z.object({
  id: z.union([z.number(), z.string()]),
  email: z.string().email(),
  name: z.string().optional(),
  // reqres wraps in { data: {...} }
});

export const CreateUserResponseSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string().optional(),
  job: z.string().optional(),
  title: z.string().optional(),
  email: z.string().optional(),
  createdAt: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

function getApiBase(): string {
  return process.env.API_BASE_URL || getEnvConfig().apiBaseURL;
}

export class ApiClient {
  constructor(private request: APIRequestContext) {}

  private get base() {
    return getApiBase();
  }

  isReqres(): boolean {
    return this.base.includes('reqres');
  }

  async getUsers() {
    const res = await this.request.get(`${this.base}/users`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const users = Array.isArray(body) ? body : body.data;
    expect(Array.isArray(users)).toBeTruthy();
    return users as User[];
  }

  async getUser(id: number | string) {
    const res = await this.request.get(`${this.base}/users/${id}`);
    expect([200, 404]).toContain(res.status());
    if (res.status() === 404) return null;
    const body = await res.json();
    const data = body.data || body;
    // Contract validation
    UserSchema.parse(data);
    return data as User;
  }

  async createUser(payload: Record<string, unknown>) {
    const endpoint = this.isReqres() ? `${this.base}/users` : `${this.base}/posts`;
    // For jsonplaceholder, payload is { title, body, userId }; for reqres { name, job }
    const res = await this.request.post(endpoint, { data: payload });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    CreateUserResponseSchema.parse(body);
    return body;
  }

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
