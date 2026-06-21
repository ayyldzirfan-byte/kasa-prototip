const fs = require("fs");
const path = require("path");

const root = __dirname;
const outDir = path.join(root, "public");

const files = [
  "404.html",
  "app-bind.js",
  "app-blocks.js",
  "app-cloud.js",
  "app-core.js",
  "app-critical-fixes.js",
  "app-game-v2.js",
  "app-init.js",
  "app-model.js",
  "app-product-pass.js",
  "app-production.js",
  "app-sounds.js",
  "app-state.js",
  "app-test-scenarios.js",
  "app-ui-fixes.js",
  "app-views.js",
  "apple-touch-icon.png",
  "cloud-config.js",
  "gizlilik.html",
  "icon-16.png",
  "icon-192.png",
  "icon-32.png",
  "icon-512.png",
  "icon-maskable-192.png",
  "icon-maskable-512.png",
  "icon.svg",
  "index.html",
  "kasa-extra.css",
  "kasam-simulator.html",
  "kasam-critical-fixes.css",
  "kasam-ui-fixes.css",
  "manifest.webmanifest",
  "robots.txt",
  "sartlar.html",
  "sitemap.xml",
  "styles.css",
  "sw.js",
  "_headers",
  "_redirects",
  "vercel.json"
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of files) {
  const from = path.join(root, file);
  const to = path.join(outDir, file);
  if (!fs.existsSync(from)) {
    throw new Error(`Build dosyasi bulunamadi: ${file}`);
  }
  fs.copyFileSync(from, to);
}

console.log(`public klasoru hazir: ${files.length} dosya`);
