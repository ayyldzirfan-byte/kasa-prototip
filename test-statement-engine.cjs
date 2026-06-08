const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const appProduction = read("app-production.js");
const appState = read("app-state.js");
const sql = read("supabase-production-kasam.sql");
const vision = read("netlify/functions/kasam-vision.js");
const supabaseVision = read("supabase/functions/kasam-vision/index.ts");

["parseCsvRows", "parsePdfFile", "parseXlsxFile", "analyzeStatementImage", "matchStatementRows", "addReconciliation", "handleStatementSubmit"].forEach((marker) => {
  assert(appProduction.includes(marker), marker);
});

["csv", "pdf", "image", "xlsx"].forEach((format) => assert(appProduction.includes(`value=\"${format}\"`) || appProduction.includes(`value="${format}"`), format));
const bankSource = `${appState}\n${appProduction}`.toLowerCase();
["garanti", "isbank", "yapikredi", "akbank", "ziraat", "qnb"].forEach((bank) => assert(bankSource.includes(bank), bank));
assert(appProduction.includes("dateFromKey(entry.date) - dateFromKey(rowDate)"));
assert(appProduction.includes("matchedEntryIds"));
assert(appProduction.includes("unmatchedRows"));
assert(appProduction.includes("aiAnalysis"));

assert(sql.includes("format_type text"));
assert(sql.includes("matched_entry_ids uuid[]"));
assert(sql.includes("unmatched_rows jsonb"));
assert(sql.includes("ai_analysis jsonb"));
assert(sql.includes("format_type in ('csv', 'pdf', 'image', 'xlsx')"));

assert(vision.includes("process.env.ANTHROPIC_API_KEY"));
assert(vision.includes("process.env.ANTHROPIC_MODEL"));
assert(supabaseVision.includes('Deno.env.get("ANTHROPIC_API_KEY")'));
assert(!vision.includes("sk-ant-"));
assert(!supabaseVision.includes("sk-ant-"));
assert(!appProduction.includes("ANTHROPIC_API_KEY="));

console.log("STATEMENT ENGINE TEST OK");
