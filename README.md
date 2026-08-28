# 🎭 Playwright Automation Showcase — Test Automation Engineer Portfolio

> Production-grade **Playwright + TypeScript** framework showcasing E2E, API, and **Visual Regression** testing across **multiple environments** — built on real-world apps.

[![Playwright Tests](https://github.com/sebastian-cichon/playwright-automation-showcase/actions/workflows/playwright.yml/badge.svg)](https://github.com/sebastian-cichon/playwright-automation-showcase/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-1.49-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Visual Regression](https://img.shields.io/badge/Visual-Regression-purple)

---

## 🎯 What This Showcases

| Skill | Demonstrated By |
|-------|----------------|
| **Playwright + TypeScript** | Strict TS, POM, fixtures, `data-test` locators |
| **Real E2E Scenarios** | Full checkout on [SauceDemo](https://www.saucedemo.com) |
| **Visual Regression** | `toHaveScreenshot()` with thresholds, masking, mobile |
| **Multi-Environment** | `ENV=dev\|staging\|prod` via `config/environments.ts` + CI matrix |
| **API Testing** | Playwright `request` — GET/POST, schema, chaining |
| **CI/CD** | GitHub Actions matrix (env × browser) |

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

---

Built to be forked and discussed in interviews. Happy testing! 🎭
