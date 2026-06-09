const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = __dirname;
const port = 4186;
const appUrl = `http://127.0.0.1:${port}/index.html`;

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
  await page.locator(selector).fill(String(value));
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.route("https://**/*", (route) => route.abort());
  try {
    const seed = {
      activeView: "group",
      activeProjectId: "p_shared",
      activeUserId: "u_2",
      signedInUserId: "u_2",
      authMode: "login",
      onboardingStep: "done",
      reportPeriod: "month",
      movementPeriod: "month",
      groupMode: "detail",
      users: [
        { id: "u_1", name: "Ortak Bir", nickname: "Bir", email: "bir@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
        { id: "u_2", name: "Ortak Iki", nickname: "Iki", email: "iki@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
      ],
      projects: [
        {
          id: "p_shared",
          name: "Ortak Butce",
          purpose: "Test",
          code: "KASAM-TEST",
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

    await page.goto(appUrl, { waitUntil: "load" });
    await page.evaluate((state) => {
      localStorage.clear();
      localStorage.setItem("kasa-prototype-state-v6", JSON.stringify(state));
    }, seed);
    await page.reload({ waitUntil: "load" });
    try {
      await page.waitForSelector("button[data-action='activate-project-detail'][data-id='p_shared']");
      await page.locator("button[data-action='activate-project-detail'][data-id='p_shared']").click();
      await page.waitForSelector("button[data-action='go-add-movement'][data-project-id='p_shared']", { timeout: 5000 });
    } catch (error) {
      console.error("SHARED_LEDGER_BOOT_STATE", await page.evaluate(() => ({ text: document.querySelector("#app")?.innerText?.slice(0, 800) || "", storage: localStorage.getItem("kasa-prototype-state-v6")?.slice(0, 500) || "" })));
      throw error;
    }
    await page.locator("button[data-action='go-add-movement'][data-project-id='p_shared']").click();
    await page.waitForSelector("#entryForm");
    await fill(page, "#amount", 1000);
    await fill(page, "#headingName", "Market");
    await page.locator("#entryForm [data-action='save-entry']").click();
    await page.waitForSelector(".project-detail-card");

    const result = await page.evaluate(() => {
      const user1 = state.users.find((user) => user.id === "u_1");
      const user2 = state.users.find((user) => user.id === "u_2");
      return {
        totalEntries: state.entries.filter((entry) => entry.projectId === "p_shared").length,
        splitWith: state.entries[0]?.splitWith || [],
        splitRatio: state.entries[0]?.splitRatio || [],
        user1Personal: personalLedgerEntries(user1).map((entry) => ({ type: entry.type, amount: entry.amount, projectId: entry.projectId })),
        user2Personal: personalLedgerEntries(user2).map((entry) => ({ type: entry.type, amount: entry.amount, projectId: entry.projectId })),
        groupEntries: personalProjectEntries(state.projects[0], user2).map((entry) => ({ amount: entry.amount, projectId: entry.projectId })),
      };
    });

    assert.equal(result.totalEntries, 1);
    assert.deepEqual(result.splitWith.sort(), ["u_1", "u_2"]);
    assert.deepEqual(result.splitRatio, [0.5, 0.5]);
    assert.equal(result.user1Personal[0]?.amount, 500);
    assert.equal(result.user2Personal[0]?.amount, 500);
    assert.equal(result.groupEntries[0]?.amount, 500);
    console.log("SHARED LEDGER TEST OK");
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
