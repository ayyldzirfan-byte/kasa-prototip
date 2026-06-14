const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const os = require("os");

const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const desktopDir = path.join(os.homedir(), "Desktop", "kasam-test", `visual-test-${stamp}`);

function ensureDir() {
  fs.mkdirSync(desktopDir, { recursive: true });
}

async function openScenario(page, params = "") {
  await page.goto(`/index.html?testScenario=1&simUser=1${params}`);
  await expect(page.locator("#app")).toBeVisible();
  await page.waitForTimeout(600);
}

async function screenshot(page, name) {
  ensureDir();
  await page.screenshot({
    path: path.join(desktopDir, `${name}.png`),
    fullPage: true,
  });
}

async function clickTab(page, view) {
  await page.locator(`.tab[data-view="${view}"]`).click();
  await page.waitForTimeout(400);
}

test("01 ana ekran gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await expect(page.getByText("Kasam")).toBeVisible();
  await screenshot(page, "01-ana-ekran");
});

test("02 hareketler ekrani gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await clickTab(page, "movements");
  await expect(page.getByText("Hareketler")).toBeVisible();
  await screenshot(page, "02-hareketler");
});

test("03 butceler ekrani gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await clickTab(page, "group");
  await expect(page.getByText("Bütçeler")).toBeVisible();
  await screenshot(page, "03-butceler");
});

test("04 takvim ekrani gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await clickTab(page, "calendar");
  await expect(page.getByText("Takvim")).toBeVisible();
  await screenshot(page, "04-takvim");
});

test("05 rapor ekrani gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await clickTab(page, "report");
  await expect(page.getByText("Rapor")).toBeVisible();
  await screenshot(page, "05-rapor");
});

test("06 bildirimler ekrani gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  const button = page.getByText("Bildirimler").first();
  if (await button.count()) await button.click();
  await page.waitForTimeout(400);
  await screenshot(page, "06-bildirimler");
});

test("07 hareket ekleme ekrani gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  const addButton = page.getByText(/Hareket ekle|Gelir ekle|Gider ekle/).first();
  if (await addButton.count()) await addButton.click();
  await page.waitForTimeout(400);
  await screenshot(page, "07-hareket-ekle");
});

test("08 ortak kasa detay gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await clickTab(page, "group");
  const groupCard = page.getByText("Yılmaz Ailesi").first();
  if (await groupCard.count()) await groupCard.click();
  await page.waitForTimeout(500);
  await screenshot(page, "08-ortak-kasa-detay");
});

test("09 test modu kullanici degistirme gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await expect(page.getByText("Test modu")).toBeVisible();
  await screenshot(page, "09-test-modu");
});

test("10 tab bar bes sekme gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await expect(page.locator(".tabbar .tab")).toHaveCount(5);
  await screenshot(page, "10-tabbar");
});

test("11 acik tema gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await page.evaluate(() => localStorage.setItem("kasam-theme", "light"));
  await page.reload();
  await page.waitForTimeout(500);
  await screenshot(page, "11-acik-tema");
});

test("12 koyu tema gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await page.evaluate(() => localStorage.setItem("kasam-theme", "dark"));
  await page.reload();
  await page.waitForTimeout(500);
  await screenshot(page, "12-koyu-tema");
});

test("13 mobil tasma ve kontrast gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(overflow).toBeFalsy();
  await screenshot(page, "13-mobil-tasma-kontrast");
});

test("14 sifre sifirlama ekrani gorsel dogrulama", async ({ page }) => {
  await page.goto("/index.html?authAction=reset-password");
  await page.waitForTimeout(700);
  await screenshot(page, "14-sifre-sifirlama");
});

test("15 yeni butce akisi gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  const newBudget = page.getByText(/Yeni bütçe|Yeni bütçe oluştur/).first();
  if (await newBudget.count()) await newBudget.click();
  await page.waitForTimeout(500);
  await screenshot(page, "15-yeni-butce-akisi");
});

test("16 fis gorunumu gorsel dogrulama", async ({ page }) => {
  await openScenario(page);
  await clickTab(page, "report");
  const receiptButton = page.getByText(/Fişi gör|Fişi Paylaş|KASAM FİŞİ/).first();
  if (await receiptButton.count()) await receiptButton.click();
  await page.waitForTimeout(500);
  await screenshot(page, "16-fis-gorunumu");
});
