const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "scripts", "cloud-live-smoke.cjs"), "utf8");
const psSource = fs.readFileSync(path.join(__dirname, "scripts", "cloud-live-smoke.ps1"), "utf8");

assert.ok(source.includes("KASAM_CLOUD_EMAIL_A"), "owner email env is required");
assert.ok(source.includes("KASAM_CLOUD_PASSWORD_A"), "owner password env is required");
assert.ok(source.includes("KASAM_CLOUD_EMAIL_B"), "member email env is required");
assert.ok(source.includes("KASAM_CLOUD_PASSWORD_B"), "member password env is required");
assert.ok(source.includes("KASAM_SUPABASE_SERVICE_ROLE_KEY"), "script supports service role self-provisioning");
assert.ok(source.includes("/auth/v1/admin/users"), "script can create temporary auth users through Supabase Admin API");
assert.ok(source.includes("email_confirm: true"), "temporary users are created confirmed");
assert.ok(source.includes("/auth/v1/token?grant_type=password"), "script uses real Supabase Auth password grant");
assert.ok(source.includes("\"kasa_entries\""), "script writes or reads real kasa_entries table");
assert.ok(source.includes("\"kasa_notifications\""), "script writes or reads real kasa_notifications table");
assert.ok(source.includes("split_with"), "script verifies split_with cloud field");
assert.ok(source.includes("split_ratio"), "script verifies split_ratio cloud field");
assert.ok(source.includes("deleteRows(\"kasa_projects\""), "script cleans up the smoke project");
assert.ok(source.includes("deleteAuthUser"), "script cleans up temporary auth users when self-provisioned");
assert.ok(source.includes("process.exit(2)"), "missing env fails instead of producing a fake PASS");
assert.ok(source.includes("apikey: options.apikey || anonKey"), "REST calls must keep anon key in apikey header");
assert.ok(source.includes("Authorization: `Bearer ${token}`"), "REST calls must use user access token only in Authorization header");
assert.ok(!source.includes("KASAM_CLOUD_PASSWORD_A='"), "script does not hardcode real passwords");
assert.ok(psSource.includes("Read-Host") && psSource.includes("-AsSecureString"), "PowerShell runner asks passwords securely");
assert.ok(psSource.includes("KASAM_SUPABASE_SERVICE_ROLE_KEY"), "PowerShell runner can pass service role key securely");
assert.ok(psSource.includes("Read-OptionalSecret"), "PowerShell runner does not force service role storage");
assert.ok(psSource.includes("KASAM_CLOUD_EMAIL_A"), "PowerShell runner sets owner email env");
assert.ok(psSource.includes("KASAM_CLOUD_PASSWORD_B"), "PowerShell runner sets member password env");
assert.ok(psSource.includes("scripts/cloud-live-smoke.cjs"), "PowerShell runner executes cloud smoke script");
assert.ok(!psSource.includes("kasam.test") && !psSource.includes("1234"), "PowerShell runner does not hardcode test credentials");

console.log("CLOUD LIVE SMOKE SCRIPT TEST OK");
