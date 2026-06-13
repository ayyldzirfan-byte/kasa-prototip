const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const port = 4184;
const storageKey = "kasa-prototype-state-v6";
const appUrl = `http://127.0.0.1:${port}/index.html?v=20260613-1937&testScenario=1`;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const results = [];

function record(name, detail = "") {
  results.push({ name, status: "PASS", detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
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
    if (urlPath === "/") urlPath = "/index.html";
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

(async () => {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  await context.addInitScript((key) => {
    localStorage.removeItem(key);
  }, storageKey);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("Failed to load resource")) errors.push(msg.text());
  });

  try {
    await page.goto(appUrl, { waitUntil: "load", timeout: 60000 });
    await page.waitForFunction((key) => Boolean(localStorage.getItem(key)), storageKey);
    await page.waitForFunction(() => document.body.dataset.view === "home");

    const result = await page.evaluate((key) => {
      const state = JSON.parse(localStorage.getItem(key));
      const activeUser = state.users.find((user) => user.id === state.activeUserId);
      return {
        testMode: window.KASAM_TEST_MODE === true,
        cloudReady: typeof isCloudReady === "function" ? isCloudReady() : null,
        activeView: state.activeView,
        activeUserEmail: activeUser?.email || "",
        signedInMatches: state.signedInUserId === state.activeUserId,
        pendingLoginEmail: state.pendingLoginEmail || "",
        testScenarioActiveEmail: state.testScenarioActiveEmail || "",
        cloudEnabled: state.cloudEnabled,
        cloudStatus: state.cloudStatus,
        projectName: state.projects.find((project) => project.id === state.activeProjectId)?.name || "",
        appText: document.querySelector("#app")?.innerText || "",
      };
    }, storageKey);

    assert.equal(result.testMode, true);
    record("test modu bayrağı aktif");
    assert.equal(result.cloudReady, false);
    record("Supabase auth/cloud bypass aktif");
    assert.equal(result.activeView, "home");
    record("auth ekranı atlandı ve ana ekran açıldı");
    assert.equal(result.activeUserEmail, "mehmet.s1@kasam.test");
    assert.equal(result.pendingLoginEmail, "mehmet.s1@kasam.test");
    assert.equal(result.testScenarioActiveEmail, "mehmet.s1@kasam.test");
    assert.equal(result.signedInMatches, true);
    assert.equal(result.cloudEnabled, false);
    assert.equal(result.cloudStatus, "Test modu");
    assert.match(result.projectName, /Yılmaz Ailesi/);
    assert.match(result.appText, /Mehmet|Yılmaz Ailesi/);
    record("localStorage aktif kullanıcı Mehmet olarak yüklendi", result.activeUserEmail);

    if (errors.length) throw new Error(errors.join("\n"));
    console.log(`Toplam: ${results.length} test, ${results.length} geçti, 0 başarısız`);
    await browser.close();
    server.close();
    process.exit(0);
  } catch (error) {
    console.error(`✗ testScenario auth bypass başarısız`);
    console.error(error.stack || error.message);
    await browser.close();
    server.close();
    process.exit(1);
  }
})();
