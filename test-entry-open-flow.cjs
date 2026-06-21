const assert = require("node:assert/strict");
const { runCdpTest } = require("./scripts/cdp-test-harness.cjs");

const seed = {
  activeView: "home",
  activeProjectId: "p_shared",
  activeUserId: "u_1",
  signedInUserId: "u_1",
  onboardingStep: "done",
  authMode: "login",
  reportPeriod: "month",
  movementPeriod: "month",
  users: [
    { id: "u_1", name: "Irfan Test", nickname: "Irfan", email: "irfan.entry@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
    { id: "u_2", name: "Diger Test", nickname: "Diger", email: "diger.entry@test.local", password: "1234", createdAt: "2026-06-01T00:00:00.000Z" },
  ],
  projects: [
    {
      id: "p_shared",
      name: "Test Ortak Kasa",
      purpose: "Entry flow",
      code: "ENTRY-FLOW-1",
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

runCdpTest({ root: __dirname, port: 4191, cdpPort: 9391 }, async ({ page, localBase }) => {
  await page.eval(`(seedState) => {
    localStorage.clear();
    localStorage.setItem("kasa-prototype-state-v6", JSON.stringify(seedState));
  }`, [seed]);
  await page.goto(localBase + "/index.html");
  await page.eval(`(seedState) => {
    window.isCloudReady = () => false;
    window.__kasamTestAccess.setState(seedState, { render: true });
  }`, [seed]);

  await page.eval(`() => {
    const appState = window.__kasamTestAccess.getState();
    appState.activeView = "add";
    appState.activeProjectId = "p_shared";
    appState.addProjectId = "p_shared";
    appState.addReturnView = "home";
    appState.addReturnProjectId = "p_shared";
    window.__kasamTestAccess.setState(appState, { render: false });
    window.__kasamTestAccess.resetDraft({
      type: "expense",
      projectId: "p_shared",
      userId: "u_1",
      date: "2026-06-14",
    });
    render();
  }`);
  const formState = await page.eval(`() => ({
    bodyView: document.body.dataset.view || "",
    activeView: window.__kasamTestAccess.getState().activeView,
    currentUserId: currentUser()?.id || "",
    activeProjectId: activeProject()?.id || "",
    hasEntryForm: Boolean(document.querySelector("#entryForm")),
    appText: document.querySelector("#app")?.innerText?.slice(0, 500) || "",
  })`);
  if (!formState.hasEntryForm) console.log("DEBUG entry-open-flow form state:", JSON.stringify(formState, null, 2));
  await page.waitForSelector("#entryForm");
  await page.fill("#amount", "4000");
  await page.fill("#headingName", "Ek is");
  await page.eval(`() => {
    document.querySelector("select[name='notificationMode']").value = "open";
    document.querySelector("input[name='notificationGif']").value = "https://media.giphy.com/media/test-entry-flow/giphy.gif";
  }`);

  await page.eval(`async () => {
    const form = document.querySelector("#entryForm");
    await Promise.all([handleEntrySubmit(form), handleEntrySubmit(form)]);
  }`);
  await page.waitFor(`document.body.dataset.view === "home"`, 10000);

  const afterSave = await page.eval(`() => ({
    entries: window.__kasamTestAccess.getState().entries.map((entry) => ({ id: entry.id, title: entryTitle(entry), amount: entry.amount, projectId: entry.projectId })),
    notifications: window.__kasamTestAccess.getState().notifications.map((notification) => ({ id: notification.id, entryId: notification.entryId, title: notification.title, gif: notification.gif, mode: notification.mode })),
    user1Ledger: personalLedgerEntries(window.__kasamTestAccess.getState().users.find((user) => user.id === "u_1")).map((entry) => ({ title: entryTitle(entry), amount: entry.amount })),
    user2Ledger: personalLedgerEntries(window.__kasamTestAccess.getState().users.find((user) => user.id === "u_2")).map((entry) => ({ title: entryTitle(entry), amount: entry.amount })),
  })`);
  assert.equal(afterSave.entries.length, 1, "Ayni hareket iki kez kaydedilmemeli");
  assert.equal(afterSave.notifications.length, 1, "Ayni hareket icin tek bildirim olusmali");
  assert.equal(afterSave.notifications[0].gif.includes("giphy.gif"), true, "Acik bildirimin GIF'i saklanmali");
  assert.equal(afterSave.user1Ledger[0].amount, 2000, "Ortak gider ekleyen kullanicinin kisisel payina yansimali");
  assert.equal(afterSave.user2Ledger[0].amount, 2000, "Ortak gider diger kullanicinin kisisel payina yansimali");

  assert.equal(await page.click("[data-action='open-entry-media']"), true);
  await page.waitForSelector(".movement-media-overlay img");
  const overlaySrc = await page.eval(`() => document.querySelector(".movement-media-overlay img")?.getAttribute("src") || ""`);
  assert.equal(overlaySrc.includes("giphy.gif"), true, "Hareket kartina tiklayinca GIF buyuk overlay'de acilmali");

  await page.eval(`() => {
    const appState = window.__kasamTestAccess.getState();
    appState.activeUserId = "u_2";
    appState.signedInUserId = "u_2";
    appState.activeView = "notifications";
    window.__kasamTestAccess.setState(appState, { resetDraft: false, render: false });
    render();
  }`);
  await page.waitForSelector(".notification-card");
  const notificationText = await page.eval(`() => document.querySelector(".notification-card")?.innerText || ""`);
  assert.match(notificationText, /gider ekledi|hareket ekledi/i, "Diger kullanici bildirimi gormeli");

  console.log("PASS entry-open-flow: tek kayit, tek bildirim, ortak pay ve GIF overlay calisiyor");
}).catch((error) => {
  console.error("FAIL entry-open-flow");
  console.error(error);
  process.exit(1);
});
