const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = __dirname;
const port = 4191;
const appUrl = `http://127.0.0.1:${port}/index.html`;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

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

const seed = {
  activeView: "home",
  activeProjectId: "p_shared",
  activeUserId: "u_1",
  signedInUserId: "u_1",
  onboardingStep: "done",
  authMode: "login",
  reportPeriod: "month",
  movementPeriod: "month",
  users: [
    { id: "u_1", name: "Irfan Test", nickname: "Irfan", email: "irfan.entry@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
    { id: "u_2", name: "Diger Test", nickname: "Diger", email: "diger.entry@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
  ],
  projects: [
    {
      id: "p_shared",
      name: "Test Ortak Kasa",
      purpose: "Entry flow",
      code: "ENTRY-FLOW-1",
      createdAt: "2026-06-01T00:00:00.000Z",
      createdBy: "u_1",
      memberIds: ["u_1", "u_2"],
      memberSince: { u_1: "2026-06-01", u_2: "2026-06-01" },
      splitType: "equal",
    },
  ],
  headings: [],
  entries: [],
  notifications: [],
  reactions: [],
  reconciliations: [],
  goals: [],
  settlements: [],
  insights: [],
  joinRequests: [],
  retryQueue: [],
};

(async () => {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route("https://**/*", (route) => route.abort());
  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate((state) => {
      localStorage.clear();
      localStorage.setItem("kasa-prototype-state-v6", JSON.stringify(state));
    }, seed);
    await page.reload({ waitUntil: "load" });
    await page.evaluate(() => {
      window.isCloudReady = () => false;
    });

    await page.locator("button[data-action='go-add-movement']").first().click();
    await page.waitForSelector("#entryForm");
    await page.locator("#amount").fill("4000");
    await page.locator("#headingName").fill("Ek is");
    await page.evaluate(() => {
      document.querySelector("select[name='notificationMode']").value = "open";
      document.querySelector("input[name='notificationGif']").value = "https://media.giphy.com/media/test-entry-flow/giphy.gif";
    });

    await page.evaluate(async () => {
      const form = document.querySelector("#entryForm");
      await Promise.all([handleEntrySubmit(form), handleEntrySubmit(form)]);
    });
    await page.waitForFunction(() => document.body.dataset.view === "home");

    const afterSave = await page.evaluate(() => ({
      entries: state.entries.map((entry) => ({ id: entry.id, title: entryTitle(entry), amount: entry.amount, projectId: entry.projectId })),
      notifications: state.notifications.map((notification) => ({ id: notification.id, entryId: notification.entryId, title: notification.title, gif: notification.gif, mode: notification.mode })),
      user1Ledger: personalLedgerEntries(state.users.find((user) => user.id === "u_1")).map((entry) => ({ title: entryTitle(entry), amount: entry.amount })),
      user2Ledger: personalLedgerEntries(state.users.find((user) => user.id === "u_2")).map((entry) => ({ title: entryTitle(entry), amount: entry.amount })),
    }));
    assert.equal(afterSave.entries.length, 1, "Ayni hareket iki kez kaydedilmemeli");
    assert.equal(afterSave.notifications.length, 1, "Ayni hareket icin tek bildirim olusmali");
    assert.equal(afterSave.notifications[0].gif.includes("giphy.gif"), true, "Acik bildirimin GIF'i saklanmali");
    assert.equal(afterSave.user1Ledger[0].amount, 2000, "Ortak gider ekleyen kullanicinin kisisel payina yansimali");
    assert.equal(afterSave.user2Ledger[0].amount, 2000, "Ortak gider diger kullanicinin kisisel payina yansimali");

    await page.locator("[data-action='open-entry-media']").first().click();
    await page.waitForSelector(".movement-media-overlay img");
    const overlaySrc = await page.locator(".movement-media-overlay img").first().getAttribute("src");
    assert.equal(overlaySrc.includes("giphy.gif"), true, "Hareket kartina tiklayinca GIF buyuk overlay'de acilmali");

    await page.evaluate(() => {
      state.activeUserId = "u_2";
      state.activeView = "notifications";
      saveState();
      render();
    });
    await page.waitForSelector(".notification-card");
    const notificationText = await page.locator(".notification-card").first().innerText();
    assert.match(notificationText, /gider ekledi|hareket ekledi/i, "Diger kullanici bildirimi gormeli");

    console.log("PASS entry-open-flow: tek kayit, tek bildirim, ortak pay ve GIF overlay calisiyor");
  } catch (error) {
    console.error("FAIL entry-open-flow");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
