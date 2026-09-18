# 🎭 Playwright Automation Showcase — Test Automation Engineer Portfolio

> Production-grade **Playwright + TypeScript** framework showcasing E2E, API, **Visual Regression**, **Accessibility** & **Allure Reporting** across **multiple environments** — built on real-world apps.

[![Playwright Tests](https://github.com/sabster-automation/automation-portfolio/actions/workflows/playwright.yml/badge.svg)](https://github.com/sabster-automation/automation-portfolio/actions/workflows/playwright.yml)
[![Allure Report](https://github.com/sabster-automation/automation-portfolio/actions/workflows/allure-pages.yml/badge.svg)](https://sabster-automation.github.io/automation-portfolio/)
![Playwright](https://img.shields.io/badge/Playwright-1.49-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Visual Regression](https://img.shields.io/badge/Visual-Regression-purple)
![a11y](https://img.shields.io/badge/a11y-axe--core-blue)
![Allure](https://img.shields.io/badge/Allure-Report-orange)

---

## 🎯 What This Showcases

| Skill | Demonstrated By |
|-------|----------------|
| **Playwright + TypeScript** | Strict TS, POM, fixtures, `data-test` locators — fully commented for colleagues/hiring managers (`pages/`, `config/`, `utils/`, `test-data/`, `tests/`) |
| **Real E2E Scenarios** | Full checkout on [SauceDemo](https://www.saucedemo.com) + Practice Form on [DemoQA](https://demoqa.com/automation-practice-form) (file upload, date picker, react-select) |
| **Visual Regression** | `toHaveScreenshot()` with thresholds, masking, mobile |
| **Accessibility (a11y)** | `@axe-core/playwright` WCAG 2.1, `tests/a11y/a11y.spec.ts` |
| **Auth Pattern** | `tests/setup/auth.setup.ts` writes `playwright/.auth/user.json` — e2e log in via fixtures because SauceDemo uses `sessionStorage` (documents `storageState` limits) |
| **Multi-Environment** | `ENV=dev\|staging\|prod` via `config/environments.ts` + CI matrix |
| **API Testing** | Playwright `request` — GET/POST, Zod schema, chaining |
| **Test Data** | `@faker-js/faker` factories (`test-data/factories/customerFactory.ts`) + seeding `utils/seedHelper.ts`/`utils/apiClient.ts`; legacy `test-data/users.ts` retained for migration reference |
| **Reporting** | HTML + JUnit + **Allure** (`allure-playwright`) → GitHub Pages |
| **Guides & MCP** | Step-by-step rebuild guide `docs/GUIDE-Step-By-Step.html` + Playwright MCP for Opencode/VS Code (`opencode.json`, `.vscode/mcp.json`) |
| **CI/CD** | GitHub Actions matrix (env × browser) + Allure Pages |

## 🚀 Quick Start

```bash
git clone https://github.com/sabster-automation/automation-portfolio.git
cd automation-portfolio
npm ci
npx playwright install --with-deps
cp .env.example .env
npm test
npm run test:ui   # UI mode
```

## 🌍 Environments

```bash
npm run test:dev
npm run test:staging
npm run test:prod
ENV=staging npx playwright test
```

## 👁️ Visual Regression

Visual tests catch unintended UI changes via Playwright's native `toHaveScreenshot()` (threshold `0.2`, `maxDiffPixels: 100`, masking dynamic badges).

```bash
npm run test:visual -- --update-snapshots  # baselines
npm run test:visual:ci                     # CI check
```

| Baseline example (SauceDemo) | What is checked |
|---|---|
| ![Login page baseline](docs/images/login-page.png) | Login form layout, logo, inputs — full page |
| ![Inventory baseline](docs/images/inventory-page.png) | Product grid, sort dropdown, cart badge |
| ![Cart baseline](docs/images/cart-page.png) | Cart items, checkout button, totals |

> **How it works in CI:** Dedicated `visual` project (`playwright.config.ts:63`) runs only on `pull_request` (`playwright.yml` + `visual-update.yml`). On failure, diff PNG is attached to the HTML report (`test-results/`).  
> **Portfolio tip:** In a PR, the diff is visible in the uploaded `playwright-report` artifact — share the PR URL in interviews.

**Techniques showcased:**
- `await expect(page).toHaveScreenshot('login-page.png')` with `threshold`/`maxDiffPixels`
- Masking flaky badges: `{ mask: [page.locator('.shopping_cart_badge')] }`
- Responsive: `page.setViewportSize({ width: 375, height: 812 })` → `login-mobile.png`
- Dedicated `visual` project for stability (chromium only)

> Snapshots are OS-specific (`-linux` on CI vs `-win32` local). Generate Linux baselines via **Actions → Update Visual Baselines → Run workflow**.

## 🔌 API Tests

```bash
npm run test:api
```

## ♿ Accessibility (a11y)

```bash
npx playwright test --project=a11y          # axe WCAG 2.1
npx playwright test tests/a11y --reporter=html
```

Checks via `AxeBuilder`: `wcag2a`, `wcag2aa`, critical/serious gate, attachments in HTML report. Also manual checks: `alt` text, heading hierarchy.

## 🔐 Auth Pattern (storageState — with caveat)

```bash
npx playwright test --project=setup   # creates playwright/.auth/user.json (smoke)
npx playwright test --project=chromium # still logs in via fixtures (sessionStorage)
```

`tests/setup/auth.setup.ts` writes `playwright/.auth/user.json` as a pattern demo. SauceDemo stores its session in `sessionStorage`, which `storageState` does not restore, so e2e specs log in themselves via `fixtures/test-fixtures.ts:35-41` (`loginPage.loginWithEnvDefaults()`). Don't add `dependencies: ['setup']` to e2e projects for this AUT — wire `storageState` only when forking to a cookie/localStorage app. See `AGENTS.md` and inline comments in `tests/setup/auth.setup.ts`.

## 📊 Allure Report

```bash
npm run test:allure          # generates allure-results
npm run report:allure        # serves allure-report locally
```

CI: `allure-pages.yml` publishes to **GitHub Pages** → https://sabster-automation.github.io/automation-portfolio/ (enable Pages: Settings → Pages → Source: GitHub Actions).

## 🚀 Releases — Automation Reports

Every release bundles the executable Playwright reports (no need to hunt artifacts).

**Trigger a release:**

```bash
# Option A — manual (recommended for portfolio):
gh workflow run release.yml -f tag=v1.0.0
# or GitHub UI: Actions → Release with Reports → Run workflow → tag: v1.0.0

# Option B — tag push:
git tag v1.0.0 && git push origin v1.0.0
```

**What you get in the Release (`Releases` tab):**

- `playwright-report.zip` — open `index.html` or `npx playwright show-report`
- `allure-report.zip` — `allure open allure-report`
- `allure-results.zip` — raw results for history/trends
- `junit.xml` — for dashboards
- Auto-generated `REPORT_SUMMARY.md`

Workflow: `.github/workflows/release.yml` runs `chromium` + `api` + `a11y` with `html,allure-playwright,junit` reporters, builds `allure-report`, zips assets, and creates the Release via `softprops/action-gh-release`.

> The latest release is linkable in your CV: `https://github.com/sabster-automation/automation-portfolio/releases/latest` → shows stakeholders the actual HTML report.

## 📖 Guides & MCP

- **Rebuild & reference guide:** `docs/GUIDE-Step-By-Step.html` — offline, self-contained HTML with TOC: architecture diagram, 14-step rebuild from empty folder, and front-end/back-end reference for every `pages/`, `config/`, `utils/`, `test-data/`, `tests/` module.
- **Playwright MCP:** `opencode.json` (Opencode) and `.vscode/mcp.json` (VS Code) both expose `npx @playwright/mcp@latest` — enable browser automation via MCP. Global Opencode config is `~/.config/opencode/opencode.jsonc`.

---

## 🌱 Test Data and Seeding

Legacy `test-data/users.ts` coexists with factories — factories are the forward path for isolation, realism and per-env flexibility (`test-data/factories/README.md` removed 2026-09; see `customerFactory.ts` header). `utils/helpers.ts` was removed as unused.

**Factories:** `test-data/factories/customerFactory.ts` (`@faker-js/faker`)
```ts
import { createCustomer, getDemoQACustomer } from './test-data/factories/customerFactory';
const customer = createCustomer({ state: 'NCR', city: 'Delhi' }); // overrides for DemoQA constraints
const checkout = createCheckoutCustomer({ postalCode: '12345' });
```

**Seeding:**

- **DemoQA — factory-only** (no API): `getDemoQACustomer()` → `await form.fillBasicInfo(customer)` (UI fill only).
- **SauceDemo/API — factory + API:** `utils/apiClient.ts` (typed wrapper with `Zod` schemas `UserSchema`/`CreateUserResponseSchema`, per-env `getEnvConfig().apiBaseURL`) + `utils/seedHelper.ts`:

```ts
// seedHelper.ts
export async function seedCustomerViaAPI(request, overrides) {
  const customer = createCustomer(overrides);
  const created = await new ApiClient(request).createUser(payload); // POST /users or /api/users
  return { ...customer, id: created.id, seeded: true };
}
export async function cleanupCustomer(request, id) {
  if (getEnvConfig().name === 'Production') return; // dedicated tenant, nightly purge
  await new ApiClient(request).deleteUser(id); // best-effort DELETE for dev/staging
}
```

**Fixture:** `fixtures/test-fixtures.ts` exposes `seededCustomer`:
```ts
test('with seeded customer', async ({ seededCustomer }) => {
  await form.fillBasicInfo(seededCustomer);
});
// cleanup runs automatically after test via fixture teardown
```

**Per-env:** `dev` (`jsonplaceholder` — ephemeral, no real delete), `staging` (`reqres` — `DELETE 204`), `prod` — no-op (dedicated tenant). `demoqa-practice-form.spec.ts` still uses hardcoded `Sebastian Cichon` — next step is migrating to `getDemoQACustomer()`.

---

## 🗺️ Roadmap — What's Next

> This is a live and unfinished portfolio. Items below are planned based on skills I have and also ones that I want to acquire. Happy to include these in any interview discussions.

**In Progress / Next (Q4 2026):**

- [x] **Second real AUT** — `demoqa.com` — Practice Form (`tests/e2e/demoqa-practice-form.spec.ts` + `pages/DemoQAPracticeFormPage.ts`) — file upload, date picker, react-select, modal → proves AUT-agnostic design vs SauceDemo e-commerce
- [x] **Test data factories** — `@faker-js/faker` factories in `test-data/factories/` (`customerFactory.ts`) + seeding via `utils/apiClient.ts` (Zod contract) & `utils/seedHelper.ts` (hybrid cleanup: `DELETE` for dev/staging, no-op for prod tenant; `factory-only` for DemoQA) + `seededCustomer` fixture in `fixtures/test-fixtures.ts`. Next: migrate `demoqa-practice-form.spec.ts` from hardcoded to `getDemoQACustomer()` — now commented for hiring-manager walkthrough.
- [x] **Code documentation for hiring managers** — 2026-09: added contextual comments across `pages/`, `config/environments.ts`, `utils/`, `test-data/`, `tests/` explaining portfolio rationale and stability techniques
- [x] **Guides & MCP** — `docs/GUIDE-Step-By-Step.html` + `opencode.json`/`.vscode/mcp.json` Playwright MCP for Opencode/VS Code
- [ ] **Mobile + cross-browser hardening** — `mobile-chrome`/`webkit` in nightly matrix + BrowserStack connector example
- [ ] **Dark-mode visual baselines** — *WIP* — scaffolding in `tests/visual/dark-mode.wip.spec.ts` + `utils/theme.ts` + `visual-dark` project (`colorScheme: 'dark'`, emulates `prefers-color-scheme: dark` + injected invert filter, separate `*-dark.png` baselines; run `npx playwright test --project=visual-dark --update-snapshots` after removing `.skip`)

**Up Next:**

- [ ] **Contract & schema validation** — Zod schemas for `jsonplaceholder` / `reqres` responses + snapshot API (shows API quality beyond status codes)
- [ ] **Performance budgets** — `responseTime < 800ms` assertions + Lighthouse CI for cart/checkout (perf as quality gate)
- [ ] **Security smoke** — negative tests: XSS payload in checkout fields, lockout brute-force, `storageState` isolation proof
- [ ] **Flaky-test quarantine** — `test.fail()` + `allure` history trend + Slack webhook on nightly failure

**Nice to have / Ideas:**

- [ ] Component testing for design system (Storybook + Playwright CT)
- [ ] Load smoke with `k6` wired to same `ENV` config

Contributions/PRs that implement a roadmap item are welcome — see `tests/` for patterns.

---

Built to showcase some of the skills I have to offer. Can be used as a Portfolio during and Interview Process. Happy testing!
