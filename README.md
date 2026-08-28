# 🎭 Playwright Automation Showcase — Test Automation Engineer Portfolio

> Production-grade **Playwright + TypeScript** framework showcasing E2E, API, **Visual Regression**, **Accessibility** & **Allure Reporting** across **multiple environments** — built on real-world apps.

[![Playwright Tests](https://github.com/sebastian-cichon/playwright-automation-showcase/actions/workflows/playwright.yml/badge.svg)](https://github.com/sebastian-cichon/playwright-automation-showcase/actions/workflows/playwright.yml)
[![Allure Report](https://github.com/sebastian-cichon/playwright-automation-showcase/actions/workflows/allure-pages.yml/badge.svg)](https://sebastian-cichon.github.io/playwright-automation-showcase/)
![Playwright](https://img.shields.io/badge/Playwright-1.49-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Visual Regression](https://img.shields.io/badge/Visual-Regression-purple)
![a11y](https://img.shields.io/badge/a11y-axe--core-blue)
![Allure](https://img.shields.io/badge/Allure-Report-orange)

---

## 🎯 What This Showcases

| Skill | Demonstrated By |
|-------|----------------|
| **Playwright + TypeScript** | Strict TS, POM, fixtures, `data-test` locators |
| **Real E2E Scenarios** | Full checkout on [SauceDemo](https://www.saucedemo.com) |
| **Visual Regression** | `toHaveScreenshot()` with thresholds, masking, mobile |
| **Accessibility (a11y)** | `@axe-core/playwright` WCAG 2.1, `tests/a11y/a11y.spec.ts` |
| **Auth Optimization** | `storageState` via `tests/setup/auth.setup.ts` — 10x faster suite |
| **Multi-Environment** | `ENV=dev\|staging\|prod` via `config/environments.ts` + CI matrix |
| **API Testing** | Playwright `request` — GET/POST, schema, chaining |
| **Reporting** | HTML + JUnit + **Allure** (`allure-playwright`) → GitHub Pages |
| **CI/CD** | GitHub Actions matrix (env × browser) + Allure Pages |

## 🚀 Quick Start

```bash
git clone https://github.com/sebastian-cichon/playwright-automation-showcase.git
cd playwright-automation-showcase
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

```bash
npm run test:visual -- --update-snapshots  # baselines
npm run test:visual:ci                     # CI check
```

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

## 🔐 Auth Reuse (storageState)

```bash
npx playwright test --project=setup   # creates playwright/.auth/user.json
npx playwright test --project=chromium # reuses session (no login)
```

Setup project `tests/setup/auth.setup.ts` logs in once → `dependencies: ['setup']` in `playwright.config.ts`. Shows senior optimization: avoids 20x logins.

## 📊 Allure Report

```bash
npm run test:allure          # generates allure-results
npm run report:allure        # serves allure-report locally
```

CI: `allure-pages.yml` publishes to **GitHub Pages** → https://sebastian-cichon.github.io/playwright-automation-showcase/ (enable Pages: Settings → Pages → Source: GitHub Actions).

---

Built to be forked and discussed in interviews. Happy testing! 🎭
