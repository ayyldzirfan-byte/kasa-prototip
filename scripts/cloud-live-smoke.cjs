const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "cloud-config.js");
const configSource = fs.readFileSync(configPath, "utf8");

function extractConfig(name) {
  const match = configSource.match(new RegExp(`${name}:\\s*"([^"]+)"`));
  return match ? match[1] : "";
}

const supabaseUrl = extractConfig("supabaseUrl").replace(/\/$/, "");
const anonKey = extractConfig("supabaseAnonKey");
const serviceRoleKey = process.env.KASAM_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const accountEnv = [
  "KASAM_CLOUD_EMAIL_A",
  "KASAM_CLOUD_PASSWORD_A",
  "KASAM_CLOUD_EMAIL_B",
  "KASAM_CLOUD_PASSWORD_B",
];

if (!supabaseUrl || !anonKey) {
  console.error("cloud-config.js does not contain Supabase URL and publishable key.");
  process.exit(2);
}

function missingAccountEnv() {
  return accountEnv.filter((key) => !process.env[key]);
}

function explainMissingEnv() {
  const missing = missingAccountEnv();
  console.error("Cloud live smoke test needs one of these inputs:");
  console.error("1) Four real test account env vars:");
  console.error(`   missing: ${missing.join(", ") || "none"}`);
  console.error("2) Or a local-only Supabase admin key env:");
  console.error("   KASAM_SUPABASE_SERVICE_ROLE_KEY");
  console.error("Accepted admin key formats: legacy service_role JWT or new sb_secret key.");
  console.error("The admin key must never be committed or added to frontend/Vercel client code.");
  console.error("Run with prompted real accounts: npm run test:cloud-live:prompt");
}

if (missingAccountEnv().length && !serviceRoleKey) {
  explainMissingEnv();
  process.exit(2);
}

function logCheck(ok, message, detail = "") {
  const marker = ok ? "PASS" : "FAIL";
  console.log(`${marker} ${message}${detail ? ` - ${detail}` : ""}`);
  if (!ok) throw new Error(message);
}

async function requestJson(url, options = {}) {
  const token = options.token || anonKey;
  const headers = {
    apikey: options.apikey || anonKey,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error_description || payload?.error || text || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }
  return payload;
}

async function adminJson(pathname, options = {}) {
  if (!serviceRoleKey) throw new Error("service role key is not configured");
  return requestJson(`${supabaseUrl}${pathname}`, {
    ...options,
    token: serviceRoleKey,
    apikey: serviceRoleKey,
  });
}

async function createAuthUser(label) {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const domain = String(process.env.KASAM_CLOUD_TEST_EMAIL_DOMAIN || "gmail.com").replace(/^@/, "");
  const email = `kasam.cloud.${label}.${suffix}@${domain}`.toLowerCase();
  const password = `KasamCloud!${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
  const payload = await adminJson("/auth/v1/admin/users", {
    method: "POST",
    body: {
      email,
      password,
      email_confirm: true,
      user_metadata: { name: `Cloud ${label}`, nickname: label },
    },
  });
  const user = payload?.user || payload;
  if (!user?.id) throw new Error(`admin user create failed for ${label}`);
  return { email, password, userId: user.id, createdByScript: true };
}

async function deleteAuthUser(userId) {
  if (!serviceRoleKey || !userId) return;
  await adminJson(`/auth/v1/admin/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
}

async function getCredentials() {
  if (!missingAccountEnv().length) {
    return {
      owner: {
        email: process.env.KASAM_CLOUD_EMAIL_A.trim().toLowerCase(),
        password: process.env.KASAM_CLOUD_PASSWORD_A,
        createdByScript: false,
      },
      member: {
        email: process.env.KASAM_CLOUD_EMAIL_B.trim().toLowerCase(),
        password: process.env.KASAM_CLOUD_PASSWORD_B,
        createdByScript: false,
      },
    };
  }
  const owner = await createAuthUser("owner");
  const member = await createAuthUser("member");
  console.log("INFO temporary Supabase auth users created with service role");
  return { owner, member };
}

async function signIn(email, password) {
  const payload = await requestJson(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    body: { email, password },
  });
  if (!payload?.access_token || !payload?.user?.id) throw new Error(`Sign in failed for ${email}`);
  return { token: payload.access_token, user: payload.user };
}

function tableUrl(table, query = "") {
  return `${supabaseUrl}/rest/v1/${table}${query}`;
}

async function upsert(table, rows, token, conflict) {
  const query = conflict ? `?on_conflict=${encodeURIComponent(conflict)}` : "";
  return requestJson(tableUrl(table, query), {
    method: "POST",
    token,
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: rows,
  });
}

async function insert(table, rows, token) {
  return requestJson(tableUrl(table), {
    method: "POST",
    token,
    headers: { Prefer: "return=representation" },
    body: rows,
  });
}

async function select(table, query, token) {
  return requestJson(tableUrl(table, query), { token });
}

async function deleteRows(table, query, token) {
  return requestJson(tableUrl(table, query), {
    method: "DELETE",
    token,
    headers: { Prefer: "return=representation" },
  });
}

(async () => {
  const credentials = await getCredentials();
  const owner = await signIn(credentials.owner.email, credentials.owner.password);
  const member = await signIn(credentials.member.email, credentials.member.password);

  logCheck(owner.user.id !== member.user.id, "iki ayri auth kullanicisi ile giris yapildi");

  const now = new Date().toISOString();
  const projectId = crypto.randomUUID();
  const headingId = crypto.randomUUID();
  const entryId = crypto.randomUUID();
  const notificationId = crypto.randomUUID();
  const code = `LIVE-${Date.now().toString(36).toUpperCase()}`;

  try {
    await upsert(
      "kasa_profiles",
      [{ id: owner.user.id, email: credentials.owner.email, name: "Cloud Owner", nickname: "Owner", updated_at: now }],
      owner.token,
      "id",
    );
    await upsert(
      "kasa_profiles",
      [{ id: member.user.id, email: credentials.member.email, name: "Cloud Member", nickname: "Member", updated_at: now }],
      member.token,
      "id",
    );

    await insert(
      "kasa_projects",
      [
        {
          id: projectId,
          name: "Kasam Cloud Smoke",
          purpose: "Live cloud verification",
          code,
          created_by: owner.user.id,
          created_at: now,
          updated_at: now,
        },
      ],
      owner.token,
    );

    await upsert(
      "kasa_project_members",
      [
        { project_id: projectId, user_id: owner.user.id, role: "owner", member_since: "2026-06-01" },
        { project_id: projectId, user_id: member.user.id, role: "member", member_since: "2026-06-01" },
      ],
      owner.token,
      "project_id,user_id",
    );

    await insert(
      "kasa_headings",
      [{ id: headingId, project_id: projectId, name: "Market", short_name: "Market", emoji: "" }],
      owner.token,
    );

    await insert(
      "kasa_entries",
      [
        {
          id: entryId,
          project_id: projectId,
          user_id: owner.user.id,
          type: "expense",
          amount: 1000,
          entered_amount: 1000,
          currency: "TRY",
          exchange_rate: 1,
          heading_id: headingId,
          short_name: "Market",
          entry_date: "2026-06-21",
          note: "cloud live smoke",
          paid_by_id: owner.user.id,
          split_with: [owner.user.id, member.user.id],
          split_ratio: [0.5, 0.5],
          rate_locked_at: now,
          status: "done",
          created_at: now,
          updated_at: now,
        },
      ],
      owner.token,
    );

    await insert(
      "kasa_notifications",
      [
        {
          id: notificationId,
          project_id: projectId,
          entry_id: entryId,
          actor_id: owner.user.id,
          recipients: [member.user.id],
          mode: "open",
          actual_type: "expense",
          title: "Market",
          amount: 1000,
          created_at: now,
        },
      ],
      owner.token,
    );

    const memberProjects = await select("kasa_projects", `?select=id,name,code&id=eq.${projectId}`, member.token);
    const memberEntries = await select("kasa_entries", `?select=id,amount,paid_by_id,split_with,split_ratio&project_id=eq.${projectId}`, member.token);
    const memberNotifications = await select("kasa_notifications", `?select=id,actor_id,recipients,title,amount&project_id=eq.${projectId}`, member.token);
    const ownerNotifications = await select("kasa_notifications", `?select=id&project_id=eq.${projectId}`, owner.token);

    logCheck(memberProjects.length === 1, "ortak proje ikinci kullanicida gorundu");
    logCheck(memberEntries.length === 1, "ortak hareket ikinci kullanicida gorundu");
    logCheck(Number(memberEntries[0].amount) === 1000, "hareket tutari cloud tarafinda dogru");
    logCheck(memberEntries[0].paid_by_id === owner.user.id, "paid_by_id korundu");
    logCheck(Array.isArray(memberEntries[0].split_with) && memberEntries[0].split_with.includes(member.user.id), "split_with ikinci kullaniciyi iceriyor");
    logCheck(Array.isArray(memberEntries[0].split_ratio) && Number(memberEntries[0].split_ratio[1]) === 0.5, "split_ratio cloud tarafinda korundu");
    logCheck(memberNotifications.length === 1, "bildirim ikinci kullaniciya dustu");
    logCheck(memberNotifications[0].recipients.includes(member.user.id), "bildirim alici listesi dogru");
    logCheck(ownerNotifications.length === 1, "aktor bildirim kaydini gorebiliyor");

    console.log("CLOUD LIVE SMOKE PASS");
  } finally {
    try {
      await deleteRows("kasa_projects", `?id=eq.${projectId}`, owner.token);
      console.log("CLEANUP project deleted");
    } catch (error) {
      console.error(`CLEANUP WARNING ${error.message}`);
      process.exitCode = 1;
    }
    for (const item of [credentials.member, credentials.owner]) {
      if (!item.createdByScript) continue;
      try {
        const userId = item.userId || (item.email === credentials.owner.email ? owner.user.id : member.user.id);
        await deleteAuthUser(userId);
        console.log(`CLEANUP auth user deleted ${item.email}`);
      } catch (error) {
        console.error(`CLEANUP AUTH WARNING ${error.message}`);
        process.exitCode = 1;
      }
    }
  }
})().catch((error) => {
  console.error(`CLOUD LIVE SMOKE FAIL ${error.message}`);
  process.exit(1);
});
