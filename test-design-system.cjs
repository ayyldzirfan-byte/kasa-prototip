const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const styles = read("styles.css");
const extra = read("kasa-extra.css");
const index = read("index.html");
const appProduction = read("app-production.js");
const manifest = JSON.parse(read("manifest.webmanifest"));

function hexOutsideTokenDefinitions(css) {
  return css
    .split(/\r?\n/)
    .map((line, index) => ({ line, index: index + 1 }))
    .filter(({ line }) => /#[0-9a-fA-F]{3,8}/.test(line))
    .filter(({ line }) => !/^\s*--[\w-]+:\s*#[0-9a-fA-F]{3,8}\s*;/.test(line));
}

assert(styles.includes("--color-bg: #F4F1EB;"));
assert(styles.includes("--font-base: 'Inter'"));
assert(styles.includes("--font-mono: 'Roboto Mono'"));
assert(styles.includes("--space-5: 20px;"));
assert(styles.includes("--radius-lg: 16px;"));
assert(styles.includes("--duration-normal: 220ms;"));
assert(styles.includes("@media (prefers-color-scheme: dark)"));
assert(styles.includes("min-height: 44px"));
assert(styles.includes("data-lucide") || styles.includes("[data-lucide]"));
assert.match(styles, /\.tab\.active\s*{[\s\S]*background:\s*transparent;/);
assert.match(styles, /\.tab\.active::before\s*{[\s\S]*opacity:\s*1;/);
assert.equal(hexOutsideTokenDefinitions(styles).length, 0, JSON.stringify(hexOutsideTokenDefinitions(styles).slice(0, 5)));
assert.equal(hexOutsideTokenDefinitions(extra).length, 0, JSON.stringify(hexOutsideTokenDefinitions(extra).slice(0, 5)));
assert(!/rgb\(/i.test(styles + extra));

assert(index.includes("fonts.googleapis.com"));
assert(index.includes("family=Inter"));
assert(index.includes("lucide.min.js"));
assert(index.includes('data-lucide="home"'));
assert(index.includes('data-lucide="bar-chart-2"'));

assert(appProduction.includes("function kasamIcon"));
assert(appProduction.includes("function kasamRenderLucide"));
assert(appProduction.includes('data-lucide="${kasamEscape(name)}"'));
assert(appProduction.includes("kasamMovementIcon"));

assert.equal(manifest.name, "Kasam");
assert.equal(manifest.theme_color, "#1A1A18");
assert.equal(manifest.background_color, "#F4F1EB");

console.log("DESIGN SYSTEM TEST OK");
