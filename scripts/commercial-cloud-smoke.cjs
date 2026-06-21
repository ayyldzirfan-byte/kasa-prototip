const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const node = process.execPath;

function run(label, script) {
  console.log(`COMMERCIAL CLOUD ${label} basliyor`);
  const result = spawnSync(node, [script], {
    cwd: root,
    env: process.env,
    stdio: "inherit"
  });
  if (result.status !== 0) {
    console.error(`COMMERCIAL CLOUD ${label} FAIL code=${result.status}`);
    process.exit(result.status || 1);
  }
  console.log(`COMMERCIAL CLOUD ${label} PASS`);
}

run("LIVE MULTI-USER", path.join(root, "scripts", "cloud-live-smoke.cjs"));
run("ADAPTER", path.join(root, "test-commercial-cloud-adapter.cjs"));

console.log("COMMERCIAL CLOUD SMOKE PASS");
