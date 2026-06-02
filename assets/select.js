/* Teacher Development Skills — selection page.
   Renders every skill grouped by section from window.TDS_DATA and lets the
   viewer pick exactly one per section. When all sections have a pick, the
   action button enables and links to summary.html with the chosen ids. */
(function () {
  "use strict";

  var data = window.TDS_DATA;
  var listEl = document.getElementById("sections");
  var btn = document.getElementById("makepage");
  var progressEl = document.getElementById("progress");

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
            '<span class="sel-status" id="status-' + si + '">Pick one</span>' +
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
    var t = e.target;
    if (!t || t.type !== "radio") return;
    var si = t.getAttribute("data-section");
    chosen[si] = t.value;
    var status = document.getElementById("status-" + si);
    if (status) { status.textContent = "✓ Selected"; status.classList.add("done"); }
    updateProgress();
  }

  function updateProgress() {
    var n = Object.keys(chosen).length;
    var total = data.sections.length;
    progressEl.textContent = n + " of " + total + " chosen";
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
    location.href = "summary.html#sel=" + ids.join(",");
  }

  render();
  listEl.addEventListener("change", onChange);
  btn.addEventListener("click", makePage);
  updateProgress();
})();
