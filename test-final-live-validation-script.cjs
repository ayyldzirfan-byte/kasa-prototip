const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = __dirname;
const finalScript = fs.readFileSync(path.join(root, "scripts", "final-live-validation.cjs"), "utf8");
const promptScript = fs.readFileSync(path.join(root, "scripts", "final-live-validation.ps1"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.ok(pkg.scripts["test:final-live"], "package.json test:final-live script eksik");
assert.ok(pkg.scripts["test:final-live:prompt"], "package.json test:final-live:prompt script eksik");
assert.ok(finalScript.includes("scripts/auth-settings-live-smoke.cjs"), "auth settings live script final gate'e bagli degil");
assert.ok(finalScript.includes("scripts/cloud-live-smoke.cjs"), "cloud live smoke final gate'e bagli degil");
assert.ok(finalScript.includes("scripts/password-reset-live-smoke.cjs"), "password reset live smoke final gate'e bagli degil");
assert.ok(finalScript.includes("NEEDS_INPUT"), "eksik input durumunda NEEDS_INPUT raporu yok");
assert.ok(finalScript.includes("final-live-validation-report.md"), "final live rapor dosyasi yok");
assert.ok(finalScript.includes("USER ACTIONS REQUIRED"), "kullanici aksiyonlari raporlanmiyor");
assert.ok(promptScript.includes("-AsSecureString"), "prompt runner secret degerleri secure prompt ile almiyor");
assert.ok(!promptScript.includes("Write-Host $env:KASAM_SUPABASE_SERVICE_ROLE_KEY"), "service role key ekrana yaziliyor");

const env = { ...process.env };
delete env.KASAM_CLOUD_EMAIL_A;
delete env.KASAM_CLOUD_PASSWORD_A;
delete env.KASAM_CLOUD_EMAIL_B;
delete env.KASAM_CLOUD_PASSWORD_B;
delete env.KASAM_SUPABASE_SERVICE_ROLE_KEY;
delete env.SUPABASE_SERVICE_ROLE_KEY;
delete env.KASAM_RESET_TEST_EMAIL;

const result = spawnSync(process.execPath, ["scripts/final-live-validation.cjs"], {
  cwd: root,
  env,
  encoding: "utf8",
  stdio: "pipe",
});

assert.equal(result.status, 2, "eksik cloud/reset input durumunda final gate exit code 2 vermeli");
assert.ok(`${result.stdout}${result.stderr}`.includes("NEEDS_INPUT CLOUD MULTI-USER"), "cloud input eksigi raporlanmadi");
assert.ok(`${result.stdout}${result.stderr}`.includes("NEEDS_INPUT CLOUD PASSWORD RESET API"), "reset input eksigi raporlanmadi");

console.log("PASS final live validation script");
