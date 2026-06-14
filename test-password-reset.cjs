const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function runTest(name, fn) {
  try {
    fn();
    return { status: "PASS", name };
  } catch (error) {
    return { status: "FAIL", name, message: error.message, stack: error.stack };
  }
}

const appCloud = read("app-cloud.js");
const appCore = read("app-core.js");
const appModel = read("app-model.js");
const critical = read("app-critical-fixes.js");
const config = read("cloud-config.js");

const tests = [
  ["RESET 1 - Canonical Vercel URL config tarafinda var", () => {
    assert.ok(config.includes('appUrl: "https://kasa-prototip.vercel.app"'));
  }],
  ["RESET 2 - Reset redirect canonical Vercel adresine gider", () => {
    assert.ok(appCloud.includes("cloudPasswordResetRedirectUrl"));
    assert.ok(appCloud.includes("/index.html?authAction=reset-password"));
    assert.ok(critical.includes("kasamCriticalPasswordRedirectUrl()"));
  }],
  ["RESET 3 - Eski Netlify hostu Vercel adresine yonlendirilir", () => {
    assert.ok(appCloud.includes('host.endsWith("netlify.app")'));
    assert.ok(appCloud.includes("location.replace"));
  }],
  ["RESET 4 - Supabase PASSWORD_RECOVERY reset modunu acar", () => {
    assert.ok(appCloud.includes('PASSWORD_RECOVERY'));
    assert.ok(appCloud.includes('state.authMode = "reset-password"'));
  }],
  ["RESET 5 - reset-password state normalize tarafinda korunur", () => {
    assert.ok(appCore.includes('["signup", "reset-password"].includes(source.authMode)'));
    assert.ok(appCore.includes('passwordResetActive'));
  }],
  ["RESET 6 - Yeni sifre ekrani ve updateUser cagrisı var", () => {
    assert.ok(critical.includes('id="passwordResetForm"'));
    assert.ok(critical.includes('auth.updateUser({ password })'));
    assert.ok(critical.includes('Şifre güncellendi.'));
  }],
  ["RESET 7 - Davet linki eski Netlify fallback kullanmaz", () => {
    assert.ok(appModel.includes("window.KASA_CLOUD_CONFIG?.appUrl"));
    assert.ok(!appModel.includes("kasa-prototip.netlify.app"));
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
if (failed) process.exit(1);
