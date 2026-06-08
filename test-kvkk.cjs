const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const app = read("app-production.js");
const sql = read("supabase-production-kasam.sql");
const privacy = read("gizlilik.html");
const terms = read("sartlar.html");

[
  "legalAccepted",
  "Gizlilik politikasını ve kullanım şartlarını okudum",
  "kasamIcon(\"shield\"",
  "export-my-data",
  "delete-account",
  "kasam-verilerim-",
  "deleteMyAccount",
  "exportMyData",
  "kasamIcon(\"download\"",
  "kasamIcon(\"trash-2\"",
].forEach((marker) => assert(app.includes(marker), marker));

assert(sql.includes("create or replace function public.delete_my_kasam_account"));
assert(sql.includes("grant execute on function public.delete_my_kasam_account"));

["ad", "e-posta", "harcama", "Supabase", "destek@kasam.app"].forEach((marker) => assert(privacy.includes(marker), `privacy:${marker}`));
const termsLower = terms.toLocaleLowerCase("tr-TR");
["kasam", "kullanım", "hesabını silebilir", "verilerini uygulama içinden indirebilirsin"].forEach((marker) => assert(termsLower.includes(marker), `terms:${marker}`));

console.log("KVKK TEST OK");
