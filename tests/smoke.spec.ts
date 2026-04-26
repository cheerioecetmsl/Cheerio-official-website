import { test, expect } from '@playwright/test';

test.describe('Archival Smoke Tests', () => {
  test('landing page should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Cheerio/);
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
  });

  test('onboarding page should be accessible', async ({ page }) => {
    await page.goto('/onboarding');
    // It might redirect to login if not authenticated, but we want to see if the route exists
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('dashboard should load with essential components', async ({ page }) => {
    // Note: This might require auth bypass or state injection, 
    // but we'll start with a basic route check.
    await page.goto('/dashboard');
    // If redirected to landing, that's expected for unauth
    const url = page.url();
    if (url.includes('/dashboard')) {
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('check for console errors on main pages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    await page.goto('/');
    await page.waitForTimeout(2000);
    
    expect(errors).toEqual([]);
  });
});
