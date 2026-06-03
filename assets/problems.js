/* Teacher Development Skills — problem-driven page.
   Renders window.TDS_PROBLEMS (the definitive source, problems-data.js) joined
   with window.TDS_DATA (skill name / gist / link / section, by skill id).
   Provides a live keyword search and category filter so a teacher can quickly
   find the challenge they're facing and jump to skills that help.
   Waits for "tds:ready" so the active language's skill data is loaded first. */
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
    var P = window.TDS_PROBLEMS;
    var D = window.TDS_DATA;
    var root = document.getElementById("problems");
    if (!P || !D || !root) return;

    // skill id -> { name, gist, url, section, accent }
    var SK = {};
    D.sections.forEach(function (s) {
      s.skills.forEach(function (k) {
        SK[k.id] = { name: k.name, gist: k.define || "", url: k.url, section: s.title, accent: s.accent };
      });
    });

    var L = {
      skillsLabel: t("problemsSkillsLabel", "Skills that can help"),
      all: t("problemsAll", "All challenges"),
      countFmt: t("problemsCountFmt", "Showing {n} of {total} challenges"),
      empty: t("problemsEmpty", "No challenges matched that search. Try different words, or"),
      emptyReset: t("problemsEmptyReset", "show all challenges")
    };

    var totalProblems = 0;
    P.categories.forEach(function (c) { totalProblems += c.problems.length; });

    // ---- render category sections + problem cards ----
    var cards = []; // { el, catId, text }
    var html = "";
    P.categories.forEach(function (cat) {
      var cardsHtml = "";
      cat.problems.forEach(function (prob) {
        var skillsHtml = "";
        var searchBits = [prob.title, prob.blurb, cat.title];
        prob.skills.forEach(function (id) {
          var sk = SK[id];
          if (!sk) return;
          searchBits.push(sk.name, sk.gist, sk.section);
          skillsHtml +=
            '<li class="pskill" style="--a:' + sk.accent + '">' +
              '<a class="pskill-name" href="' + sk.url + '" target="_blank" rel="noopener">' + esc(sk.name) + '</a>' +
              '<span class="pskill-tag">' + esc(sk.section) + '</span>' +
              (sk.gist ? '<p class="pskill-gist">' + esc(sk.gist) + '</p>' : '') +
            '</li>';
        });
        cardsHtml +=
          '<article class="pcard" id="p-' + esc(prob.id) + '" data-cat="' + esc(cat.id) + '">' +
            '<h3 class="pcard-title">' + esc(prob.title) + '</h3>' +
            (prob.blurb ? '<p class="pcard-blurb">' + esc(prob.blurb) + '</p>' : '') +
            '<div class="pcard-skills">' +
              '<p class="pcard-skills-label">' + esc(L.skillsLabel) + '</p>' +
              '<ul>' + skillsHtml + '</ul>' +
            '</div>' +
          '</article>';
      });
      html +=
        '<section class="pcat" id="cat-' + esc(cat.id) + '" data-cat="' + esc(cat.id) + '">' +
          '<h2 class="pcat-title">' + esc(cat.title) + '</h2>' +
          (cat.blurb ? '<p class="pcat-blurb">' + esc(cat.blurb) + '</p>' : '') +
          '<div class="pcat-problems">' + cardsHtml + '</div>' +
        '</section>';
    });
    root.innerHTML = html;

    // index card elements for filtering
    P.categories.forEach(function (cat) {
      cat.problems.forEach(function (prob) {
        var el = document.getElementById("p-" + prob.id);
        if (!el) return;
        var bits = [prob.title, prob.blurb, cat.title];
        prob.skills.forEach(function (id) { var sk = SK[id]; if (sk) bits.push(sk.name, sk.gist, sk.section); });
        cards.push({ el: el, catId: cat.id, text: bits.join(" • ").toLowerCase() });
      });
    });

    // ---- filter chips ----
    var chipsEl = document.getElementById("pf-chips");
    var chipHtml = '<button class="pf-chip active" type="button" data-cat="" aria-pressed="true">' + esc(L.all) + '</button>';
    P.categories.forEach(function (cat) {
      chipHtml += '<button class="pf-chip" type="button" data-cat="' + esc(cat.id) + '" aria-pressed="false">' + esc(cat.title) + '</button>';
    });
    if (chipsEl) chipsEl.innerHTML = chipHtml;

    var searchEl = document.getElementById("pf-search");
    var countEl = document.getElementById("pf-count");
    var emptyEl = document.getElementById("pf-empty");
    if (emptyEl) {
      emptyEl.innerHTML = esc(L.empty) + ' <button type="button" class="pf-reset" id="pf-reset">' + esc(L.emptyReset) + "</button>";
    }

    var state = { cat: "", q: "" };

    function setChips() {
      if (!chipsEl) return;
      Array.prototype.forEach.call(chipsEl.querySelectorAll(".pf-chip"), function (b) {
        var on = (b.getAttribute("data-cat") || "") === state.cat;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function apply() {
      var tokens = state.q.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var visible = 0;
      cards.forEach(function (c) {
        var okCat = !state.cat || c.catId === state.cat;
        var okQ = tokens.every(function (tok) { return c.text.indexOf(tok) !== -1; });
        var show = okCat && okQ;
        c.el.hidden = !show;
        if (show) visible++;
      });
      // hide category sections with no visible cards
      Array.prototype.forEach.call(root.querySelectorAll(".pcat"), function (sec) {
        var any = sec.querySelector(".pcard:not([hidden])");
        sec.hidden = !any;
      });
      if (countEl) countEl.textContent = L.countFmt.replace("{n}", visible).replace("{total}", totalProblems);
      if (emptyEl) emptyEl.hidden = visible !== 0;
      setChips();
    }

    // ---- events ----
    if (searchEl) searchEl.addEventListener("input", function () { state.q = searchEl.value; apply(); });
    if (chipsEl) chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".pf-chip"); if (!b) return;
      state.cat = b.getAttribute("data-cat") || "";
      updateHash();
      apply();
      // bring results into view when narrowing on small screens
      if (state.cat) { var top = root.getBoundingClientRect().top + window.scrollY - 12; window.scrollTo({ top: top, behavior: "smooth" }); }
    });
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "pf-reset") {
        state.cat = ""; state.q = ""; if (searchEl) searchEl.value = ""; updateHash(); apply();
      }
    });

    function updateHash() {
      var h = state.cat ? "#cat=" + state.cat : "";
      if (history.replaceState) history.replaceState(null, "", location.pathname + location.search + h);
      else location.hash = h;
    }
    function readHash() {
      var m = /(?:^#|&)cat=([^&]+)/.exec(location.hash);
      if (m && P.categories.some(function (c) { return c.id === m[1]; })) state.cat = m[1];
    }

    readHash();
    apply();
  }

  if (window.__tdsReady) init();
  else document.addEventListener("tds:ready", init);
})();
