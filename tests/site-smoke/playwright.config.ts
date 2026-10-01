import { defineConfig } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    // docs/ をそのまま静的に配信する (GitHub Pages と同じ見え方)
    command: `python3 -m http.server ${PORT} --bind 127.0.0.1 --directory ../../docs`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
  },
});
