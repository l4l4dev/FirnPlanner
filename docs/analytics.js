// FirnPlanner 配布サイトのアクセス解析 (Google アナリティクス 4)。
// - Cookie は使わない: gtag('config', ...) に client_storage: 'none' を渡す
// - 測定 ID はこのファイルのこの 1 か所だけに書く (公開される値なので秘密ではない)
// - 見るもの: ページビュー、「最新版をダウンロード」「不具合報告・要望」のクリック、言語・テーマ切替
(function () {
  "use strict";

  var MEASUREMENT_ID = "G-JQ370L8PWN";

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;

  // 広告系の保存は使わない (同意モード既定 denied)。analytics_storage は denied に
  // **しない** — denied にすると gtag は「モデリング用の ping」しか送らず、規模の小さい
  // サイトではレポートにもリアルタイムにも一切出ない (1 日 1000 イベント × 7 日が閾値)。
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  gtag("js", new Date());
  // Cookie を使わないのは client_storage: "none" で実現する。gtag は Cookie を作らず、
  // ページ読み込みごとに匿名の ID を使う。失うのは「同じ人が戻ってきたか」だけ。
  gtag("config", MEASUREMENT_ID, { client_storage: "none", anonymize_ip: true });

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(script);

  function current(attr) {
    return document.documentElement.getAttribute(attr) || "";
  }

  function closest(el, selector) {
    return el && el.closest ? el.closest(selector) : null;
  }

  // 「最新版をダウンロード」「不具合報告・要望」ボタン: data-analytics 属性で拾う。
  // site.js のイベント処理は汚さない。
  document.addEventListener("click", function (event) {
    var target = closest(event.target, "[data-analytics]");
    if (!target) return;
    var name = target.getAttribute("data-analytics");
    if (name === "download") {
      gtag("event", "click_download", { lang: current("data-lang"), theme: current("data-theme") });
    } else if (name === "issues") {
      gtag("event", "click_issues", { lang: current("data-lang"), theme: current("data-theme") });
    }
  });

  // 言語・テーマの切り替えボタン (index.html / privacy.html 共通のヘッダー)。
  document.addEventListener("click", function (event) {
    var langBtn = closest(event.target, "[data-set-lang]");
    if (langBtn) {
      gtag("event", "toggle_lang", { lang: langBtn.getAttribute("data-set-lang") });
      return;
    }
    var themeBtn = closest(event.target, "[data-set-theme]");
    if (themeBtn) {
      gtag("event", "toggle_theme", { theme: themeBtn.getAttribute("data-set-theme") });
    }
  });
})();
