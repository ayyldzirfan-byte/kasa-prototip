const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const node = process.execPath;
const tests = fs
  .readdirSync(root)
  .filter((name) => /^test-.*\.cjs$/.test(name))
  .sort();

let passed = 0;
let failed = 0;

for (const testFile of tests) {
  console.log(`RUN ${testFile}`);
  const result = spawnSync(node, [testFile], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status === 0) {
    passed += 1;
    continue;
  }
  failed += 1;
  console.error(`FAIL ${testFile}`);
  break;
}

console.log(`Toplam test dosyasi: ${tests.length}`);
console.log(`Gecen dosya: ${passed}`);
console.log(`Basarisiz dosya: ${failed}`);

if (failed > 0) process.exit(1);
