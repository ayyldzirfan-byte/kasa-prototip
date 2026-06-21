const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { runCdpTest } = require("./scripts/cdp-test-harness.cjs");

const root = process.cwd();
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
function resolveOutDir() {
  const preferred = path.join(os.homedir(), "Desktop", "kasam-test", `scenario-screenshots-${stamp}`);
  const fallback = path.join(root, "screenshots", `scenario-screenshots-${stamp}`);
  try {
    fs.mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch (_error) {
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

const outDir = resolveOutDir();
const shots = [];
const checks = [];

function check(name, detail = "") {
  checks.push({ name, detail });
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

async function screenshot(page, name, detail) {
  await page.eval(`() => document.querySelectorAll(".toast").forEach((node) => node.remove())`);
  const file = path.join(outDir, `${String(shots.length + 1).padStart(2, "0")}-${name}.png`);
  await page.screenshot(file);
  shots.push({ name, detail, file });
}

function writeReport() {
  fs.mkdirSync(outDir, { recursive: true });
  const lines = [
    "# Kasam screenshot test raporu",
    "",
    `Tarih: ${new Date().toLocaleString("tr-TR")}`,
    "",
    "## Kontroller",
    ...checks.map((item) => `- PASS: ${item.name}${item.detail ? ` - ${item.detail}` : ""}`),
    "",
    "## Ekran goruntuleri",
    ...shots.map((shot) => `- ${shot.name}: ${shot.file} - ${shot.detail}`),
    "",
  ];
  fs.writeFileSync(path.join(outDir, "kasam-screenshot-test-raporu.md"), lines.join("\n"), "utf8");
}

async function setView(page, view, extra = {}) {
  await page.eval(`(payload) => {
    Object.assign(state, payload.extra, { activeView: payload.view });
    draft = makeDraft();
    saveState();
    render();
  }`, [{ view, extra }]);
  await page.waitFor(`document.body.dataset.view === ${JSON.stringify(view)}`, 12000);
}

runCdpTest({ root, port: 4186, cdpPort: 9386 }, async ({ page, localBase }) => {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto(`${localBase}/index.html?testScenario=1&simUser=2&v=screenshot`);
  await page.waitFor(`document.body.dataset.view === "home"`, 12000);
  await screenshot(page, "kisisel-kasa-ana", "Test kullanicisi ana ekran");
  const homeText = await page.eval(`() => document.querySelector("#app")?.innerText || ""`);
  assert.match(homeText, /Kasam|Test modu|Fatma|Yılmaz/);
  check("Ana ekran test senaryosu ile acildi");

  await setView(page, "movement", { movementPeriod: "month" });
  await screenshot(page, "hareketler", "Hareket listesi");
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /Hareket|Gelir|Gider/);
  check("Hareketler ekrani gorundu");

  const scenarioProjectId = await page.eval(`() => state.activeProjectId || state.projects[0]?.id || ""`);
  await setView(page, "group", { activeProjectId: scenarioProjectId, groupMode: "detail" });
  await screenshot(page, "butce-detay", "Butce detay ekrani");
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /Bütçe|Kasa|Üye|Gelir|Gider/);
  check("Butce detay ekrani gorundu");

  await setView(page, "calendar");
  await screenshot(page, "takvim", "Takvim ekrani");
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /Takvim|Pzt|Sal|Çar/);
  check("Takvim ekrani gorundu");

  await setView(page, "report", { reportPeriod: "month" });
  await screenshot(page, "rapor", "Rapor ekrani");
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /Rapor|Fişi gör|Gelir|Gider/);
  check("Rapor ekrani gorundu");

  await setView(page, "notifications");
  await screenshot(page, "bildirimler", "Bildirim ve tahmin ekrani");
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /Bildirim|Sessizlik|Yeni tahmin|hareket/);
  check("Bildirim ekrani gorundu");

  const layout = await page.eval(`() => ({
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    tabCount: document.querySelectorAll(".tab-bar .tab, nav .tab").length,
    unreadBroken: Array.from(document.querySelectorAll("[data-testid='notification-badge'], .notification-count")).some((el) => el.getBoundingClientRect().width > 40),
  })`);
  assert.equal(layout.overflow, false, "Mobil yatay tasma olmamali");
  assert.ok(layout.tabCount >= 5, "Alt menude 5 sekme olmali");
  assert.equal(layout.unreadBroken, false, "Bildirim sayaci kutuyu bozmamali");
  check("Mobil temel layout kontrolleri gecti");

  writeReport();
  console.log(`Toplam: ${checks.length} test, ${checks.length} gecti, 0 basarisiz`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
