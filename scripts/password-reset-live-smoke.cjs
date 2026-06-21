const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const configSource = fs.readFileSync(path.join(root, "cloud-config.js"), "utf8");

function extractConfig(name) {
  const match = configSource.match(new RegExp(`${name}:\\s*"([^"]+)"`));
  return match ? match[1] : "";
}

const supabaseUrl = extractConfig("supabaseUrl").replace(/\/$/, "");
const anonKey = extractConfig("supabaseAnonKey");
const appUrl = extractConfig("appUrl").replace(/\/$/, "");
const email = String(process.env.KASAM_RESET_TEST_EMAIL || "").trim().toLowerCase();

if (!supabaseUrl || !anonKey || !appUrl) {
  console.error("cloud-config.js must contain supabaseUrl, supabaseAnonKey and appUrl.");
  process.exit(2);
}

if (!email) {
  console.error("Password reset live smoke needs KASAM_RESET_TEST_EMAIL.");
  console.error("This proves Supabase accepted the reset request. Inbox delivery must still be checked manually.");
  console.error("Run with prompt: npm run test:password-reset-live:prompt");
  process.exit(2);
}

if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error("KASAM_RESET_TEST_EMAIL is not a valid email address.");
  process.exit(1);
}

async function requestRecover() {
  const redirectTo = `${appUrl}/index.html?mode=reset-password`;
  const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      redirect_to: redirectTo,
    }),
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_error) {
    payload = text;
  }
  if (!response.ok) {
    const message = payload?.message || payload?.error_description || payload?.error || text || response.statusText;
    throw new Error(`${response.status} ${message}`);
  }
  return { status: response.status, redirectTo };
}

requestRecover()
  .then(({ status, redirectTo }) => {
    console.log(`PASS password reset API accepted - status ${status}`);
    console.log(`INFO email: ${email}`);
    console.log(`INFO redirect_to: ${redirectTo}`);
    console.log("INFO This does not prove inbox delivery. Check inbox/spam for the reset email.");
  })
  .catch((error) => {
    console.error(`FAIL password reset API rejected - ${error.message}`);
    process.exit(1);
  });
