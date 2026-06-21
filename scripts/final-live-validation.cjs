const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const node = process.execPath;
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);

const requiredAccountEnv = [
  "KASAM_CLOUD_EMAIL_A",
  "KASAM_CLOUD_PASSWORD_A",
  "KASAM_CLOUD_EMAIL_B",
  "KASAM_CLOUD_PASSWORD_B",
];
const serviceRoleEnv = ["KASAM_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const resetEmailEnv = "KASAM_RESET_TEST_EMAIL";

function reportDir() {
  const preferred = path.join(os.homedir(), "Desktop", "kasam-test", `final-live-validation-${stamp}`);
  const fallback = path.join(root, "screenshots", `final-live-validation-${stamp}`);
  try {
    fs.mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch (_error) {
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

function runCheck(name, script) {
  const result = spawnSync(node, [script], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: "pipe",
  });
  const output = `${result.stdout || ""}${result.stderr || ""}`.trim();
  return {
    name,
    status: result.status ?? 1,
    state: result.status === 0 ? "PASS" : "FAIL",
    detail: output || "no output",
  };
}

function missingAccountEnv() {
  return requiredAccountEnv.filter((key) => !process.env[key]);
}

function hasCloudCredentials() {
  return missingAccountEnv().length === 0 || serviceRoleEnv.some((key) => Boolean(process.env[key]));
}

function formatDetail(detail) {
  return String(detail || "")
    .replace(/\r/g, "")
    .split("\n")
    .slice(0, 12)
    .join("<br>")
    .replace(/\|/g, "/");
}

function needsInput(name, detail) {
  return {
    name,
    status: 2,
    state: "NEEDS_INPUT",
    detail,
  };
}

const results = [];
results.push(runCheck("CLOUD AUTH SETTINGS", "scripts/auth-settings-live-smoke.cjs"));

if (hasCloudCredentials()) {
  results.push(runCheck("CLOUD MULTI-USER", "scripts/cloud-live-smoke.cjs"));
} else {
  results.push(
    needsInput(
      "CLOUD MULTI-USER",
      `missing ${missingAccountEnv().join(", ")} or ${serviceRoleEnv.join("/")}`,
    ),
  );
}

if (process.env[resetEmailEnv]) {
  results.push(runCheck("CLOUD PASSWORD RESET API", "scripts/password-reset-live-smoke.cjs"));
} else {
  results.push(needsInput("CLOUD PASSWORD RESET API", `missing ${resetEmailEnv}`));
}

const inputItems = results.filter((item) => item.state === "NEEDS_INPUT");
const failures = results.filter((item) => item.state === "FAIL");
const allPassed = results.every((item) => item.state === "PASS");
const dir = reportDir();
const reportPath = path.join(dir, "final-live-validation-report.md");

const report = [
  "# Kasam Final Live Validation",
  "",
  `Tarih: ${new Date().toISOString()}`,
  "",
  "## Sonuc",
  "",
  `- CLOUD AUTH SETTINGS: ${results.find((item) => item.name === "CLOUD AUTH SETTINGS")?.state || "MISSING"}`,
  `- CLOUD MULTI-USER: ${results.find((item) => item.name === "CLOUD MULTI-USER")?.state || "MISSING"}`,
  `- CLOUD PASSWORD RESET API: ${results.find((item) => item.name === "CLOUD PASSWORD RESET API")?.state || "MISSING"}`,
  "",
  "## Detay",
  "",
  "| Alan | Sonuc | Kod | Detay |",
  "|---|---|---:|---|",
  ...results.map((item) => `| ${item.name} | ${item.state} | ${item.status} | ${formatDetail(item.detail)} |`),
  "",
  "## USER ACTIONS REQUIRED",
  "",
  inputItems.length
    ? inputItems.map((item) => `- ${item.name}: ${item.detail}`).join("\n")
    : "- Yok.",
  "",
  "## Not",
  "",
  "- CLOUD MULTI-USER PASS olmadan ortak kasa hareket/bildirim davranisi gercek cloud icin kanitlanmis sayilmaz.",
  "- CLOUD PASSWORD RESET API PASS, Supabase'in reset istegini kabul ettigini kanitlar; mailin inbox/spam teslimi manuel kontrol edilir.",
  "- Prompt ile tek kosum: `npm run test:final-live:prompt`.",
  "",
].join("\n");

fs.writeFileSync(reportPath, report, "utf8");

for (const item of results) {
  console.log(`${item.state} ${item.name} code=${item.status}`);
}
console.log(`REPORT ${reportPath}`);

if (failures.length) {
  process.exit(1);
} else if (!allPassed) {
  process.exit(2);
}
