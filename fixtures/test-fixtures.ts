import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
};

type AuthFixtures = {
  authenticatedPage: void;
};

type SeededFixtures = {
  seededCustomer: import('../test-data/factories/customerFactory').Customer & { id: string | number; seeded: boolean };
};

export const test = base.extend<Pages & AuthFixtures & SeededFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginWithEnvDefaults();
    await loginPage.assertLoggedIn();
    await use();
  },
  seededCustomer: async ({ request }, use) => {
    // Seeded via API — used for SauceDemo/API suites; DemoQA uses factory-only (getDemoQACustomer)
    const { seedCustomerViaAPI, cleanupCustomer } = await import('../utils/seedHelper');
    const customer = await seedCustomerViaAPI(request, {});
    await use(customer);
    await cleanupCustomer(request, customer.id);
  },
});

export { expect };
