const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const sql = read("supabase-production-kasam.sql");
const appProduction = read("app-production.js");
const index = read("index.html");

[
  "alter table public.kasa_profiles enable row level security",
  "create policy \"profiles select own\"",
  "create policy \"projects select members\"",
  "create policy \"projects insert owner\"",
  "create policy \"entries select members\"",
  "create policy \"entries insert own\"",
  "create policy \"entries update own\"",
  "create policy \"entries delete own\"",
  "create policy \"notifications select recipients\"",
  "create policy \"notifications insert actor\"",
  "create policy \"notifications update recipients\"",
  "create policy \"reactions own write\"",
  "create policy \"reconciliations own\"",
  "create policy \"goals member select\"",
  "create policy \"goals owner delete\"",
  "create policy \"settlements related select\"",
  "create policy \"settlements from insert\"",
].forEach((marker) => assert(sql.includes(marker), marker));

assert(sql.includes("public.kasa_is_project_member(project_id)"));
assert(sql.includes("user_id = auth.uid()"));
assert(sql.includes("created_by = auth.uid()"));
assert(sql.includes("auth.uid() = any(recipients)"));

assert(index.includes("purify.min.js"));
assert(appProduction.includes("window.DOMPurify"));
assert(appProduction.includes("ALLOWED_TAGS: []"));
assert(appProduction.includes("maxLength = 200"));
assert(appProduction.includes("Tutar pozitif bir sayı olmalı."));
assert(appProduction.includes("Bu kasaya erişim iznin yok."));
assert(!appProduction.includes("eval("));
assert(!appProduction.includes(".innerHTML = kasamCleanText"));

console.log("SECURITY TEST OK");
