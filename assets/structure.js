/* Teacher Development Skills — structure page.
   Renders the full hierarchical index (section → page → skills) from
   window.TDS_DATA so it localizes with the active language. */
(function () {
  "use strict";

  function t(key, fallback) {
    var s = (window.TDS_I18N && window.TDS_I18N.t(key));
    return (s && s !== key) ? s : fallback;
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function init() {
    var data = window.TDS_DATA;
    var root = document.getElementById("tree");
    if (!data || !root) return;

    var countFmt = t("skillsCountFmt", "({n} skills)");
    var html = "";

    data.sections.forEach(function (section) {
      html +=
        '<details class="section" open>' +
          '<summary>' + esc(section.title) +
            ' <span class="count">' + esc(countFmt.replace("{n}", section.skills.length)) + '</span>' +
          '</summary>' +
          '<div class="secbody">';

      // Group skills by their parent page (the "subsection" field), in order.
      var order = [], byPage = {};
      section.skills.forEach(function (sk) {
        var key = sk.subsection || "";
        if (!Object.prototype.hasOwnProperty.call(byPage, key)) { byPage[key] = []; order.push(key); }
        byPage[key].push(sk);
      });

      order.forEach(function (page) {
        html += '<div class="page">';
        if (page) html += '<div class="page-title">' + esc(page) + '</div>';
        html += '<ul class="skills">';
        byPage[page].forEach(function (sk) {
          html += '<li><a href="' + sk.url + '" target="_blank" rel="noopener">' + esc(sk.name) + '</a></li>';
        });
        html += '</ul></div>';
      });

      html += '</div></details>';
    });

    root.innerHTML = html;
  }

  if (window.__tdsReady) init();
  else document.addEventListener("tds:ready", init);
})();
