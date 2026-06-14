const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: { timeout: 5000 },
  use: {
    baseURL: process.env.KASAM_VISUAL_BASE_URL || "https://kasa-prototip.vercel.app",
    browserName: "chromium",
    viewport: { width: 390, height: 844 },
    screenshot: "on",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    ...devices["iPhone 13"],
  },
  outputDir: "screenshots/",
  reporter: [["list"]],
});
