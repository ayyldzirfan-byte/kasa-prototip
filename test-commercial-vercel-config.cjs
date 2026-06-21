const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = __dirname;

function readJson(file) {
  assert.ok(fs.existsSync(file), `${path.basename(file)} bulunamadi`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function read(file) {
  assert.ok(fs.existsSync(file), `${path.basename(file)} bulunamadi`);
  return fs.readFileSync(file, "utf8");
}

const tests = [
  ["commercial vercel config Next.js project olarak ayarli", () => {
    const config = readJson(path.join(root, "commercial", "vercel.json"));
    assert.equal(config.framework, "nextjs");
    assert.equal(config.buildCommand, "npm run build");
    assert.equal(config.installCommand, "npm install");
    assert.equal(config.outputDirectory, ".next");
  }],
  ["root Vercel production PWA build ayari korunuyor", () => {
    const config = readJson(path.join(root, "vercel.json"));
    assert.equal(config.buildCommand, "npm run vercel-build");
    assert.equal(config.outputDirectory, "public");
  }],
  ["commercial kurulum dokumani root directory ve env ayrimini anlatiyor", () => {
    const doc = read(path.join(root, "COMMERCIAL-VERCEL-SETUP.md"));
    assert.ok(doc.includes("Root Directory"));
    assert.ok(doc.includes("commercial"));
    assert.ok(doc.includes("NEXT_PUBLIC_SUPABASE_URL"));
    assert.ok(doc.includes("Service role key Vercel frontend project ortamına girilmez."));
  }],
  ["commercial env ornegi frontend public key disinda secret istemiyor", () => {
    const env = read(path.join(root, "commercial", ".env.example"));
    assert.ok(env.includes("NEXT_PUBLIC_SUPABASE_URL"));
    assert.ok(env.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
    assert.ok(!/SERVICE_ROLE|sb_secret|eyJ/.test(env));
  }]
];

let passed = 0;
for (const [name, test] of tests) {
  try {
    test();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  }
}

if (process.exitCode) process.exit(1);
console.log(`Toplam: ${tests.length} test, ${passed} gecti, 0 basarisiz`);
