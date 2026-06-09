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
      return {
        style: {},
        classList: { add() {}, remove() {}, toggle() {} },
        setAttribute() {},
        appendChild() {},
        remove() {},
      };
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
    activeView: "group",
    activeProjectId: "p_shared",
    activeUserId: "u_2",
    signedInUserId: "u_2",
    users: [
      { id: "u_1", name: "User One", nickname: "One", email: "one@test.local", createdAt: "2026-06-01T00:00:00.000Z" },
      { id: "u_2", name: "User Two", nickname: "Two", email: "two@test.local", createdAt: "2026-06-01T00:00:00.000Z" }
    ],
    projects: [{
      id: "p_shared",
      name: "Shared Budget",
      purpose: "Test",
      code: "KASAM-TEST",
      createdAt: "2026-06-01T00:00:00.000Z",
      createdBy: "u_1",
      memberIds: ["u_1", "u_2"],
      memberSince: { u_1: "2026-06-01", u_2: "2026-06-01" },
      budgetLimits: { __memberSince: { u_1: "2026-06-01", u_2: "2026-06-01" } },
      splitType: "equal"
    }],
    headings: [{ id: "h_1", projectId: "p_shared", name: "Market", shortName: "Market", emoji: "" }],
    entries: [],
    notifications: [],
    reactions: [],
    reconciliations: [],
    goals: [],
    settlements: [],
    insights: [],
    joinRequests: [],
    retryQueue: []
  };
  draft = makeDraft();
  const project = state.projects[0];
  const expenseSplit = splitForResponsibleEntry(project, "expense", "u_2", "2026-06-09");
  const incomeSplit = splitForResponsibleEntry(project, "income", "u_2", "2026-06-09");
  const expense = {
    id: "e_expense",
    projectId: "p_shared",
    type: "expense",
    amount: 1000,
    headingId: "h_1",
    shortName: "Market",
    userId: "u_2",
    paidById: "u_2",
    splitWith: expenseSplit.splitWith,
    splitRatio: expenseSplit.splitRatio,
    date: "2026-06-09",
    status: "done",
    createdAt: "2026-06-09T00:00:00.000Z"
  };
  const income = {
    ...expense,
    id: "e_income",
    type: "income",
    amount: 600,
    splitWith: incomeSplit.splitWith,
    splitRatio: incomeSplit.splitRatio
  };
  state.entries.unshift(expense, income);
  createEntryNotification(expense, { mode: "open", emoji: "T" });
  createEntryNotification(income, { mode: "open", emoji: "T" });
  const user1 = state.users[0];
  const user2 = state.users[1];
  ({
    expenseSplit,
    incomeSplit,
    user1Ledger: personalLedgerEntries(user1).map((entry) => ({ id: entry.id, type: entry.type, amount: entry.amount })),
    user2Ledger: personalLedgerEntries(user2).map((entry) => ({ id: entry.id, type: entry.type, amount: entry.amount })),
    notifications: state.notifications.map((item) => ({ entryId: item.entryId, actorId: item.actorId, recipients: item.recipients, actualType: item.actualType })),
    missingFeature: kasamCloudMissingFeature({ code: "PGRST202", message: "Could not find function" })
  });
`, sandbox)));

assert.deepEqual([...result.expenseSplit.splitWith].sort(), ["u_1", "u_2"]);
assert.deepEqual([...result.incomeSplit.splitWith].sort(), ["u_1", "u_2"]);
assert.deepEqual(result.expenseSplit.splitRatio, [0.5, 0.5]);
assert.deepEqual(result.incomeSplit.splitRatio, [0.5, 0.5]);
assert.equal(result.user1Ledger.find((entry) => entry.id === "e_expense").amount, 500);
assert.equal(result.user2Ledger.find((entry) => entry.id === "e_expense").amount, 500);
assert.equal(result.user1Ledger.find((entry) => entry.id === "e_income").amount, 300);
assert.equal(result.user2Ledger.find((entry) => entry.id === "e_income").amount, 300);
assert.equal(result.notifications.length, 2);
assert.ok(result.notifications.every((item) => item.actorId === "u_2" && item.recipients.includes("u_1")));
assert.equal(result.missingFeature, true);

console.log("SHARED BUDGET SYNC TEST OK");
