const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const node = process.execPath;
const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const expectedStamp = "G\u00fcncellendi 14.06.2026 23:05";
const requiredCloudEnv = [
  "KASAM_CLOUD_EMAIL_A",
  "KASAM_CLOUD_PASSWORD_A",
  "KASAM_CLOUD_EMAIL_B",
  "KASAM_CLOUD_PASSWORD_B",
];

function outputDir() {
  const preferred = path.join(os.homedir(), "Desktop", "kasam-test", `readiness-${stamp}`);
  const fallback = path.join(root, "screenshots", `readiness-${stamp}`);
  try {
    fs.mkdirSync(preferred, { recursive: true });
    return preferred;
  } catch (_error) {
    fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

function run(name, command, args) {
  console.log(`RUN ${name}`);
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    encoding: "utf8",
    stdio: "pipe",
  });
  const ok = result.status === 0;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : ` code=${result.status}`}`);
  return {
    name,
    ok,
    status: result.status,
    detail: ok ? "ok" : `${result.stdout || ""}${result.stderr || ""}`.trim().slice(0, 500),
  };
}

async function liveStamp() {
  const url = "https://kasa-prototip.vercel.app/index.html?readiness-check=1";
  try {
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();
    const stampOk = response.ok && (
      text.includes(expectedStamp) ||
      text.includes("GÃ¼ncellendi 14.06.2026 23:05") ||
      text.includes("GÃƒÂ¼ncellendi 14.06.2026 23:05")
    );
    return {
      name: "CLOUD live stamp",
      ok: stampOk,
      status: response.status,
      detail: stampOk ? expectedStamp : "stamp missing",
    };
  } catch (error) {
    return { name: "CLOUD live stamp", ok: false, status: 1, detail: error.message };
  }
}

function summaryLine(item) {
  const marker = item.ok ? "PASS" : "FAIL";
  return `| ${item.name} | ${marker} | ${item.status ?? ""} | ${(item.detail || "").replace(/\|/g, "/")} |`;
}

(async () => {
  const reportDir = outputDir();
  const results = [];

  results.push(run("LOCAL lint", node, ["kasam-lint.cjs"]));
  results.push(run("LOCAL tests", node, ["scripts/run-all-tests.cjs"]));
  results.push(run("LOCAL build-public", node, ["build-public.cjs"]));
  results.push(run("GORSEL visual-audit", node, ["scripts/visual-audit.cjs"]));

  const live = await liveStamp();
  console.log(`${live.ok ? "PASS" : "FAIL"} ${live.name} - ${live.detail}`);
  results.push(live);

  const missingCloudEnv = requiredCloudEnv.filter((key) => !process.env[key]);
  let cloudResult;
  if (missingCloudEnv.length) {
    cloudResult = {
      name: "CLOUD live multi-user",
      ok: false,
      status: 2,
      detail: `missing env: ${missingCloudEnv.join(", ")}`,
    };
    console.log(`SKIP ${cloudResult.name} - ${cloudResult.detail}`);
  } else {
    cloudResult = run("CLOUD live multi-user", node, ["scripts/cloud-live-smoke.cjs"]);
    cloudResult.detail = cloudResult.ok ? "real two-account cloud smoke passed" : "real cloud smoke failed";
  }
  results.push(cloudResult);

  const localOk = results.filter((item) => item.name.startsWith("LOCAL")).every((item) => item.ok);
  const visualOk = results.filter((item) => item.name.startsWith("GORSEL")).every((item) => item.ok);
  const cloudStampOk = live.ok;
  const cloudLiveOk = cloudResult.ok;

  const report = [
    "# Kasam Readiness Check",
    "",
    `Tarih: ${new Date().toISOString()}`,
    "",
    "## Sonuc",
    "",
    `- LOCAL SIMULASYON: ${localOk ? "PASS" : "FAIL"}`,
    `- GORSEL DOGRULAMA: ${visualOk ? "PASS" : "FAIL"}`,
    `- CLOUD STAMP: ${cloudStampOk ? "PASS" : "FAIL"}`,
    `- CLOUD LIVE MULTI-USER: ${cloudLiveOk ? "PASS" : "ENV MISSING / FAIL"}`,
    "",
    "## Detay",
    "",
    "| Alan | Sonuc | Kod | Detay |",
    "|---|---|---:|---|",
    ...results.map(summaryLine),
    "",
    "## Not",
    "",
    "Cloud live multi-user PASS olmadan gercek iki kullanici/telefon davranisi tam kanitlanmis sayilmaz.",
    "Eksik env varsa su komut kullanilir: `npm run test:cloud-live:prompt`.",
    "",
  ].join("\n");

  const reportPath = path.join(reportDir, "readiness-report.md");
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(`REPORT ${reportPath}`);

  if (!localOk || !visualOk || !cloudStampOk) {
    process.exitCode = 1;
    return;
  }
  if (!cloudLiveOk) process.exitCode = 2;
})().catch((error) => {
  console.error(`READINESS FAIL ${error.message}`);
  process.exitCode = 1;
});
