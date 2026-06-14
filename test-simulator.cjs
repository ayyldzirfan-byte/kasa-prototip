const assert = require("assert");
const fs = require("fs");

const simulator = fs.readFileSync("kasam-simulator.html", "utf8");
const scenarios = fs.readFileSync("app-test-scenarios.js", "utf8");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test("Simulator dosyasi testScenario ve simUser parametrelerini kullanir", () => {
  assert.ok(simulator.includes("testScenario"));
  assert.ok(simulator.includes("simUser"));
});

test("Simulator postMessage ile iframe'e aksiyon gonderir", () => {
  assert.ok(simulator.includes("postMessage"));
  assert.ok(simulator.includes("kasam-simulator"));
  assert.ok(simulator.includes("add-entry"));
});

test("Simulator 2-4 kullanici ve 8 senaryo kontrolu icerir", () => {
  assert.ok(simulator.includes("data-count=\"2\""));
  assert.ok(simulator.includes("data-count=\"3\""));
  assert.ok(simulator.includes("data-count=\"4\""));
  assert.ok(simulator.includes("value=\"8\""));
});

test("Simulator otomatik test butonlarini icerir", () => {
  assert.ok(simulator.includes("Tahmin Oyunu Başlat"));
  assert.ok(simulator.includes("Ortak Kasa Testi"));
  assert.ok(simulator.includes("Senaryoyu Otomatik Oynat"));
});

test("App test senaryosu simUser URL parametresini okur", () => {
  assert.ok(scenarios.includes("function testScenarioUserIndexFromUrl"));
  assert.ok(scenarios.includes("get(\"simUser\")"));
});

test("App test senaryosu simulator bridge mesajlarini dinler", () => {
  assert.ok(scenarios.includes("__kasamSimulatorBridgeBound"));
  assert.ok(scenarios.includes("message.source !== \"kasam-simulator\""));
  assert.ok(scenarios.includes("hydrate-state"));
});

test("App test senaryosu simulator icin state ozeti dondurur", () => {
  assert.ok(scenarios.includes("function testScenarioSummary"));
  assert.ok(scenarios.includes("entryCount"));
  assert.ok(scenarios.includes("notificationCount"));
  assert.ok(scenarios.includes("personalNet"));
  assert.ok(simulator.includes("Kişisel pay"));
});

let passed = 0;
for (const item of tests) {
  try {
    item.fn();
    passed += 1;
    console.log(`\x1b[32m✓\x1b[0m ${item.name}`);
  } catch (error) {
    console.error(`\x1b[31m✗ ${item.name}\x1b[0m`);
    console.error(error.stack || error.message);
  }
}

const failed = tests.length - passed;
console.log(`Toplam: ${tests.length} test, ${passed} geçti, ${failed} başarısız`);
process.exit(failed ? 1 : 0);
