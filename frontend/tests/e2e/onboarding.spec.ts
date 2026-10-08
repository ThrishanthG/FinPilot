import { test, expect } from '@playwright/test';

test.describe('FinPilot E2E User Flow', () => {
  
  test('should navigate through signup with disclaimer consent, onboarding, and display dashboard metrics', async ({ page }) => {
    // 1. Visit landing page
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/FinPilot/);
    
    // Check if SEBI advisory notice is visible on landing
    await expect(page.locator('text=SEBI Compliance Advisory')).toBeVisible();

    // 2. Go to register page
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*auth/);

    // Switch to register tab
    await page.click('button:has-text("Register")');

    // Fill registration credentials
    await page.fill('input[placeholder="Aarav Sharma"]', 'Test User');
    await page.fill('input[placeholder="name@company.com"]', `testuser_${Date.now()}@test.com`);
    await page.fill('input[placeholder="••••••••"]', 'securepassword123');

    // Try to register without clicking consent checkbox (should show validation error)
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=You must consent to the SEBI advisory disclaimer to register')).toBeVisible();

    // Now click the consent checkbox
    await page.check('input[id="consentedToDisclaimer"]');
    
    // Submit registration
    await page.click('button:has-text("Register")');
    
    // Wait for redirect to login
    await expect(page.locator('text=Account created successfully')).toBeVisible();
    
    // 3. Log In
    await page.fill('input[placeholder="name@company.com"]', 'user@smartfinance.com'); // standard seeded user
    await page.fill('input[placeholder="••••••••"]', 'user1234');
    await page.click('button:has-text("Sign In")');

    // Wait and verify we hit the Dashboard (since user@smartfinance.com is already assessed in seeds)
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/.*dashboard/);

    // 4. Verify Dashboard Widgets
    await expect(page.locator('text=Total Assets Value')).toBeVisible();
    await expect(page.locator('text=Suggested Model Asset Allocation')).toBeVisible();
    await expect(page.locator('text=Investment Growth Calculator')).toBeVisible();

    // Test AI Chat helper opening
    await page.click('text=Ask AI Helper');
    await expect(page.locator('text=AI Financial Helper')).toBeVisible();
    await expect(page.locator('text=Compliance Guard Active')).toBeVisible();

    // Send a query
    await page.fill('input[placeholder*="Ask about large cap"]', 'Give me stock tips');
    await page.click('button:has-text("Send")');
    
    // Verify chatbot returns compliance disclaimers
    await page.waitForTimeout(1000);
    await expect(page.locator('text=SEBI guidelines')).toBeVisible();
  });

});
