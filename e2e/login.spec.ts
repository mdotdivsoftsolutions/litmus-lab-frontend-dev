import { test, expect } from "@playwright/test";

test("lab login page renders credentials form", async ({ page }) => {
  await page.goto("/laboratory/login");
  await expect(page.getByPlaceholder("Email address")).toBeVisible();
  await expect(page.getByPlaceholder("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
});
