const assert = require("node:assert/strict");
const { buildKasamTestScenarioState } = require("./app-test-scenarios.js");

const state = buildKasamTestScenarioState("1");
const users = Object.fromEntries(state.users.map((user) => [user.email.split("@")[0].split(".")[0], user]));
const headings = new Map(state.headings.map((heading) => [heading.id, heading.name]));
const project = state.projects.find((item) => item.code === "YILMAZ-EV-1");

function shareFor(entry, userId) {
  const ids = Array.isArray(entry.splitWith) ? entry.splitWith : [];
  const ratios = Array.isArray(entry.splitRatio) ? entry.splitRatio : [];
  const index = ids.indexOf(userId);
  if (index < 0) return 0;
  return Number(entry.amount || 0) * Number(ratios[index] ?? (ids.length ? 1 / ids.length : 1));
}

function personalTotals(userId, entries) {
  return entries.reduce(
    (totals, entry) => {
      const amount = shareFor(entry, userId);
      if (!amount) return totals;
      if (entry.type === "income" || entry.type === "receivable") totals.income += amount;
      else totals.expense += amount;
      totals.net = totals.income - totals.expense;
      return totals;
    },
    { income: 0, expense: 0, net: 0 }
  );
}

function entriesBetween(start, end) {
  return state.entries.filter((entry) => entry.projectId === project.id && entry.date >= start && entry.date <= end);
}

function weekEntries(anchorDate) {
  const anchor = new Date(`${anchorDate}T12:00:00`);
  const day = anchor.getDay() || 7;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const start = monday.toISOString().slice(0, 10);
  const end = sunday.toISOString().slice(0, 10);
  return entriesBetween(start, end);
}

assert.equal(project.memberIds.length, 4, "Yılmaz Ailesi dört üyeli olmalı");

const mehmetIncome = personalTotals(users.mehmet.id, state.entries.filter((entry) => entry.type === "income")).income;
assert.equal(mehmetIncome, 96000, "Mehmet'in 3 aylık geliri 96.000 TL olmalı");

const rentEntries = state.entries.filter((entry) => headings.get(entry.headingId) === "Kira");
assert.equal(rentEntries.length, 3, "Her ay bir kira hareketi olmalı");
rentEntries.forEach((entry) => {
  assert.equal(entry.paidById, users.mehmet.id, "Ortak kira Mehmet tarafından ödenmeli");
  assert.deepEqual(entry.splitWith, project.memberIds, "Ortak kira tüm aileye bölünmeli");
  assert.deepEqual(entry.splitRatio, [0.25, 0.25, 0.25, 0.25], "Ortak kira eşit paylanmalı");
});

const personalChildrenHeadings = new Set(["Okul ulaşımı", "Üniversite", "Lise", "Yemek"]);
state.entries
  .filter((entry) => personalChildrenHeadings.has(headings.get(entry.headingId)))
  .forEach((entry) => {
    assert.equal(shareFor(entry, users.mehmet.id), 0, `${headings.get(entry.headingId)} Mehmet'in kişisel kasasına yansımamalı`);
  });

const juneTotals = personalTotals(users.mehmet.id, entriesBetween("2026-06-01", "2026-06-30"));
assert.equal(Math.round(juneTotals.net), 19921, "Mehmet Haziran neti pozitif ve beklenen seviyede olmalı");

const currentWeek = weekEntries("2026-06-13");
assert.ok(currentWeek.every((entry) => entry.date >= "2026-06-08" && entry.date <= "2026-06-14"), "Haftalık filtre sadece 8-14 Haziran aralığını almalı");
assert.ok(currentWeek.every((entry) => entry.date.startsWith("2026-06")), "Haftalık filtre Nisan/Mayıs hareketlerini almamalı");
const weekTotals = personalTotals(users.mehmet.id, currentWeek);
assert.equal(Math.round(weekTotals.net), -4324, "8-14 Haziran haftası sadece o haftanın payını hesaplamalı");

console.log("YILMAZ_SCENARIO_RHYTHM TEST OK");
