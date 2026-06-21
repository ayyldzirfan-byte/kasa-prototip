import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3100",
    viewport: { width: 390, height: 844 },
    screenshot: "on",
    video: "retain-on-failure"
  },
  webServer: {
    command: `"${process.execPath}" ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100`,
    url: "http://127.0.0.1:3100",
    reuseExistingServer: true,
    timeout: 120000
  },
  outputDir: "../screenshots/commercial-playwright"
});
