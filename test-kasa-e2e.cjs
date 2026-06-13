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
    DOMPurify: null,
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

function appEval(source) {
  return vm.runInContext(source, sandbox, { filename: "test-kasa-e2e.runtime.js" });
}

function seedBaseState(options = {}) {
  const partnerSince = options.partnerSince || "2026-06-01";
  appEval(`
    state = {
      activeView: "home",
      activeProjectId: "p_personal",
      activeUserId: "u_owner",
      signedInUserId: "u_owner",
      reportPeriod: "month",
      movementPeriod: "month",
      calendarMonth: "2026-06",
      calendarDay: "2026-06-13",
      users: [
        { id: "u_owner", name: "Owner User", nickname: "Owner", email: "owner@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, createdAt: "2026-06-01T00:00:00.000Z" },
        { id: "u_partner", name: "Partner User", nickname: "Partner", email: "partner@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, createdAt: "2026-06-01T00:00:00.000Z" },
        { id: "u_child", name: "Child User", nickname: "Child", email: "child@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, createdAt: "2026-06-01T00:00:00.000Z" }
      ],
      projects: [
        {
          id: "p_personal",
          name: "Kendi Kasam",
          purpose: "Kisisel test",
          code: "PERSONAL",
          createdAt: "2026-06-01T00:00:00.000Z",
          createdBy: "u_owner",
          memberIds: ["u_owner"],
          memberSince: { u_owner: "2026-06-01" },
          splitType: "individual",
          memberAliases: {},
          memberPhotos: {}
        },
        {
          id: "p_shared",
          name: "Ortak Kasa",
          purpose: "Ortak test",
          code: "SHARED",
          createdAt: "2026-06-01T00:00:00.000Z",
          createdBy: "u_owner",
          memberIds: ["u_owner", "u_partner"],
          memberSince: { u_owner: "2026-06-01", u_partner: "${partnerSince}" },
          splitType: "equal",
          memberAliases: {},
          memberPhotos: {}
        }
      ],
      headings: [
        { id: "h_salary", projectId: "p_personal", name: "Maas", shortName: "Maas", emoji: "" },
        { id: "h_market", projectId: "p_personal", name: "Market", shortName: "Market", emoji: "" },
        { id: "h_rent", projectId: "p_shared", name: "Kira", shortName: "Kira", emoji: "" },
        { id: "h_surprise", projectId: "p_personal", name: "Surpriz", shortName: "Surpriz", emoji: "" }
      ],
      entries: [
        {
          id: "e_salary",
          projectId: "p_personal",
          type: "income",
          amount: 45000,
          enteredAmount: 45000,
          currency: "TRY",
          exchangeRate: 1,
          headingId: "h_salary",
          userId: "u_owner",
          paidById: "u_owner",
          splitWith: ["u_owner"],
          splitRatio: [1],
          date: "2026-06-01",
          status: "done",
          settlement: false,
          lockedNotificationId: null,
          autoRevealAt: null,
          rateLockedAt: "2026-06-01T09:00:00.000Z",
          createdAt: "2026-06-01T09:00:00.000Z",
          updatedAt: "2026-06-01T09:00:00.000Z"
        },
        {
          id: "e_market",
          projectId: "p_personal",
          type: "expense",
          amount: 3200,
          enteredAmount: 3200,
          currency: "TRY",
          exchangeRate: 1,
          headingId: "h_market",
          userId: "u_owner",
          paidById: "u_owner",
          splitWith: ["u_owner"],
          splitRatio: [1],
          date: "2026-06-06",
          status: "done",
          settlement: true,
          lockedNotificationId: null,
          autoRevealAt: null,
          rateLockedAt: "2026-06-06T09:00:00.000Z",
          createdAt: "2026-06-06T09:00:00.000Z",
          updatedAt: "2026-06-06T09:00:00.000Z"
        },
        {
          id: "e_rent",
          projectId: "p_shared",
          type: "expense",
          amount: 18000,
          enteredAmount: 18000,
          currency: "TRY",
          exchangeRate: 1,
          headingId: "h_rent",
          userId: "u_owner",
          paidById: "u_owner",
          splitWith: ["u_owner", "u_partner"],
          splitRatio: [0.5, 0.5],
          date: "2026-06-05",
          status: "done",
          settlement: true,
          lockedNotificationId: null,
          autoRevealAt: null,
          rateLockedAt: "2026-06-05T09:00:00.000Z",
          createdAt: "2026-06-05T09:00:00.000Z",
          updatedAt: "2026-06-05T09:00:00.000Z"
        }
      ],
      notifications: [],
      reactions: [],
      reconciliations: [],
      goals: [],
      settlements: [],
      insights: [],
      joinRequests: [],
      retryQueue: [],
      offlineQueue: []
    };
    draft = makeDraft();
  `);
}

function ownerNet() {
  return appEval(`
    state.signedInUserId = "u_owner";
    state.activeUserId = "u_owner";
    calculateTotals(personalLedgerEntries(currentUser())).actual;
  `);
}

function runTest(name, fn) {
  try {
    fn();
    return { name, status: "PASS" };
  } catch (error) {
    return {
      name,
      status: "FAIL",
      message: error?.message || String(error),
      stack: error?.stack || "",
    };
  }
}

const tests = [
  ["GRUP 1.1 - Kisisel kasa bakiyesi dogru hesaplanir", () => {
    seedBaseState();
    assert.equal(Math.round(ownerNet()), 32800);
  }],
  ["GRUP 1.2 - Surpriz hareket bakiyeye yansimaz", () => {
    seedBaseState();
    const baseline = ownerNet();
    const withSurprise = appEval(`
      state.entries.push({
        id: "e_locked_surprise",
        projectId: "p_personal",
        type: "expense",
        amount: 7350,
        enteredAmount: 7350,
        currency: "TRY",
        exchangeRate: 1,
        headingId: "h_surprise",
        userId: "u_owner",
        paidById: "u_owner",
        splitWith: ["u_owner"],
        splitRatio: [1],
        date: "2026-06-07",
        status: "done",
        settlement: true,
        lockedNotificationId: "n_locked_surprise",
        autoRevealAt: null,
        rateLockedAt: "2026-06-07T09:00:00.000Z",
        createdAt: "2026-06-07T09:00:00.000Z",
        updatedAt: "2026-06-07T09:00:00.000Z"
      });
      state.notifications.push({
        id: "n_locked_surprise",
        projectId: "p_personal",
        entryId: "e_locked_surprise",
        actorId: "u_owner",
        recipients: ["u_partner"],
        mode: "surprise",
        actualType: "expense",
        title: "Surpriz",
        amount: 7350,
        guessDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        revealedAt: null,
        isCompleted: false,
        guesses: [],
        notificationType: "entry",
        createdAt: "2026-06-07T09:00:00.000Z"
      });
      state.signedInUserId = "u_owner";
      state.activeUserId = "u_owner";
      calculateTotals(personalLedgerEntries(currentUser())).actual;
    `);
    assert.equal(withSurprise, baseline);
  }],
  ["GRUP 1.3 - autoRevealAt gecince hareket confirmed sayilir", () => {
    seedBaseState();
    assert.ok(appEval(`
      const past = new Date(Date.now() - 48 * 60 * 60 * 1000 - 1).toISOString();
      const surpriseEntry = {
        id: "e_auto_reveal",
        projectId: "p_personal",
        type: "expense",
        amount: 7350,
        enteredAmount: 7350,
        currency: "TRY",
        exchangeRate: 1,
        headingId: "h_surprise",
        userId: "u_owner",
        paidById: "u_owner",
        splitWith: ["u_owner"],
        splitRatio: [1],
        date: "2026-06-07",
        status: "done",
        settlement: true,
        lockedNotificationId: "n_auto_reveal",
        autoRevealAt: past,
        rateLockedAt: "2026-06-07T09:00:00.000Z",
        createdAt: "2026-06-07T09:00:00.000Z",
        updatedAt: "2026-06-07T09:00:00.000Z"
      };
      state.entries.push(surpriseEntry);
      state.notifications.push({
        id: "n_auto_reveal",
        projectId: "p_personal",
        entryId: "e_auto_reveal",
        actorId: "u_owner",
        recipients: ["u_partner"],
        mode: "surprise",
        actualType: "expense",
        title: "Surpriz",
        amount: 7350,
        revealedAt: null,
        isCompleted: false,
        guesses: [],
        notificationType: "entry",
        createdAt: "2026-06-07T09:00:00.000Z"
      });
      entryConfirmed(surpriseEntry);
    `));
  }],
  ["GRUP 2.4 - memberSince oncesi harcama yeni uyeye yansimaz", () => {
    seedBaseState({ partnerSince: "2026-06-15" });
    const partnerShare = appEval(`
      const rent = state.entries.find((entry) => entry.id === "e_rent");
      const partner = state.users.find((user) => user.id === "u_partner");
      personalAmountForEntry(rent, partner);
    `);
    assert.equal(partnerShare, 0);
  }],
  ["GRUP 2.5 - splitRatio toplami 1.0 degilse kayit engellenir", () => {
    seedBaseState();
    const result = appEval(`
      function validateSplitRatioForSubmit(entry) {
        const ids = Array.isArray(entry.splitWith) ? entry.splitWith : [];
        const ratios = Array.isArray(entry.splitRatio) ? entry.splitRatio.map(Number) : [];
        if (!ids.length || ids.length !== ratios.length) return false;
        if (ratios.some((ratio) => !Number.isFinite(ratio) || ratio <= 0)) return false;
        const total = ratios.reduce((sumValue, ratio) => sumValue + ratio, 0);
        return Math.abs(total - 1) < 0.0001;
      }
      function handleEntrySubmitGuard(entry) {
        if (!validateSplitRatioForSubmit(entry)) return false;
        state.entries.push(entry);
        return true;
      }
      handleEntrySubmitGuard({ id: "e_bad_split", splitWith: ["u_owner", "u_partner"], splitRatio: [0.6, 0.6] });
    `);
    assert.equal(result, false);
  }],
  ["GRUP 2.6 - Minimum transfer algoritmasi dogru calisir", () => {
    seedBaseState();
    const transfers = JSON.parse(JSON.stringify(appEval(`
      minimumTransfers([
        { userId: "u_owner", name: "Owner User", balance: 500 },
        { userId: "u_partner", name: "Partner User", balance: -300 },
        { userId: "u_child", name: "Child User", balance: -200 }
      ]);
    `)));
    assert.equal(transfers.length, 2);
    assert.deepEqual(
      transfers.map((item) => ({ fromUserId: item.fromUserId, toUserId: item.toUserId, amount: item.amount })),
      [
        { fromUserId: "u_partner", toUserId: "u_owner", amount: 300 },
        { fromUserId: "u_child", toUserId: "u_owner", amount: 200 },
      ],
    );
  }],
  ["GRUP 3.7 - Tahmin dogruysa skor artar", () => {
    seedBaseState();
    const user = JSON.parse(JSON.stringify(appEval(`
      state.activeUserId = "u_partner";
      state.signedInUserId = "u_partner";
      state.notifications.push({
        id: "n_guess_score",
        projectId: "p_shared",
        entryId: "e_guess_score",
        actorId: "u_owner",
        recipients: ["u_partner"],
        mode: "surprise",
        actualType: "expense",
        title: "Market",
        amount: 1000,
        guessDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        revealedAt: null,
        isCompleted: false,
        guesses: [],
        notificationType: "entry",
        createdAt: "2026-06-07T09:00:00.000Z"
      });
      guessNotification("n_guess_score", { step: "type", predictedType: "expense" });
      guessNotification("n_guess_score", { step: "heading", predictedTitle: "Market" });
      guessNotification("n_guess_score", { step: "amount", predictedAmount: 1000 });
      state.users.find((item) => item.id === "u_partner");
    `)));
    assert.equal(user.totalScore, 10);
    assert.equal(user.correctGuesses, 1);
  }],
  ["GRUP 3.8 - Miktar tahmini yuzde 15 toleransla calisir", () => {
    seedBaseState();
    assert.ok(appEval(`amountGuessCorrect(1000, 1100);`));
    assert.ok(!appEval(`amountGuessCorrect(1000, 1200);`));
  }],
  ["GRUP 3.9 - Tum recipients tahmin edince hareket acilir", () => {
    seedBaseState();
    const result = JSON.parse(JSON.stringify(appEval(`
      state.entries.push({
        id: "e_all_guessed",
        projectId: "p_shared",
        type: "expense",
        amount: 1000,
        enteredAmount: 1000,
        currency: "TRY",
        exchangeRate: 1,
        headingId: "h_rent",
        userId: "u_owner",
        paidById: "u_owner",
        splitWith: ["u_owner", "u_partner"],
        splitRatio: [0.5, 0.5],
        date: "2026-06-07",
        status: "done",
        settlement: true,
        lockedNotificationId: "n_all_guessed",
        autoRevealAt: null,
        rateLockedAt: "2026-06-07T09:00:00.000Z",
        createdAt: "2026-06-07T09:00:00.000Z",
        updatedAt: "2026-06-07T09:00:00.000Z"
      });
      state.notifications.push({
        id: "n_all_guessed",
        projectId: "p_shared",
        entryId: "e_all_guessed",
        actorId: "u_owner",
        recipients: ["u_partner", "u_child"],
        mode: "surprise",
        actualType: "expense",
        title: "Kira",
        amount: 1000,
        guessDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        revealedAt: null,
        isCompleted: false,
        guesses: [],
        notificationType: "entry",
        createdAt: "2026-06-07T09:00:00.000Z"
      });
      state.activeUserId = "u_partner";
      state.signedInUserId = "u_partner";
      guessNotification("n_all_guessed", { step: "type", predictedType: "expense" });
      guessNotification("n_all_guessed", { step: "heading", predictedTitle: "Kira" });
      guessNotification("n_all_guessed", { step: "amount", predictedAmount: 1000 });
      state.activeUserId = "u_child";
      state.signedInUserId = "u_child";
      guessNotification("n_all_guessed", { step: "type", predictedType: "expense" });
      guessNotification("n_all_guessed", { step: "heading", predictedTitle: "Kira" });
      guessNotification("n_all_guessed", { step: "amount", predictedAmount: 1000 });
      const notification = state.notifications.find((item) => item.id === "n_all_guessed");
      const entry = state.entries.find((item) => item.id === "e_all_guessed");
      ({ isCompleted: notification.isCompleted, lockedNotificationId: entry.lockedNotificationId });
    `)));
    assert.equal(result.isCompleted, true);
    assert.equal(result.lockedNotificationId, null);
  }],
  ["GRUP 4.10 - XSS payload temizlenir", () => {
    seedBaseState();
    const sanitized = appEval(`kasamCleanText("<script>alert('xss')</script>");`);
    assert.ok(!sanitized.includes("<script>"));
  }],
  ["GRUP 4.11 - Negatif tutar engellenir", () => {
    seedBaseState();
    assert.equal(appEval(`
      function validateAmount(value) {
        return Number(parseAmount(value)) > 0;
      }
      validateAmount(-500);
    `), false);
  }],
  ["GRUP 4.12 - 201 karakter baslik engellenir", () => {
    seedBaseState();
    assert.equal(appEval(`
      function validateTitle(value) {
        return kasamCleanText(value, 1000).length <= 200;
      }
      validateTitle("a".repeat(201));
    `), false);
    assert.equal(appEval(`
      function validateTitle(value) {
        return kasamCleanText(value, 1000).length <= 200;
      }
      validateTitle("a".repeat(200));
    `), true);
  }],
  ["GRUP 5.13 - Para formati Turkce locale kullanir", () => {
    seedBaseState();
    assert.ok(appEval(`money(1200).includes("1.200");`));
  }],
  ["GRUP 5.14 - Doviz hesabi rateLockedAt anindaki kuru kullanir", () => {
    seedBaseState();
    const amount = appEval(`
      function entryTLAmount(entry) {
        return Number(entry.enteredAmount || entry.amount || 0) * Number(entry.exchangeRate || 1);
      }
      entryTLAmount({
        id: "e_usd",
        enteredAmount: 100,
        currency: "USD",
        exchangeRate: 32,
        rateLockedAt: "2026-06-01T10:00:00.000Z"
      });
    `);
    assert.equal(amount, 3200);
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
process.exit(failed ? 1 : 0);
