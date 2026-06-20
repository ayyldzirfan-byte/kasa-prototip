const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mime(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
  }[ext] || "application/octet-stream";
}

function startServer(root, port) {
  const base = `http://127.0.0.1:${port}`;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url || "/", base);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/" || pathname === "/gizlilik" || pathname === "/sartlar") pathname = "/index.html";
    const target = path.normalize(path.join(root, pathname));
    if (!target.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(target, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": mime(target), "Cache-Control": "no-store" });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

async function waitForCdp(cdpPort) {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      if (response.ok) return response.json();
    } catch (_error) {}
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint acilmadi.");
}

class CdpPage {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.ready = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket timeout")), 10000);
      this.ws.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      });
      this.ws.addEventListener("error", reject);
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
      else resolve(message.result);
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 20000);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async setup() {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      screenWidth: 390,
      screenHeight: 844,
    });
    await this.send("Emulation.setUserAgentOverride", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
  }

  async goto(url) {
    await this.send("Page.navigate", { url });
    await sleep(2500);
  }

  async eval(expression, args = undefined) {
    const trimmed = String(expression || "").trim();
    const callableExpression =
      trimmed.startsWith("() =>") ||
      trimmed.startsWith("async () =>") ||
      trimmed.startsWith("function") ||
      trimmed.startsWith("async function") ||
      (trimmed.startsWith("(") && trimmed.includes("=>"));
    const source = args === undefined
      ? callableExpression ? `(${expression})()` : expression
      : `(${expression})(...${JSON.stringify(args)})`;
    const result = await this.send("Runtime.evaluate", { expression: source, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime exception");
    return result.result ? result.result.value : undefined;
  }

  async waitFor(expression, timeout = 10000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      if (await this.eval(expression)) return true;
      await sleep(150);
    }
    throw new Error(`Timeout waiting for ${expression}`);
  }

  async waitForSelector(selector, timeout = 10000) {
    return this.waitFor(`Boolean(document.querySelector(${JSON.stringify(selector)}))`, timeout);
  }

  async click(selector, index = 0) {
    return this.eval(`(selector, index) => {
      const el = Array.from(document.querySelectorAll(selector))[index];
      if (!el) return false;
      el.scrollIntoView({ block: "center", inline: "center" });
      el.click();
      return true;
    }`, [selector, index]);
  }

  async fill(selector, value) {
    return this.eval(`(selector, value) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      el.scrollIntoView({ block: "center", inline: "center" });
      el.focus();
      el.value = String(value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }`, [selector, value]);
  }

  close() {
    try {
      this.ws.close();
    } catch (_error) {}
  }
}

async function createPage(cdpPort, url) {
  const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const info = await response.json();
  const page = new CdpPage(info.webSocketDebuggerUrl);
  await page.setup();
  await page.goto(url);
  return page;
}

async function runCdpTest(options, fn) {
  const root = options.root || process.cwd();
  const port = options.port;
  const cdpPort = options.cdpPort;
  const localBase = `http://127.0.0.1:${port}`;
  const profileDir = path.join(root, `.tmp-cdp-${cdpPort}`);
  fs.mkdirSync(profileDir, { recursive: true });
  const server = await startServer(root, port);
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${cdpPort}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${profileDir}`,
    "about:blank",
  ], { stdio: "ignore" });
  try {
    await waitForCdp(cdpPort);
    const page = await createPage(cdpPort, `${localBase}/index.html`);
    try {
      await fn({ page, localBase });
    } finally {
      page.close();
    }
  } finally {
    server.close();
    chrome.kill();
    try {
      fs.rmSync(profileDir, { recursive: true, force: true });
    } catch (_error) {}
  }
}

module.exports = { runCdpTest, sleep };
