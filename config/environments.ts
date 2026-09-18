/**
 * Environment configuration — single source of truth for all per-env URLs.
 *
 * Portfolio intent: demonstrates multi-environment strategy without duplicating
 * tests. A hiring manager can see at a glance how the same suite runs against
 * dev/staging/prod by switching ENV, and how the API host is intentionally
 * different per env (jsonplaceholder for dev/prod, reqres for staging) to
 * showcase handling of heterogeneous back-ends.
 *
 * Loading order (see playwright.config.ts:6-8):
 *   1. dotenv loads `.env` → reads ENV inside it
 *   2. dotenv loads `.env.${ENV}` with override:true → env-specific overrides win
 *   3. Direct env vars (BASE_URL / API_BASE_URL) win over everything via getBaseURL()/getApiBase()
 *
 * For colleagues: add a new env by extending this map and adding a matching
 * `.env.<name>` file. No test file needs to change — fixtures and ApiClient
 * read from here automatically.
 */
export type Environment = 'dev' | 'staging' | 'prod';

/** Resolved config for one environment — keep shape small and serialisable. */
export interface EnvConfig {
  /** UI host for Playwright `baseURL` (SauceDemo is same across envs — realistic for portfolio; swap when forking). */
  baseURL: string;
  /** API host for utils/apiClient.ts — this is what actually varies per env. */
  apiBaseURL: string;
  /** Human label for logs/reports (Development / Staging / Production). */
  name: string;
}

/**
 * Per-environment map.
 * - `baseURL` is intentionally identical (SauceDemo) so E2E can be compared
 *   across envs without AUT drift. Override via BASE_URL env var when needed.
 * - `apiBaseURL` uses two public fake APIs to demonstrate payload/contract
 *   switching: jsonplaceholder (dev/prod, ephemeral) vs reqres (staging, real CRUD).
 */
export const environments: Record<Environment, EnvConfig> = {
  dev: {
    name: 'Development',
    baseURL: 'https://www.saucedemo.com',
    apiBaseURL: 'https://jsonplaceholder.typicode.com',
  },
  staging: {
    name: 'Staging',
    baseURL: 'https://www.saucedemo.com',
    apiBaseURL: 'https://reqres.in/api',
  },
  prod: {
    name: 'Production',
    baseURL: 'https://www.saucedemo.com',
    apiBaseURL: 'https://jsonplaceholder.typicode.com',
  },
};

/**
 * Resolve current EnvConfig from `process.env.ENV`.
 * Defaults to 'dev' so `npm test` works with zero config.
 * Throws on unknown ENV — fail fast rather than silently hitting wrong host.
 */
export function getEnvConfig(): EnvConfig {
  const env = (process.env.ENV as Environment) || 'dev';
  if (!environments[env]) {
    throw new Error(`Unknown ENV="${env}". Valid: ${Object.keys(environments).join(', ')}`);
  }
  return environments[env];
}

/**
 * Resolve UI baseURL with override support.
 * Priority: BASE_URL env var > EnvConfig.baseURL
 * Useful for ad-hoc runs: `BASE_URL=https://staging.example.com npm test`
 */
export function getBaseURL(): string {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  return getEnvConfig().baseURL;
}
