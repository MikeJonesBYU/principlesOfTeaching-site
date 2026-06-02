/* Teacher Development Skills — random skill combination generator.
   Data comes from window.TDS_DATA (loaded per-language by i18n.js). Waits for
   the "tds:ready" event so the active language's bundle is available first. */
(function () {
  "use strict";

  function init() {
    var data = window.TDS_DATA;
    var resultsEl = document.getElementById("results");
    var btn = document.getElementById("generate");
    var permalinkBtn = document.getElementById("permalink");
    if (!data || !resultsEl) return;

    // Remember the last pick per section so each click changes every card.
    var lastIndex = {};
    // Ids of the currently displayed combination (for the permanent link).
    var currentIds = [];

    function pickIndex(section) {
      var n = section.skills.length;
      if (n === 0) return -1;
      if (n === 1) return 0;
      var prev = lastIndex[section.title];
      var i;
      do { i = Math.floor(Math.random() * n); } while (i === prev);
      lastIndex[section.title] = i;
      return i;
    }

    function cardHTML(section, skill) {
      var define = skill.define
        ? '<p class="skill-define">' + esc(skill.define) + '</p>'
        : '';
      return (
        '<div class="card animate" style="--card-accent:' + section.accent + '">' +
          '<span class="section-tag">' + esc(section.title) + '</span>' +
          '<a class="skill-link" href="' + skill.url + '" target="_blank" rel="noopener">' +
            esc(skill.name) +
          '</a>' +
          define +
        '</div>'
      );
    }

    function generate() {
      var html = "";
      currentIds = [];
      for (var s = 0; s < data.sections.length; s++) {
        var section = data.sections[s];
        var idx = pickIndex(section);
        if (idx < 0) continue;
        var skill = section.skills[idx];
        currentIds.push(skill.id);
        html += cardHTML(section, skill);
      }
      resultsEl.innerHTML = html;
    }

    function esc(str) {
      return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    if (btn) btn.addEventListener("click", generate);
    if (permalinkBtn) {
      permalinkBtn.addEventListener("click", function () {
        if (window.TDSshare) window.TDSshare.copyPermalink(currentIds);
      });
    }
    // Show a sample combination immediately so the page is self-explanatory.
    generate();
  }

  if (window.__tdsReady) init();
  else document.addEventListener("tds:ready", init);
})();
