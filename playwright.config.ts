import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { getBaseURL } from './config/environments';

// Load `.env` first so ENV=staging in that file selects `.env.staging`.
dotenv.config({ path: '.env' });
const env = process.env.ENV || 'dev';
dotenv.config({ path: `.env.${env}`, override: true });

const baseURL = getBaseURL();

const skipInBrowserE2E = [
  /.*visual.*\.spec\.ts/,
  /.*api.*\.spec\.ts/,
  /.*a11y.*\.spec\.ts/,
  /.*\.setup\.ts/,
];

// DemoQA is a second AUT; keep it on chromium only to avoid 4-browser flake.
const skipOutsideChromium = [...skipInBrowserE2E, /demoqa/i];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
    ['list'],
  ],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // Writes playwright/.auth/user.json. SauceDemo keeps the session in
    // sessionStorage, so e2e projects log in themselves and do not consume this file.
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: skipInBrowserE2E,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: skipOutsideChromium,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: skipOutsideChromium,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      testIgnore: skipOutsideChromium,
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*visual.*\.spec\.ts/,
      testIgnore: /.*dark-mode.*/,
    },
    {
      name: 'visual-dark',
      use: { ...devices['Desktop Chrome'], colorScheme: 'dark' },
      testMatch: /.*dark-mode.*\.spec\.ts/,
    },
    {
      name: 'api',
      use: { baseURL: undefined },
      testMatch: /.*api.*\.spec\.ts/,
    },
    {
      name: 'a11y',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*a11y.*\.spec\.ts/,
    },
  ],
});
