const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = [
  "kasam-ui-fixes.css",
  "kasam-critical-fixes.css",
].map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const uiJs = fs.readFileSync(path.join(root, "app-ui-fixes.js"), "utf8");
const criticalJs = fs.readFileSync(path.join(root, "app-critical-fixes.js"), "utf8");
const js = `${uiJs}\n${criticalJs}`;

function runTest(name, fn) {
  try {
    fn();
    return { status: "PASS", name };
  } catch (error) {
    return { status: "FAIL", name, message: error.message, stack: error.stack };
  }
}

const tests = [
  ["8.1 - Sari zeminde yazi rengi koyu", () => {
    assert.match(css, /\.secondary-button,[\s\S]*background:\s*var\(--color-accent\);[\s\S]*color:\s*var\(--color-text-primary\);/);
  }],
  ["8.2 - Tab bar 5 sekme gorunuyor", () => {
    assert.equal((index.match(/<button class="tab(?:\s|")/g) || []).length, 5);
  }],
  ["8.3 - Tab bar aciklamalari var", () => {
    ["Ana ekran", "Hareketler", "Bütçeler", "Takvim", "Rapor"].forEach((label) => assert.ok(index.includes(label), label));
  }],
  ["8.4 - Bulut senkron metni aktif UI katmaninda yok", () => {
    assert.ok(!js.includes("Bulut senkron"));
    assert.ok(!index.includes("Bulut senkron"));
  }],
  ["8.5 - Gelir/Gider metinleri kullaniliyor", () => {
    assert.ok(js.includes("Gelir"));
    assert.ok(js.includes("Gider"));
    assert.ok(!js.includes(">Giren<"));
    assert.ok(!js.includes(">Çıkan<"));
  }],
  ["8.6 - Beklenen gelir ve Yaklasan odeme ifadeleri var", () => {
    assert.ok(js.includes("Beklenen gelir"));
    assert.ok(js.includes("Yaklaşan ödeme"));
  }],
  ["8.7 - Bildirim sayaci badge seklinde", () => {
    assert.match(css, /\.notification-badge\s*\{[\s\S]*position:\s*absolute/);
    assert.match(js, /notification-badge/);
  }],
  ["8.8 - Toast koyu arka plan beyaz yazi", () => {
    assert.match(css, /\.toast\s*\{[\s\S]*background:\s*var\(--color-primary\);[\s\S]*color:\s*var\(--color-on-dark\);/);
  }],
  ["8.9 - Finansal ritim arti eksi isaretli", () => {
    assert.match(js, /function kasamSignedMoney/);
    assert.match(js, /return `\+\$\{money\(number\)\}`/);
    assert.match(js, /return `-\$\{money\(Math\.abs\(number\)\)\}`/);
  }],
  ["8.10 - Surpriz hareket oyun bitmeden gizli", () => {
    assert.ok(js.includes("?? TL"));
    assert.ok(js.includes("?? Hareket"));
    assert.ok(js.includes("Detaylar oyun bitince açılır"));
  }],
  ["8.11 - Yeni UI dosyalari index tarafindan yukleniyor", () => {
    assert.ok(index.includes("kasam-ui-fixes.css"));
    assert.ok(index.includes("app-ui-fixes.js"));
  }],
  ["8.12 - Hareket ekle ana butonu bind ediliyor", () => {
    assert.ok(js.includes("[data-action='go-add-movement']"));
    assert.ok(js.includes("state.activeView = \"add\""));
  }],
  ["8.13 - Bildirim bos durum metni sadece Sessizlik", () => {
    assert.ok(criticalJs.includes('KASAM_EMPTY.notifications = "Sessizlik..."'));
    assert.ok(!criticalJs.includes("Henüz sürpriz yok"));
  }],
  ["8.14 - Surpriz sayaci hareketi ekleyene gosterilmez", () => {
    assert.ok(criticalJs.includes("notification.actorId === userId"));
    assert.ok(criticalJs.includes("return false"));
    assert.ok(criticalJs.includes("lockedSurpriseCountForUserCritical"));
  }],
  ["8.15 - Tutar alaninda ornek placeholder aktif katmanda kaldirilir", () => {
    assert.ok(criticalJs.includes("kasamCriticalAmountShell"));
    assert.ok(criticalJs.includes("data-amount-currency-suffix"));
    assert.ok(criticalJs.includes('placeholder=""'));
    assert.ok(criticalJs.includes('placeholder="1\\.000"') || criticalJs.includes("placeholder=\"1\\.000\""));
  }],
  ["8.16 - Doviz kuru TCMB proxy ile kilitlenir", () => {
    assert.ok(criticalJs.includes("/api/tcmb-rate"));
    assert.ok(criticalJs.includes("data-rate-source"));
    assert.ok(criticalJs.includes("TCMB"));
  }],
  ["8.17 - Cift kayit engeli ve kaydediliyor overlay var", () => {
    assert.ok(criticalJs.includes("kasamCriticalSaving"));
    assert.ok(criticalJs.includes("Bu hareket kaydedildi."));
    assert.ok(criticalJs.includes("Kaydediliyor"));
    assert.ok(css.includes("entry-saving-overlay"));
  }],
  ["8.18 - Hareket silme akisi var", () => {
    assert.ok(criticalJs.includes("kasamDeleteEntry"));
    assert.ok(criticalJs.includes("data-action='delete-entry'"));
    assert.ok(criticalJs.includes("Bu hareket silinsin mi?"));
  }],
  ["8.19 - Kisisel kasa kartlari tekillestirilir", () => {
    assert.ok(criticalJs.includes("personalShown"));
    assert.ok(criticalJs.includes("kasamCriticalProjectRows"));
  }],
  ["8.20 - Aktif bildirim ile gecmis bildirim ayrilir", () => {
    assert.ok(criticalJs.includes("active-notification-list"));
    assert.ok(criticalJs.includes("notification-history"));
    assert.ok(css.includes("passive-notification-list"));
  }],
  ["8.21 - Cloud realtime kullanici bazli acilir ve yenilenir", () => {
    assert.ok(criticalJs.includes("kasamCriticalStartRealtime"));
    assert.ok(criticalJs.includes("postgres_changes"));
    assert.ok(criticalJs.includes("kasamCriticalRealtimeUserId === state.signedInUserId"));
    assert.ok(criticalJs.includes("kasamCriticalStopRealtime"));
    assert.ok(criticalJs.includes("kasamCriticalRefreshFromCloud(\"realtime\")"));
  }],
  ["8.22 - Online ve uygulamaya geri donuste cloud refresh tetiklenir", () => {
    assert.ok(criticalJs.includes('window.addEventListener("online"'));
    assert.ok(criticalJs.includes('document.addEventListener("visibilitychange"'));
    assert.ok(criticalJs.includes('kasamCriticalRefreshFromCloud("online")'));
    assert.ok(criticalJs.includes('kasamCriticalRefreshFromCloud("visibility")'));
  }],
];

const results = tests.map(([name, fn]) => runTest(name, fn));
const passed = results.filter((item) => item.status === "PASS").length;
const failed = results.length - passed;

for (const result of results) {
  if (result.status === "PASS") {
    console.log(`\x1b[32m✓\x1b[0m ${result.name}`);
  } else {
    console.error(`\x1b[31m✗\x1b[0m ${result.name}`);
    console.error(result.message);
    if (result.stack) console.error(result.stack);
  }
}

console.log(`Toplam: ${results.length} test, ${passed} geçti, ${failed} başarısız`);
process.exit(failed ? 1 : 0);
