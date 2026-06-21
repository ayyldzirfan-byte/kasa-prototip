const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const appProduction = read("app-production.js");
const sw = read("sw.js");

assert(appProduction.includes("window.onerror"));
assert(appProduction.includes("window.onunhandledrejection"));
assert(appProduction.includes("window.Sentry?.captureException"));
assert(appProduction.includes("retryQueue"));
assert(appProduction.includes("nextAttemptAt"));
assert(appProduction.includes("5000"));
assert(appProduction.includes("30000"));
assert(appProduction.includes("manual-retry"));
assert(appProduction.includes("wifi-off"));
assert(appProduction.includes("Çevrimdışı"));
assert(appProduction.includes("Kaydedildi (senkronize edilecek)"));
assert(appProduction.includes("updated_at: entry.updatedAt"));
assert(appProduction.includes("loadCloudDataKasam"));

["./index.html", "./styles.css", "./app-production.js", "./app-critical-fixes.js", "./manifest.webmanifest"].forEach((asset) => {
  assert(sw.includes(asset), asset);
});
assert(sw.includes("caches.open"));
assert(sw.includes("fetch(event.request)"));
assert(sw.includes("caches.match(event.request)"));

console.log("OFFLINE TEST OK");
