const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "cloud-config.js"), "utf8");

function extractConfig(name) {
  const match = source.match(new RegExp(`${name}:\\s*"([^"]+)"`));
  return match ? match[1] : "";
}

const supabaseUrl = extractConfig("supabaseUrl").replace(/\/$/, "");
const anonKey = extractConfig("supabaseAnonKey");

if (!supabaseUrl || !anonKey) {
  console.error("cloud-config.js must contain supabaseUrl and supabaseAnonKey.");
  process.exit(2);
}

async function requestJson(pathname) {
  const response = await fetch(`${supabaseUrl}${pathname}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error_description || payload?.error || text || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }
  return payload;
}

(async () => {
  const settings = await requestJson("/auth/v1/settings");
  const health = await requestJson("/auth/v1/health");

  if (!settings?.external?.email) {
    throw new Error("Supabase email auth provider is disabled");
  }
  if (settings.disable_signup) {
    throw new Error("Supabase signup is disabled");
  }
  if (!health?.version) {
    throw new Error("Supabase auth health response has no version");
  }

  console.log("PASS Supabase auth settings live smoke");
  console.log(`INFO email provider: ${settings.external.email ? "enabled" : "disabled"}`);
  console.log(`INFO signup disabled: ${settings.disable_signup ? "yes" : "no"}`);
  console.log(`INFO mailer autoconfirm: ${settings.mailer_autoconfirm ? "yes" : "no"}`);
  console.log(`INFO GoTrue version: ${health.version}`);
  console.log("INFO This does not prove SMTP inbox delivery.");
})().catch((error) => {
  console.error(`FAIL Supabase auth settings live smoke - ${error.message}`);
  process.exit(1);
});
