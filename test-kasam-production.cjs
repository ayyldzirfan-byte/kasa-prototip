const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

const index = read("index.html");
const manifest = JSON.parse(read("manifest.webmanifest"));
const appProduction = read("app-production.js");
const appBundle = read("app.js");
const sql = read("supabase-production-kasam.sql");
const sw = read("sw.js");
const vision = read("netlify/functions/kasam-vision.js");
const coach = read("netlify/functions/kasam-ai-coach.js");

const tests = [
  {
    block: 0,
    name: "Kasam brand, manifest and icons",
    run() {
      assert.equal(manifest.name, "Kasam");
      assert.equal(manifest.short_name, "Kasam");
      assert(index.includes("<title>Kasam</title>"));
      assert(index.includes("Paran"));
      ["icon-16.png", "icon-32.png", "icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png", "apple-touch-icon.png"].forEach((file) => assert(exists(file), file));
      assert(appProduction.includes("KASAM"));
      assert(appProduction.includes("kasam.app"));
      assert(appProduction.includes("bekleyen"));
      assert(!appBundle.includes("kasa.app"));
      assert(!appBundle.includes("Geçici isim"));
    },
  },
  {
    block: 1,
    name: "RLS and input safety markers",
    run() {
      assert(sql.includes("alter table public.kasa_entries enable row level security"));
      assert(sql.includes("entries delete own"));
      assert(sql.includes("kasa_is_project_member(project_id)"));
      assert(appProduction.includes("kasamCleanText"));
      assert(appProduction.includes("Tutar pozitif"));
      assert(!appProduction.includes("eval("));
    },
  },
  {
    block: 2,
    name: "Global errors, retry and offline cache",
    run() {
      assert(appProduction.includes("window.onerror"));
      assert(appProduction.includes("window.onunhandledrejection"));
      assert(appProduction.includes("retryQueue"));
      assert(appProduction.includes("Çevrimdışı"));
      assert(sw.includes("app-production.js"));
    },
  },
  {
    block: 3,
    name: "Onboarding and PWA release files",
    run() {
      assert(appProduction.includes("Kasam'a"));
      assert(appProduction.includes("Demoyu"));
      assert(index.includes('property="og:title" content="Kasam"'));
      assert(exists("robots.txt"));
      assert(exists("404.html"));
      assert(exists("_redirects"));
      assert(exists("gizlilik.html"));
      assert(exists("sartlar.html"));
    },
  },
  {
    block: 4,
    name: "Statement engine and Claude key isolation",
    run() {
      assert(appProduction.includes("parsePdfFile"));
      assert(appProduction.includes("parseXlsxFile"));
      assert(appProduction.includes("analyzeStatementImage"));
      assert(sql.includes("format_type text"));
      assert(sql.includes("matched_entry_ids"));
      assert(vision.includes("process.env.ANTHROPIC_API_KEY"));
      assert(coach.includes("process.env.ANTHROPIC_API_KEY"));
      assert(!vision.includes("sk-ant-"));
      assert(!coach.includes("sk-ant-"));
      assert(!appProduction.includes("ANTHROPIC_API_KEY="));
    },
  },
  {
    block: 5,
    name: "Insights and AI coach",
    run() {
      assert(appProduction.includes("generateDailyInsights"));
      assert(appProduction.includes("generateWeeklyInsights"));
      assert(appProduction.includes("generateMonthlyInsights"));
      assert(appProduction.includes("detectAnomalies"));
      assert(appProduction.includes("Kasam sana ne diyor?"));
      assert(sql.includes("create table if not exists public.kasa_insights"));
    },
  },
  {
    block: 6,
    name: "Previous feature coverage remains present",
    run() {
      assert(appProduction.includes("Tahmin oyunu"));
      assert(read("app-blocks.js").includes("setReaction"));
      assert(read("app-blocks.js").includes("projectTemplates"));
      assert(read("app-blocks.js").includes("minimumTransfers"));
      assert(read("app-blocks.js").includes("html2canvas") || index.includes("html2canvas"));
    },
  },
  {
    block: 7,
    name: "KVKK, export and account deletion",
    run() {
      assert(appProduction.includes("Gizlilik Politikası"));
      assert(appProduction.includes("Kullanım Şartları"));
      assert(appProduction.includes("exportMyData"));
      assert(appProduction.includes("deleteMyAccount"));
      assert(sql.includes("delete_my_kasam_account"));
      assert(appProduction.includes("kasam-verilerim-"));
    },
  },
];

for (const test of tests) {
  test.run();
  console.log(`BLOK ${test.block} TEST OK - ${test.name}`);
}

console.log("KASAM PRODUCTION SMOKE TEST OK");
