const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "scripts", "cloud-live-smoke.cjs"), "utf8");

assert.ok(source.includes("KASAM_CLOUD_EMAIL_A"), "owner email env is required");
assert.ok(source.includes("KASAM_CLOUD_PASSWORD_A"), "owner password env is required");
assert.ok(source.includes("KASAM_CLOUD_EMAIL_B"), "member email env is required");
assert.ok(source.includes("KASAM_CLOUD_PASSWORD_B"), "member password env is required");
assert.ok(source.includes("/auth/v1/token?grant_type=password"), "script uses real Supabase Auth password grant");
assert.ok(source.includes("\"kasa_entries\""), "script writes or reads real kasa_entries table");
assert.ok(source.includes("\"kasa_notifications\""), "script writes or reads real kasa_notifications table");
assert.ok(source.includes("split_with"), "script verifies split_with cloud field");
assert.ok(source.includes("split_ratio"), "script verifies split_ratio cloud field");
assert.ok(source.includes("deleteRows(\"kasa_projects\""), "script cleans up the smoke project");
assert.ok(source.includes("process.exit(2)"), "missing env fails instead of producing a fake PASS");
assert.ok(!source.includes("KASAM_CLOUD_PASSWORD_A='"), "script does not hardcode real passwords");

console.log("CLOUD LIVE SMOKE SCRIPT TEST OK");
