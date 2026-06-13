const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const css = read("styles.css") + "\n" + read("kasa-extra.css");
const app = read("app-production.js");
const html = read("index.html");

const cssWithoutTokenBlocks = css
  .replace(/:root[^{]*\s*{[\s\S]*?}\s*/g, "")
  .replace(/@media\s*\(prefers-color-scheme:\s*dark\)\s*{\s*:root[^{]*\s*{[\s\S]*?}\s*}/g, "");
assert(!/(#[0-9a-fA-F]{3,8}|rgb\()/.test(cssWithoutTokenBlocks), "CSS token dışı hardcode renk var");
assert(!/(Mükemmel|Harika|Tabii ki|İşleminiz|Lütfen|giriniz|yazalım|seçelim|bağlayalım)/.test(app + html), "AI/resmi kalıp kaldı");
assert(app.includes("kasamIcon(\"home\"") || html.includes('data-lucide="home"'), "Lucide nav home yok");

function startServer(port) {
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

(async () => {
  const port = 4185;
  const server = await startServer(port);
  const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
  try {
    for (const colorScheme of ["light", "dark"]) {
      const page = await browser.newPage({ viewport: { width: 375, height: 812 }, colorScheme });
      await page.route("https://**/*", (route) => route.abort());
      await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "load" });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: "load" });
      await page.locator("button[data-action='demo-start']").click();
      await page.waitForFunction(() => document.body.dataset.view === "home" && (document.querySelector("#app")?.textContent || "").length > 100);
      const metrics = await page.evaluate(() => {
        const visibleButtons = Array.from(document.querySelectorAll("button, a")).filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== "hidden";
        });
        const tooSmall = visibleButtons
          .map((el) => ({ text: el.textContent.trim().slice(0, 40), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }))
          .filter((item) => item.width < 44 || item.height < 44);
        const style = getComputedStyle(document.body);
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth,
          background: style.backgroundColor,
          color: style.color,
          tooSmall,
        };
      });
      assert(metrics.scrollWidth <= metrics.innerWidth + 1, `${colorScheme} 375px yatay taşma var`);
      assert(metrics.background && metrics.color, `${colorScheme} renk hesaplanamadı`);
      assert.deepEqual(metrics.tooSmall, [], `${colorScheme} 44px altı dokunma alanı var`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log("FINAL AUDIT TEST OK");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
