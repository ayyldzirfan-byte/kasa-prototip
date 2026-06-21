const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = __dirname;
const script = fs.readFileSync(path.join(root, "scripts", "password-reset-live-smoke.cjs"), "utf8");
const promptScript = fs.readFileSync(path.join(root, "scripts", "password-reset-live-smoke.ps1"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.equal(pkg.scripts["test:password-reset-live"], "node scripts/password-reset-live-smoke.cjs");
assert.equal(
  pkg.scripts["test:password-reset-live:prompt"],
  "powershell -ExecutionPolicy Bypass -File scripts/password-reset-live-smoke.ps1",
);
assert.ok(script.includes("KASAM_RESET_TEST_EMAIL"), "script requires reset test email env");
assert.ok(script.includes("/auth/v1/recover"), "script calls Supabase recover endpoint");
assert.ok(script.includes("redirect_to"), "script passes canonical reset redirect");
assert.ok(script.includes("mode=reset-password"), "script uses app reset-password mode");
assert.ok(script.includes("does not prove inbox delivery"), "script separates API acceptance from inbox delivery");
assert.ok(promptScript.includes("Read-Host"), "prompt runner asks for email at runtime");

const result = spawnSync(process.execPath, ["scripts/password-reset-live-smoke.cjs"], {
  cwd: root,
  env: {
    ...process.env,
    KASAM_RESET_TEST_EMAIL: "",
  },
  encoding: "utf8",
  stdio: "pipe",
});

assert.equal(result.status, 2, "missing reset email exits with code 2");
assert.ok(result.stderr.includes("KASAM_RESET_TEST_EMAIL"), "missing env output names required variable");

console.log("PASSWORD RESET LIVE SMOKE SCRIPT TEST OK");
