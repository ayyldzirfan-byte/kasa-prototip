const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: Number.parseInt(clean.slice(0, 2), 16) / 255,
    g: Number.parseInt(clean.slice(2, 4), 16) / 255,
    b: Number.parseInt(clean.slice(4, 6), 16) / 255,
  };
}

function channel(value) {
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

assert.doesNotMatch(css, /,\s*@media\b/, "CSS selector list cannot contain @media");
assert.match(css, /:root\[data-theme="light"\]/, "explicit light theme variables must exist");
assert.match(css, /:root\[data-theme="dark"\]/, "explicit dark theme variables must exist");
assert.match(css, /:root:not\(\[data-theme="light"\]\)\s+\{[\s\S]*--overlay-white-92:\s*hsl\(45 5% 15% \/ 0\.92\)/, "system dark mode must darken legacy white overlays");
assert.ok(contrast("#F4F1EB", "#1A1A18") >= 7, "light mode body contrast should be AAA-level");
assert.ok(contrast("#FFFFFF", "#1A1A18") >= 7, "light mode card contrast should be AAA-level");
assert.ok(contrast("#141412", "#F0EDE6") >= 7, "dark mode body contrast should be AAA-level");
assert.ok(contrast("#1E1E1C", "#F0EDE6") >= 7, "dark mode card contrast should be AAA-level");
assert.ok(contrast("#2A2A28", "#F0EDE6") >= 7, "dark mode input contrast should be AAA-level");

console.log("THEME CONTRAST TEST OK");
