const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const source = fs.readFileSync(path.join(root, "scripts", "auth-settings-live-smoke.cjs"), "utf8");
const readiness = fs.readFileSync(path.join(root, "scripts", "readiness-check.cjs"), "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.equal(pkg.scripts["test:auth-settings-live"], "node scripts/auth-settings-live-smoke.cjs");
assert.ok(source.includes("/auth/v1/settings"), "script reads Supabase auth settings");
assert.ok(source.includes("/auth/v1/health"), "script reads Supabase auth health");
assert.ok(source.includes("external?.email"), "script requires email provider");
assert.ok(source.includes("disable_signup"), "script checks signup status");
assert.ok(source.includes("does not prove SMTP inbox delivery"), "script separates auth settings from SMTP delivery");
assert.ok(readiness.includes("scripts/auth-settings-live-smoke.cjs"), "readiness runs auth settings smoke");
assert.ok(readiness.includes("CLOUD auth settings"), "readiness reports auth settings separately");

console.log("AUTH SETTINGS LIVE SMOKE SCRIPT TEST OK");
