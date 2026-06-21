const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { runCdpTest } = require("./scripts/cdp-test-harness.cjs");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const css = read("styles.css") + "\n" + read("kasa-extra.css");
const app = read("app-production.js");
const html = read("index.html");

const cssWithoutTokenBlocks = css
  .replace(/:root[^{]*\s*{[\s\S]*?}\s*/g, "")
  .replace(/@media\s*\(prefers-color-scheme:\s*dark\)\s*{\s*:root[^{]*\s*{[\s\S]*?}\s*}/g, "");

assert(!/(#[0-9a-fA-F]{3,8}|rgb\()/.test(cssWithoutTokenBlocks), "CSS token disi hardcode renk var");
assert(!/(Mükemmel|Harika|Tabii ki|İşleminiz|Lütfen|giriniz|yazalım|seçelim|bağlayalım)/.test(app + html), "AI/resmi kalip kaldi");
assert(app.includes("kasamIcon(\"home\"") || html.includes('data-lucide="home"'), "Lucide nav home yok");

runCdpTest({ root, port: 4185, cdpPort: 9385 }, async ({ page, localBase }) => {
  for (const colorScheme of ["light", "dark"]) {
    await page.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-color-scheme", value: colorScheme }],
    });
    await page.goto(`${localBase}/index.html?v=final-audit-${colorScheme}`);
    await page.eval(`() => localStorage.clear()`);
    await page.goto(`${localBase}/index.html?v=final-audit-${colorScheme}-clean`);
    await page.waitForSelector("button[data-action='demo-start']");
    await page.click("button[data-action='demo-start']");
    await page.waitFor(`document.body.dataset.view === "home" && (document.querySelector("#app")?.textContent || "").length > 100`, 12000);
    const metrics = await page.eval(`() => {
      const visibleButtons = Array.from(document.querySelectorAll("button, a")).filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== "hidden";
      });
      const tooSmall = visibleButtons
        .map((el) => ({ text: el.textContent.trim().slice(0, 40), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height }))
        .filter((item) => item.width < 44 || item.height < 44);
      const style = getComputedStyle(document.body);
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        background: style.backgroundColor,
        color: style.color,
        tooSmall,
      };
    }`);
    assert(metrics.scrollWidth <= metrics.innerWidth + 1, `${colorScheme} 375px yatay tasma var`);
    assert(metrics.background && metrics.color, `${colorScheme} renk hesaplanamadi`);
    assert.deepEqual(metrics.tooSmall, [], `${colorScheme} 44px alti dokunma alani var`);
  }
  console.log("FINAL AUDIT TEST OK");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
