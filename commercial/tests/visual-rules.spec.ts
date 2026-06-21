import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const visualDir =
  process.env.KASAM_VISUAL_DIR ??
  path.join(process.env.USERPROFILE ?? process.cwd(), "Desktop", "kasam-test", "commercial-visual");
const visualUrl = "/?visualTest=1";

test.beforeAll(() => {
  fs.mkdirSync(visualDir, { recursive: true });
});

test.describe("Kasam commercial visual rules", () => {
  test("home screen", async ({ page }) => {
    await page.goto(visualUrl);
    await expect(page.getByText("Finansal ritim")).toBeVisible();
    await expect(page.getByText("Kasam öneriyor")).toBeVisible();
    await expect(page.getByText("Ana ekran")).toBeVisible();
    await page.screenshot({ path: path.join(visualDir, "commercial-home.png"), fullPage: true });
  });

  test("movement add flow", async ({ page }) => {
    await page.goto(visualUrl);
    await page.getByRole("button", { name: /Hareket ekle/i }).click();
    await expect(page.getByLabel("Hareket ekle")).toBeVisible();
    await expect(page.getByText("Paylaşılacak kişiler")).toBeVisible();
    await page.screenshot({ path: path.join(visualDir, "commercial-add-flow.png"), fullPage: true });
  });

  test("shared budgets", async ({ page }) => {
    await page.goto(visualUrl);
    await page.getByRole("button", { name: "Bütçeler" }).click();
    await expect(page.getByText("Ayyıldız Home")).toBeVisible();
    await page.screenshot({ path: path.join(visualDir, "commercial-projects.png"), fullPage: true });
  });

  test("notification game privacy", async ({ page }) => {
    await page.goto(visualUrl);
    await page.getByRole("button", { name: "Hareketler" }).click();
    await expect(page.getByText("Gizli hareket")).toBeVisible();
    await page.screenshot({ path: path.join(visualDir, "commercial-notifications.png"), fullPage: true });
  });

  test("receipt report", async ({ page }) => {
    await page.goto(visualUrl);
    await page.getByText("Rapor").click();
    await expect(page.getByText("KASAM FİŞİ")).toBeVisible();
    await page.screenshot({ path: path.join(visualDir, "commercial-report.png"), fullPage: true });
  });
});
