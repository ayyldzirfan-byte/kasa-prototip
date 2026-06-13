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
    setInterval() {
      return 1;
    },
    clearInterval() {},
  },
  document: {
    hidden: false,
    body: { dataset: {}, classList: { toggle() {}, add() {}, remove() {} } },
    documentElement: { style: { setProperty() {} }, dataset: {} },
    addEventListener() {},
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
    createElement() {
      return { style: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, appendChild() {}, remove() {} };
    },
  },
  location: { origin: "http://test.local", pathname: "/index.html" },
  localStorage: {
    data: {},
    getItem(key) {
      return this.data[key] || null;
    },
    setItem(key, value) {
      this.data[key] = String(value);
    },
    removeItem(key) {
      delete this.data[key];
    },
    clear() {
      this.data = {};
    },
  },
  navigator: { onLine: true },
  crypto: { randomUUID: () => `test-${Math.random().toString(16).slice(2)}` },
  app: { innerHTML: "", querySelectorAll() { return []; }, querySelector() { return null; } },
  tabs: [],
  setTimeout() {
    return 1;
  },
  clearTimeout() {},
  setInterval() {
    return 1;
  },
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
  const ids = { owner: "u_owner", partner: "u_partner", child: "u_child", project: "p_house" };
  state = {
    activeView: "home",
    activeProjectId: ids.project,
    activeUserId: ids.owner,
    signedInUserId: ids.owner,
    reportPeriod: "month",
    movementPeriod: "month",
    calendarMonth: "2026-06",
    calendarDay: "2026-06-13",
    users: [
      { id: ids.owner, name: "User Owner", nickname: "Owner", email: "owner@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, createdAt: "2026-06-01T00:00:00.000Z" },
      { id: ids.partner, name: "User Partner", nickname: "Partner", email: "partner@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, createdAt: "2026-06-01T00:00:00.000Z" },
      { id: ids.child, name: "User Child", nickname: "Child", email: "child@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, createdAt: "2026-06-01T00:00:00.000Z" }
    ],
    projects: [{
      id: ids.project,
      name: "House Budget",
      purpose: "Shared functional test",
      code: "KASAM-FLOW",
      createdAt: "2026-06-01T00:00:00.000Z",
      createdBy: ids.owner,
      memberIds: [ids.owner, ids.partner, ids.child],
      memberSince: { [ids.owner]: "2026-06-01", [ids.partner]: "2026-06-01", [ids.child]: "2026-06-01" },
      splitType: "equal",
      memberAliases: {},
      memberPhotos: {}
    }],
    headings: [
      { id: "h_market", projectId: ids.project, name: "Market", shortName: "Market", emoji: "" },
      { id: "h_salary", projectId: ids.project, name: "Katki", shortName: "Katki", emoji: "" },
      { id: "h_electric", projectId: ids.project, name: "Elektrik", shortName: "Elektrik", emoji: "" },
      { id: "h_rent", projectId: ids.project, name: "Kira", shortName: "Kira", emoji: "" }
    ],
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

  function switchUser(userId) {
    state.signedInUserId = userId;
    state.activeUserId = userId;
    state.activeProjectId = ids.project;
    draft = makeDraft();
    return currentUser();
  }

  function addEntry({ id, actorId, type, amount, headingId, date = "2026-06-13", status = "done", mode = "open" }) {
    switchUser(actorId);
    const project = activeProject();
    const split = splitForResponsibleEntry(project, type, actorId, date);
    const entry = {
      id,
      projectId: ids.project,
      type,
      amount,
      enteredAmount: amount,
      currency: "TRY",
      exchangeRate: 1,
      headingId,
      shortName: state.headings.find((heading) => heading.id === headingId)?.shortName || "",
      userId: actorId,
      paidById: actorId,
      splitWith: split.splitWith,
      splitRatio: split.splitRatio,
      date,
      status,
      settlement: type === "expense",
      lockedNotificationId: "",
      autoRevealAt: "",
      rateLockedAt: "2026-06-13T09:00:00.000Z",
      createdAt: "2026-06-13T09:00:00.000Z",
      updatedAt: "2026-06-13T09:00:00.000Z"
    };
    state.entries.unshift(entry);
    const notification = createEntryNotification(entry, {
      mode,
      emoji: "T",
      successReaction: "OK",
      failReaction: "NO",
      guessDeadline: "2099-01-01T00:00:00.000Z"
    });
    if (notification?.mode === "surprise") {
      entry.lockedNotificationId = notification.id;
      entry.autoRevealAt = notification.guessDeadline;
    }
    return { entry, notification };
  }

  const openExpense = addEntry({ id: "e_open_expense", actorId: ids.owner, type: "expense", amount: 900, headingId: "h_market", mode: "open" });
  const openIncome = addEntry({ id: "e_open_income", actorId: ids.child, type: "income", amount: 600, headingId: "h_salary", mode: "open" });
  const surpriseExpense = addEntry({ id: "e_surprise_expense", actorId: ids.owner, type: "expense", amount: 1200, headingId: "h_electric", mode: "surprise" });
  const futurePayable = addEntry({ id: "e_future_rent", actorId: ids.partner, type: "payable", amount: 1500, headingId: "h_rent", date: "2026-07-01", status: "pending", mode: "silent" });

  function userSnapshot(userId) {
    switchUser(userId);
    const ledger = personalLedgerEntries();
    const totals = calculateTotals(ledger);
    const notificationHtml = renderNotifications();
    const movementHtml = renderMovements();
    const calendarHtml = renderCalendar();
    const reportHtml = renderReport();
    const receiptHtml = renderReceipt();
    return {
      userId,
      ledger: ledger.map((entry) => ({ id: entry.id, type: entry.type, amount: entry.amount, status: entry.status, title: entryTitle(entry) })),
      totals,
      notifications: notificationEntries().map((item) => ({ id: item.id, entryId: item.entryId, mode: item.mode, type: item.notificationType || "entry", actorId: item.actorId, recipients: item.recipients })),
      notificationHtml,
      movementHtml,
      calendarHtml,
      reportHtml,
      receiptHtml
    };
  }

  const beforeRevealOwner = userSnapshot(ids.owner);
  const beforeRevealPartner = userSnapshot(ids.partner);
  const beforeRevealChild = userSnapshot(ids.child);

  switchUser(ids.partner);
  const partnerWrongActor = guessNotification(surpriseExpense.notification.id, { step: "actor", predictedActorId: ids.child });
  const partnerAfterWrongHtml = notificationRow(surpriseExpense.notification);
  const partnerCorrectType = guessNotification(surpriseExpense.notification.id, { step: "type", predictedType: "expense" });
  const partnerCorrectHeading = guessNotification(surpriseExpense.notification.id, { step: "heading", predictedTitle: "Elektrik" });
  const partnerAmount = guessNotification(surpriseExpense.notification.id, { step: "amount", predictedAmount: 1180 });
  const afterPartnerDoneVisible = notificationEntries().some((item) => item.id === surpriseExpense.notification.id);
  const afterPartnerDoneConfirmed = entryConfirmed(surpriseExpense.entry);

  switchUser(ids.child);
  const childActor = guessNotification(surpriseExpense.notification.id, { step: "actor", predictedActorId: ids.owner });
  const childType = guessNotification(surpriseExpense.notification.id, { step: "type", predictedType: "expense" });
  const childHeading = guessNotification(surpriseExpense.notification.id, { step: "heading", predictedTitle: "Elektrik" });
  const childAmount = guessNotification(surpriseExpense.notification.id, { step: "amount", predictedAmount: 1300 });
  const afterAllDoneConfirmed = entryConfirmed(surpriseExpense.entry);

  switchUser(ids.partner);
  setReaction(openExpense.entry.id, "FIRE");
  const reactionNotification = state.notifications.find((item) => item.notificationType === "reaction");

  const afterRevealOwner = userSnapshot(ids.owner);
  const afterRevealPartner = userSnapshot(ids.partner);
  const afterRevealChild = userSnapshot(ids.child);

  switchUser(ids.owner);
  state.activeProjectId = ids.project;
  const balances = calculateBalances();
  const receiptDistribution = kasamReceiptDistributionHtml(activeProject(), "month");

  ({
    openExpenseNotification: {
      actorId: openExpense.notification.actorId,
      recipients: openExpense.notification.recipients,
      mode: openExpense.notification.mode,
      title: openExpense.notification.title,
      amount: openExpense.notification.amount
    },
    openIncomeNotification: {
      actorId: openIncome.notification.actorId,
      recipients: openIncome.notification.recipients,
      mode: openIncome.notification.mode,
      title: openIncome.notification.title,
      amount: openIncome.notification.amount
    },
    beforeRevealOwner,
    beforeRevealPartner,
    beforeRevealChild,
    partnerGuessStatuses: [partnerWrongActor.status, partnerCorrectType.status, partnerCorrectHeading.status, partnerAmount.status],
    partnerAfterWrongHasResult: partnerAfterWrongHtml.includes("Yanl"),
    partnerAfterWrongHasNext: partnerAfterWrongHtml.includes("Gelir mi, gider mi?"),
    afterPartnerDoneVisible,
    afterPartnerDoneConfirmed,
    childGuessStatuses: [childActor.status, childType.status, childHeading.status, childAmount.status],
    afterAllDoneConfirmed,
    afterRevealOwner,
    afterRevealPartner,
    afterRevealChild,
    reactionNotification: reactionNotification ? {
      actorId: reactionNotification.actorId,
      recipients: reactionNotification.recipients,
      emoji: reactionNotification.reactionEmoji,
      title: reactionNotification.title
    } : null,
    reactionSummary: reactionSummary(openExpense.entry.id),
    balances,
    receiptDistribution,
    pendingSurpriseCountOwner: pendingSurpriseCountForUser(state.users.find((user) => user.id === ids.owner)),
    pendingSurpriseCountPartner: pendingSurpriseCountForUser(state.users.find((user) => user.id === ids.partner)),
    pendingSurpriseCountChild: pendingSurpriseCountForUser(state.users.find((user) => user.id === ids.child))
  });
`, sandbox)));

function hasEntry(snapshot, id) {
  return snapshot.ledger.some((entry) => entry.id === id);
}

function entryAmount(snapshot, id) {
  return snapshot.ledger.find((entry) => entry.id === id)?.amount;
}

assert.deepEqual([...result.openExpenseNotification.recipients].sort(), ["u_child", "u_partner"]);
assert.equal(result.openExpenseNotification.actorId, "u_owner");
assert.equal(result.openExpenseNotification.mode, "open");
assert.deepEqual([...result.openIncomeNotification.recipients].sort(), ["u_owner", "u_partner"]);
assert.equal(result.openIncomeNotification.actorId, "u_child");

for (const snapshot of [result.beforeRevealOwner, result.beforeRevealPartner, result.beforeRevealChild]) {
  assert.equal(entryAmount(snapshot, "e_open_expense"), 300, `${snapshot.userId} sees open expense share`);
  assert.equal(entryAmount(snapshot, "e_open_income"), 200, `${snapshot.userId} sees open income share`);
  assert.equal(hasEntry(snapshot, "e_surprise_expense"), false, `${snapshot.userId} does not see locked surprise in ledger`);
  assert.equal(snapshot.totals.expense, 300, `${snapshot.userId} locked surprise not in expense total`);
  assert.equal(snapshot.totals.income, 200, `${snapshot.userId} open income in total`);
  assert.equal(snapshot.totals.payable, 500, `${snapshot.userId} future payable is pending share`);
  assert.ok(snapshot.calendarHtml.includes("Kira"), `${snapshot.userId} calendar shows future payable`);
  assert.ok(!snapshot.movementHtml.includes("Elektrik"), `${snapshot.userId} movement list hides locked surprise detail`);
}

assert.ok(result.beforeRevealPartner.notifications.some((item) => item.entryId === "e_open_expense" && item.mode === "open"));
assert.ok(result.beforeRevealPartner.notifications.some((item) => item.entryId === "e_surprise_expense" && item.mode === "surprise"));
assert.ok(result.beforeRevealChild.notifications.some((item) => item.entryId === "e_surprise_expense" && item.mode === "surprise"));
assert.ok(result.beforeRevealPartner.notificationHtml.includes("Yeni tahmin var"));
assert.ok(!result.beforeRevealPartner.notificationHtml.includes("1.200 TL"), "surprise amount should not leak before game");

assert.deepEqual(result.partnerGuessStatuses, ["partial", "partial", "partial", "saved"]);
assert.equal(result.partnerAfterWrongHasResult, true);
assert.equal(result.partnerAfterWrongHasNext, true);
assert.equal(result.afterPartnerDoneVisible, true, "notification remains until all recipients finish");
assert.equal(result.afterPartnerDoneConfirmed, false, "entry remains locked until all recipients finish");
assert.deepEqual(result.childGuessStatuses, ["partial", "partial", "partial", "saved"]);
assert.equal(result.afterAllDoneConfirmed, true, "entry is revealed after all recipients finish");

for (const snapshot of [result.afterRevealOwner, result.afterRevealPartner, result.afterRevealChild]) {
  assert.equal(entryAmount(snapshot, "e_surprise_expense"), 400, `${snapshot.userId} sees revealed surprise share`);
  assert.equal(snapshot.totals.expense, 700, `${snapshot.userId} revealed surprise in expense total`);
  assert.ok(snapshot.movementHtml.includes("Elektrik"), `${snapshot.userId} movement list shows revealed surprise detail`);
  assert.ok(snapshot.reportHtml.includes("Fişi aç"), `${snapshot.userId} report links to receipt page`);
  assert.ok(snapshot.receiptHtml.includes("KASAM F"), `${snapshot.userId} receipt page renders`);
  assert.ok(snapshot.receiptHtml.includes("Pay"), `${snapshot.userId} receipt includes distribution section`);
}

assert.ok(result.reactionNotification, "reaction notification created");
assert.equal(result.reactionNotification.actorId, "u_partner");
assert.deepEqual(result.reactionNotification.recipients, ["u_owner"]);
assert.equal(result.reactionNotification.emoji, "FIRE");
assert.ok(result.reactionSummary.includes("FIRE"));

const ownerBalance = result.balances.find((item) => item.userId === "u_owner");
const partnerBalance = result.balances.find((item) => item.userId === "u_partner");
const childBalance = result.balances.find((item) => item.userId === "u_child");
assert.equal(ownerBalance.paid, 2100);
assert.equal(ownerBalance.share, 700);
assert.equal(ownerBalance.balance, 1400);
assert.equal(partnerBalance.balance, -700);
assert.equal(childBalance.balance, -700);
assert.ok(result.receiptDistribution.includes("Kim"));
assert.ok(result.receiptDistribution.includes("Pay"));
assert.equal(result.pendingSurpriseCountOwner, 0);
assert.equal(result.pendingSurpriseCountPartner, 0);
assert.equal(result.pendingSurpriseCountChild, 0);

console.log("MULTI USER FUNCTIONAL FLOW TEST OK");
console.log(JSON.stringify({
  openExpenseRecipients: result.openExpenseNotification.recipients,
  openIncomeRecipients: result.openIncomeNotification.recipients,
  beforeRevealPartnerTotals: result.beforeRevealPartner.totals,
  afterRevealPartnerTotals: result.afterRevealPartner.totals,
  partnerGuessStatuses: result.partnerGuessStatuses,
  childGuessStatuses: result.childGuessStatuses,
  balances: result.balances,
  reactionNotification: result.reactionNotification
}, null, 2));
