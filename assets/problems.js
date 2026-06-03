/* Teacher Development Skills — problem-driven page.
   Renders window.TDS_PROBLEMS (definitive source, problems-data.js) joined with
   window.TDS_DATA (skill name/gist/link/section, by id).

   Search is a forgiving "soft" keyword match: it normalizes text, drops filler
   words + contractions, lightly stems (feeling->feel, learners->learner), maps a
   few synonyms (kids->child, teens->youth, boring->bored, quiet->silent...),
   tolerates a 1-character typo, scores each problem (title hits weigh more), and
   RANKS results best-first across categories. With no query it's a normal
   category-grouped browse. Category chips compose with search. */
(function () {
  "use strict";

  function t(key, fb) { var s = (window.TDS_I18N && window.TDS_I18N.t(key)); return (s && s !== key) ? s : fb; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ---- text matching helpers ----
  var STOP = new Set(("a an the this that these those and or but if then of in on at to for from with by " +
    "as is are am was were be been being it its i you he she we they them his her their our your my me him us " +
    "do does did doing done dont doesnt didnt isnt arent wasnt werent cant cannot couldnt wouldnt shouldnt " +
    "wont havent hasnt hadnt im ive id ill youre youve theyre theres thats whats whos which while because so " +
    "too very just really quite about into out up down over under again some any all every each more most " +
    "when where why how what who whom not no nor also even still get got getting gets have has had will would " +
    "can could should may might one want wants wanted like lot thing things cant").split(/\s+/));

  // colloquial term -> canonical term that appears in the data (applied before stemming)
  var SYN = {
    kid: "child", kids: "child", children: "child", child: "child", primary: "child",
    teen: "youth", teens: "youth", teenager: "youth", teenagers: "youth", youth: "youth", young: "youth", adolescent: "youth", adolescents: "youth",
    adult: "adult", adults: "adult", grownup: "adult", grownups: "adult",
    boring: "bored", dull: "bored", bored: "bored", disengaged: "bored", uninterested: "bored", apathetic: "bored", zoned: "bored",
    phone: "distracted", phones: "distracted", distraction: "distracted", distractions: "distracted",
    quiet: "silent", silent: "silence", silence: "silence", shy: "silent",
    talk: "participate", talking: "participate", talks: "participate", participation: "participate", respond: "participate", responding: "participate", answer: "participate", answers: "participate", answering: "participate",
    unprepared: "prepare", prepared: "prepare", preparation: "prepare", prep: "prepare", ready: "prepare",
    testify: "testimony", witness: "testimony",
    holyghost: "spirit", ghost: "spirit", prompting: "spirit", promptings: "spirit",
    apply: "relevant", application: "relevant", relevance: "relevant", sowhat: "relevant",
    deepdoctrine: "speculation", speculate: "speculation", controversial: "speculation", controversy: "speculation", tangent: "speculation", tangents: "speculation",
    rush: "time", rushing: "time", rushed: "time",
    behave: "disruptive", behavior: "disruptive", misbehave: "disruptive", disrupt: "disruptive", disrupting: "disruptive", rowdy: "disruptive",
    god: "god", gods: "god", lord: "god", savior: "christ", jesus: "christ"
  };

  function norm(s) {
    return String(s).toLowerCase()
      .replace(/[‘’'`]/g, "")     // drop apostrophes: don't->dont, god's->gods
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ").trim();
  }
  function stem(w) {
    if (w.length > 4 && w.slice(-3) === "ies") return w.slice(0, -3) + "y";
    if (w.length > 5 && w.slice(-3) === "ing") return w.slice(0, -3);
    if (w.length > 4 && w.slice(-2) === "ed") return w.slice(0, -2);
    if (w.length > 3 && w.slice(-1) === "s" && w.slice(-2) !== "ss") return w.slice(0, -1);
    return w;
  }
  function canon(raw) { return stem(SYN[raw] || raw); }

  // string -> array of canonical content tokens (stopwords removed)
  function toks(str) {
    var out = [];
    norm(str).split(" ").forEach(function (w) {
      if (!w || STOP.has(w)) return;
      var c = canon(w);
      if (c && c.length > 1 && !STOP.has(c)) out.push(c);
    });
    return out;
  }
  function tokenSet(str) { return new Set(toks(str)); }

  // typo fallback: shared 6-char prefix (catches longer-word typos), else Levenshtein <= 1
  function near(a, b) {
    if (a === b) return true;
    if (a.length >= 6 && b.length >= 6 && a.slice(0, 6) === b.slice(0, 6)) return true;
    var la = a.length, lb = b.length;
    if (Math.abs(la - lb) > 1) return false;
    if (la < 5 || lb < 5) return false;  // no edit-distance typos on short words (love != move)
    var i = 0, j = 0, diff = 0;
    while (i < la && j < lb) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++diff > 1) return false;
      if (la > lb) i++; else if (lb > la) j++; else { i++; j++; }
    }
    if (i < la || j < lb) diff++;
    return diff <= 1;
  }

  function init() {
    var P = window.TDS_PROBLEMS, D = window.TDS_DATA;
    var root = document.getElementById("problems");
    if (!P || !D || !root) return;

    var SK = {};
    D.sections.forEach(function (s) {
      s.skills.forEach(function (k) { SK[k.id] = { name: k.name, gist: k.define || "", url: k.url, section: s.title, accent: s.accent }; });
    });

    var L = {
      skillsLabel: t("problemsSkillsLabel", "Skills that can help"),
      all: t("problemsAll", "All challenges"),
      countFmt: t("problemsCountFmt", "Showing {n} of {total} challenges"),
      empty: t("problemsEmpty", "No challenges matched that search. Try different words, or"),
      emptyReset: t("problemsEmptyReset", "show all challenges")
    };

    // ---- render flat: [header, card, card, ... header, card ...] ----
    var nodes = [];   // { el, type, catId, oi, titleTok?, allTok? }
    var total = 0;
    var html = "";
    P.categories.forEach(function (cat) {
      html += '<div class="pcat-header" data-cat="' + esc(cat.id) + '">' +
        '<h2 class="pcat-title">' + esc(cat.title) + '</h2>' +
        (cat.blurb ? '<p class="pcat-blurb">' + esc(cat.blurb) + '</p>' : '') + '</div>';
      cat.problems.forEach(function (prob) {
        total++;
        var skillsHtml = "";
        prob.skills.forEach(function (id) {
          var sk = SK[id]; if (!sk) return;
          skillsHtml += '<li class="pskill" style="--a:' + sk.accent + '">' +
            '<a class="pskill-name" href="' + sk.url + '" target="_blank" rel="noopener">' + esc(sk.name) + '</a>' +
            '<span class="pskill-tag">' + esc(sk.section) + '</span>' +
            (sk.gist ? '<p class="pskill-gist">' + esc(sk.gist) + '</p>' : '') + '</li>';
        });
        html += '<article class="pcard" id="p-' + esc(prob.id) + '" data-cat="' + esc(cat.id) + '">' +
          '<p class="pcard-cat">' + esc(cat.title) + '</p>' +
          '<h3 class="pcard-title">' + esc(prob.title) + '</h3>' +
          (prob.blurb ? '<p class="pcard-blurb">' + esc(prob.blurb) + '</p>' : '') +
          '<div class="pcard-skills"><p class="pcard-skills-label">' + esc(L.skillsLabel) + '</p><ul>' + skillsHtml + '</ul></div>' +
          '</article>';
      });
    });
    root.innerHTML = html;

    // index the rendered nodes + precompute token sets for cards
    var oi = 0;
    P.categories.forEach(function (cat) {
      var hEl = root.querySelector('.pcat-header[data-cat="' + cat.id + '"]');
      if (hEl) nodes.push({ el: hEl, type: "header", catId: cat.id, oi: oi++ });
      cat.problems.forEach(function (prob) {
        var el = document.getElementById("p-" + prob.id);
        if (!el) return;
        var titleText = prob.title + " " + (prob.blurb || "");
        var allText = titleText + " " + cat.title + " " + cat.blurb;
        prob.skills.forEach(function (id) { var sk = SK[id]; if (sk) allText += " " + sk.name + " " + sk.gist + " " + sk.section; });
        nodes.push({ el: el, type: "card", catId: cat.id, oi: oi++, titleTok: tokenSet(titleText), allTok: tokenSet(allText) });
      });
    });
    var cards = nodes.filter(function (n) { return n.type === "card"; });
    var headers = nodes.filter(function (n) { return n.type === "header"; });

    // inverse document frequency: down-weight words common to many problems
    // (e.g. "feel", "student", "question") and reward distinctive ones ("love", "disruptive").
    var N = cards.length, DF = {};
    cards.forEach(function (c) { c.allTok.forEach(function (tk) { DF[tk] = (DF[tk] || 0) + 1; }); });
    function idf(tk) { return Math.log((N + 1) / ((DF[tk] || 0) + 0.5)); }

    function scoreCard(c, q) {
      var s = 0;
      for (var i = 0; i < q.length; i++) {
        var qt = q[i];
        if (c.titleTok.has(qt)) { s += 3 * idf(qt); continue; }
        if (c.allTok.has(qt)) { s += 1 * idf(qt); continue; }
        // typo fallback: credit the best near doc token, weighted by where it sits
        // and its idf, scaled down 0.6 as a typo penalty.
        var fz = 0;
        c.allTok.forEach(function (dt) {
          if (near(qt, dt)) { var w = (c.titleTok.has(dt) ? 3 : 1) * Math.min(idf(dt), 1.5) * 0.6; if (w > fz) fz = w; }
        });
        s += fz;
      }
      return s;
    }

    // ---- chips ----
    var chipsEl = document.getElementById("pf-chips");
    var ch = '<button class="pf-chip active" type="button" data-cat="" aria-pressed="true">' + esc(L.all) + "</button>";
    P.categories.forEach(function (cat) { ch += '<button class="pf-chip" type="button" data-cat="' + esc(cat.id) + '" aria-pressed="false">' + esc(cat.title) + "</button>"; });
    if (chipsEl) chipsEl.innerHTML = ch;

    var searchEl = document.getElementById("pf-search");
    var countEl = document.getElementById("pf-count");
    var emptyEl = document.getElementById("pf-empty");
    if (emptyEl) emptyEl.innerHTML = esc(L.empty) + ' <button type="button" class="pf-reset" id="pf-reset">' + esc(L.emptyReset) + "</button>";

    var state = { cat: "", q: "" };

    function setChips() {
      if (!chipsEl) return;
      Array.prototype.forEach.call(chipsEl.querySelectorAll(".pf-chip"), function (b) {
        var on = (b.getAttribute("data-cat") || "") === state.cat;
        b.classList.toggle("active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function apply() {
      var q = [];
      var seen = {};
      toks(state.q).forEach(function (tk) { if (!seen[tk]) { seen[tk] = 1; q.push(tk); } });
      var searching = q.length > 0;
      root.classList.toggle("ranked", searching);
      var visible = 0;

      if (!searching) {
        // browse: category-grouped, natural order
        nodes.forEach(function (n) {
          n.el.style.order = "";
          n.el.hidden = !!(state.cat && n.catId !== state.cat);
        });
        cards.forEach(function (c) { if (!c.el.hidden) visible++; });
      } else {
        // ranked search: hide headers, score, keep clearly-relevant, sort, cap
        headers.forEach(function (h) { h.el.hidden = true; });
        var scored = [];
        cards.forEach(function (c) {
          if (state.cat && c.catId !== state.cat) { c.el.hidden = true; c._score = 0; return; }
          c._score = scoreCard(c, q);
          if (c._score > 0) scored.push(c);
        });
        // drop the weak long tail: keep only scores within 40% of the best, cap 12
        var best = scored.reduce(function (m, c) { return Math.max(m, c._score); }, 0);
        var thresh = best * 0.4;
        var matched = scored.filter(function (c) { return c._score >= thresh; })
          .sort(function (a, b) { return (b._score - a._score) || (a.oi - b.oi); })
          .slice(0, 12);
        var keep = {}; matched.forEach(function (c) { keep[c.oi] = 1; });
        cards.forEach(function (c) { c.el.hidden = !keep[c.oi]; });
        matched.forEach(function (c, i) { c.el.style.order = i + 1; });
        visible = matched.length;
      }

      if (countEl) countEl.textContent = L.countFmt.replace("{n}", visible).replace("{total}", total);
      if (emptyEl) emptyEl.hidden = visible !== 0;
      setChips();
    }

    if (searchEl) searchEl.addEventListener("input", function () { state.q = searchEl.value; apply(); });
    if (chipsEl) chipsEl.addEventListener("click", function (e) {
      var b = e.target.closest(".pf-chip"); if (!b) return;
      state.cat = b.getAttribute("data-cat") || ""; updateHash(); apply();
      if (state.cat) window.scrollTo({ top: Math.max(0, root.getBoundingClientRect().top + window.scrollY - 12), behavior: "smooth" });
    });
    document.addEventListener("click", function (e) {
      if (e.target && e.target.id === "pf-reset") { state.cat = ""; state.q = ""; if (searchEl) searchEl.value = ""; updateHash(); apply(); }
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
