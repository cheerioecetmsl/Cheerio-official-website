import { test, expect } from '@playwright/test';

test.describe('Archival UI Rendering Tests', () => {
  test('hero section should have premium aesthetic elements', async ({ page }) => {
    await page.goto('/');
    // Check for the "CHEERIO 2026" branding in navbar or hero
    const branding = page.locator('text=/CHEERIO 2026/i');
    await expect(branding.first()).toBeVisible();
    
    // Check for cinematic font (EB Garamond or serif)
    const h1 = page.locator('h1');
    const computedStyle = await h1.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(computedStyle.toLowerCase()).toMatch(/garamond|serif/);
  });

  test('navbar should be visible and functional on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // For unauthenticated users, we expect a "Sign In" button
    await expect(page.locator('text=/Sign In/i')).toBeVisible();
  });

  test('community pages should load their specific headers', async ({ page }) => {
    const categories = ['seniors', 'faculty', 'organizers'];
    for (const cat of categories) {
      await page.goto(`/community/${cat}`);
      // Check for DirectoryHeader component rendering
      const header = page.locator('h1');
      await expect(header).toBeVisible();
    }
  });
});
