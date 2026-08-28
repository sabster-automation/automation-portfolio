import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { getBaseURL } from './config/environments';

const env = process.env.ENV || 'dev';
dotenv.config({ path: `.env.${env}` });
dotenv.config({ path: '.env' });

const baseURL = getBaseURL();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
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
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*visual.*\.spec\.ts/,
    },
    {
      name: 'api',
      use: { baseURL: undefined },
      testMatch: /.*api.*\.spec\.ts/,
    },
  ],
});
