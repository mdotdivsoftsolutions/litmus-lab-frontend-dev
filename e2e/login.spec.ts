import { test, expect } from "@playwright/test";

test("lab login page renders credentials form", async ({ page }) => {
  await page.goto("/laboratory/login");
  await expect(page.getByRole("textbox", { name: "Email" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sign in/i })).toBeVisible();
});
