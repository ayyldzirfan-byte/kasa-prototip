const assert = require("node:assert/strict");
const { runCdpTest } = require("./scripts/cdp-test-harness.cjs");

const storageKey = "kasa-prototype-state-v6";
const results = [];

function record(name, detail = "") {
  results.push({ name, status: "PASS", detail });
  console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
}

runCdpTest({ root: __dirname, port: 4184, cdpPort: 9384 }, async ({ page, localBase }) => {
  await page.goto(`${localBase}/index.html?v=20260613-1952&testScenario=1`);
  await page.waitFor(`Boolean(localStorage.getItem(${JSON.stringify(storageKey)}))`, 12000);
  await page.waitFor(`document.body.dataset.view === "home"`, 12000);

  const result = await page.eval(`(key) => {
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
  }`, [storageKey]);

  assert.equal(result.testMode, true);
  record("test modu bayragi aktif");
  assert.equal(result.cloudReady, false);
  record("Supabase auth/cloud bypass aktif");
  assert.equal(result.activeView, "home");
  record("auth ekrani atlandi ve ana ekran acildi");
  assert.equal(result.activeUserEmail, "mehmet.s1@kasam.test");
  assert.equal(result.pendingLoginEmail, "mehmet.s1@kasam.test");
  assert.equal(result.testScenarioActiveEmail, "mehmet.s1@kasam.test");
  assert.equal(result.signedInMatches, true);
  assert.equal(result.cloudEnabled, false);
  assert.equal(result.cloudStatus, "Test modu");
  assert.match(result.projectName, /Yılmaz Ailesi/);
  assert.match(result.appText, /Mehmet|Yılmaz Ailesi/);
  record("localStorage aktif kullanici Mehmet olarak yuklendi", result.activeUserEmail);

  const bannerText = await page.eval(`() => document.querySelector("[data-testid='test-mode-banner']")?.innerText || ""`);
  assert.match(bannerText, /Test modu/);
  assert.match(bannerText, /Senaryo 1: Yılmaz Ailesi/);
  record("test modu banneri senaryo adini gosteriyor");

  await page.eval(`() => {
    const select = document.querySelector("[data-action='test-user-switch']");
    select.value = select.options[1].value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }`);
  await page.waitFor(`() => {
    try {
      const raw = localStorage.getItem(${JSON.stringify(storageKey)});
      if (!raw) return false;
      const state = JSON.parse(raw);
      const user = Array.isArray(state.users) ? state.users.find((item) => item.id === state.activeUserId) : null;
      return user?.email === "fatma.s1@kasam.test";
    } catch (_error) {
      return false;
    }
  }`, 12000);
  const switched = await page.eval(`(key) => {
    const state = JSON.parse(localStorage.getItem(key));
    const user = state.users.find((item) => item.id === state.activeUserId);
    return { email: user?.email, signedInMatches: state.signedInUserId === state.activeUserId };
  }`, [storageKey]);
  assert.equal(switched.email, "fatma.s1@kasam.test");
  assert.equal(switched.signedInMatches, true);
  record("test modu kullanici degistiriyor", switched.email);

  await page.click("[data-action='exit-test-mode']");
  await page.waitFor(`!location.search.includes("testScenario")`, 12000);
  await page.waitFor(`!localStorage.getItem(${JSON.stringify(storageKey)})`, 12000);
  assert.ok(!(await page.eval(`() => location.href`)).includes("testScenario"));
  record("test modundan cikis parametreyi ve localStorage state'i temizliyor");

  console.log(`Toplam: ${results.length} test, ${results.length} gecti, 0 basarisiz`);
}).catch((error) => {
  console.error("FAIL testScenario auth bypass");
  console.error(error.stack || error.message);
  process.exit(1);
});
