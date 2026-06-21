const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const source = fs.readFileSync(path.join(root, "scripts", "readiness-check.cjs"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.equal(pkg.scripts["check:ready"], "node scripts/readiness-check.cjs", "package exposes readiness command");
assert.ok(source.includes("kasam-lint.cjs"), "readiness runs rules lint");
assert.ok(source.includes("scripts/run-all-tests.cjs"), "readiness runs all local tests");
assert.ok(source.includes("build-public.cjs"), "readiness builds public output");
assert.ok(source.includes("scripts/visual-audit.cjs"), "readiness runs visual audit");
assert.ok(source.includes("scripts/auth-settings-live-smoke.cjs"), "readiness runs Supabase auth settings smoke");
assert.ok(source.includes("CLOUD AUTH SETTINGS"), "readiness reports auth settings cloud gate");
assert.ok(source.includes("https://kasa-prototip.vercel.app/index.html"), "readiness checks live canonical app");
assert.ok(source.includes("expectedStamp"), "readiness checks current live stamp");
assert.ok(source.includes("scripts/cloud-live-smoke.cjs"), "readiness runs real cloud smoke when env exists");
assert.ok(source.includes("scripts/password-reset-live-smoke.cjs"), "readiness runs password reset API smoke when env exists");
assert.ok(source.includes("KASAM_CLOUD_EMAIL_A"), "readiness requires cloud owner email env");
assert.ok(source.includes("KASAM_CLOUD_PASSWORD_B"), "readiness requires cloud member password env");
assert.ok(source.includes("KASAM_SUPABASE_SERVICE_ROLE_KEY"), "readiness also accepts local service role self-provisioning");
assert.ok(source.includes("KASAM_RESET_TEST_EMAIL"), "readiness accepts password reset live email env");
assert.ok(source.includes("CLOUD PASSWORD RESET API"), "readiness reports password reset cloud API separately");
assert.ok(source.includes("process.exitCode = 2"), "readiness exits distinctly when only cloud live proof is missing");
assert.ok(source.includes("readiness-report.md"), "readiness writes a report");

console.log("READINESS CHECK SCRIPT TEST OK");
