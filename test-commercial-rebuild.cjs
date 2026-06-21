const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = __dirname;

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  assert.ok(fs.existsSync(path.join(root, file)), `${file} missing`);
}

function includes(file, text) {
  assert.ok(read(file).includes(text), `${file} must include ${text}`);
}

function notIncludes(file, text) {
  assert.ok(!read(file).includes(text), `${file} must not include ${text}`);
}

const cases = [
  ["commercial package exists", () => exists("commercial/package.json")],
  ["Next.js 15 dependency declared", () => includes("commercial/package.json", "\"next\": \"^15.0.0\"")],
  ["TypeScript config exists", () => exists("commercial/tsconfig.json")],
  ["Tailwind v4 dependency declared", () => includes("commercial/package.json", "\"tailwindcss\": \"^4.0.0\"")],
  ["Supabase client dependency declared", () => includes("commercial/package.json", "@supabase/supabase-js")],
  ["PRD exists", () => includes("commercial/docs/PRD.md", "Freemium")],
  ["Information architecture exists", () => includes("commercial/docs/INFORMATION-ARCHITECTURE.md", "Movement Add Flow")],
  ["domain model covers surprise privacy", () => includes("commercial/src/lib/domain.ts", "pendingSurpriseCountForUser")],
  ["domain model covers personal impact", () => includes("commercial/src/lib/domain.ts", "personalEntryImpact")],
  ["domain model covers settlement transfers", () => includes("commercial/src/lib/domain.ts", "minimumTransfers")],
  ["insight engine exists", () => includes("commercial/src/lib/insights.ts", "generateInsightDeck")],
  ["insight engine keeps finance deterministic", () => includes("commercial/src/lib/insights.ts", "calculateGoalDelayDays")],
  ["UI has five tabs", () => ["Ana ekran", "Hareketler", "Bütçeler", "Takvim", "Rapor"].forEach((label) => includes("commercial/src/components/KasamCommercialApp.tsx", label))],
  ["UI keeps add flow compact", () => notIncludes("commercial/src/components/KasamCommercialApp.tsx", "Aşama 1")],
  ["UI shows compact recommendations", () => includes("commercial/src/components/KasamCommercialApp.tsx", "insightDeck")],
  ["commercial jest tests exist", () => exists("commercial/src/__tests__/domain.test.ts")],
  ["commercial visual tests exist", () => exists("commercial/tests/visual-rules.spec.ts")],
  ["intelligence engine documentation exists", () => includes("commercial/docs/INTELLIGENCE-ENGINE.md", "LLM yapmaz")]
];

let passed = 0;
for (const [name, fn] of cases) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.stack);
    process.exit(1);
  }
}

console.log(`Toplam: ${cases.length} test, ${passed} geçti, 0 başarısız`);
