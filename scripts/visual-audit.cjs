const fs = require("fs");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

const root = path.resolve(__dirname, "..", "public");
const port = Number(process.env.KASAM_VISUAL_PORT || 4187);
const cdpPort = Number(process.env.KASAM_CDP_PORT || 9387);
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const desktop = "C:\\Users\\İRFAN AYYILDIZ\\Desktop\\kasam-test";
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const outDir = path.join(desktop, `visual-test-${stamp}`);
const cacheKey = `visual-${stamp}`;
const liveBase = "https://kasa-prototip.vercel.app";
const localBase = `http://127.0.0.1:${port}`;
const results = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(name, ok, detail = "") {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function mime(file) {
  const ext = path.extname(file).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
  }[ext] || "application/octet-stream";
}

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, localBase);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";
    let target = path.resolve(root, `.${pathname}`);
    if (!target.startsWith(root)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      target = path.join(root, "index.html");
    }
    res.writeHead(200, { "content-type": mime(target), "cache-control": "no-store" });
    fs.createReadStream(target).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

async function waitForCdp() {
  for (let index = 0; index < 80; index += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      if (response.ok) return response.json();
    } catch (_error) {}
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint açılmadı.");
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
      }, 15000);
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
    await sleep(2600);
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || "Runtime exception");
    return result.result ? result.result.value : undefined;
  }

  async screenshot(name) {
    const result = await this.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true });
    fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(result.data, "base64"));
  }

  async clickText(text) {
    return this.eval(`(() => {
      const target = ${JSON.stringify(text)};
      const els = Array.from(document.querySelectorAll("button,a,[role='button'],.tab,[data-action]"));
      const el = els.find((item) => (item.textContent || "").trim().includes(target));
      if (!el) return false;
      el.scrollIntoView({ block: "center", inline: "center" });
      el.click();
      return true;
    })()`);
  }

  close() {
    try {
      this.ws.close();
    } catch (_error) {}
  }
}

async function newPage(url) {
  const response = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const info = await response.json();
  const page = new CdpPage(info.webSocketDebuggerUrl);
  await page.setup();
  await page.goto(url);
  return page;
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const chrome = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${cdpPort}`,
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${path.join(outDir, "chrome-profile")}`,
    "about:blank",
  ], { stdio: "ignore" });
  try {
    await waitForCdp();
    const page = await newPage(`${localBase}/index.html?testScenario=1&simUser=1&v=${cacheKey}`);
    await page.screenshot("01-ana-ekran");
    const home = await page.eval(`(() => {
      const text = document.body.innerText;
      return {
        stamp: text.includes("Güncellendi 14.06.2026 23:05"),
        tabs: ["Ana ekran","Hareketler","Bütçeler","Takvim","Rapor"].every((item) => text.includes(item)),
        cloudText: text.includes("Bulut senkron"),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    })()`);
    log("Ana ekran stamp/tabbar/overflow", home.stamp && home.tabs && !home.cloudText && !home.overflow, JSON.stringify(home));

    await page.clickText("Bütçeler");
    await sleep(900);
    await page.screenshot("02-butceler");
    const budgets = await page.eval(`(() => {
      const text = document.body.innerText;
      return {
        personalCount: (text.match(/İrfan kasası/g) || []).length,
        hasJoinForm: text.includes("Katılma talebi gönder") || text.includes("Kodla katıl"),
        hasShared: text.includes("Yılmaz Ailesi"),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    })()`);
    log("Bütçeler sade liste ve tek kişisel kasa", budgets.personalCount <= 1 && !budgets.hasJoinForm && budgets.hasShared && !budgets.overflow, JSON.stringify(budgets));

    await page.eval(`(() => {
      const item = Array.from(document.querySelectorAll("button,[role='button']")).find((el) => (el.textContent || "").includes("Yılmaz Ailesi"));
      if (item) item.click();
    })()`);
    await sleep(900);
    await page.screenshot("03-ortak-kasa-detay");
    const group = await page.eval(`(() => {
      const text = document.body.innerText;
      return {
        share: text.includes("Paylaş") || text.includes("Paylaşım bağlantısı"),
        joinRequests: text.includes("Katılma talepleri"),
        debt: text.includes("Borç") || text.includes("alacak"),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    })()`);
    log("Ortak kasa detay paylaşım ve katılma talepleri", group.share && group.joinRequests && group.debt && !group.overflow, JSON.stringify(group));

    await page.clickText("Ana ekran");
    await sleep(700);
    await page.clickText("Hareket ekle");
    await sleep(1000);
    await page.screenshot("04-hareket-ekle");
    const add = await page.eval(`(() => {
      const text = document.body.innerText;
      const dateFields = Array.from(document.querySelectorAll("input[type='date'], [name='date'], .date-input"));
      const dateOverflow = dateFields.some((el) => el.getBoundingClientRect().right > window.innerWidth + 2 || el.getBoundingClientRect().left < -2);
      return {
        hasAmount: text.includes("Tutar") || text.includes("TUTAR"),
        dateOverflow,
        splitToggles: document.querySelectorAll("input[name='splitWith']").length,
        amountSuffix: Boolean(document.querySelector("[data-amount-currency-suffix]")),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    })()`);
    log("Hareket ekle tarih/split/para birimi", add.hasAmount && !add.dateOverflow && add.splitToggles > 0 && add.amountSuffix && !add.overflow, JSON.stringify(add));

    const mediaOpened = await page.eval(`(() => {
      const el = Array.from(document.querySelectorAll("button,[role='button'],[data-action]")).find((item) => (item.textContent || "").includes("Medya") || (item.textContent || "").includes("Seç") || (item.dataset.action || "").includes("media"));
      if (!el) return false;
      el.scrollIntoView({ block: "center" });
      el.click();
      return true;
    })()`);
    await sleep(800);
    if (mediaOpened) {
      await page.eval(`(() => { const gif = Array.from(document.querySelectorAll("button")).find((item) => (item.textContent || "").trim() === "GIF"); if (gif) gif.click(); })()`);
      await sleep(2500);
      await page.screenshot("05-gif-secici");
      const gif = await page.eval(`(() => {
        const buttons = Array.from(document.querySelectorAll("[data-gif-url], .gif-result-button"));
        let overlap = false;
        for (let i = 0; i < Math.min(buttons.length, 8); i += 1) {
          for (let j = i + 1; j < Math.min(buttons.length, 8); j += 1) {
            const a = buttons[i].getBoundingClientRect();
            const b = buttons[j].getBoundingClientRect();
            if (a.width && b.width && !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top)) overlap = true;
          }
        }
        return { picker: document.body.innerText.includes("GIF"), buttons: buttons.length, overlap, overflow: document.documentElement.scrollWidth > window.innerWidth + 2 };
      })()`);
      log("GIF seçici çakışmasız", gif.picker && !gif.overlap && !gif.overflow, JSON.stringify(gif));
      await page.eval(`(() => { const sticker = Array.from(document.querySelectorAll("button")).find((item) => (item.textContent || "").trim() === "Sticker"); if (sticker) sticker.click(); })()`);
      await sleep(700);
      await page.screenshot("06-sticker-secici");
      const sticker = await page.eval(`(() => ({ sticker: document.body.innerText.includes("Sticker"), fallback: document.body.innerText.includes("Yapıştır") || document.body.innerText.includes("Görsel seç") || document.body.innerText.includes("Klavyeden seç"), overflow: document.documentElement.scrollWidth > window.innerWidth + 2 }))()`);
      log("Sticker seçici ve PWA fallback", sticker.sticker && sticker.fallback && !sticker.overflow, JSON.stringify(sticker));
    } else {
      log("Medya seçici açılıyor", false, "Medya butonu bulunamadı");
    }
    page.close();

    const notify = await newPage(`${localBase}/index.html?testScenario=1&simUser=2&v=${cacheKey}`);
    await notify.eval(`(() => { state.activeView = "notifications"; render(); })()`);
    await sleep(1000);
    await notify.screenshot("07-bildirimler-faz1");
    const notification = await notify.eval(`(() => {
      const card = document.querySelector("[data-current-game='1']") || document.querySelector(".critical-game-card") || document.querySelector(".surprise-locked");
      const text = card ? card.innerText : document.body.innerText;
      const lower = text.toLocaleLowerCase("tr-TR");
      return {
        title: document.body.innerText.includes("Bildirimler"),
        gameCard: Boolean(card),
        newGuess: lower.includes("yeni tahmin var"),
        hidden: lower.includes("detaylar oyun bitene kadar"),
        actor: lower.includes("bu hareketi kim ekledi"),
        amountLeak: /1\\.847|1847|4\\.000|4000|380/.test(text),
        overflow: document.documentElement.scrollWidth > window.innerWidth + 2,
      };
    })()`);
    log("Bildirim/tahmin faz 1 gizlilik ve taşma", notification.title && notification.gameCard && notification.newGuess && notification.hidden && notification.actor && !notification.amountLeak && !notification.overflow, JSON.stringify(notification));
    const phase1 = await notify.eval(`(() => { const form = document.querySelector("form[data-guess-form][data-step='actor']"); const button = form && form.querySelector("button"); if (!button) return false; button.click(); return true; })()`);
    await sleep(900);
    await notify.screenshot("08-tahmin-faz1-overlay");
    log("Tahmin faz 1 cevap/overlay", phase1 && await notify.eval(`Boolean(document.querySelector(".game-result-overlay"))`));
    await notify.eval(`(() => { const button = Array.from(document.querySelectorAll("button")).find((item) => (item.textContent || "").includes("Devam")); if (button) button.click(); })()`);
    await sleep(3300);
    await notify.screenshot("09-tahmin-faz2");
    log("Tahmin faz 2 açılıyor", await notify.eval(`document.body.innerText.includes("Gelir mi gider mi")`));
    const phase2 = await notify.eval(`(() => { const form = document.querySelector("form[data-guess-form][data-step='type']"); const button = form && form.querySelector("button"); if (!button) return false; button.click(); return true; })()`);
    await sleep(900);
    await notify.screenshot("10-tahmin-faz2-overlay");
    log("Tahmin faz 2 cevap/overlay", phase2 && await notify.eval(`Boolean(document.querySelector(".game-result-overlay"))`));
    await notify.eval(`(() => { const button = Array.from(document.querySelectorAll("button")).find((item) => (item.textContent || "").includes("Devam")); if (button) button.click(); })()`);
    await sleep(3300);
    await notify.screenshot("11-tahmin-faz3");
    log("Tahmin faz 3 açılıyor", await notify.eval(`document.body.innerText.includes("Bu hareket ne")`));
    const phase3 = await notify.eval(`(() => { const form = document.querySelector("form[data-guess-form][data-step='category']"); const button = form && form.querySelector("button"); if (!button) return false; button.click(); return true; })()`);
    await sleep(900);
    await notify.screenshot("12-tahmin-faz3-overlay");
    log("Tahmin faz 3 cevap/overlay", phase3 && await notify.eval(`Boolean(document.querySelector(".game-result-overlay"))`));
    notify.close();

    const simulator = await newPage(`${localBase}/kasam-simulator.html`);
    await simulator.screenshot("13-simulator");
    const sim = await simulator.eval(`(() => ({ open: document.body.innerText.includes("Kasam Simulator"), controls: document.body.innerText.includes("Ortak Kasa Testi") && document.body.innerText.includes("Tahmin Oyunu Başlat") }))()`);
    log("Simülatör açılıyor ve test kontrolleri var", sim.open && sim.controls, JSON.stringify(sim));
    simulator.close();

    const live = await newPage(`${liveBase}/index.html?testScenario=1&simUser=1&v=${cacheKey}`);
    await live.screenshot("14-cloud-ana-ekran");
    const cloud = await live.eval(`(() => ({ stamp: document.body.innerText.includes("Güncellendi 14.06.2026 23:05"), visibleStamp: (document.body.innerText.match(/Güncellendi [0-9.]+ [0-9:]+/) || [""])[0], testMode: document.body.innerText.includes("Test modu") }))()`);
    log("Cloud canlı sürüm stamp", cloud.stamp, JSON.stringify(cloud));
    live.close();
  } finally {
    server.close();
    chrome.kill();
  }

  const pass = results.filter((item) => item.ok).length;
  const fail = results.length - pass;
  const report = [
    "# Kasam Görsel Doğrulama Raporu",
    `Tarih: ${new Date().toLocaleString("tr-TR")}`,
    `Klasör: ${outDir}`,
    "",
    `Toplam kontrol: ${results.length}`,
    `Geçen: ${pass}`,
    `Başarısız: ${fail}`,
    "",
    ...results.map((item) => `${item.ok ? "PASS" : "FAIL"} - ${item.name}${item.detail ? ` - ${item.detail}` : ""}`),
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "visual-report.md"), report, "utf8");
  console.log(`REPORT ${path.join(outDir, "visual-report.md")}`);
  if (fail) process.exit(1);
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
