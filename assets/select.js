/* Teacher Development Skills — selection page.
   Renders every skill grouped by section from window.TDS_DATA and lets the
   viewer pick exactly one per section. When all sections have a pick, the
   action button enables and links to summary.html with the chosen ids. */
(function () {
  "use strict";

  function t(key, fallback) {
    var s = (window.TDS_I18N && window.TDS_I18N.t(key));
    return (s && s !== key) ? s : fallback;
  }

  function init() {
    var data = window.TDS_DATA;
    var listEl = document.getElementById("sections");
    var btn = document.getElementById("makepage");
    var progressEl = document.getElementById("progress");
    if (!data || !listEl) return;

    var statusPick = t("statusPick", "Pick one");
    var statusDone = t("statusDone", "✓ Selected");
    var progressFmt = t("progressFmt", "{n} of {total} chosen");

    // sectionIndex -> chosen skill id
    var chosen = {};

    function esc(str) {
      return String(str)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function render() {
      var html = "";
      data.sections.forEach(function (section, si) {
        html +=
          '<section class="sel-section" style="--card-accent:' + section.accent +
            ';--card-tint:' + section.tint + '">' +
            '<header class="sel-head">' +
              '<h2>' + esc(section.title) + '</h2>' +
              '<span class="sel-status" id="status-' + si + '">' + esc(statusPick) + '</span>' +
            '</header>' +
            '<div class="sel-options">';

        section.skills.forEach(function (sk) {
          html +=
            '<label class="opt">' +
              '<input type="radio" name="sec' + si + '" value="' + esc(sk.id) + '" ' +
                'data-section="' + si + '">' +
              '<span class="opt-text">' + esc(sk.name) + '</span>' +
            '</label>';
        });

        html += '</div></section>';
      });
      listEl.innerHTML = html;
    }

    function onChange(e) {
      var target = e.target;
      if (!target || target.type !== "radio") return;
      var si = target.getAttribute("data-section");
      chosen[si] = target.value;
      var status = document.getElementById("status-" + si);
      if (status) { status.textContent = statusDone; status.classList.add("done"); }
      updateProgress();
    }

    function updateProgress() {
      var n = Object.keys(chosen).length;
      var total = data.sections.length;
      progressEl.textContent = progressFmt.replace("{n}", n).replace("{total}", total);
      var complete = n === total;
      btn.disabled = !complete;
      progressEl.classList.toggle("complete", complete);
    }

    function makePage() {
      var ids = [];
      for (var i = 0; i < data.sections.length; i++) {
        if (!chosen[i]) return; // safety: button shouldn't be enabled yet
        ids.push(chosen[i]);
      }
      var url = "summary.html#sel=" + ids.join(",");
      location.href = window.TDS_I18N ? window.TDS_I18N.withLang(url) : url;
    }

    render();
    listEl.addEventListener("change", onChange);
    btn.addEventListener("click", makePage);
    updateProgress();
  }

  if (window.__tdsReady) init();
  else document.addEventListener("tds:ready", init);
})();
