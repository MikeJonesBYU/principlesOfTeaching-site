/* Teacher Development Skills — internationalization bootstrap.
   Resolves the active language from the ?lang= query param, loads the matching
   content bundle (skills-data / descriptions) and UI strings from
   assets/lang/<code>/, localizes the static page chrome, renders the language
   switcher, then dispatches "tds:ready" so the page scripts can render.

   Add a language by dropping assets/lang/<code>/{skills-data,descriptions,strings}.js
   in place and registering it in LANGS below. Nothing else needs to change. */
(function () {
  "use strict";

  // Registry of supported languages. `code` matches the church site's lang= value
  // and the assets/lang/<code>/ folder; `html` is the BCP-47 tag for <html lang>.
  var LANGS = [
    { code: "eng", html: "en", label: "English" },
    { code: "spa", html: "es", label: "Español" }
  ];
  var DEFAULT = "eng";

  function known(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return null;
  }

  function resolveLang() {
    var q = null;
    try { q = new URLSearchParams(location.search).get("lang"); } catch (e) {}
    return known(q) ? q : DEFAULT;
  }

  var lang = resolveLang();
  var meta = known(lang);
  document.documentElement.lang = meta.html;

  // Which bundles does this page need? Pages set window.TDS_CONFIG before loading us.
  var cfg = window.TDS_CONFIG || {};
  var needs = cfg.needs || ["data", "strings"];
  var FILES = { data: "skills-data.js", desc: "descriptions.js", strings: "strings.js" };

  // Resolve the .../assets/ base from this script's own URL so relative paths work
  // whether the page is at the site root or a subfolder.
  function assetsBase() {
    var s = document.currentScript;
    if (!s) {
      var all = document.getElementsByTagName("script");
      for (var i = 0; i < all.length; i++) {
        if (/(^|\/)i18n\.js(\?|$)/.test(all[i].src)) { s = all[i]; break; }
      }
    }
    return (s ? s.src : "").replace(/i18n\.js(\?.*)?$/, "");
  }
  var base = assetsBase();

  function loadScript(url) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement("script");
      el.src = url;
      el.onload = function () { resolve(); };
      el.onerror = function () { reject(new Error("failed to load " + url)); };
      document.head.appendChild(el);
    });
  }

  // Build a URL for the current page in another language, preserving path + hash.
  function langHref(code) {
    var params;
    try { params = new URLSearchParams(location.search); }
    catch (e) { params = new URLSearchParams(); }
    if (code === DEFAULT) params.delete("lang"); else params.set("lang", code);
    var qs = params.toString();
    return location.pathname + (qs ? "?" + qs : "") + location.hash;
  }

  // Add ?lang= to a same-site relative URL (e.g. "summary.html#sel=..") unless default.
  function withLang(url) {
    if (lang === DEFAULT) return url;
    var hash = "";
    var h = url.indexOf("#");
    if (h >= 0) { hash = url.slice(h); url = url.slice(0, h); }
    var sep = url.indexOf("?") >= 0 ? "&" : "?";
    return url + sep + "lang=" + lang + hash;
  }

  window.TDS_I18N = {
    lang: lang,
    htmlLang: meta.html,
    isDefault: lang === DEFAULT,
    langHref: langHref,
    withLang: withLang,
    t: function (key) {
      var s = window.TDS_STRINGS || {};
      return Object.prototype.hasOwnProperty.call(s, key) ? s[key] : key;
    }
  };

  function applyStrings() {
    var S = window.TDS_STRINGS || {};
    var has = function (k) { return Object.prototype.hasOwnProperty.call(S, k); };

    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      var k = n.getAttribute("data-i18n");
      if (has(k)) n.textContent = S[k];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (n) {
      var k = n.getAttribute("data-i18n-html");
      if (has(k)) n.innerHTML = S[k];
    });
    // data-i18n-attr="alt:keyA|aria-label:keyB"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (n) {
      n.getAttribute("data-i18n-attr").split("|").forEach(function (pair) {
        var i = pair.indexOf(":");
        if (i < 0) return;
        var attr = pair.slice(0, i).trim(), key = pair.slice(i + 1).trim();
        if (has(key)) n.setAttribute(attr, S[key]);
      });
    });
    // Per-language hero image: <img data-i18n-graphic> + strings.graphic = filename.
    var hero = document.querySelector("[data-i18n-graphic]");
    if (hero && has("graphic")) hero.setAttribute("src", base + S.graphic);
  }

  // For non-default languages, append ?lang= to relative in-app .html links so
  // navigation stays within the chosen language. External (church) links and the
  // language switcher (rendered afterward) are untouched.
  function localizeLinks() {
    if (lang === DEFAULT) return;
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || !/^[^/?#:]+\.html(\?|#|$)/.test(href)) return; // relative .html only
      if (/[?&]lang=/.test(href)) return; // already carries a language
      a.setAttribute("href", withLang(href));
    });
  }

  function renderSwitcher() {
    var bar = document.getElementById("langbar");
    if (!bar) return;
    bar.innerHTML = LANGS.map(function (l) {
      return l.code === lang
        ? '<span class="lang-active" aria-current="true">' + l.label + "</span>"
        : '<a href="' + langHref(l.code) + '">' + l.label + "</a>";
    }).join('<span class="lang-sep">·</span>');
  }

  function done() {
    applyStrings();
    localizeLinks();
    renderSwitcher();
    window.__tdsReady = true;
    document.dispatchEvent(new Event("tds:ready"));
  }

  var urls = needs.map(function (n) { return base + "lang/" + lang + "/" + FILES[n]; });
  Promise.all(urls.map(loadScript)).then(done).catch(function (err) {
    if (window.console) console.error("[i18n] bundle load failed:", err);
    done(); // still localize chrome + signal so the page degrades gracefully
  });
})();
