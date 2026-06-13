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
const tabViews = [...index.matchAll(/<button class="tab(?: active)?" data-view="([^"]+)"/g)].map((match) => match[1]);

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
assert(styles.includes("/* Emergency five-tab override */"));
assert.match(styles, /\/\* Emergency five-tab override \*\/[\s\S]*\.tabbar\s*{[\s\S]*display:\s*flex;/);
assert.match(styles, /\/\* Emergency five-tab override \*\/[\s\S]*\.tabbar\s*{[\s\S]*grid-template-columns:\s*none;/);
assert.match(styles, /body\[data-view="add"\]\s+\.tabbar,[\s\S]*body\[data-view="onboarding"\]\s+\.tabbar\s*{[\s\S]*display:\s*flex;/);
assert.match(styles, /\.tab\s*{[\s\S]*flex:\s*1 1 0;/);
assert.match(styles, /\.tab\s*{[\s\S]*min-width:\s*0;/);
assert.match(styles, /\.tab span\s*{[\s\S]*display:\s*none;/);
assert.match(styles, /\.tab\.active span\s*{[\s\S]*display:\s*block;/);
assert.equal(hexOutsideTokenDefinitions(styles).length, 0, JSON.stringify(hexOutsideTokenDefinitions(styles).slice(0, 5)));
assert.equal(hexOutsideTokenDefinitions(extra).length, 0, JSON.stringify(hexOutsideTokenDefinitions(extra).slice(0, 5)));
assert(!/rgb\(/i.test(styles + extra));

assert(index.includes("fonts.googleapis.com"));
assert(index.includes("family=Inter"));
assert(index.includes("lucide.min.js"));
assert(index.includes('data-lucide="home"'));
assert(index.includes('data-view="home"'));
assert(index.includes('data-view="movements"'));
assert(index.includes('data-view="group"'));
assert(index.includes('data-view="calendar"'));
assert(index.includes('data-view="report"'));
assert(index.includes('data-lucide="bar-chart-2"'));
assert.deepEqual(tabViews, ["home", "movements", "group", "calendar", "report"]);
assert.equal(tabViews.length, 5);
assert(index.includes("<span>Kasam</span>"));
assert(index.includes("<span>Hareketler</span>"));
assert(index.includes("<span>Bütçeler</span>"));
assert(index.includes("<span>Takvim</span>"));
assert(index.includes("<span>Rapor</span>"));

assert(appProduction.includes("function kasamIcon"));
assert(appProduction.includes("function kasamRenderLucide"));
assert(appProduction.includes('data-lucide="${kasamEscape(name)}"'));
assert(appProduction.includes("kasamMovementIcon"));

assert.equal(manifest.name, "Kasam");
assert.equal(manifest.theme_color, "#1A1A18");
assert.equal(manifest.background_color, "#F4F1EB");

console.log("DESIGN SYSTEM TEST OK");
