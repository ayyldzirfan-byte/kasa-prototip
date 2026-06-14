const fs = require("fs");
const path = require("path");

const root = __dirname;
const appFiles = [
  "index.html",
  "styles.css",
  "kasam-ui-fixes.css",
  "app-state.js",
  "app-core.js",
  "app-views.js",
  "app-bind.js",
  "app-model.js",
  "app-cloud.js",
  "app-blocks.js",
  "app-product-pass.js",
  "app-production.js",
  "app-sounds.js",
  "app-game-v2.js",
  "app-ui-fixes.js",
  "app-test-scenarios.js",
  "app-init.js",
].filter((file) => fs.existsSync(path.join(root, file)));

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function lines(file) {
  return read(file).split(/\r?\n/);
}

function fail(file, line, message) {
  return { file, line, message };
}

function stripRootBlocks(css) {
  return css.replace(/:root(?:\[[^\]]+\])?\s*\{[\s\S]*?\n\}/g, "");
}

function cssBlocks(css, selector) {
  const blocks = [];
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}[^\\{]*\\{([\\s\\S]*?)\\}`, "g");
  let match;
  while ((match = regex.exec(css))) blocks.push(match[1]);
  return blocks;
}

function sourceLine(file, index) {
  return read(file).slice(0, index).split(/\r?\n/).length;
}

function checkRule001() {
  const failures = [];
  ["styles.css", "kasam-ui-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).forEach((file) => {
    const css = read(file);
    const blockRegex = /([^{]+)\{([^{}]*)\}/g;
    let match;
    while ((match = blockRegex.exec(css))) {
      const body = match[2];
      const hasYellowBg = /background(?:-color)?:\s*(var\(--(?:color-accent|yellow)\)|var\(--color-warning-bg\)|var\(--yellow-soft\))/i.test(body);
      const hasWhiteText = /color:\s*(#fff(?:fff)?|white|var\(--color-on-dark\)|var\(--color-on-primary\))/i.test(body);
      if (hasYellowBg && hasWhiteText) failures.push(fail(file, sourceLine(file, match.index), "Sarı zemin üzerinde beyaz yazı kullanılıyor."));
    }
  });
  return failures;
}

function checkRule002() {
  const css = ["styles.css", "kasam-ui-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).map(read).join("\n");
  const blocks = cssBlocks(css, ".toast");
  const ok = blocks.some((block) => /background:\s*var\(--color-text-primary\)/.test(block) && /color:\s*(var\(--color-on-dark\)|#fff|#FFFFFF|white)/i.test(block));
  return ok ? [] : [fail("styles.css", 1, "Toast koyu zemin ve beyaz yazı kuralını karşılamıyor.")];
}

function checkRule003() {
  const failures = [];
  ["styles.css", "kasam-ui-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).forEach((file) => {
    let rootDepth = 0;
    let pendingRoot = false;
    lines(file).forEach((line, index) => {
      if (/:root(?:\[[^\]]+\])?\s*\{/.test(line)) {
        pendingRoot = true;
        rootDepth = 0;
      }
      if (pendingRoot) {
        rootDepth += (line.match(/\{/g) || []).length;
        rootDepth -= (line.match(/\}/g) || []).length;
      }
      const insideRoot = pendingRoot && rootDepth > 0;
      if (!insideRoot && /#[0-9a-fA-F]{3,8}\b/.test(line) && !/^\s*--/.test(line)) {
        failures.push(fail(file, index + 1, "CSS token dışında hardcode hex renk var."));
      }
      if (pendingRoot && rootDepth <= 0) pendingRoot = false;
    });
  });
  return failures;
}

function checkRule004() {
  const css = ["styles.css", "kasam-ui-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).map(read).join("\n");
  const required = ["--color-income", "--color-expense", "--color-pending"];
  return required.every((token) => css.includes(token)) ? [] : [fail("styles.css", 1, "Gelir/gider/bekleyen renk tokenları eksik.")];
}

function checkRule007() {
  const js = appFiles.filter((file) => file.endsWith(".js")).map(read).join("\n");
  return /function\s+money|money\s*=/.test(js) && /Intl\.NumberFormat\(["']tr-TR["']/.test(js)
    ? []
    : [fail("app-model.js", 1, "money() Türkçe Intl.NumberFormat kullanmalı.")];
}

function checkRule008() {
  const html = read("index.html");
  const tabbar = html.match(/<nav class="tabbar"[\s\S]*?<\/nav>/)?.[0] || "";
  const hasLucide = ["home", "list", "layers", "calendar", "bar-chart-2"].every((icon) => tabbar.includes(`data-lucide="${icon}"`));
  const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(tabbar);
  const failures = [];
  if (!hasLucide) failures.push(fail("index.html", 1, "Tab bar Lucide ikonları eksik."));
  if (hasEmoji) failures.push(fail("index.html", 1, "Tab bar sistem ikonunda emoji var."));
  return failures;
}

function checkRule011() {
  const banned = ["Giren", "Çıkan", "Bulut senkron"];
  const failures = [];
  appFiles.forEach((file) => {
    lines(file).forEach((line, index) => {
      banned.forEach((word) => {
        if (line.includes(word)) failures.push(fail(file, index + 1, `Standart dışı ifade: ${word}`));
      });
    });
  });
  return failures;
}

function checkRule012() {
  const banned = ["Mükemmel!", "Harika!", "Tabii ki!", "İşleminiz gerçekleştirildi"];
  const failures = [];
  appFiles.forEach((file) => {
    lines(file).forEach((line, index) => {
      banned.forEach((word) => {
        if (line.includes(word)) failures.push(fail(file, index + 1, `Yapay zeka dili: ${word}`));
      });
    });
  });
  return failures;
}

function checkRule015() {
  const html = read("index.html");
  const labels = ["Ana ekran", "Hareketler", "Bütçeler", "Takvim", "Rapor"];
  const icons = ["home", "list", "layers", "calendar", "bar-chart-2"];
  const failures = [];
  labels.forEach((label) => {
    if (!html.includes(label)) failures.push(fail("index.html", 1, `Tab etiketi eksik: ${label}`));
  });
  icons.forEach((icon) => {
    if (!html.includes(`data-lucide="${icon}"`)) failures.push(fail("index.html", 1, `Tab ikonu eksik: ${icon}`));
  });
  return failures;
}

function checkRule018() {
  const secretPatterns = [
    /sk-ant-[A-Za-z0-9_-]{16,}/,
    /service_role["'\s:=]+[A-Za-z0-9_.-]{20,}/i,
    /GIPHY_API_KEY\s*=\s*["'][^"']+["']/,
    /ANTHROPIC_API_KEY\s*=\s*["'][^"']+["']/,
  ];
  const failures = [];
  appFiles.concat(["api/kasa-giphy-search.js", "netlify/functions/kasa-giphy-search.js"]).filter((file) => fs.existsSync(path.join(root, file))).forEach((file) => {
    lines(file).forEach((line, index) => {
      secretPatterns.forEach((pattern) => {
        if (pattern.test(line)) failures.push(fail(file, index + 1, "Frontend veya kaynak dosyada gizli API anahtarı görünüyor."));
      });
    });
  });
  return failures;
}

function checkRule019() {
  const js = appFiles.filter((file) => file.endsWith(".js")).map(read).join("\n");
  const failures = [];
  if (!/kasamCleanText|DOMPurify|kasamSafe/.test(js)) failures.push(fail("app-production.js", 1, "Sanitizasyon yardımcıları bulunamadı."));
  if (!/parseAmount[\s\S]*amount < 0|negative|< 0 \? 0/.test(js)) failures.push(fail("app-production.js", 1, "Negatif tutar engelleme izi bulunamadı."));
  return failures;
}

const checks = [
  ["KURAL-001", checkRule001],
  ["KURAL-002", checkRule002],
  ["KURAL-003", checkRule003],
  ["KURAL-004", checkRule004],
  ["KURAL-007", checkRule007],
  ["KURAL-008", checkRule008],
  ["KURAL-011", checkRule011],
  ["KURAL-012", checkRule012],
  ["KURAL-015", checkRule015],
  ["KURAL-018", checkRule018],
  ["KURAL-019", checkRule019],
];

let passed = 0;
let failed = 0;

for (const [id, fn] of checks) {
  const result = fn();
  if (!result.length) {
    passed += 1;
    console.log(`✓ ${id}`);
    continue;
  }
  failed += 1;
  result.forEach((item) => console.log(`✗ ${id} — ${item.file}:${item.line} — ${item.message}`));
}

console.log(`${checks.length} kural, ${passed} geçti, ${failed} başarısız`);
if (failed > 0) process.exit(1);
