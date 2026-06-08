const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

const index = read("index.html");
const appProduction = read("app-production.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const sw = read("sw.js");

assert.equal(manifest.name, "Kasam");
assert.equal(manifest.short_name, "Kasam");
assert.equal(manifest.display, "standalone");
assert.equal(manifest.orientation, "portrait");
assert.equal(manifest.theme_color, "#1A1A18");
assert.equal(manifest.background_color, "#F4F1EB");
assert(manifest.icons.some((icon) => icon.purpose === "maskable"));
assert(index.includes('property="og:title" content="Kasam"'));
assert(index.includes('property="og:image" content="./icon-512.png"'));
assert(index.includes('meta name="apple-mobile-web-app-capable"'));
assert(index.includes("<title>Kasam</title>"));

assert(appProduction.includes("Kasam'a hoş geldin"));
assert(appProduction.includes("Paranın nereye gittiğini artık bileceksin."));
assert(appProduction.includes("Demoyu keşfet"));
assert(appProduction.includes("Gizlilik politikasını ve kullanım şartlarını okudum"));
assert(appProduction.includes("deleteMyAccount"));
assert(appProduction.includes("exportMyData"));
assert(!appProduction.includes("console.log("));

["404.html", "robots.txt", "_redirects", "_headers", "gizlilik.html", "sartlar.html", "sitemap.xml"].forEach((file) => assert(exists(file), file));
assert(read("_redirects").includes("/* /index.html 200"));
assert(read("robots.txt").includes("Sitemap:"));
assert(sw.includes("./sitemap.xml"));

console.log("PWA TEST OK");
