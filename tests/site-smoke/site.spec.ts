import { expect, test, type Page } from "@playwright/test";

const pages = ["index.html", "faq.html", "privacy.html"];
const langs = ["ja", "en"] as const;
const themes = ["light", "dark"] as const;
const widths = [1280, 390];

// 言語・テーマは localStorage で決める (docs/site.js と同じキー)
async function seed(page: Page, lang: string, theme: string) {
  await page.addInitScript(
    ([l, t]) => {
      localStorage.setItem("firnplanner-lang", l);
      localStorage.setItem("firnplanner-theme", t);
    },
    [lang, theme],
  );
}

for (const file of pages) {
  for (const lang of langs) {
    for (const theme of themes) {
      for (const width of widths) {
        test(`${file} ${lang} ${theme} ${width}px`, async ({ page, baseURL }) => {
          const errors: string[] = [];
          page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
          page.on("console", (m) => {
            if (m.type() === "error") errors.push(`console: ${m.text()}`);
          });
          // analytics.js が読む Google の外部スクリプトは、テスト環境 (CI や
          // オフライン) で失敗しうる。サイト自身の不具合ではないので、外部への通信は
          // 空の 200 で返す (abort すると「読み込み失敗」がコンソールエラーになる)。
          await page.route(
            (url) => url.origin !== baseURL,
            (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
          );

          await page.setViewportSize({ width, height: 800 });
          await seed(page, lang, theme);
          await page.goto(`/${file}`);

          await expect(page.locator("html")).toBeVisible();
          await expect(page.locator("body")).toBeVisible();
          expect(await page.locator("html").evaluate((e) => getComputedStyle(e).display)).not.toBe("none");
          expect(await page.locator("body").evaluate((e) => getComputedStyle(e).display)).not.toBe("none");
          await expect(page.locator("html")).toHaveAttribute("data-lang", lang);
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

          const other = lang === "ja" ? "en" : "ja";
          const h1 = page.locator("h1:visible");
          await expect(h1).toHaveCount(1);
          await expect(h1.locator(`span[lang="${lang}"]:visible`)).toHaveCount(1);
          await expect(h1.locator(`span[lang="${other}"]:visible`)).toHaveCount(0);

          if (file === "index.html") {
            await expect(page.locator('[data-analytics="download"]:visible').first()).toBeVisible();
          }

          expect(errors).toEqual([]);
        });
      }
    }
  }
}

// 同じサイト内のリンクと画像が 200 を返す (外部リンクは CI で不安定なので見ない)
for (const file of pages) {
  test(`${file} internal links and images`, async ({ page, request, baseURL }) => {
    await page.route(
      (url) => url.origin !== baseURL,
      (route) => route.fulfill({ status: 200, contentType: "text/javascript", body: "" }),
    );
    await page.goto(`/${file}`);
    const refs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[href], [src]")).map(
        (e) => e.getAttribute("href") ?? e.getAttribute("src") ?? "",
      ),
    );
    const targets = new Set<string>();
    for (const ref of refs) {
      if (!ref || ref.startsWith("#") || /^(mailto:|tel:|data:|javascript:)/.test(ref)) continue;
      const url = new URL(ref, `${baseURL}/${file}`);
      if (url.origin !== new URL(baseURL!).origin) continue;
      targets.add(url.pathname);
    }
    expect(targets.size).toBeGreaterThan(0);
    for (const path of targets) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
    }
  });
}
