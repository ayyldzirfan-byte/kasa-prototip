const fs = require("fs");
const path = require("path");

const root = __dirname;
const appFiles = [
  "index.html",
  "styles.css",
  "kasam-ui-fixes.css",
  "kasam-critical-fixes.css",
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
  "app-critical-fixes.js",
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
  ["styles.css", "kasam-ui-fixes.css", "kasam-critical-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).forEach((file) => {
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
  const css = ["styles.css", "kasam-ui-fixes.css", "kasam-critical-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).map(read).join("\n");
  const blocks = cssBlocks(css, ".toast");
  const ok = blocks.some((block) => /background:\s*var\(--color-text-primary\)/.test(block) && /color:\s*(var\(--color-on-dark\)|#fff|#FFFFFF|white)/i.test(block));
  return ok ? [] : [fail("styles.css", 1, "Toast koyu zemin ve beyaz yazı kuralını karşılamıyor.")];
}

function checkRule003() {
  const failures = [];
  ["styles.css", "kasam-ui-fixes.css", "kasam-critical-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).forEach((file) => {
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
  const css = ["styles.css", "kasam-ui-fixes.css", "kasam-critical-fixes.css"].filter((file) => fs.existsSync(path.join(root, file))).map(read).join("\n");
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
  const banned = ["Giren", "Çıkan", "Bulut senkron", "Henüz sürpriz yok"];
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

function checkRule039() {
  const failures = [];
  appFiles.filter((file) => file.endsWith(".js")).forEach((file) => {
    const text = read(file);
    const isAddFlow = /renderAdd|handleEntrySubmit|entry-form|add-entry/.test(text);
    const repeatsGameSetup = /(AŞAMA|Aşama)\s*[123]\s*[—-]|Kim ekledi\?\s*[\s\S]{0,120}Gelir mi gider mi\?\s*[\s\S]{0,120}Ne harcaması\?/.test(text);
    if (isAddFlow && repeatsGameSetup) {
      failures.push(fail(file, 1, "Hareket ekleme ekraninda oyun asamalari tekrar kurulmus; bilgi hareketten turetilmeli ve ekran kompakt kalmali."));
    }
  });
  const rules = fs.existsSync(path.join(root, "KASAM-RULES.md")) ? read("KASAM-RULES.md") : "";
  if (!rules.includes("KURAL-039")) failures.push(fail("KASAM-RULES.md", 1, "Ekran kalabaligi kural kaydi eksik."));
  return failures;
}

function checkRule052() {
  const failures = [];
  if (fs.existsSync(path.join(root, "netlify-upload"))) {
    failures.push(fail("netlify-upload", 1, "Eski Netlify/prototip kopyasi repoda tutulamaz; tek canonical Vercel uygulamasi kalmali."));
  }
  if (fs.existsSync(path.join(root, "app.js"))) {
    failures.push(fail("app.js", 1, "Yuklenmeyen eski monolit bundle repoda tutulamaz; aktif moduler dosyalar canonical kaynaktir."));
  }
  ["build-public.cjs", "sw.js", "index.html"].filter((file) => fs.existsSync(path.join(root, file))).forEach((file) => {
    lines(file).forEach((line, index) => {
      if (/app\.js/.test(line)) failures.push(fail(file, index + 1, "Eski app.js bundle referansi canonical build/cache icinde kalamaz."));
      if (/netlify-upload|radiant-squirrel|kasa-prototip\.netlify/.test(line)) failures.push(fail(file, index + 1, "Eski prototip/Netlify referansi canonical uygulamada kalamaz."));
    });
  });
  return failures;
}

function checkRule053() {
  const failures = [];
  const vercelPath = path.join(root, "vercel.json");
  const packagePath = path.join(root, "package.json");
  if (!fs.existsSync(vercelPath)) {
    failures.push(fail("vercel.json", 1, "Vercel build ayari bulunmali."));
    return failures;
  }
  if (!fs.existsSync(packagePath)) {
    failures.push(fail("package.json", 1, "Vercel build scriptleri package.json icinde bulunmali."));
    return failures;
  }
  const vercel = JSON.parse(read("vercel.json"));
  const pkg = JSON.parse(read("package.json"));
  if (vercel.buildCommand !== "npm run vercel-build") {
    failures.push(fail("vercel.json", 1, "Vercel production build sadece `npm run vercel-build` calistirmali."));
  }
  const script = pkg.scripts && pkg.scripts["vercel-build"];
  if (script !== "node build-public.cjs") {
    failures.push(fail("package.json", 1, "`vercel-build` sadece static public paketini uretmeli."));
  }
  if (/run-all-tests|kasam-lint|test:|check:ready/.test(String(script || ""))) {
    failures.push(fail("package.json", 1, "Vercel deploy build komutu local test/lint kapilarini calistirmamali."));
  }
  return failures;
}

function listFilesRecursive(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  const result = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...listFilesRecursive(fullPath, predicate));
      return;
    }
    if (!predicate || predicate(fullPath)) result.push(fullPath);
  });
  return result;
}

function checkRule025_GorselDogrulama() {
  const screenshotsDir = path.join(root, "screenshots");
  const images = listFilesRecursive(screenshotsDir, (file) => /\.(png|jpg|jpeg|webp)$/i.test(file));
  const failures = [];
  if (!fs.existsSync(screenshotsDir)) failures.push(fail("screenshots", 1, "KURAL-025: Gorsel dogrulama eksik - screenshots klasoru yok."));
  if (fs.existsSync(screenshotsDir) && images.length < 5) failures.push(fail("screenshots", 1, "KURAL-025: Gorsel dogrulama eksik - en az 5 ekran goruntusu yok."));
  return failures;
}

function checkRule026_PlaywrightTestGuncel() {
  const specPath = path.join(root, "tests", "visual-rules.spec.js");
  const failures = [];
  if (!fs.existsSync(specPath)) return [fail("tests/visual-rules.spec.js", 1, "KURAL-026: Playwright gorsel test dosyasi yok.")];
  const renderNames = new Set();
  appFiles.filter((file) => file.endsWith(".js")).forEach((file) => {
    const text = read(file);
    const regex = /\b(?:function\s+|(?:const|let|var)\s+|^)(render[A-Z][A-Za-z0-9_]*)/gm;
    let match;
    while ((match = regex.exec(text))) renderNames.add(match[1]);
  });
  const spec = fs.readFileSync(specPath, "utf8");
  const testCount = (spec.match(/\btest\(/g) || []).length;
  if (testCount < Math.ceil(renderNames.size * 0.5)) {
    failures.push(fail("tests/visual-rules.spec.js", 1, `KURAL-026: Bazi ekranlar icin gorsel test eksik. render=${renderNames.size}, test=${testCount}`));
  }
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
  ["KURAL-039", checkRule039],
  ["KURAL-052", checkRule052],
  ["KURAL-053", checkRule053],
];

const warnChecks = [
  ["KURAL-025", checkRule025_GorselDogrulama],
  ["KURAL-026", checkRule026_PlaywrightTestGuncel],
];

let passed = 0;
let failed = 0;
let warned = 0;

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
for (const [id, fn] of warnChecks) {
  const result = fn();
  if (!result.length) {
    console.log(`âœ“ ${id}`);
    continue;
  }
  warned += result.length;
  result.forEach((item) => console.log(`WARN ${id} - ${item.file}:${item.line} - ${item.message}`));
}

console.log(`UyarÄ±: ${warned}`);
if (failed > 0) process.exit(1);
