const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const app = read("app-production.js");
const sql = read("supabase-production-kasam.sql");
const netlifyCoach = read("netlify/functions/kasam-ai-coach.js");
const supabaseCoach = read("supabase/functions/kasa-ai-coach/index.ts");

[
  "generateDailyInsights",
  "generateWeeklyInsights",
  "generateMonthlyInsights",
  "detectAnomalies",
  "generateGoalInsights",
  "requestAiCoachReport",
  "Kasam sana ne diyor?",
  "const icon = kasamInsightIcon(top.type)",
  "createInsight",
  "mark-insight-read",
].forEach((marker) => assert(app.includes(marker), marker));

["daily", "weekly", "monthly", "goal", "anomaly", "coaching"].forEach((type) => {
  assert(sql.includes(`'${type}'`) || app.includes(`type: "${type}"`), type);
});

["son 3 aylık", "last3MonthsSummary", "summary", "opportunities", "habits", "goalPlan", "actions"].forEach((marker) => {
  assert(netlifyCoach.includes(marker) || app.includes(marker), marker);
});

assert(sql.includes("create table if not exists public.kasa_insights"));
assert(sql.includes("insight_data jsonb"));
assert(sql.includes("is_read boolean"));
assert(sql.includes("alter table public.kasa_insights enable row level security"));
assert(sql.includes("user_id = auth.uid()"));

assert(netlifyCoach.includes("process.env.ANTHROPIC_API_KEY"));
assert(netlifyCoach.includes("process.env.ANTHROPIC_MODEL"));
assert(supabaseCoach.includes('Deno.env.get("ANTHROPIC_API_KEY")'));
assert(!netlifyCoach.includes("sk-ant-"));
assert(!supabaseCoach.includes("sk-ant-"));
assert(!app.includes("ANTHROPIC_API_KEY="));

console.log("INSIGHTS TEST OK");
