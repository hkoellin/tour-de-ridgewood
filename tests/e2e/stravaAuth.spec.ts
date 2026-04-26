import { test, expect } from "@playwright/test";

/**
 * E2E tests for Strava OAuth flow.
 * These tests are stubs documenting expected behavior.
 * Actual OAuth flow requires a live Strava account and cannot be fully automated.
 * Use Playwright's mock network feature or a test Strava app for CI.
 */

test.describe("Strava OAuth flow", () => {
  test.skip(true, "Requires live Strava OAuth app — run manually or with mocked OAuth server");

  test("clicking 'Connect with Strava' redirects to Strava authorization URL", async ({ page }) => {
    await page.goto("/");

    const connectBtn = page.getByRole("link", { name: /connect with strava/i });
    await connectBtn.click();

    // Should redirect to Strava OAuth authorization endpoint
    await expect(page).toHaveURL(/www\.strava\.com\/oauth\/authorize/);
  });

  test("after Strava authorization, user is returned to site authenticated", async ({ page }) => {
    // After callback: session should contain Strava name and avatar
    await page.goto("/");
    // Avatar or user name should appear in header
    const header = page.locator("header");
    await expect(header).toContainText(/connected/i);
  });

  test("authenticated runner is highlighted in their team's roster", async ({ page }) => {
    // Navigate to the runner's team page
    await page.goto("/teams");
    // Runner's row should show "You" badge
    await expect(page.getByText("You")).toBeVisible();
  });
});
