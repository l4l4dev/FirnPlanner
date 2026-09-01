// FirnPlanner ダウンロードサイト共通スクリプト。
// - 言語 (ja / en) とテーマ (light / dark) の切り替え
// - どちらも localStorage に記憶し、次回訪問時に復元する
// - 既定値: 言語はブラウザの言語、テーマは prefers-color-scheme
(function () {
  "use strict";

  var LANG_KEY = "firnplanner-lang";
  var THEME_KEY = "firnplanner-theme";
  var root = document.documentElement;

  function detectLang() {
    var nav = (navigator.language || "en").toLowerCase();
    return nav.indexOf("ja") === 0 ? "ja" : "en";
  }

  function detectTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function readStored(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeStored(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // localStorage が使えない環境 (プライベートブラウズ等) は無視して続行する
    }
  }

  function updateToggle(groupSelector, activeValue, attr) {
    var buttons = document.querySelectorAll(groupSelector + " [" + attr + "]");
    buttons.forEach(function (btn) {
      var isOn = btn.getAttribute(attr) === activeValue;
      btn.classList.toggle("on", isOn);
      btn.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
  }

  function applyLang(lang, animate) {
    var body = document.querySelector(".copy");
    function commit() {
      root.setAttribute("data-lang", lang);
      updateToggle(".lang-toggle", lang, "data-set-lang");
      if (body) {
        body.style.opacity = "1";
      }
    }
    if (animate && body) {
      body.style.opacity = "0";
      window.setTimeout(commit, 180);
    } else {
      commit();
    }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    updateToggle(".theme-toggle", theme, "data-set-theme");
  }

  function setLang(lang, animate) {
    writeStored(LANG_KEY, lang);
    applyLang(lang, animate);
  }

  function setTheme(theme) {
    writeStored(THEME_KEY, theme);
    applyTheme(theme);
  }

  // FAQ ページ (docs/faq.html) の <details id="q..."> を URL のハッシュ
  // (#q-storage 等) に合わせて開く。ハッシュが details 以外を指すとき・
  // 対象が無いときは何もしない。
  function openHashDetails() {
    var id = window.location.hash.slice(1);
    if (!id) return;
    try {
      var target = document.getElementById(id);
      if (target && target.tagName === "DETAILS") {
        target.open = true;
      }
    } catch (e) {}
  }

  function init() {
    var storedLang = readStored(LANG_KEY);
    var storedTheme = readStored(THEME_KEY);
    applyLang(storedLang || detectLang(), false);
    applyTheme(storedTheme || detectTheme(), false);

    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-set-lang"), true);
      });
    });
    document.querySelectorAll("[data-set-theme]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTheme(btn.getAttribute("data-set-theme"));
      });
    });

    openHashDetails();
    window.addEventListener("hashchange", openHashDetails);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
