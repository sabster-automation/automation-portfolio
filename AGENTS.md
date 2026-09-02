# AGENTS.md

Single-package Playwright + TypeScript portfolio (`"type":"module"`, `"private":true` in `package.json`). No monorepo. `testDir: ./tests` (`playwright.config.ts:22`).

## Setup

```bash
npm ci
npx playwright install --with-deps
cp .env.example .env   # set ENV=dev|staging|prod, TEST_USERNAME, TEST_PASSWORD
```

Env loading: `.env` then `.env.${ENV}` with `override:true` (`playwright.config.ts:6-8`). Override via `BASE_URL` / `API_BASE_URL` env vars. Per-env URLs in `config/environments.ts:9` — `baseURL` always `saucedemo.com`; `apiBaseURL` is `jsonplaceholder` (dev/prod) or `reqres` (staging).

## Commands

- Full suite: `npm test`
- Single test / project: `npx playwright test tests/e2e/checkout.spec.ts --project=chromium`
- Per-env: `npm run test:dev` | `test:staging` | `test:prod` (via `cross-env ENV=...`) or `ENV=staging npx playwright test --project=chromium`
- API only: `npm run test:api` (`--project=api`, `baseURL: undefined`)
- a11y: `npx playwright test --project=a11y`
- Visual: `npm run test:visual` (chromium-only, `maxDiffPixels: 100, threshold: 0.2` in `playwright.config.ts:37-39`); update `npm run test:visual:update`; dark-mode WIP `npx playwright test --project=visual-dark --update-snapshots` after removing `.skip`
- Reports: `npm run report` (HTML), `npm run test:allure` + `npm run report:allure`
- Verify: `npm run typecheck` (`tsc --noEmit`); `npm run lint` / `npm run format` have no config files — will error if run
- `npm run codegen` for locator generation

## Playwright Projects — Gotchas

- `chromium` ignores `*visual*|*api*|*a11y*|*.setup.ts`; `firefox`/`webkit`/`mobile-chrome` additionally ignore `/demoqa/i` (`playwright.config.ts:12-21`). DemoQA is chromium-only.
- `setup` (`tests/setup/auth.setup.ts`) writes `playwright/.auth/user.json` but **SauceDemo stores session in `sessionStorage`**, so `storageState` is NOT reused — e2e specs log in themselves via `fixtures/test-fixtures.ts:35-41`. Don't add `dependencies:['setup']` to e2e projects.
- `visual` ignores `dark-mode`; `visual-dark` (`colorScheme:'dark'`) matches only `dark-mode.wip.spec.ts`.
- `api` uses no `baseURL`; `a11y` is chromium-only.

## Visual Regression Quirks

- Snapshots are OS-specific (`*-linux.png` on CI vs `*-win32` local). Local updates will fail CI diff. Generate Linux baselines via **Actions → Update Visual Baselines** (`visual-update.yml:31` runs `--update-snapshots` and commits `tests/visual`).
- `visual` job in `playwright.yml:63` runs only on `pull_request` and skips if no `*-snapshots/` dir exists.
- Mask dynamic badges: `{ mask: [page.locator('.shopping_cart_badge')] }` (see `tests/visual/visual.spec.ts`).

## Architecture

- POM: `pages/` (`BasePage.ts`, `LoginPage.ts`, `InventoryPage.ts`, `CartPage.ts`, `CheckoutPage.ts`, `DemoQAPracticeFormPage.ts`)
- Fixtures: `fixtures/test-fixtures.ts:22` extends `base` with `loginPage`/`inventoryPage`/`cartPage`/`checkoutPage`, `authenticatedPage`, `seededCustomer`
- Utils: `utils/apiClient.ts` (Zod `UserSchema` contract, per-env `getEnvConfig().apiBaseURL`) and `utils/seedHelper.ts`
- Path aliases `tsconfig.json:17-22`: `@pages/*`, `@fixtures/*`, `@utils/*`, `@data/*`

## Test Data

- Factories `test-data/factories/customerFactory.ts` via `@faker-js/faker`. DemoQA = factory-only (`getDemoQACustomer({state:'NCR',city:'Delhi'})`); SauceDemo/API = `seededCustomer` fixture → `seedCustomerViaAPI()` → `ApiClient.createUser()` with per-env payload (`seedHelper.ts:31-33`). Cleanup: `DELETE` best-effort dev/staging, **no-op in prod** (dedicated tenant, `seedHelper.ts:54`, `apiClient.ts:75`).

## CI

- `playwright.yml`: matrix `env=[dev,staging] × project=[chromium,firefox]` + `visual` (PR-only) + `api` job. Reporters `html,junit,allure-playwright` (`playwright.config.ts:28-33`). Artifacts `playwright-report-*` / `allure-results*` (30d).
- `visual-update.yml` and `release.yml` / `allure-pages.yml` publish reports to GitHub Pages / Releases.

## Ignored / Don't Commit

`.env`, `.env.*`, `playwright/.auth/`, `allure-results/`, `allure-report/`, `test-results/`, `playwright-report/` all gitignored. Snapshots under `tests/visual/**/*-snapshots/` are committed.
