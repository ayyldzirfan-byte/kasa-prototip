const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const files = [
  "app-state.js",
  "app-core.js",
  "app-views.js",
  "app-bind.js",
  "app-model.js",
  "app-cloud.js",
  "app-blocks.js",
  "app-product-pass.js",
  "app-production.js",
];

const sandbox = {
  console,
  window: {
    addEventListener() {},
    removeEventListener() {},
    location: { origin: "http://test.local", pathname: "/index.html" },
    Sentry: null,
    setInterval() { return 1; },
    clearInterval() {},
  },
  document: {
    hidden: false,
    body: { dataset: {}, classList: { toggle() {}, add() {}, remove() {} } },
    documentElement: { style: { setProperty() {} } },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() {
      return { style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, appendChild() {}, remove() {} };
    },
  },
  location: { origin: "http://test.local", pathname: "/index.html" },
  localStorage: {
    data: {},
    getItem(key) { return this.data[key] || null; },
    setItem(key, value) { this.data[key] = String(value); },
    removeItem(key) { delete this.data[key]; },
    clear() { this.data = {}; },
  },
  navigator: { onLine: true },
  crypto: { randomUUID: () => `test-${Math.random().toString(16).slice(2)}` },
  app: { innerHTML: "", querySelectorAll() { return []; }, querySelector() { return null; } },
  setTimeout() { return 1; },
  clearTimeout() {},
  setInterval() { return 1; },
  clearInterval() {},
  URLSearchParams,
  FormData,
  Blob,
  File: function File() {},
  Intl,
  Date,
  Math,
};

sandbox.window.document = sandbox.document;
sandbox.window.localStorage = sandbox.localStorage;
sandbox.window.navigator = sandbox.navigator;

vm.createContext(sandbox);
for (const file of files) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), "utf8"), sandbox, { filename: file });
}

const result = JSON.parse(JSON.stringify(vm.runInContext(`
  state = {
    activeView: "notifications",
    activeProjectId: "p_shared",
    signedInUserId: "u_2",
    activeUserId: "u_2",
    users: [{ id: "u_2", name: "User Two", nickname: "Two", email: "two@test.local", createdAt: "2026-06-11T05:00:00.000Z" }],
    projects: [{ id: "p_shared", name: "Shared", purpose: "Test", code: "KASAM-TST", createdAt: "2026-06-11T05:00:00.000Z", createdBy: "u_1", memberIds: ["u_1", "u_2", "u_3"], memberSince: { u_1: "2026-06-01", u_2: "2026-06-01", u_3: "2026-06-01" }, splitType: "equal" }],
    headings: [{ id: "h_1", projectId: "p_shared", name: "Elektrik", shortName: "Elektrik", emoji: "" }],
    entries: [],
    notifications: [],
    reactions: [],
    goals: [],
    settlements: [],
    reconciliations: [],
    insights: [],
    retryQueue: []
  };
  draft = makeDraft();
  const localSnapshot = {
    users: [
      { id: "u_1", name: "User One", nickname: "One", email: "one@test.local", createdAt: "2026-06-11T05:00:00.000Z" },
      { id: "u_2", name: "User Two", nickname: "Two", email: "two@test.local", createdAt: "2026-06-11T05:00:00.000Z" },
      { id: "u_3", name: "User Three", nickname: "Three", email: "three@test.local", createdAt: "2026-06-11T05:00:00.000Z" }
    ],
    projects: state.projects,
    headings: state.headings,
    entries: [{
      id: "e_pending",
      projectId: "p_shared",
      type: "expense",
      amount: 900,
      headingId: "h_1",
      shortName: "Elektrik",
      userId: "u_2",
      paidById: "u_2",
      splitWith: ["u_1", "u_2", "u_3"],
      splitRatio: [1/3, 1/3, 1/3],
      date: "2026-06-11",
      status: "done",
      syncStatus: "pending",
      createdAt: "2026-06-11T05:01:00.000Z",
      updatedAt: "2026-06-11T05:01:00.000Z"
    }],
    notifications: [{
      id: "n_pending",
      projectId: "p_shared",
      entryId: "e_pending",
      actorId: "u_2",
      recipients: ["u_1", "u_3"],
      mode: "surprise",
      actualType: "expense",
      title: "Elektrik",
      amount: 900,
      guesses: [],
      syncStatus: "pending",
      createdAt: "2026-06-11T05:01:00.000Z"
    }],
    reactions: [],
    goals: [],
    settlements: []
  };
  kasamRestoreLocalPendingAfterCloud(localSnapshot);
  const restoredEntry = state.entries.find((entry) => entry.id === "e_pending");
  const restoredNotification = state.notifications.find((item) => item.id === "n_pending");
  const hasAllMemberStubs = ["u_1", "u_2", "u_3"].every((id) => state.users.some((user) => user.id === id));

  state.notifications = [{
    id: "n_game",
    projectId: "p_shared",
    entryId: "e_pending",
    actorId: "u_1",
    recipients: ["u_2"],
    mode: "surprise",
    actualType: "expense",
    title: "Elektrik",
    amount: 900,
    successReaction: "OK",
    failReaction: "NO",
    guesses: [],
    createdAt: "2026-06-11T05:02:00.000Z"
  }];
  const initialHtml = notificationRow(state.notifications[0]);
  const first = guessNotification("n_game", { step: "actor", predictedActorId: "u_1" });
  const second = guessNotification("n_game", { step: "type", predictedType: "expense" });
  const third = guessNotification("n_game", { step: "heading", predictedTitle: "Elektrik" });
  const fourth = guessNotification("n_game", { step: "amount", predictedAmount: 920 });
  ({
    restoredEntry,
    restoredNotification,
    hasAllMemberStubs,
    initialHasActorQuestion: initialHtml.includes("Kim hareket ekledi?"),
    initialLeaksAmountOptional: initialHtml.includes("Tutar tahmini opsiyonel"),
    statuses: [first.status, second.status, third.status, fourth.status],
    completed: state.notifications[0].isCompleted,
    revealed: Boolean(state.notifications[0].revealedAt),
    score: currentUser().totalScore,
    correctGuesses: currentUser().correctGuesses,
    totalGuesses: currentUser().totalGuesses
  });
`, sandbox)));

assert.ok(result.restoredEntry, "pending local entry should survive stale cloud load");
assert.equal(result.restoredEntry.splitWith.length, 3);
assert.ok(result.restoredNotification, "pending local notification should survive stale cloud load");
assert.equal(result.hasAllMemberStubs, true);
assert.equal(result.initialHasActorQuestion, true);
assert.equal(result.initialLeaksAmountOptional, false);
assert.deepEqual(result.statuses, ["partial", "partial", "partial", "saved"]);
assert.equal(result.completed, true);
assert.equal(result.revealed, true);
assert.equal(result.score, 10);
assert.equal(result.correctGuesses, 1);
assert.equal(result.totalGuesses, 1);

console.log("CLOUD PERSISTENCE AND GUESS FLOW TEST OK");
