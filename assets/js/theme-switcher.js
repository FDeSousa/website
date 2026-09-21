(function () {
  "use strict";

  if (!/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;

  var THEMES = [
    "default",
    "neon", "neon-orange", "neon-green", "neon-yellow", "neon-cyan",
    "paper", "poster"
  ];
  var LABELS = {
    "default": "default",
    "neon": "neon·pink",
    "neon-orange": "neon·orange",
    "neon-green": "neon·green",
    "neon-yellow": "neon·yellow",
    "neon-cyan": "neon·cyan",
    "paper": "paper",
    "poster": "poster"
  };
  var STORAGE_KEY = "preview-theme";
  var params = new URLSearchParams(location.search);
  var requested = params.get("theme");

  var stylesheetEl = document.querySelector('link[rel="stylesheet"][href*="/assets/main.css"]');

  function apply(theme) {
    if (!stylesheetEl) return;
    var base = stylesheetEl.href.split("/assets/")[0];
    stylesheetEl.href = theme === "default"
      ? base + "/assets/main.css"
      : base + "/assets/themes/" + theme + ".css";
    document.documentElement.setAttribute("data-preview-theme", theme);
  }

  var theme = THEMES.indexOf(requested) >= 0 ? requested : sessionStorage.getItem(STORAGE_KEY) || "default";
  if (requested && THEMES.indexOf(requested) >= 0) sessionStorage.setItem(STORAGE_KEY, requested);
  if (theme !== "default") apply(theme);

  var bar = document.createElement("div");
  bar.style.cssText =
    "position:fixed;left:12px;bottom:12px;z-index:9999;background:#fff;border:1px solid #999;" +
    "border-radius:6px;padding:6px 8px;font:12px ui-monospace,Menlo,monospace;box-shadow:0 2px 8px rgba(0,0,0,.25);display:flex;gap:6px;align-items:center;";
  var label = document.createElement("span");
  label.textContent = "theme:";
  label.style.color = "#666";
  bar.appendChild(label);

  function mark(current) {
    bar.querySelectorAll("button").forEach(function (b) {
      b.style.fontWeight = b.dataset.theme === current ? "700" : "400";
      b.style.textDecoration = b.dataset.theme === current ? "underline" : "none";
    });
  }

  THEMES.forEach(function (t) {
    var b = document.createElement("button");
    b.textContent = LABELS[t] || t;
    b.dataset.theme = t;
    b.style.cssText = "border:none;background:none;padding:2px 6px;cursor:pointer;color:#111;font:inherit;";
    b.addEventListener("click", function () {
      sessionStorage.setItem(STORAGE_KEY, t);
      apply(t);
      mark(t);
    });
    bar.appendChild(b);
  });

  document.body.appendChild(bar);
  mark(theme);
})();
