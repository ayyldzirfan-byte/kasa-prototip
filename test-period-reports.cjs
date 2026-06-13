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
    lucide: { createIcons() {} },
  },
  document: {
    hidden: false,
    body: { dataset: {}, classList: { toggle() {}, add() {}, remove() {} } },
    documentElement: {
      dataset: {},
      style: { setProperty() {} },
      removeAttribute(name) { delete this.dataset[name.replace(/^data-/, "")]; },
    },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement() {
      return {
        style: {},
        dataset: {},
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
  function fmtTestDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function offsetDate(days) {
    const date = dateFromKey(todayKey());
    date.setDate(date.getDate() + days);
    return fmtTestDate(date);
  }

  function monthOffsetDate(offset, day) {
    const date = dateFromKey(todayKey());
    date.setMonth(date.getMonth() + offset, day);
    return fmtTestDate(date);
  }

  function buildEntry({ id, projectId, type, amount, headingId, userId, paidById, splitWith, splitRatio, date, status = "done" }) {
    return {
      id,
      projectId,
      type,
      amount,
      enteredAmount: amount,
      currency: "TRY",
      exchangeRate: 1,
      headingId,
      shortName: state.headings.find((heading) => heading.id === headingId)?.name || "Hareket",
      userId,
      paidById,
      splitWith,
      splitRatio,
      date,
      status,
      createdAt: date + "T09:00:00.000Z",
      updatedAt: date + "T09:00:00.000Z",
      lockedNotificationId: "",
    };
  }

  state = {
    activeView: "report",
    reportPeriod: "day",
    movementPeriod: "day",
    activeProjectId: "p_personal",
    activeUserId: "u_owner",
    signedInUserId: "u_owner",
    themeMode: "dark",
    users: [
      { id: "u_owner", name: "Test Kullanıcı", nickname: "Ben", email: "owner@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, onayModu: "standart" },
      { id: "u_partner", name: "Ortak Kullanıcı", nickname: "Ortak", email: "partner@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0, onayModu: "standart" }
    ],
    projects: [
      { id: "p_personal", name: "Kendi Kasam", purpose: "Kişisel bütçe", code: "OWN", createdAt: monthOffsetDate(-1, 1) + "T00:00:00.000Z", createdBy: "u_owner", memberIds: ["u_owner"], memberSince: { u_owner: monthOffsetDate(-1, 1) }, budgetLimits: { __memberSince: { u_owner: monthOffsetDate(-1, 1) } }, splitType: "individual" },
      { id: "p_shared", name: "Ortak Test Bütçesi", purpose: "Ortak gider", code: "SHARED", createdAt: monthOffsetDate(-1, 1) + "T00:00:00.000Z", createdBy: "u_owner", memberIds: ["u_owner", "u_partner"], memberSince: { u_owner: monthOffsetDate(-1, 1), u_partner: monthOffsetDate(-1, 1) }, budgetLimits: { __memberSince: { u_owner: monthOffsetDate(-1, 1), u_partner: monthOffsetDate(-1, 1) } }, splitType: "equal" }
    ],
    headings: [
      { id: "h_salary", projectId: "p_personal", name: "Maaş", shortName: "Maaş", emoji: "" },
      { id: "h_rent", projectId: "p_personal", name: "Kira", shortName: "Kira", emoji: "" },
      { id: "h_fuel", projectId: "p_personal", name: "Yakıt", shortName: "Yakıt", emoji: "" },
      { id: "h_coffee", projectId: "p_personal", name: "Kahve", shortName: "Kahve", emoji: "" },
      { id: "h_utility", projectId: "p_personal", name: "Fatura", shortName: "Fatura", emoji: "" },
      { id: "h_market", projectId: "p_shared", name: "Ortak market", shortName: "Market", emoji: "" },
      { id: "h_shared_income", projectId: "p_shared", name: "Ortak katkı", shortName: "Katkı", emoji: "" }
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

  const today = todayKey();
  const yesterday = offsetDate(-1);
  const earlierThisWeek = offsetDate(-2);
  const thisMonthFirst = monthOffsetDate(0, 1);
  const thisMonthFifth = monthOffsetDate(0, 5);
  const lastMonthTenth = monthOffsetDate(-1, 10);
  const lastMonthEleventh = monthOffsetDate(-1, 11);
  const lastMonthTwelfth = monthOffsetDate(-1, 12);
  const splitBoth = ["u_owner", "u_partner"];
  const half = [0.5, 0.5];

  state.entries = [
    buildEntry({ id: "e_salary_current", projectId: "p_personal", type: "income", amount: 35000, headingId: "h_salary", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: thisMonthFirst }),
    buildEntry({ id: "e_utility_current", projectId: "p_personal", type: "expense", amount: 1500, headingId: "h_utility", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: thisMonthFifth }),
    buildEntry({ id: "e_rent_week", projectId: "p_personal", type: "expense", amount: 12000, headingId: "h_rent", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: earlierThisWeek }),
    buildEntry({ id: "e_fuel_yesterday", projectId: "p_personal", type: "expense", amount: 800, headingId: "h_fuel", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: yesterday }),
    buildEntry({ id: "e_coffee_today", projectId: "p_personal", type: "expense", amount: 120, headingId: "h_coffee", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: today }),
    buildEntry({ id: "e_shared_market_today", projectId: "p_shared", type: "expense", amount: 1000, headingId: "h_market", userId: "u_partner", paidById: "u_partner", splitWith: splitBoth, splitRatio: half, date: today }),
    buildEntry({ id: "e_shared_income_today", projectId: "p_shared", type: "income", amount: 600, headingId: "h_shared_income", userId: "u_partner", paidById: "u_partner", splitWith: splitBoth, splitRatio: half, date: today }),
    buildEntry({ id: "e_salary_last", projectId: "p_personal", type: "income", amount: 33000, headingId: "h_salary", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: lastMonthTenth }),
    buildEntry({ id: "e_rent_last", projectId: "p_personal", type: "expense", amount: 11000, headingId: "h_rent", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: lastMonthEleventh }),
    buildEntry({ id: "e_market_last", projectId: "p_personal", type: "expense", amount: 2200, headingId: "h_market", userId: "u_owner", paidById: "u_owner", splitWith: ["u_owner"], splitRatio: [1], date: lastMonthTwelfth })
  ];

  function periodSummary(period, userId) {
    state.activeUserId = userId;
    state.signedInUserId = userId;
    state.reportPeriod = period;
    const user = state.users.find((item) => item.id === userId);
    const entries = personalLedgerEntries(user).filter((entry) => entry.status === "done" && entryConfirmed(entry));
    const currentEntries = kasamPeriodEntries(entries, period);
    const previousEntries = kasamPeriodEntries(entries, period, -1);
    const totals = calculateTotals(currentEntries);
    const previousTotals = calculateTotals(previousEntries);
    const html = renderReport();
    const receiptHtml = renderReceipt();
    return {
      period,
      userId,
      currentCount: currentEntries.length,
      previousCount: previousEntries.length,
      income: totals.income,
      expense: totals.expense,
      net: totals.actual,
      previousNet: previousTotals.actual,
      diff: period === "all" ? totals.actual : totals.actual - previousTotals.actual,
      htmlHasReceiptLink: html.includes('data-action="open-receipt"') && html.includes("Kasa fi"),
      receiptHtmlHasReceipt: receiptHtml.includes("KASAM F"),
      htmlHasIncome: html.includes("Giren"),
      htmlHasExpense: html.includes("kan") || html.includes("Çıkan"),
      rows: currentEntries.map((entry) => ({
        id: entry.id,
        projectId: entry.projectId,
        title: entryTitle(entry),
        type: entry.type,
        amount: entry.amount,
        originalAmount: entry.originalAmount || entry.amount,
        date: entry.date
      }))
    };
  }

  function moneyOut(value) {
    return money(value);
  }

  ({
    today,
    periods: ["day", "week", "month", "all"].map((period) => periodSummary(period, "u_owner")),
    partnerDay: periodSummary("day", "u_partner"),
    themeMode: state.themeMode,
    themeApplied: (() => { applyProductionChrome(); return document.documentElement.dataset.theme || "system"; })(),
    moneySamples: [moneyOut(1000), moneyOut(35000), moneyOut(14920)]
  });
`, sandbox)));

const expected = {
  day: { income: 300, expense: 620, net: -320 },
  week: { income: 300, expense: 13420, net: -13120 },
  month: { income: 35300, expense: 14920, net: 20380 },
  all: { income: 68300, expense: 28120, net: 40180 },
};

for (const period of result.periods) {
  assert.equal(period.income, expected[period.period].income, `${period.period} income`);
  assert.equal(period.expense, expected[period.period].expense, `${period.period} expense`);
  assert.equal(period.net, expected[period.period].net, `${period.period} net`);
  assert.ok(period.htmlHasReceiptLink, `${period.period} receipt link is rendered`);
  assert.ok(period.receiptHtmlHasReceipt, `${period.period} receipt page is rendered`);
  assert.ok(period.htmlHasIncome, `${period.period} income label is rendered`);
  assert.ok(period.htmlHasExpense, `${period.period} expense label is rendered`);
}

assert.equal(result.partnerDay.income, 300, "shared income should reflect on partner personal ledger");
assert.equal(result.partnerDay.expense, 500, "shared expense should reflect on partner personal ledger");
assert.equal(result.partnerDay.net, -200, "partner daily net");
assert.equal(result.themeApplied, "dark", "manual dark theme should be applied");
assert.deepEqual(result.moneySamples, ["1.000 TL", "35.000 TL", "14.920 TL"]);

const lines = [
  "# Kasam Rapor Senaryo Çıktıları",
  "",
  `Test tarihi: ${result.today}`,
  "",
  "## Bireysel kullanıcı + ortak bütçe payı",
  "",
  "| Dönem | Giren | Çıkan | Net | Önceki net | Fark | Hareket sayısı |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
  ...result.periods.map((item) => `| ${item.period} | ${item.income.toLocaleString("tr-TR")} TL | ${item.expense.toLocaleString("tr-TR")} TL | ${item.net.toLocaleString("tr-TR")} TL | ${item.previousNet.toLocaleString("tr-TR")} TL | ${item.diff.toLocaleString("tr-TR")} TL | ${item.currentCount} |`),
  "",
  "## Günlük detay satırları",
  "",
  ...result.periods.find((item) => item.period === "day").rows.map((row) => `- ${row.date} / ${row.title} / ${row.type}: ${row.amount.toLocaleString("tr-TR")} TL${row.originalAmount !== row.amount ? ` (ortak hareket toplamı ${row.originalAmount.toLocaleString("tr-TR")} TL)` : ""}`),
  "",
  "## Diğer ortak kullanıcı günlük etkisi",
  "",
  `- Giren: ${result.partnerDay.income.toLocaleString("tr-TR")} TL`,
  `- Çıkan: ${result.partnerDay.expense.toLocaleString("tr-TR")} TL`,
  `- Net: ${result.partnerDay.net.toLocaleString("tr-TR")} TL`,
  "",
  "## Kontrol notları",
  "",
  "- Günlük raporda 1.000 TL ortak market giderinin kişisel etkisi 500 TL olarak görünüyor.",
  "- Günlük raporda 600 TL ortak katkının kişisel etkisi 300 TL olarak görünüyor.",
  "- Haftalık ve aylık raporlar aynı kişisel etki mantığını topluyor.",
  "- Para formatı noktalı Türkçe formatta: 1.000 TL, 35.000 TL, 14.920 TL.",
  "- Tema testi manuel koyu modu `data-theme=dark` olarak uyguladı.",
  "",
].join("\n");

fs.writeFileSync(path.join(__dirname, "kasam-rapor-senaryo-ciktilari.md"), lines, "utf8");

console.log("PERIOD REPORT TEST OK");
console.log(lines);
