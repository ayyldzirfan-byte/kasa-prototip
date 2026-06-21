const assert = require("node:assert/strict");
const path = require("node:path");
const { runCdpTest } = require("./scripts/cdp-test-harness.cjs");

const root = process.cwd();
const results = [];

function record(name) {
  results.push(name);
  console.log(`PASS ${name}`);
}

const seed = {
  activeView: "home",
  reportPeriod: "month",
  movementPeriod: "month",
  groupMode: "detail",
  activeProjectId: "p_personal",
  activeUserId: "u_1",
  signedInUserId: "u_1",
  authMode: "login",
  onboardingStep: "done",
  users: [
    { id: "u_1", name: "Test Kullanici", nickname: "Test", email: "test.kullanici@kasam.test", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
    { id: "u_2", name: "Ortak Kullanici", nickname: "Ortak", email: "ortak@kasam.test", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
  ],
  projects: [
    { id: "p_personal", name: "Kendi Kasam", purpose: "Kisisel butce", code: "OWN", createdAt: "2026-06-01T00:00:00.000Z", createdBy: "u_1", memberIds: ["u_1"], memberSince: { u_1: "2026-06-01" }, splitType: "individual" },
    { id: "p_shared", name: "Ortak Butce", purpose: "Ev", code: "KASAM-TEST", createdAt: "2026-06-01T00:00:00.000Z", createdBy: "u_1", memberIds: ["u_1", "u_2"], memberSince: { u_1: "2026-06-01", u_2: "2026-06-01" }, splitType: "equal" },
  ],
  headings: [],
  entries: [],
  notifications: [],
  reactions: [],
  reconciliations: [],
  goals: [],
  settlements: [],
  insights: [],
  joinRequests: [],
  retryQueue: [],
  offlineQueue: [],
};

async function openEntryForm(page, projectId, type) {
  await page.eval(`(payload) => {
    state.activeView = "add";
    state.activeProjectId = payload.projectId;
    state.addProjectId = payload.projectId;
    state.addReturnView = "home";
    state.addReturnProjectId = payload.projectId;
    draft = makeDraft();
    draft.type = payload.type;
    draft.projectId = payload.projectId;
    draft.userId = state.activeUserId;
    draft.date = "2026-06-14";
    draft.notificationMode = "open";
    render();
  }`, [{ projectId, type }]);
  await page.waitForSelector("#entryForm");
}

async function submitEntry(page, { type, amount, heading, projectId = "p_personal" }) {
  const entryCount = await page.eval(`() => state.entries.length`);
  await openEntryForm(page, projectId, type);
  await page.fill("#amount", String(amount));
  await page.fill("#headingName", heading);
  await page.eval(`async () => handleEntrySubmit(document.querySelector("#entryForm"))`);
  await page.waitFor(`() => state.entries.length > ${entryCount}`, 12000);
  if (projectId === "p_personal") {
    await page.waitFor(`document.body.dataset.view === "home"`, 12000);
  }
}

runCdpTest({ root, port: 4178, cdpPort: 9378 }, async ({ page, localBase }) => {
  await page.goto(`${localBase}/index.html?v=kasam-e2e`);
  await page.eval(`(seedState) => {
    localStorage.clear();
    window.isCloudReady = () => false;
    state = normalizeState(seedState);
    draft = makeDraft();
    saveState();
    render();
  }`, [seed]);
  await page.waitFor(`document.body.dataset.view === "home"`, 12000);
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /Kasam|Kendi Kasam|Test kasası/);
  record("home render");

  await submitEntry(page, { type: "income", amount: 10000, heading: "Maas" });
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /10\.000/);
  record("income entry");

  await submitEntry(page, { type: "expense", amount: 1250, heading: "Market" });
  const homeText = await page.eval(`() => document.querySelector("#app")?.innerText || ""`);
  assert.match(homeText, /8\.750/);
  record("expense entry");

  await page.eval(`() => { state.activeView = "calendar"; saveState(); render(); }`);
  await page.waitForSelector(".desk-calendar");
  assert.match(await page.eval(`() => document.querySelector("#app")?.innerText || ""`), /Takvim|TAKV/);
  record("calendar render");

  await page.eval(`() => { state.activeView = "report"; state.reportPeriod = "month"; saveState(); render(); }`);
  await page.waitForSelector("[data-action='open-receipt']");
  await page.click("[data-action='open-receipt']");
  await page.waitForSelector("#receiptCard");
  assert.match(await page.eval(`() => document.querySelector("#receiptCard")?.innerText || ""`), /KASAM|KASA/);
  record("report receipt");

  await submitEntry(page, { type: "expense", amount: 1000, heading: "Ortak market", projectId: "p_shared" });
  const sharedResult = await page.eval(`() => {
    const user1 = state.users.find((user) => user.id === "u_1");
    const user2 = state.users.find((user) => user.id === "u_2");
    return {
      user1Expense: personalLedgerEntries(user1).filter((entry) => entry.projectId === "p_shared").reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
      user2Expense: personalLedgerEntries(user2).filter((entry) => entry.projectId === "p_shared").reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
      notifications: state.notifications.length,
    };
  }`);
  assert.equal(sharedResult.user1Expense, 500);
  assert.equal(sharedResult.user2Expense, 500);
  assert.equal(sharedResult.notifications, 1);
  record("shared entry personal ledgers and notification");

  await page.screenshot(path.join(root, "screenshots", "kasam-production-e2e.png"));
  console.log(results.map((item) => `PASS ${item}`).join("\n"));
  console.log("KASAM E2E OK");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
