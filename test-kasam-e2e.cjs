const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const port = 4178;
const appUrl = `http://127.0.0.1:${port}/index.html`;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const results = [];

function record(name, detail = "") {
  results.push({ name, status: "PASS", detail });
}

function startServer() {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
    ".png": "image/png",
  };
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(String(req.url || "/").split("?")[0]);
    if (urlPath === "/" || urlPath === "/gizlilik" || urlPath === "/sartlar") urlPath = "/index.html";
    const filePath = path.normalize(path.join(root, urlPath));
    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

async function fill(page, selector, value) {
  const locator = page.locator(selector);
  assert.equal(await locator.count(), 1, `Tekil input bulunamadi: ${selector}`);
  await locator.fill(value);
}

async function submit(page, selector) {
  const primarySave = page.locator(`${selector} [data-action='save-entry']`);
  if (await primarySave.count()) {
    await primarySave.first().click();
    return;
  }
  await page.locator(`${selector} button[type='submit']`).last().click();
}

async function addEntry(page, { type, amount, heading }) {
  await page.locator("button[data-action='go-add-movement']").first().click();
  await page.waitForSelector("#entryForm");
  await page.locator(`[data-entry-type='${type}']`).click();
  await page.waitForFunction((entryType) => {
    const heading = document.querySelector("#entryForm h2")?.textContent || "";
    return entryType === "income" ? heading.includes("Gelir") : heading.includes("Gider");
  }, type);
  await fill(page, "#amount", String(amount));
  await fill(page, "#headingName", heading);
  await submit(page, "#entryForm");
  try {
    await page.waitForSelector(".personal-hero");
  } catch (error) {
    console.error("ADD_ENTRY_TIMEOUT_STATE", await page.evaluate(() => ({
      url: location.href,
      html: document.querySelector("#app")?.innerText?.slice(0, 900) || "",
      amount: document.querySelector("#amount")?.value || "",
      heading: document.querySelector("#headingName")?.value || "",
      typeTitle: document.querySelector("#entryForm h2")?.textContent || "",
      toast: document.querySelector("#toast")?.textContent || "",
      saveAction: document.querySelector("#entryForm button[type='submit']")?.getAttribute("data-action") || "",
      saveBound: document.querySelector("#entryForm button[type='submit']")?.dataset.kasamClickBound || "",
      submitBound: document.querySelector("#entryForm")?.dataset.kasamSubmitBound || "",
      hasEntryForm: Boolean(document.querySelector("#entryForm")),
      hasHero: Boolean(document.querySelector(".personal-hero")),
    })));
    throw error;
  }
}

(async () => {
  fs.mkdirSync(path.join(root, "screenshots"), { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (msg) => {
    if (
      msg.type() === "error" &&
      !msg.text().includes("Failed to load resource: net::ERR_FAILED") &&
      !msg.text().includes("Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED")
    ) {
      pageErrors.push(msg.text());
    }
  });
  await page.route("https://cdn.jsdelivr.net/**", (route) => route.abort());

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate(async () => {
      localStorage.clear();
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    });
    await page.reload({ waitUntil: "load" });
    await assert.match(await page.locator("body").innerText(), /Kasam/);
    record("onboarding welcome");

    await page.locator("button[data-action='onboarding-start']").click();
    await page.waitForSelector("#accountForm");
    await fill(page, "input[name='userName']", "Test Kullanici");
    await fill(page, "input[name='nickname']", "Test");
    await fill(page, "input[name='password']", "1234");
    await page.locator("input[name='legalAccepted']").check();
    await submit(page, "#accountForm");
    await page.waitForSelector("#loginForm");
    record("local account create");

    const firstUserValue = await page.locator("select[name='loginUserId'] option").first().getAttribute("value");
    await page.locator("select[name='loginUserId']").selectOption(firstUserValue);
    await fill(page, "input[name='loginPassword']", "1234");
    await submit(page, "#loginForm");
    await page.waitForSelector("#firstProjectForm");
    record("login");

    await fill(page, "input[name='projectName']", "Kendi Kasam");
    await fill(page, "input[name='purpose']", "Kisisel butce");
    await submit(page, "#firstProjectForm");
    await page.waitForSelector(".personal-hero");
    record("first budget create");

    await addEntry(page, { type: "income", amount: "10000", heading: "Maas" });
    await assert.match(await page.locator(".personal-hero").innerText(), /10\.000/);
    record("income entry");

    await addEntry(page, { type: "expense", amount: "1250", heading: "Market" });
    await assert.match(await page.locator(".personal-hero").innerText(), /8\.750/);
    record("expense entry");

    await page.locator("nav .tab[data-view='calendar']").click();
    await page.waitForSelector(".desk-calendar");
    await assert.match(await page.locator(".desk-calendar-card").innerText(), /TAKV|Takv/);
    record("calendar render");

    await page.locator("nav .tab[data-view='report']").click();
    await page.waitForSelector("#receiptCard");
    await assert.match(await page.locator("#receiptCard").innerText(), /KASAM/);
    record("report receipt");

    await page.locator("nav .tab[data-view='home']").click();
    await page.locator("button[data-action='open-own-profile']").click();
    await page.waitForSelector("button[data-action='export-my-data']");
    record("profile export/delete controls");

    const sharedSeed = {
      activeView: "home",
      reportPeriod: "month",
      movementPeriod: "month",
      groupMode: "detail",
      activeProjectId: "p_shared",
      activeUserId: "u_2",
      signedInUserId: "u_2",
      authMode: "login",
      users: [
        { id: "u_1", name: "Ortak Bir", nickname: "Bir", email: "bir@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
        { id: "u_2", name: "Ortak Iki", nickname: "Iki", email: "iki@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
      ],
      projects: [{ id: "p_shared", name: "Ortak Butce", purpose: "Test", code: "KASAM-TEST", createdAt: "2026-06-01T00:00:00.000Z", createdBy: "u_1", memberIds: ["u_1", "u_2"], memberSince: { u_1: "2026-06-01", u_2: "2026-06-01" }, splitType: "equal" }],
      headings: [{ id: "h_1", projectId: "p_shared", name: "Eski gider", shortName: "Eski gider", emoji: "" }],
      entries: [
        { id: "e_old", projectId: "p_shared", type: "expense", amount: 1000, enteredAmount: 1000, currency: "TRY", exchangeRate: 1, headingId: "h_1", shortName: "Eski gider", userId: "u_1", paidById: "u_1", splitWith: [], splitRatio: [], date: "2026-06-07", status: "done", createdAt: "2026-06-07T10:00:00.000Z" },
        { id: "e_game", projectId: "p_shared", type: "expense", amount: 300, enteredAmount: 300, currency: "TRY", exchangeRate: 1, headingId: "h_1", shortName: "Eski oyun", userId: "u_1", paidById: "u_1", splitWith: [], splitRatio: [], date: "2026-06-07", status: "done", lockedNotificationId: "n_game", autoRevealAt: "2099-01-01T00:00:00.000Z", createdAt: "2026-06-07T11:00:00.000Z" },
      ],
      notifications: [],
      reactions: [],
      reconciliations: [],
      goals: [],
      settlements: [],
    };
    await page.evaluate((seed) => localStorage.setItem("kasa-prototype-state-v6", JSON.stringify(seed)), sharedSeed);
    await page.reload({ waitUntil: "load" });
    await page.waitForSelector(".personal-hero");
    const sharedResult = await page.evaluate(() => ({
      personalAmounts: personalLedgerEntries(currentUser()).map((entry) => ({ id: entry.id, amount: entry.amount, locked: Boolean(entry.lockedNotificationId) })),
      notifications: notificationEntries().map((item) => ({ entryId: item.entryId, mode: item.mode, recipients: item.recipients })),
    }));
    assert.equal(sharedResult.personalAmounts.find((item) => item.id === "e_old")?.amount, 500);
    assert.equal(sharedResult.personalAmounts.some((item) => item.id === "e_game"), false);
    assert.equal(sharedResult.notifications.length, 2);
    record("shared old entries and notifications");

    await page.locator("nav .tab[data-view='group']").click();
    await page.waitForSelector("button[data-action='go-add-movement'][data-project-id='p_shared']");
    record("budget detail add movement button");

    await page.screenshot({ path: path.join(root, "screenshots", "kasam-production-e2e.png"), fullPage: true });
    assert.deepEqual(pageErrors, []);
    console.log(results.map((item) => `${item.status} ${item.name}`).join("\n"));
    console.log("KASAM E2E OK");
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
