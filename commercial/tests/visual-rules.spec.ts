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
    await expect(page.getByText("Akıllı yönlendirme")).toBeVisible();
    await expect(page.getByText("Fişten yemek fikri")).toBeVisible();
    await expect(page.getByText("Ana ekran")).toBeVisible();
    await expect(page.getByText("Allah verdi")).toHaveCount(0);
    await expect(page.locator(".entry-title", { hasText: "Ev Ortak Kasası" })).toBeVisible();
    await page.screenshot({ path: path.join(visualDir, "commercial-home.png"), fullPage: true });
  });

  test("tab bar does not cover the last content block", async ({ page }) => {
    await page.goto(visualUrl);
    await expect(page.getByText("Finansal ritim")).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(250);
    const tabBox = await page.locator(".tabbar").boundingBox();
    const lastBlockBox = await page.locator(".screen-stack > :last-child").boundingBox();
    expect(tabBox).not.toBeNull();
    expect(lastBlockBox).not.toBeNull();
    expect(lastBlockBox!.y + lastBlockBox!.height).toBeLessThanOrEqual(tabBox!.y - 8);
    await page.screenshot({ path: path.join(visualDir, "commercial-bottom-spacing.png"), fullPage: true });
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
    await expect(page.getByText("Ev Ortak Kasası")).toBeVisible();
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
    await page.getByRole("button", { name: "Rapor" }).click();
    await expect(page.getByText("KASAM FİŞİ")).toBeVisible();
    await page.screenshot({ path: path.join(visualDir, "commercial-report.png"), fullPage: true });
  });
});
