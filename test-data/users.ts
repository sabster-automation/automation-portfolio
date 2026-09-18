/**
 * Legacy hardcoded test data for SauceDemo — kept for backwards compatibility.
 *
 * Portfolio context (for hiring managers):
 *   - This file is the "before" in a before/after story. It works but has
 *     known limits: same email/name across parallel runs, one shape for all
 *     envs, and edits require touching every spec.
 *   - The "after" is `test-data/factories/customerFactory.ts` (faker-based
 *     factories + API seeding). New specs should use factories; this file
 *     stays until all specs are migrated.
 *
 * For colleagues: prefer factories for new tests. Use `users`/`products`
 * only for legacy SauceDemo flows that need stable, known values (e.g.,
 * `standard_user` is a SauceDemo-provided account, not generated data).
 */

// SauceDemo demo accounts — these are real accounts on https://www.saucedemo.com, not generated data.
// `standard` is the primary happy-path user; others exercise lockout/performance/error variants.
export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  performanceGlitch: { username: 'performance_glitch_user', password: 'secret_sauce' },
  error: { username: 'error_user', password: 'secret_sauce' },
  visual: { username: 'visual_user', password: 'secret_sauce' },
} as const;

// Checkout form data — `valid` is used in happy-path checkout, `invalid` exercises required-field validation.
export const checkoutData = {
  valid: { firstName: 'John', lastName: 'Doe', postalCode: '12345' },
  invalid: { firstName: '', lastName: '', postalCode: '' },
} as const;

// Canonical product names as they appear in SauceDemo inventory — keep in sync with `products` filter in specs.
// Use these constants to avoid typos in `inventoryItem(productName)` lookups.
export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
  fleeceJacket: 'Sauce Labs Fleece Jacket',
  onesie: 'Sauce Labs Onesie',
  redTShirt: 'Test.allTheThings() T-Shirt (Red)',
} as const;
