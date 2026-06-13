const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = process.cwd();
const port = 4186;
const appUrl = `http://127.0.0.1:${port}/index.html`;
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = path.join(root, "screenshots", "kasam-senaryo-testleri");
const storageKey = "kasa-prototype-state-v6";
const shots = [];
const checks = [];

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

function check(name, detail = "") {
  checks.push({ name, detail });
}

async function screenshot(page, name, detail) {
  await page.evaluate(() => document.querySelectorAll(".toast").forEach((node) => node.remove()));
  const file = path.join(outDir, `${String(shots.length + 1).padStart(2, "0")}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  shots.push({ name, detail, file });
}

function dateKey(offset = 0) {
  const date = new Date("2026-06-10T12:00:00.000Z");
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function entry({ id, projectId, type, amount, headingId, shortName, userId, paidById, splitWith, splitRatio, date, status = "done", lockedNotificationId = "" }) {
  return {
    id,
    projectId,
    type,
    amount,
    enteredAmount: amount,
    currency: "TRY",
    exchangeRate: 1,
    headingId,
    shortName,
    userId,
    paidById: paidById || userId,
    splitWith,
    splitRatio,
    date,
    status,
    lockedNotificationId,
    autoRevealAt: lockedNotificationId ? "2099-01-01T00:00:00.000Z" : "",
    createdAt: `${date}T09:00:00.000Z`,
    updatedAt: `${date}T09:00:00.000Z`,
  };
}

function buildSeed() {
  const sharedIds = ["user_owner", "user_partner"];
  return {
    activeView: "home",
    authMode: "login",
    onboardingStep: "done",
    signedInUserId: "user_partner",
    activeUserId: "user_partner",
    activeProjectId: "project_personal",
    reportPeriod: "month",
    movementPeriod: "month",
    groupMode: "detail",
    calendarDay: "2026-06-10",
    calendarMonth: "2026-06",
    themeMode: "light",
    users: [
      { id: "user_owner", name: "Test Sahibi", nickname: "Sahip", email: "owner@test.local", password: "1234", totalScore: 0, correctGuesses: 0, totalGuesses: 0 },
      { id: "user_partner", name: "Test Ortak", nickname: "Ortak", email: "partner@test.local", password: "1234", totalScore: 0, correctGuesses: 0, totalGuesses: 0 },
    ],
    projects: [
      {
        id: "project_personal",
        name: "Kendi Kasam",
        purpose: "Kisisel butce",
        code: "OWN-TEST",
        createdBy: "user_partner",
        memberIds: ["user_partner"],
        memberSince: { user_partner: "2026-06-01" },
        memberAliases: { user_partner: "Gereksiz Lakap" },
        splitType: "individual",
        photoName: "",
        photoData: "",
        createdAt: "2026-06-01T00:00:00.000Z",
      },
      {
        id: "project_shared",
        name: "Ortak Kasa Test",
        purpose: "Ev ortak giderleri",
        code: "KASAM-TEST",
        createdBy: "user_owner",
        memberIds: sharedIds,
        memberSince: { user_owner: "2026-06-01", user_partner: "2026-06-01" },
        memberAliases: { user_partner: "Lakap Raporda Kalmamali" },
        splitType: "equal",
        photoName: "",
        photoData: "",
        createdAt: "2026-06-01T00:00:00.000Z",
      },
    ],
    headings: [
      { id: "h_salary", projectId: "project_personal", name: "Maas", shortName: "Maas", emoji: "" },
      { id: "h_market", projectId: "project_personal", name: "Market", shortName: "Market", emoji: "" },
      { id: "h_fuel", projectId: "project_personal", name: "Yakit", shortName: "Yakit", emoji: "" },
      { id: "h_shared_market", projectId: "project_shared", name: "Ortak market", shortName: "Market", emoji: "" },
      { id: "h_shared_bill", projectId: "project_shared", name: "Fatura", shortName: "Fatura", emoji: "" },
      { id: "h_future", projectId: "project_personal", name: "Planli odeme", shortName: "Plan", emoji: "" },
    ],
    entries: [
      entry({ id: "personal_income", projectId: "project_personal", type: "income", amount: 30000, headingId: "h_salary", shortName: "Maas", userId: "user_partner", splitWith: ["user_partner"], splitRatio: [1], date: "2026-06-01" }),
      entry({ id: "personal_market", projectId: "project_personal", type: "expense", amount: 2200, headingId: "h_market", shortName: "Market", userId: "user_partner", splitWith: ["user_partner"], splitRatio: [1], date: "2026-06-10" }),
      entry({ id: "personal_fuel", projectId: "project_personal", type: "expense", amount: 1400, headingId: "h_fuel", shortName: "Yakit", userId: "user_partner", splitWith: ["user_partner"], splitRatio: [1], date: "2026-06-08" }),
      entry({ id: "personal_future", projectId: "project_personal", type: "payable", amount: 1750, headingId: "h_future", shortName: "Kart odemesi", userId: "user_partner", splitWith: ["user_partner"], splitRatio: [1], date: dateKey(5), status: "pending" }),
      entry({ id: "shared_market", projectId: "project_shared", type: "expense", amount: 1600, headingId: "h_shared_market", shortName: "Ortak market", userId: "user_owner", paidById: "user_owner", splitWith: sharedIds, splitRatio: [0.5, 0.5], date: "2026-06-10" }),
      entry({ id: "shared_bill", projectId: "project_shared", type: "expense", amount: 900, headingId: "h_shared_bill", shortName: "Fatura", userId: "user_partner", paidById: "user_partner", splitWith: sharedIds, splitRatio: [0.5, 0.5], date: "2026-06-09" }),
      entry({ id: "shared_surprise", projectId: "project_shared", type: "expense", amount: 500, headingId: "h_shared_market", shortName: "Tahminli hareket", userId: "user_owner", paidById: "user_owner", splitWith: sharedIds, splitRatio: [0.5, 0.5], date: "2026-06-10", lockedNotificationId: "notification_surprise" }),
    ],
    notifications: [
      {
        id: "notification_surprise",
        projectId: "project_shared",
        entryId: "shared_surprise",
        actorId: "user_owner",
        recipients: ["user_partner"],
        mode: "surprise",
        actualType: "expense",
        title: "Tahminli hareket",
        amount: 500,
        photoName: "clue.png",
        photoData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lxJq5QAAAABJRU5ErkJggg==",
        guessDeadline: "2099-01-01T00:00:00.000Z",
        revealedAt: "",
        isCompleted: false,
        notificationType: "entry",
        guesses: [],
        createdAt: "2026-06-10T10:00:00.000Z",
      },
      {
        id: "notification_member",
        projectId: "project_shared",
        entryId: "",
        actorId: "user_owner",
        recipients: ["user_partner"],
        mode: "open",
        actualType: "member",
        title: "Yeni kisi eklendi",
        amount: 0,
        revealedAt: "2026-06-10T09:00:00.000Z",
        isCompleted: true,
        notificationType: "member",
        guesses: [],
        createdAt: "2026-06-10T09:00:00.000Z",
      },
    ],
    reactions: [],
    reconciliations: [],
    goals: [],
    settlements: [],
    insights: [],
    joinRequests: [],
    retryQueue: [],
    offlineQueue: [],
  };
}

async function setScenario(page, patch = {}) {
  const seed = { ...buildSeed(), ...patch };
  await page.evaluate((payload) => {
    localStorage.setItem("kasa-prototype-state-v6", JSON.stringify(payload));
    state = normalizeState(payload);
    draft = makeDraft();
    render();
  }, seed);
}

async function setView(page, view, extra = {}) {
  await page.evaluate(({ view, extra }) => {
    Object.assign(state, extra, { activeView: view });
    draft = makeDraft();
    saveState();
    render();
  }, { view, extra });
}

function contrastRatio(rgb1, rgb2) {
  function parse(rgb) {
    return String(rgb).match(/\d+/g).slice(0, 3).map((value) => Number(value) / 255);
  }
  function lum(rgb) {
    const values = parse(rgb).map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
  }
  const a = lum(rgb1);
  const b = lum(rgb2);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function writeReport() {
  const lines = [
    "# Kasam screenshot test raporu",
    "",
    `Tarih: ${new Date().toLocaleString("tr-TR")}`,
    "",
    "## Kontroller",
    ...checks.map((item) => `- PASS: ${item.name}${item.detail ? ` - ${item.detail}` : ""}`),
    "",
    "## Ekran goruntuleri",
    ...shots.map((shot) => `- ${shot.name}: ${path.relative(root, shot.file).replace(/\\/g, "/")} - ${shot.detail}`),
    "",
  ];
  fs.writeFileSync(path.join(outDir, "kasam-screenshot-test-raporu.md"), lines.join("\n"), "utf8");
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error" && !/Failed to load resource|net::ERR/.test(msg.text())) errors.push(msg.text());
  });
  await page.route("https://cdn.jsdelivr.net/**", (route) => route.abort());
  await page.route("https://unpkg.com/**", (route) => route.abort());
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());

  try {
    await page.goto(appUrl, { waitUntil: "load" });
    await page.waitForSelector("#app");
    await page.waitForFunction(() => typeof normalizeState === "function" && typeof makeDraft === "function" && typeof render === "function");
    await screenshot(page, "onboarding", "Ilk acilis ekrani");
    assert.match(await page.locator("body").innerText(), /Kasam/);
    check("Onboarding ekrani acildi");

    await setScenario(page);
    await screenshot(page, "kisisel-kasa-ana", "Kisisel kasa ana ekrani ve net durum");
    const homeText = await page.locator("#app").innerText();
    assert.match(homeText, /23\.400/);
    check("Kisisel kasa ana bakiye hesaplandi", "Ortak kasa payi ve planlanan odeme dahil, kilitli surpriz haric");

    await setView(page, "group", { activeProjectId: "project_personal", groupMode: "detail" });
    await screenshot(page, "kisisel-kasa-detay", "Kisisel kasada ortak kasa kontrolleri gizli");
    const personalGroupText = await page.locator("#app").innerText();
    assert.doesNotMatch(personalGroupText, /Kasa kodu|Katılma talepleri|Borç & alacak|Bütçeye kişi ekle|Bu kasadaki lakap/);
    assert.match(personalGroupText, /Kişisel kasa|Bütçe hareketleri/);
    check("Kisisel kasa ortak kasa kontrollerinden ayrildi");

    await setView(page, "group", { activeProjectId: "project_shared", groupMode: "detail" });
    await screenshot(page, "ortak-kasa-detay", "Ortak kasada uye, erisim ve borc/alacak gorunur");
    const sharedGroupText = await page.locator("#app").innerText();
    assert.match(sharedGroupText, /Üyeler|Erişim|Borç & alacak|Bütçeye kişi ekle/);
    assert.match(sharedGroupText, /Test Sahibi|Test Ortak/);
    check("Ortak kasa detay bolumleri gorundu");

    await setView(page, "report", { activeProjectId: "project_shared", reportPeriod: "month" });
    await page.locator("[data-action='open-receipt']").first().click();
    await page.waitForSelector("#receiptCard");
    await screenshot(page, "ortak-kasa-rapor-fis", "Aylik kasa fisinde odeme ve pay dagilimi");
    const receiptText = await page.locator("#receiptCard").innerText();
    assert.match(receiptText, /Kasa çıktısı|KASA ÇIKTISI/);
    assert.match(receiptText, /Kim ödedi|KİM ÖDEDİ/);
    assert.match(receiptText, /Pay dağılımı|PAY DAĞILIMI/);
    assert.match(receiptText, /Hesaplaşma|HESAPLAŞMA/);
    assert.match(receiptText, /Test Sahibi|Test Ortak/);
    assert.doesNotMatch(receiptText, /Lakap Raporda Kalmamali/);
    check("Fis kasa dagilimini gercek kullanici adlariyla verdi");

    await setView(page, "notifications", { activeProjectId: "project_shared" });
    await screenshot(page, "bildirim-oyunu-aktif", "Aktif tahmin bildirimi gorsel ipucu gostermiyor");
    const notificationText = await page.locator("#app").innerText();
    assert.match(notificationText, /Yeni tahmin var/);
    assert.doesNotMatch(notificationText, /\?\? · \?\?/);
    assert.equal(await page.locator(".notification-card img").count(), 0);
    check("Tahmin listesi ipucu vermiyor");

    await page.locator(".guess-form button[value='expense']").first().click();
    await page.waitForTimeout(50);
    await screenshot(page, "bildirim-oyunu-sonrasi", "Tahmin cevabindan sonra oyun sonraki asamaya devam ediyor");
    assert.match(await page.locator("#app").innerText(), /Yeni tahmin var/);
    check("Tahmin tek cevapla kapanmadan sonraki asamaya devam etti");

    await setView(page, "movements", { activeProjectId: "project_shared", movementPeriod: "month" });
    await screenshot(page, "hareketler-aylik", "Aylik hareket listesi");
    assert.match(await page.locator("#app").innerText(), /Ortak market|Fatura|Tahminli hareket/);
    check("Aylik hareket ekraninda ortak kasa hareketleri gorundu");

    await setView(page, "calendar", { activeProjectId: "project_personal", calendarDay: "2026-06-10", calendarMonth: "2026-06" });
    await screenshot(page, "takvim-gun-detay", "Takvimde gun secimi ve planli odeme");
    const calendarText = await page.locator("#app").innerText();
    assert.match(calendarText, /Market|Planlananlar|Kart odemesi/);
    check("Takvim gun detayi ve ileri tarihli odeme gorundu");

    await setView(page, "report", { activeProjectId: "project_personal", reportPeriod: "day" });
    await page.locator("[data-action='open-receipt']").first().click();
    await page.waitForSelector("#receiptCard");
    await screenshot(page, "gunluk-rapor", "Gunluk rapor ornegi");
    assert.match(await page.locator("#receiptCard").innerText(), /KASAM FİŞİ|KASAM F/);
    check("Gunluk rapor uretildi");

    await setView(page, "report", { activeProjectId: "project_personal", reportPeriod: "week" });
    await page.locator("[data-action='open-receipt']").first().click();
    await page.waitForSelector("#receiptCard");
    await screenshot(page, "haftalik-rapor", "Haftalik rapor ornegi");
    assert.match(await page.locator("#receiptCard").innerText(), /Net|Kasam|KASAM/);
    check("Haftalik rapor uretildi");

    await setView(page, "report", { activeProjectId: "project_personal", reportPeriod: "month", themeMode: "dark" });
    await screenshot(page, "koyu-mod-rapor", "Koyu mod kontrast kontrolu");
    const contrast = await page.locator(".card").first().evaluate((node) => {
      const card = getComputedStyle(node);
      const text = getComputedStyle(node.querySelector("h2") || node);
      return { background: card.backgroundColor, color: text.color };
    });
    assert.ok(contrastRatio(contrast.background, contrast.color) >= 4.5, `Yetersiz kontrast: ${JSON.stringify(contrast)}`);
    check("Koyu mod kontrasti AA esigini gecti");

    await page.setViewportSize({ width: 375, height: 812 });
    await screenshot(page, "mobil-375-rapor", "375px mobil kirilim kontrolu");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
    assert.equal(overflow, false);
    check("375px genislikte yatay tasma yok");

    assert.deepEqual(errors, []);
    writeReport();
    console.log(checks.map((item) => `PASS ${item.name}`).join("\n"));
    console.log(`SCREENSHOTS ${outDir}`);
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  writeReport();
  console.error(error);
  process.exit(1);
});
