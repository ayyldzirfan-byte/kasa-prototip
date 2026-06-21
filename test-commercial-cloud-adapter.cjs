const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const files = [
  path.join(root, "commercial", "src", "lib", "cloud-schema.ts"),
  path.join(root, "commercial", "src", "lib", "cloud-client.ts"),
  path.join(root, "commercial", "src", "__tests__", "cloud-schema.test.ts"),
  path.join(root, "scripts", "commercial-cloud-smoke.cjs"),
  path.join(root, "scripts", "commercial-cloud-smoke.ps1")
];

function read(file) {
  assert.ok(fs.existsSync(file), `${path.basename(file)} bulunamadi`);
  return fs.readFileSync(file, "utf8");
}

function pass(name) {
  console.log(`✓ ${name}`);
}

function fail(name, error) {
  console.error(`✗ ${name}`);
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
}

const tests = [
  ["commercial cloud adapter dosyalari var", () => files.forEach(read)],
  ["cloud client mevcut kasa tablolarini kullaniyor", () => {
    const source = read(files[1]);
    ["kasa_profiles", "kasa_projects", "kasa_project_members", "kasa_entries", "kasa_notifications"].forEach((table) => {
      assert.ok(source.includes(table), `${table} eksik`);
    });
  }],
  ["commercial notification payload production semasina uyumlu", () => {
    const source = `${read(files[0])}\n${read(files[1])}`;
    ["actual_type", "title", "amount", "success_reaction", "fail_reaction", "guesses"].forEach((field) => {
      assert.ok(source.includes(field), `${field} notification payload icinde eksik`);
    });
    const builderStart = source.indexOf("export function buildNotificationInsertPayload");
    const builderEnd = source.indexOf("export function buildCommercialStateFromCloud", builderStart);
    const notificationBuilder = source.slice(builderStart, builderEnd > builderStart ? builderEnd : undefined);
    assert.ok(notificationBuilder.includes('notification_type: "guess"'), "notification_type payload builder icinde eksik");
    assert.ok(!/^\s+type:\s*"guess"/m.test(notificationBuilder), 'kasa_notifications tablosunda type kolonu yok; payload type: "guess" icermemeli');
  }],
  ["commercial kaynak frontend secret icermiyor", () => {
    const source = [files[0], files[1], files[2]].map(read).join("\n");
    assert.ok(!/service[_-]?role/i.test(source), "service role ifadesi commercial kaynakta olmamali");
    assert.ok(!/sb_secret/i.test(source), "secret key ifadesi commercial kaynakta olmamali");
    assert.ok(!/eyJ[A-Za-z0-9_-]{20,}/.test(source), "JWT benzeri hardcode key olmamali");
  }],
  ["cloud schema ortak kasa pay etkisini test ediyor", () => {
    const source = read(files[2]);
    assert.ok(source.includes("u-partner"), "ikinci kullanici testi yok");
    assert.ok(source.includes("toBe(-500)"), "pay etkisi testi yok");
    assert.ok(source.includes("pendingSurpriseCountForUser"), "bildirim gorunurlugu testi yok");
  }],
  ["commercial cloud smoke gercek cloud kapisini cagiriyor", () => {
    const source = read(files[3]);
    assert.ok(source.includes("cloud-live-smoke.cjs"), "gercek cloud live smoke cagrisi yok");
    assert.ok(source.includes("test-commercial-cloud-adapter.cjs"), "commercial adapter smoke cagrisi yok");
    assert.ok(!source.includes("PASS uretilir"), "sahte pass metni olmamali");
  }],
  ["commercial tablo eslemesi kolon-tam mapper kullaniyor", () => {
    const schema = read(files[0]);
    [
      "mapCloudProfile",
      "mapCloudProject",
      "mapCloudEntry",
      "mapCloudNotification",
      "mapCloudGoal",
      "mapCloudReaction",
      "mapCloudSettlement",
      "mapCloudReconciliation",
      "mapCloudInsight",
      "buildEntryInsertPayload",
      "buildNotificationInsertPayload"
    ].forEach((name) => {
      assert.ok(schema.includes(`function ${name}`) || schema.includes(`function ${name}`), `${name} eksik`);
    });
    [
      "paid_by_id",
      "split_with",
      "split_ratio",
      "rate_locked_at",
      "auto_reveal_at",
      "revealed_at",
      "guess_deadline",
      "phase3_options",
      "familiarity_scores",
      "matched_entry_ids"
    ].forEach((column) => {
      assert.ok(schema.includes(column), `${column} mapper icinde eksik`);
    });
  }],
  ["commercial cloud client opsiyonel kasa tablolarini guvenli okuyor", () => {
    const source = read(files[1]);
    ["kasa_goals", "kasa_reactions", "kasa_settlements", "kasa_reconciliations", "kasa_insights"].forEach((table) => {
      assert.ok(source.includes(table), `${table} okunmuyor`);
    });
    assert.ok(source.includes("selectOptionalRows"), "opsiyonel tablo okuma korumasi yok");
    assert.ok(source.includes("buildEntryInsertPayload"), "entry insert payload builder kullanilmiyor");
    assert.ok(source.includes("buildNotificationInsertPayload"), "notification insert payload builder kullanilmiyor");
  }],
  ["commercial cloud prompt runner secret yazmadan calisiyor", () => {
    const source = read(files[4]);
    assert.ok(source.includes("Read-Host") && source.includes("-AsSecureString"), "Supabase admin key guvenli prompt ile alinmali");
    assert.ok(source.includes("legacy service_role JWT or sb_secret"), "prompt legacy JWT ve yeni sb_secret formatlarini anlatmali");
    assert.ok(source.includes("KASAM_SUPABASE_SERVICE_ROLE_KEY"), "Supabase admin env gecici set edilmeli");
    assert.ok(source.includes("Remove-Item Env:\\KASAM_SUPABASE_SERVICE_ROLE_KEY"), "Supabase admin env test sonunda temizlenmeli");
    assert.ok(source.includes("scripts/commercial-cloud-smoke.cjs"), "commercial cloud smoke runner cagrilmali");
  }]
];

tests.forEach(([name, fn]) => {
  try {
    fn();
    pass(name);
  } catch (error) {
    fail(name, error);
  }
});

if (process.exitCode) process.exit(1);
console.log(`Toplam: ${tests.length} test, ${tests.length} gecti, 0 basarisiz`);
