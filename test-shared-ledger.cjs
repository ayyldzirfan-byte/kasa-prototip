const assert = require("node:assert/strict");
const { runCdpTest } = require("./scripts/cdp-test-harness.cjs");

const seed = {
  activeView: "group",
  activeProjectId: "p_shared",
  activeUserId: "u_2",
  signedInUserId: "u_2",
  authMode: "login",
  onboardingStep: "done",
  reportPeriod: "month",
  movementPeriod: "month",
  groupMode: "detail",
  users: [
    { id: "u_1", name: "Ortak Bir", nickname: "Bir", email: "bir@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
    { id: "u_2", name: "Ortak Iki", nickname: "Iki", email: "iki@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
  ],
  projects: [
    {
      id: "p_shared",
      name: "Ortak Butce",
      purpose: "Test",
      code: "KASAM-TEST",
      createdAt: "2026-06-01T00:00:00.000Z",
      createdBy: "u_1",
      memberIds: ["u_1", "u_2"],
      memberSince: { u_1: "2026-06-01", u_2: "2026-06-01" },
      splitType: "equal",
    },
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
};

async function openEntryForm(page, type) {
  await page.eval(`(type) => {
    state.activeView = "add";
    state.activeProjectId = "p_shared";
    state.addProjectId = "p_shared";
    state.addReturnView = "group";
    state.addReturnProjectId = "p_shared";
    state.groupMode = "detail";
    draft = makeDraft();
    draft.type = type;
    draft.projectId = "p_shared";
    draft.userId = state.activeUserId;
    draft.date = "2026-06-14";
    draft.notificationMode = "open";
    render();
  }`, [type]);
  await page.waitForSelector("#entryForm");
}

async function submitEntryForm(page) {
  const result = await page.eval(`async () => {
    window.__lastKasamEntryError = "";
    try {
      await handleEntrySubmit(document.querySelector("#entryForm"));
      return {
        ok: true,
        entries: state.entries.length,
        activeView: state.activeView,
        bodyView: document.body.dataset.view || "",
        error: window.__lastKasamEntryError || "",
      };
    } catch (error) {
      return {
        ok: false,
        entries: state.entries.length,
        activeView: state.activeView,
        bodyView: document.body.dataset.view || "",
        error: error?.message || String(error),
      };
    }
  }`);
  if (!result.ok || !result.entries) console.log("DEBUG shared-ledger submit:", JSON.stringify(result, null, 2));
}

runCdpTest({ root: __dirname, port: 4186, cdpPort: 9386 }, async ({ page, localBase }) => {
  await page.eval(`(seedState) => {
    localStorage.clear();
    localStorage.setItem("kasa-prototype-state-v6", JSON.stringify(seedState));
  }`, [seed]);
  await page.goto(localBase + "/index.html");
  await page.eval(`(seedState) => {
    window.isCloudReady = () => false;
    state = normalizeState(seedState);
    draft = makeDraft();
    saveState();
    render();
  }`, [seed]);

  await openEntryForm(page, "expense");
  await page.fill("#amount", 1000);
  await page.fill("#headingName", "Market");
  await submitEntryForm(page);
  await page.waitFor(`state.entries.length === 1`, 12000);

  await openEntryForm(page, "income");
  await page.fill("#amount", 600);
  await page.fill("#headingName", "Ortak gelir");
  await submitEntryForm(page);
  await page.waitFor(`state.entries.length === 2`, 12000);

  const result = await page.eval(`() => {
    const user1 = state.users.find((user) => user.id === "u_1");
    const user2 = state.users.find((user) => user.id === "u_2");
    const entries = state.entries.filter((entry) => entry.projectId === "p_shared");
    return {
      totalEntries: entries.length,
      entries: entries.map((entry) => ({ type: entry.type, amount: entry.amount, splitWith: entry.splitWith || [], splitRatio: entry.splitRatio || [] })),
      user1Personal: personalLedgerEntries(user1).map((entry) => ({ type: entry.type, amount: entry.amount, projectId: entry.projectId })),
      user2Personal: personalLedgerEntries(user2).map((entry) => ({ type: entry.type, amount: entry.amount, projectId: entry.projectId })),
      groupEntries: personalProjectEntries(state.projects[0], user2).map((entry) => ({ amount: entry.amount, projectId: entry.projectId })),
      notifications: state.notifications.map((item) => ({ actorId: item.actorId, recipients: item.recipients, actualType: item.actualType, mode: item.mode })),
    };
  }`);

  assert.equal(result.totalEntries, 2);
  const expenseEntry = result.entries.find((entry) => entry.type === "expense");
  const incomeEntry = result.entries.find((entry) => entry.type === "income");
  assert.deepEqual(expenseEntry.splitWith.sort(), ["u_1", "u_2"]);
  assert.deepEqual(expenseEntry.splitRatio, [0.5, 0.5]);
  assert.deepEqual(incomeEntry.splitWith.sort(), ["u_1", "u_2"]);
  assert.deepEqual(incomeEntry.splitRatio, [0.5, 0.5]);
  assert.equal(result.user1Personal.find((entry) => entry.type === "expense")?.amount, 500);
  assert.equal(result.user2Personal.find((entry) => entry.type === "expense")?.amount, 500);
  assert.equal(result.user1Personal.find((entry) => entry.type === "income")?.amount, 300);
  assert.equal(result.user2Personal.find((entry) => entry.type === "income")?.amount, 300);
  assert.ok(result.groupEntries.some((entry) => entry.amount === 500));
  assert.ok(result.groupEntries.some((entry) => entry.amount === 300));
  assert.equal(result.notifications.length, 2);
  assert.ok(result.notifications.every((item) => item.actorId === "u_2" && item.recipients.includes("u_1")));

  console.log("SHARED LEDGER TEST OK");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
