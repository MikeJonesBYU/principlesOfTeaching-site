/* Teacher Development Skills — summary page.
   Reads the chosen skill ids from the URL hash (summary.html#sel=id,id,...),
   then renders each with its section tag, name (linked to the live page), and
   the entire "Define" section from window.TDS_DESCRIPTIONS. */
(function () {
  "use strict";

  function t(key, fallback) {
    var s = (window.TDS_I18N && window.TDS_I18N.t(key));
    return (s && s !== key) ? s : fallback;
  }

  function init() {
    var data = window.TDS_DATA;
    var desc = window.TDS_DESCRIPTIONS || {};
    var el = document.getElementById("summary");
    if (!data || !el) return;

    var learnMore = t("learnMore", "Learn more about this skill →");
    var descUnavailable = t("descUnavailable", "(The description for this skill is unavailable.)");

    // id -> { section, accent, name, url }
    var index = {};
    data.sections.forEach(function (section) {
      section.skills.forEach(function (sk) {
        index[sk.id] = {
          section: section.title,
          accent: section.accent,
          name: sk.name,
          url: sk.url
        };
      });
    });

    function esc(str) {
      return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function parseIds() {
      var hash = location.hash.replace(/^#/, "");
      var m = /(?:^|&)sel=([^&]*)/.exec(hash);
      if (!m) return [];
      return m[1].split(",").map(function (s) {
        try { return decodeURIComponent(s); } catch (e) { return s; }
      }).filter(Boolean);
    }

    function cardHTML(id) {
      var info = index[id];
      if (!info) return "";
      var body = desc[id] || '<p class="skill-desc">' + esc(descUnavailable) + '</p>';
      return (
        '<article class="card" style="--card-accent:' + info.accent + '">' +
          '<span class="section-tag">' + esc(info.section) + '</span>' +
          '<a class="skill-link" href="' + info.url + '" target="_blank" rel="noopener">' +
            esc(info.name) +
          '</a>' +
          '<div class="skill-desc">' + body + '</div>' +
          '<a class="learn-more" href="' + info.url + '" target="_blank" rel="noopener">' +
            esc(learnMore) +
          '</a>' +
        '</article>'
      );
    }

    function render() {
      var ids = parseIds();
      if (!ids.length) {
        el.innerHTML = '<p class="placeholder">' +
          t("summaryEmptyHtml", 'No skills were selected yet. <a href="select.html">Choose one skill from each principle</a> to build your page.') +
          '</p>';
        relink();
        return;
      }
      var html = ids.map(cardHTML).join("");
      el.innerHTML = html || '<p class="placeholder">' +
        t("summaryNotFoundHtml", 'Those skills could not be found. <a href="select.html">Start over</a>.') +
        '</p>';
      relink();
    }

    // Keep in-app links inside placeholders on the current language.
    function relink() {
      if (!window.TDS_I18N) return;
      el.querySelectorAll('.placeholder a[href^="select.html"]').forEach(function (a) {
        a.setAttribute("href", window.TDS_I18N.withLang(a.getAttribute("href")));
      });
    }

    var permalinkBtn = document.getElementById("permalink");
    if (permalinkBtn) {
      permalinkBtn.addEventListener("click", function () {
        if (window.TDSshare) window.TDSshare.copyPermalink(parseIds());
      });
    }

    render();
    window.addEventListener("hashchange", render);
  }

  if (window.__tdsReady) init();
  else document.addEventListener("tds:ready", init);
})();
