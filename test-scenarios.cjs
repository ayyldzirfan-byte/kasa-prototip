const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const { REPORT_DATE, kasamScenarioMoney, buildKasamTestScenarioState } = require("./app-test-scenarios.js");

const outputRoot = path.join(os.homedir(), "Desktop", "kasam-test");
const state = buildKasamTestScenarioState("all");
const usersById = new Map(state.users.map((user) => [user.id, user]));
const projectsById = new Map(state.projects.map((project) => [project.id, project]));
const headingsById = new Map(state.headings.map((heading) => [heading.id, heading]));
const scenarioResults = [];
const globalChecks = [];

function cleanDirName(value) {
  return String(value || "senaryo").replace(/[<>:"/\\|?*]+/g, "-");
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function entryTitle(entry) {
  return entry.shortName || headingsById.get(entry.headingId)?.name || "Hareket";
}

function typeLabel(entry) {
  if (entry.type === "income") return "Gelir";
  if (entry.type === "receivable") return "Beklenen gelir";
  if (entry.type === "payable") return "Yaklaşan ödeme";
  return "Gider";
}

function isIncome(entry) {
  return entry.type === "income" || entry.type === "receivable";
}

function splitShare(entry, userId) {
  const ids = Array.isArray(entry.splitWith) ? entry.splitWith : [];
  const ratios = Array.isArray(entry.splitRatio) ? entry.splitRatio : [];
  const index = ids.indexOf(userId);
  if (index === -1) return 0;
  return Number(entry.amount || 0) * Number(ratios[index] ?? (ids.length ? 1 / ids.length : 1));
}

function projectEntries(projectId) {
  return state.entries.filter((entry) => entry.projectId === projectId);
}

function scenarioEntries(meta) {
  return projectEntries(meta.projectId).sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function scenarioNotifications(meta) {
  return state.notifications.filter((notification) => notification.projectId === meta.projectId);
}

function sumEntries(entries) {
  return entries.reduce(
    (total, entry) => {
      if (isIncome(entry)) total.income += Number(entry.amount || 0);
      else total.expense += Number(entry.amount || 0);
      total.net = total.income - total.expense;
      return total;
    },
    { income: 0, expense: 0, net: 0 }
  );
}

function personalImpact(entries, userId) {
  return entries.reduce(
    (total, entry) => {
      const amount = splitShare(entry, userId);
      if (!amount) return total;
      if (isIncome(entry)) total.income += amount;
      else total.expense += amount;
      total.net = total.income - total.expense;
      return total;
    },
    { income: 0, expense: 0, net: 0 }
  );
}

function dateRange(start, end) {
  const dates = [];
  const current = new Date(`${start}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  while (current <= last) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function weekKey(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function groupBy(entries, keyFn) {
  const map = new Map();
  entries.forEach((entry) => {
    const key = keyFn(entry);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
  });
  return map;
}

function lineForTotals(label, totals) {
  return `${label}: Gelir ${kasamScenarioMoney(totals.income)} | Gider ${kasamScenarioMoney(totals.expense)} | Net ${kasamScenarioMoney(totals.net)}`;
}

function userImpactLines(entries, project) {
  return project.memberIds
    .map((userId) => {
      const user = usersById.get(userId);
      const impact = personalImpact(entries, userId);
      return `- ${user?.name || userId}: +${kasamScenarioMoney(impact.income)} / -${kasamScenarioMoney(impact.expense)} / net ${kasamScenarioMoney(impact.net)}`;
    })
    .join("\n");
}

function movementLines(entries) {
  if (!entries.length) return "Hareket yok.";
  return entries
    .map((entry) => {
      const actor = usersById.get(entry.userId)?.name || entry.userId;
      const paidBy = usersById.get(entry.paidById)?.name || entry.paidById;
      return `- ${entry.date} | ${typeLabel(entry)} | ${entryTitle(entry)} | ${kasamScenarioMoney(entry.amount)} | Ekleyen: ${actor} | Ödeyen: ${paidBy}`;
    })
    .join("\n");
}

function receiptForMonth(meta, month) {
  const project = projectsById.get(meta.projectId);
  const entries = scenarioEntries(meta).filter((entry) => entry.date.startsWith(month) && entry.status !== "pending");
  const totals = sumEntries(entries);
  const rows = [
    "KASAM FİŞİ",
    month,
    "",
    `Kasa: ${project.name}`,
    `Kod: ${project.code}`,
    "--------------------------------",
    lineForTotals("Kasa toplamı", totals),
    "",
    "HAREKETLER",
    movementLines(entries),
    "",
    "PAY DAĞILIMI",
    userImpactLines(entries, project),
    "",
    "kasam.app",
  ];
  return rows.join("\n");
}

function usersText(meta) {
  const project = projectsById.get(meta.projectId);
  return [
    `${meta.title}`,
    `Kasa: ${project.name}`,
    `Kod: ${project.code}`,
    "",
    "Kullanıcılar",
    ...project.memberIds.map((userId) => {
      const user = usersById.get(userId);
      const profile = user.testProfile || {};
      return `- ${user.name} | ${profile.age || ""} | ${profile.role || ""} | Gelir: ${kasamScenarioMoney(profile.income || 0)} | E-posta: ${user.email} | Şifre: ${user.password}`;
    }),
  ].join("\n");
}

function dailyReport(meta) {
  const project = projectsById.get(meta.projectId);
  const entries = scenarioEntries(meta);
  const byDate = groupBy(entries, (entry) => entry.date);
  return [
    `${meta.title} - Günlük Rapor`,
    `Kasa: ${project.name} (${project.code})`,
    "",
    ...dateRange(meta.startDate, meta.endDate).map((date) => {
      const rows = byDate.get(date) || [];
      const totals = sumEntries(rows);
      return [`## ${date}`, lineForTotals("Gün", totals), movementLines(rows), "Kişisel yansıma", userImpactLines(rows, project)].join("\n");
    }),
  ].join("\n\n");
}

function weeklyReport(meta) {
  const project = projectsById.get(meta.projectId);
  const entries = scenarioEntries(meta);
  const byWeek = groupBy(entries, (entry) => weekKey(entry.date));
  return [
    `${meta.title} - Haftalık Rapor`,
    `Kasa: ${project.name} (${project.code})`,
    "",
    ...[...byWeek.entries()].map(([week, rows]) => [`## Hafta başlangıcı ${week}`, lineForTotals("Hafta", sumEntries(rows)), movementLines(rows), "Kişisel yansıma", userImpactLines(rows, project)].join("\n")),
  ].join("\n\n");
}

function monthlyReport(meta) {
  const project = projectsById.get(meta.projectId);
  const entries = scenarioEntries(meta);
  return [
    `${meta.title} - Aylık Rapor`,
    `Kasa: ${project.name} (${project.code})`,
    "",
    ...meta.months.map((month) => {
      const rows = entries.filter((entry) => entry.date.startsWith(month));
      return [`## ${month}`, lineForTotals("Ay", sumEntries(rows)), movementLines(rows), "Kişisel yansıma", userImpactLines(rows, project)].join("\n");
    }),
    "",
    "## Kümülatif",
    lineForTotals("Toplam", sumEntries(entries)),
    userImpactLines(entries, project),
  ].join("\n\n");
}

function gameReport(meta) {
  const notifications = scenarioNotifications(meta);
  if (!notifications.length) return "Tahmin oyunu yok.";
  return notifications
    .map((notification) => {
      const entry = state.entries.find((item) => item.id === notification.entryId);
      const actor = usersById.get(notification.actorId)?.name || notification.actorId;
      const recipients = notification.recipients.map((id) => usersById.get(id)?.name || id).join(", ") || "Kendi kendine test";
      const phase1 = (notification.phase1Guesses || []).map((guess) => `${usersById.get(guess.userId)?.name || guess.userId}: ${guess.isCorrect ? "doğru" : "yanlış"}`).join(", ") || "tahmin yok";
      const phase2 = (notification.phase2Guesses || []).map((guess) => `${usersById.get(guess.userId)?.name || guess.userId}: ${guess.isCorrect ? "doğru" : "yanlış"}`).join(", ") || "tahmin yok";
      const phase3 = (notification.phase3Guesses || []).map((guess) => `${usersById.get(guess.userId)?.name || guess.userId}: ${guess.isCorrect ? "doğru" : "yanlış"}`).join(", ") || "tahmin yok";
      return [
        `Oyun: ${entry ? entryTitle(entry) : notification.title}`,
        `Ekleyen: ${actor}`,
        `Alıcılar: ${recipients}`,
        `Tutar: ${kasamScenarioMoney(notification.amount)}`,
        `Durum: ${notification.gameFullyCompleted ? "tamamlandı" : "bekliyor"}`,
        `Aşama 1 kim ekledi: ${phase1}`,
        `Aşama 2 tip: ${phase2}`,
        `Aşama 3 kategori: ${phase3}`,
      ].join("\n");
    })
    .join("\n\n");
}

function featureReport(meta) {
  const entries = scenarioEntries(meta);
  const notifications = scenarioNotifications(meta);
  const features = [
    ["Gelir/gider", entries.some((entry) => entry.type === "income") && entries.some((entry) => entry.type === "expense")],
    ["Ortak kasa", projectsById.get(meta.projectId).memberIds.length > 1],
    ["Paylaştırma", entries.some((entry) => (entry.splitWith || []).length > 1)],
    ["Tahmin oyunu", notifications.length >= 2],
    ["Tepki", state.reactions.some((item) => item.projectId === meta.projectId)],
    ["Hedef/kumbara", state.goals.some((item) => item.projectId === meta.projectId)],
    ["Ekstre", state.reconciliations.some((item) => item.projectId === meta.projectId)],
    ["Hesaplaşma", state.settlements.some((item) => item.projectId === meta.projectId)],
    ["Planlı ödeme", entries.some((entry) => entry.status === "pending" || entry.type === "payable")],
    ["Koç/insight", state.insights.some((item) => item.projectId === meta.projectId)],
  ];
  return features.map(([name, ok]) => `${ok ? "PASS" : "SKIP"} - ${name}`).join("\n");
}

function checkScenario(meta, scenarioDir) {
  const checks = [];
  const project = projectsById.get(meta.projectId);
  const entries = scenarioEntries(meta);
  const notifications = scenarioNotifications(meta);
  function run(name, fn) {
    try {
      fn();
      checks.push({ name, status: "PASS" });
    } catch (error) {
      checks.push({ name, status: "FAIL", message: error.message });
    }
  }
  run("Kasa kodu var ve tekil", () => assert.ok(project.code));
  run("Hareket var", () => assert.ok(entries.length > 0));
  run("En az 2 tahmin oyunu var", () => assert.ok(notifications.length >= 2));
  run("Tahmin oyunları entry ile bağlı", () => notifications.forEach((notification) => assert.ok(entries.some((entry) => entry.id === notification.entryId))));
  run("Split oranları 1.0 ediyor", () => {
    entries.forEach((entry) => {
      if (!entry.splitWith?.length) return;
      const sum = entry.splitRatio.reduce((total, value) => total + Number(value || 0), 0);
      assert.ok(Math.abs(sum - 1) < 0.0001, `${entry.id} split sum ${sum}`);
    });
  });
  run("Rapor dosyaları yazıldı", () => {
    ["kullanicilar.txt", "gunluk-rapor.txt", "haftalik-rapor.txt", "aylik-rapor.txt", "oyun-kayitlari.txt", "ozellik-kullanimi.txt"].forEach((file) => assert.ok(fs.existsSync(path.join(scenarioDir, file)), file));
  });
  return checks;
}

function writeScenario(meta) {
  const dir = path.join(outputRoot, cleanDirName(meta.folder));
  fs.mkdirSync(dir, { recursive: true });
  writeFile(path.join(dir, "kullanicilar.txt"), usersText(meta));
  writeFile(path.join(dir, "gunluk-rapor.txt"), dailyReport(meta));
  writeFile(path.join(dir, "haftalik-rapor.txt"), weeklyReport(meta));
  writeFile(path.join(dir, "aylik-rapor.txt"), monthlyReport(meta));
  meta.months.forEach((month) => writeFile(path.join(dir, `fis-${month}.txt`), receiptForMonth(meta, month)));
  writeFile(path.join(dir, "oyun-kayitlari.txt"), gameReport(meta));
  writeFile(path.join(dir, "ozellik-kullanimi.txt"), featureReport(meta));
  const checks = checkScenario(meta, dir);
  writeFile(
    path.join(dir, "test-sonuclari.txt"),
    checks.map((check) => `${check.status} - ${check.name}${check.message ? ` | ${check.message}` : ""}`).join("\n")
  );
  const failed = checks.filter((check) => check.status === "FAIL").length;
  scenarioResults.push({
    meta,
    dir,
    userCount: meta.userIds.length,
    entryCount: meta.entryCount,
    gameCount: meta.gameCount,
    checks,
    failed,
  });
  console.log(`SENARYO ${meta.id} TAMAMLANDI`);
}

function runGlobalCheck(name, fn) {
  try {
    fn();
    globalChecks.push({ name, status: "PASS" });
  } catch (error) {
    globalChecks.push({ name, status: "FAIL", message: error.message });
  }
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(outputRoot, { recursive: true });

state.testScenarioMeta.forEach(writeScenario);

runGlobalCheck("8 senaryo üretildi", () => assert.equal(state.testScenarioMeta.length, 8));
runGlobalCheck("Kasa kodları tekil", () => assert.equal(new Set(state.projects.map((project) => project.code)).size, state.projects.length));
runGlobalCheck("Tüm senaryolarda en az 2 oyun var", () => state.testScenarioMeta.forEach((meta) => assert.ok(meta.gameCount >= 2, meta.title)));
runGlobalCheck("Hedef özelliği kullanıldı", () => assert.ok(state.goals.length > 0));
runGlobalCheck("Tepki özelliği kullanıldı", () => assert.ok(state.reactions.length > 0));
runGlobalCheck("Ekstre özelliği kullanıldı", () => assert.ok(state.reconciliations.length > 0));
runGlobalCheck("Hesaplaşma özelliği kullanıldı", () => assert.ok(state.settlements.length > 0));
runGlobalCheck("Planlı ödeme özelliği kullanıldı", () => assert.ok(state.entries.some((entry) => entry.status === "pending" || entry.type === "payable")));
runGlobalCheck("Koç/insight özelliği kullanıldı", () => assert.ok(state.insights.length > 0));

const scenarioRows = scenarioResults
  .map((result) => `| ${result.meta.title} | ${result.userCount} | ${result.meta.startDate} - ${result.meta.endDate} | ${result.entryCount} | ${result.gameCount} | ${result.failed ? "FAIL" : "PASS"} |`)
  .join("\n");
const allChecks = [...scenarioResults.flatMap((result) => result.checks), ...globalChecks];
const passed = allChecks.filter((check) => check.status === "PASS").length;
const failed = allChecks.length - passed;

const summary = [
  "# Kasam Test Özeti",
  `Tarih: ${REPORT_DATE}`,
  "",
  "## Senaryo Sonuçları",
  "| Senaryo | Kullanıcı sayısı | Süre | Toplam hareket | Oyun sayısı | Durum |",
  "|---|---:|---|---:|---:|---|",
  scenarioRows,
  "",
  "## Genel PASS/FAIL",
  `Toplam test: ${allChecks.length}`,
  `Geçen: ${passed}`,
  `Başarısız: ${failed}`,
  "",
  "## Öne Çıkan Bulgular",
  "- Ortak kasalarda paylaştırma oranları test verisine açık şekilde yazıldı.",
  "- Tek gelirli aile ve araç hedefi senaryolarında hedef tutarı ile gerçekçi birikim farkı özellikle görünür bırakıldı.",
  "- Tahmin oyunu verileri tamamlanmış akış olarak işlendi; tek kullanıcılı kasalarda oyun kaydı kendi kendine test formatında tutuldu.",
  "",
  "## Beta İçin Notlar",
  "- Beta kullanıcısına kişisel kasa yansıması, ortak kasa payı ve oyun bildirim mantığı aynı veriyle gösterilebilir.",
  "- Ekstre, hedef, hesaplaşma, planlı ödeme ve koç kartları tüm test setinde en az bir kez temsil ediliyor.",
  "- Canlı çoklu cihaz Supabase davranışı ayrıca gerçek hesaplarla doğrulanmalı; bu paket uygulama içi seed ve rapor doğrulamasıdır.",
  "",
  "## Global Kontroller",
  ...globalChecks.map((check) => `- ${check.status} - ${check.name}${check.message ? ` | ${check.message}` : ""}`),
].join("\n");

writeFile(path.join(outputRoot, "OZET.md"), summary);

console.log(`Toplam: ${allChecks.length} test, ${passed} geçti, ${failed} başarısız`);
if (failed) process.exit(1);
process.exit(0);
