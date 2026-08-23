/* Team A — prototype v1 app.
   Hash router over window.V1_DATA. Three views of one source: the category
   hierarchy, the lesson-moment hierarchy, and search results. Every list on
   every screen is produced by selecting on block attributes, and all 53
   blocks render through one template. Nothing is hand-placed.

   Also carries the instrument the task test runs on: a click-and-query log
   that survives reloads and exports as JSON or CSV. */
(function () {
  "use strict";

  var D = window.V1_DATA;

  var LOG_KEY = "v1.teama.log.v1";
  var LOG_CAP = 5000;

  var app     = document.getElementById("app");
  var form    = document.getElementById("search-form");
  var field   = document.getElementById("search-field");

  /* ------------------------------------------------------------- utilities */

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function store(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }

  // One normalizer for everything the search touches, so a query and a label
  // are always compared in the same shape. Apostrophes survive; hyphens and
  // curly quotes do not.
  function norm(s) {
    return String(s)
      .toLowerCase()
      .replace(/[‘’]/g, "'")
      .replace(/[^a-z0-9']+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  var STOP = { "a":1, "an":1, "the":1, "of":1, "to":1, "in":1, "on":1, "for":1,
               "and":1, "or":1, "is":1, "it":1, "that":1, "this":1, "with":1,
               "my":1, "me":1, "i":1, "you":1, "your":1, "s":1 };

  function tokens(s) {
    return norm(s).split(" ").filter(function (t) {
      return t && t.length > 1 && !STOP[t];
    });
  }

  /* ------------------------------------------------- selecting on attributes */

  function categoryBySlug(slug) {
    return D.categories.filter(function (c) { return c.slug === slug; })[0];
  }
  function groupBySlug(slug) {
    return D.groups.filter(function (g) { return g.slug === slug; })[0];
  }
  function momentByKey(key) {
    return D.moments.filter(function (m) { return m.key === key; })[0];
  }
  function blockById(id) {
    return D.skills.filter(function (s) { return s.id === id; })[0];
  }
  function groupsIn(catSlug) {
    return D.groups.filter(function (g) { return g.category === catSlug; });
  }
  function blocksInCategory(catSlug) {
    return D.skills.filter(function (s) {
      return s.filings.some(function (f) { return f.category === catSlug; });
    });
  }
  function blocksInGroup(groupSlug) {
    return D.skills.filter(function (s) {
      return s.filings.some(function (f) { return f.group === groupSlug; });
    });
  }
  function blocksAt(momentKey) {
    return D.skills.filter(function (s) { return s.moment.indexOf(momentKey) !== -1; });
  }

  // What a list calls a block: the situation label where our tree test gave it
  // one (D4), the manual's own sentence everywhere else.
  function blockTitle(s) { return s.label || s.name; }

  function shorten(s, n) {
    s = String(s);
    return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…";
  }

  function momentNames(keys) {
    return keys.map(function (k) {
      var m = momentByKey(k);
      return m ? m.name : k;
    });
  }

  // Group labels, from the wireframe nav.
  var GROUP_LABELS = {
    "about-their-own-life": "Making it about their own life",
    "finding-him-in-the-scriptures": "Finding Him in the scriptures",
    "bearing-witness-in-class": "Bearing witness in class",
    "what-the-prophets-say": "What the prophets say",
    "see-or-hear": "Something they can see or hear",
    "do-not-watch": "Something they do, not watch",
    "safe-to-speak-up": "Making the room safe to speak up",
    "getting-to-know-them": "Getting to know them",
    "during-the-week": "Caring about them during the week",
    "getting-yourself-ready": "Getting yourself ready",
    "planning-the-lesson": "Planning the lesson",
    "invitations-they-take-home": "Invitations they take home",
    "not-answering-it-yourself": "Not answering it yourself",
    "talking-to-each-other": "Getting them talking to each other",
    "asking-for-a-real-answer": "Asking so you get a real answer"
  };

  /* ------------------------------------------------------------------- log */

  function readLog() { return store(LOG_KEY, []); }
  function writeLog(entries) { return save(LOG_KEY, entries); }

  var LOG_FIELDS = ["seq", "time", "event", "fromRoute", "toRoute", "label",
                    "query", "blockId", "rank", "facet", "resultCount"];

  function record(fields) {
    var entries = readLog();
    var row = {
      seq: entries.length + 1,
      time: new Date().toISOString(),
      event: fields.event || "nav",
      fromRoute: fields.fromRoute === undefined ? currentRoute() : fields.fromRoute,
      toRoute: fields.toRoute || "",
      label: fields.label || "",
      query: fields.query || "",
      blockId: fields.blockId || "",
      rank: fields.rank === undefined ? "" : fields.rank,
      facet: fields.facet || "",
      resultCount: fields.resultCount === undefined ? "" : fields.resultCount
    };
    entries.push(row);
    if (entries.length > LOG_CAP) { entries = entries.slice(entries.length - LOG_CAP); }
    writeLog(entries);
  }

  function currentRoute() {
    return (window.location.hash || "#/").slice(1) || "/";
  }

  function logCsv(entries) {
    var rows = [LOG_FIELDS.slice()];
    entries.forEach(function (e) {
      rows.push(LOG_FIELDS.map(function (k) { return e[k]; }));
    });
    return csv(rows);
  }

  /* -------------------------------------------------------------- exporting */

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime + ";charset=utf-8" });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function csvCell(v) {
    if (v === null || v === undefined) { return ""; }
    var s = String(v);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function csv(rows) {
    return rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
  }

  function stamp() {
    return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  }

  function offerCopy(mountId, text) {
    var mount = document.getElementById(mountId);
    if (!mount) { return; }
    function fallback() {
      mount.innerHTML = '<p class="hint">Clipboard blocked &mdash; select this text and copy it by hand.</p>' +
                        '<textarea class="copybox" readonly></textarea>';
      var ta = mount.querySelector("textarea");
      ta.value = text;
      ta.focus();
      ta.select();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        mount.innerHTML = '<p class="hint">Copied to the clipboard.</p>';
      })["catch"](fallback);
    } else {
      fallback();
    }
  }

  /* ============================================================== SEARCH ===
     Two layers over the same 53 records.

     1. Literal. Every typed word is matched against the block's label, its
        manual sentence, and the names of the categories, groups and moments
        it carries. Word-prefix matching, so "pictur" finds "pictures".
     2. Concept. A committed vocabulary (V1_DATA.concepts) harvested from our
        card sort and tree test: a phrase a participant actually used, and
        what it turned out to mean. Concept hits carry the reason on screen.

     Ranking is one addition. Every hit adds its weight, and the weights are
     an ordering we can defend out loud: a situation label (6) beats a term we
     committed by hand to this exact block (5), which beats the manual's own
     sentence (4), which beats a whole branch a term points at (3 / 2). Ties
     go to whichever block matched more of the typed words. Nothing here is
     tuned, learned, or hidden.
     ======================================================================= */

  var W_LABEL = 6, W_NAME = 4, W_TAXON = 2, W_MOMENT = 1;
  var W_CONCEPT_BLOCK = 5, W_CONCEPT_GROUP = 3, W_CONCEPT_CATEGORY = 2, W_CONCEPT_MOMENT = 2;

  function haystacks(s) {
    var cats = [], grps = [];
    s.filings.forEach(function (f) {
      var c = categoryBySlug(f.category);
      var g = f.group ? groupBySlug(f.group) : null;
      if (c) { cats.push(c.name); }
      if (g) { grps.push(g.name); if (g.subtitle) { grps.push(g.subtitle); } }
    });
    return {
      label: norm(s.label || ""),
      name: norm(s.name),
      taxon: norm(cats.concat(grps).join(" ")),
      moment: norm(momentNames(s.moment).join(" "))
    };
  }

  function hasWord(hay, token) {
    if (!hay) { return false; }
    return hay.split(" ").some(function (w) { return w.indexOf(token) === 0; });
  }

  // Whole-phrase containment with word boundaries, so "safe" does not match
  // inside "safety" and "pray" does not match inside "prayerful".
  function containsPhrase(nq, phrase) {
    var p = norm(phrase);
    if (!p) { return false; }
    return (" " + nq + " ").indexOf(" " + p + " ") !== -1;
  }

  // What a concept means, in one display name, for the "why this matched"
  // hint. Most specific naming first.
  function conceptLead(concept) {
    var to = concept.to || {};
    var g = (to.groups || [])[0];
    if (g && groupBySlug(g)) { return groupBySlug(g).name; }
    var c = (to.categories || [])[0];
    if (c && categoryBySlug(c)) { return categoryBySlug(c).name; }
    var m = (to.moments || [])[0];
    if (m && momentByKey(m)) { return momentByKey(m).name; }
    var b = (to.blocks || [])[0];
    if (b && blockById(b)) { return shorten(blockTitle(blockById(b)), 46); }
    return concept.term;
  }

  function conceptTargets(concept) {
    var to = concept.to || {}, hits = {};
    function add(id, weight) {
      hits[id] = Math.max(hits[id] || 0, weight);
    }
    (to.blocks || []).forEach(function (id) { add(id, W_CONCEPT_BLOCK); });
    (to.groups || []).forEach(function (g) {
      blocksInGroup(g).forEach(function (s) { add(s.id, W_CONCEPT_GROUP); });
    });
    (to.categories || []).forEach(function (c) {
      blocksInCategory(c).forEach(function (s) { add(s.id, W_CONCEPT_CATEGORY); });
    });
    (to.moments || []).forEach(function (k) {
      blocksAt(k).forEach(function (s) { add(s.id, W_CONCEPT_MOMENT); });
    });
    return hits;
  }

  function matchedConcepts(query) {
    var nq = norm(query);
    if (!nq) { return []; }
    return D.concepts.filter(function (c) {
      if (containsPhrase(nq, c.term)) { return true; }
      return (c.also || []).some(function (a) { return containsPhrase(nq, a); });
    });
  }

  function search(query) {
    var toks = tokens(query);
    var scored = {};

    function slot(s) {
      if (!scored[s.id]) {
        scored[s.id] = { block: s, score: 0, words: 0, why: [] };
      }
      return scored[s.id];
    }

    // 1. literal
    if (toks.length) {
      D.skills.forEach(function (s) {
        var h = haystacks(s), score = 0, words = 0;
        toks.forEach(function (t) {
          var w = 0;
          if (hasWord(h.label, t))  { w = Math.max(w, W_LABEL); }
          if (hasWord(h.name, t))   { w = Math.max(w, W_NAME); }
          if (hasWord(h.taxon, t))  { w = Math.max(w, W_TAXON); }
          if (hasWord(h.moment, t)) { w = Math.max(w, W_MOMENT); }
          if (w) { score += w; words += 1; }
        });
        if (words) {
          var r = slot(s);
          r.score += score;
          r.words = words;
        }
      });
    }

    // 2. concept
    matchedConcepts(query).forEach(function (concept) {
      var lead = conceptLead(concept);
      var hits = conceptTargets(concept);
      Object.keys(hits).forEach(function (id) {
        var s = blockById(id);
        if (!s) { return; }
        var r = slot(s);
        r.score += hits[id];
        r.why.push("matched “" + concept.term + "” → " + lead);
      });
    });

    return Object.keys(scored).map(function (id) { return scored[id]; })
      .sort(function (a, b) {
        if (b.score !== a.score) { return b.score - a.score; }
        if (b.words !== a.words) { return b.words - a.words; }
        return blockTitle(a.block).localeCompare(blockTitle(b.block));
      });
  }

  // Terms to offer when a query found nothing: any committed term that shares
  // a word with what was typed, otherwise the vocabulary's opening handful.
  function nearestTerms(query) {
    var toks = tokens(query);
    var near = D.concepts.filter(function (c) {
      var bag = norm([c.term].concat(c.also || []).join(" "));
      return toks.some(function (t) {
        return bag.split(" ").some(function (w) {
          return w.indexOf(t) === 0 || t.indexOf(w) === 0;
        });
      });
    }).map(function (c) { return c.term; });
    if (near.length) { return near.slice(0, 6); }
    return ["nobody answers", "saturday night", "bored", "quiet kid",
            "is it the spirit", "follow up"];
  }

  /* --------------------------------------------------------------- facets */

  function facetMatch(block, token) {
    var kind = token.charAt(0), value = token.slice(2);
    if (kind === "c") { return block.filings.some(function (f) { return f.category === value; }); }
    if (kind === "g") { return block.filings.some(function (f) { return f.group === value; }); }
    if (kind === "m") { return block.moment.indexOf(value) !== -1; }
    return true;
  }

  function facetName(token) {
    var kind = token.charAt(0), value = token.slice(2);
    if (kind === "c") { return (categoryBySlug(value) || {}).name || value; }
    if (kind === "g") { return (groupBySlug(value) || {}).name || value; }
    if (kind === "m") { return (momentByKey(value) || {}).name || value; }
    return value;
  }

  // Chips are computed from the result set on screen right now, so a chip
  // never promises a narrowing that leads nowhere.
  function facetCounts(results) {
    var counts = { c: {}, g: {}, m: {} };
    results.forEach(function (r) {
      var seen = {};
      r.block.filings.forEach(function (f) {
        if (!seen["c:" + f.category]) { seen["c:" + f.category] = 1; counts.c[f.category] = (counts.c[f.category] || 0) + 1; }
        if (f.group && !seen["g:" + f.group]) { seen["g:" + f.group] = 1; counts.g[f.group] = (counts.g[f.group] || 0) + 1; }
      });
      r.block.moment.forEach(function (k) { counts.m[k] = (counts.m[k] || 0) + 1; });
    });
    return counts;
  }

  /* ------------------------------------------------------- page fragments */

  function crumbs(parts) {
    var html = parts.map(function (p, i) {
      var piece = p.href
        ? '<a href="' + esc(p.href) + '" data-label="' + esc("Breadcrumb: " + p.text) + '">' + esc(p.text) + "</a>"
        : "<span>" + esc(p.text) + "</span>";
      return (i ? '<span class="sep">›</span>' : "") + piece;
    }).join("");
    return '<p class="crumbs">' + html + "</p>";
  }

  function here(kicker, title, sub) {
    return '<div class="here">' +
      '<p class="here__kicker">' + esc(kicker) + "</p>" +
      "<h1>" + esc(title) + "</h1>" +
      (sub ? '<p class="here__sub">' + esc(sub) + "</p>" : "") +
      "</div>";
  }

  function tile(href, name, sub, label, extraClass) {
    return '<li><a class="tile' + (extraClass ? " " + extraClass : "") + '" href="' + esc(href) +
           '" data-label="' + esc(label) + '">' +
           '<span class="tile__name">' + esc(name) + "</span>" +
           (sub ? '<span class="tile__sub">' + esc(sub) + "</span>" : "") +
           "</a></li>";
  }

  function trialNote(cat) {
    return '<p class="trial-note"><strong>Trial branch.</strong> ' +
           esc(cat.trialNote) + "</p>";
  }

  // ONE template for all 53 blocks, in every list on every view.
  function blockList(list, opts) {
    opts = opts || {};
    return '<ul class="blocks">' + list.map(function (item, i) {
      var s = item.block || item;
      var title = blockTitle(s);
      var attrs = ' data-label="' + esc("Block: " + title) + '"';
      if (opts.query !== undefined) {
        attrs += ' data-ev="result" data-block="' + esc(s.id) + '"' +
                 ' data-query="' + esc(opts.query) + '" data-rank="' + (i + 1) + '"';
      }
      var why = (item.why && item.why.length) ? item.why[0] : "";
      return "<li>" +
        '<a class="block-item" href="#/b/' + esc(s.id) + '"' + attrs + ">" +
          '<span class="block-item__title">' + esc(title) + "</span>" +
          (s.label ? '<span class="block-item__verbatim">' + esc(s.name) + "</span>" : "") +
          '<span class="block-item__foot">' +
            momentNames(s.moment).map(function (n) {
              return '<span class="tag">' + esc(n) + "</span>";
            }).join("") +
            (why ? '<span class="why">' + esc(why) + "</span>" : "") +
          "</span>" +
        "</a></li>";
    }).join("") + "</ul>";
  }

  function backnav(items) {
    return '<p class="backnav">' + items.map(function (i) {
      return '<a href="' + esc(i.href) + '" data-label="' + esc("Back: " + i.text) + '">' + esc(i.text) + "</a>";
    }).join("") + "</p>";
  }

  /* ------------------------------------------------------------- the views */

  function viewHome() {
    var cats = D.categories.map(function (c) {
      var n = blocksInCategory(c.slug).length;
      var gs = groupsIn(c.slug).length;
      var sub = gs
        ? plural(n, "skill", "skills") + " in " + plural(gs, "group", "groups")
        : plural(n, "skill", "skills") + " · trial branch";
      return tile("#/c/" + c.slug, c.name, sub, "Category: " + c.name,
                  c.trial ? "tile--trial" : "");
    }).join("");

    var moments = D.moments.map(function (m) {
      return tile("#/m/" + m.key, m.name,
                  m.blurb + " " + plural(blocksAt(m.key).length, "skill", "skills") + ".",
                  "Moment: " + m.name);
    }).join("");

    var trial = D.categories.filter(function (c) { return c.trial; })[0];

    var tries = ["nobody answers", "saturday night", "bored",
                 "quiet kid", "is it the spirit"].map(function (t) {
      return '<button type="button" data-act="try" data-q="' + esc(t) + '">' + esc(t) + "</button>";
    }).join("");

    return "<h1>Find something to try on Sunday</h1>" +
      '<p class="lede">Search in your own words, or walk in through one of the ' +
      "two ways below. Everything lands on the same " + D.skills.length +
      " skills from the manual &mdash; a skill can sit in more than one place, " +
      "because teachers reach for it from more than one question.</p>" +
      '<p class="chips__legend">Try searching</p>' +
      '<div class="suggests">' + tries + "</div>" +

      '<div class="section"><h2>Start with the problem you are having</h2>' +
        '<ul class="grid">' + cats + "</ul>" +
        (trial ? trialNote(trial) : "") +
      "</div>" +

      '<div class="section"><h2>Start with where you are in the lesson</h2>' +
        '<ul class="grid">' + moments + "</ul>" +
      "</div>";
  }

  function viewCategory(slug) {
    var cat = categoryBySlug(slug);
    if (!cat) { return notFound(); }
    var list = blocksInCategory(cat.slug);
    var gs = groupsIn(cat.slug);

    // A trial branch files its blocks directly: no L2 to walk (D1).
    if (!gs.length) {
      return crumbs([{ text: "Home", href: "#/" }, { text: cat.name }]) +
        here("Category", cat.name, plural(list.length, "skill", "skills") + ", filed directly.") +
        (cat.trialNote ? trialNote(cat) : "") +
        blockList(list) +
        backnav([{ text: "← Home", href: "#/" }]);
    }

    var tiles = gs.map(function (g) {
      var n = blocksInGroup(g.slug).length;
      return tile("#/g/" + cat.slug + "/" + g.slug, g.name,
                  (g.subtitle ? g.subtitle + " · " : "") + plural(n, "skill", "skills"),
                  "Group: " + g.name);
    }).join("");

    return crumbs([{ text: "Home", href: "#/" }, { text: cat.name }]) +
      here("Category", cat.name,
           plural(list.length, "skill", "skills") + " in " + plural(gs.length, "group", "groups") + ".") +
      '<ul class="grid">' + tiles + "</ul>" +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function viewGroup(catSlug, groupSlug) {
    var cat = categoryBySlug(catSlug);
    var grp = groupBySlug(groupSlug);
    if (!cat || !grp || grp.category !== cat.slug) { return notFound(); }
    var list = blocksInGroup(grp.slug);

    return crumbs([
        { text: "Home", href: "#/" },
        { text: cat.name, href: "#/c/" + cat.slug },
        { text: grp.name }
      ]) +
      here("In " + cat.name, grp.name,
           (grp.subtitle ? grp.subtitle + " · " : "") + plural(list.length, "skill", "skills") + ".") +
      blockList(list) +
      backnav([
        { text: "← " + cat.name, href: "#/c/" + cat.slug },
        { text: "← Home", href: "#/" }
      ]);
  }

  function viewMoment(key) {
    var m = momentByKey(key);
    if (!m) { return notFound(); }
    var list = blocksAt(m.key);

    // Grouped by each block's first filing, so the four moment pages render
    // exactly as the wireframe's did. The moment attribute did not change and
    // neither did this view (D6); cross-filing is a category-view fact.
    var sections = D.categories.map(function (c) {
      var mine = list.filter(function (s) { return s.filings[0].category === c.slug; });
      if (!mine.length) { return ""; }
      return '<div class="section"><h2>' + esc(c.name) + "</h2>" + blockList(mine) + "</div>";
    }).join("");

    return crumbs([{ text: "Home", href: "#/" }, { text: m.name }]) +
      here("Lesson moment", m.name,
           m.blurb + " " + plural(list.length, "skill", "skills") +
           " are tagged for this moment, shown under the problem each one is filed against.") +
      sections +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function viewBlock(id) {
    var s = blockById(id);
    if (!s) { return notFound(); }

    var trails = s.filings.map(function (f) {
      var cat = categoryBySlug(f.category);
      if (!cat) { return ""; }
      var link = '<a href="#/c/' + esc(cat.slug) + '" data-label="' + esc("Category: " + cat.name) + '">' +
                 esc(cat.name) + "</a>";
      if (!f.group) {
        return '<p class="trail">' + link + '<span class="sep">›</span>' +
               '<span>filed directly</span></p>';
      }
      var label = GROUP_LABELS[f.group] || f.group;
      return '<p class="trail">' + link + '<span class="sep">›</span>' +
             '<a href="#/g/' + esc(cat.slug) + "/" + esc(f.group) + '" data-label="' +
             esc("Group: " + label) + '">' + esc(label) + "</a></p>";
    }).join("");

    var momentLinks = s.moment.map(function (k) {
      var m = momentByKey(k);
      return '<a class="tag" href="#/m/' + esc(k) + '" data-label="' + esc("Moment: " + m.name) + '">' +
             esc(m.name) + "</a>";
    }).join(" ");

    return (s.label ? '<div class="block-head"><p class="block-head__label">' + esc(s.label) + "</p>"
                    : '<div class="block-head">') +
      "<h1>" + esc(s.name) + "</h1></div>" +

      '<div class="facts">' +
        '<div class="fact"><p class="fact__key">Filed under</p>' + trails + "</div>" +
        '<div class="fact"><p class="fact__key">When in the lesson</p><p>' + momentLinks + "</p></div>" +
        '<div class="fact"><p class="fact__key">Block id</p><p class="meta">' + esc(s.id) + "</p></div>" +
      "</div>" +

      '<p class="stub"><strong>This is a stub.</strong> v1 carries every block’s ' +
      "identity, filings and moments; the written guidance &mdash; what the skill " +
      "means, how to practise it, what it looks like in a real class &mdash; is the " +
      "final prototype’s job. Until then the manual is one tap away.</p>" +

      '<a class="manual-btn" href="' + esc(s.url) + '" target="_blank" rel="noopener"' +
      ' data-ev="manual" data-block="' + esc(s.id) + '"' +
      ' data-label="' + esc("Manual: " + s.id) + '">Read it in the manual →</a>' +

      backnav([{ text: "← Home", href: "#/" }]);
  }

  function viewFind(query, facets) {
    var base = search(query);
    var results = base.filter(function (r) {
      return facets.every(function (t) { return facetMatch(r.block, t); });
    });

    var head = "<h1>Search</h1>" +
      '<p class="lede">' + (query
        ? plural(results.length, "skill", "skills") + " for “" + esc(query) + "”" +
          (facets.length ? " with " + plural(facets.length, "filter", "filters") + " on." : ".")
        : "Type what is going wrong on Sunday, in your own words.") + "</p>";

    if (!query) {
      return head + '<p class="hint">The search box is at the top of every screen.</p>' +
        backnav([{ text: "← Home", href: "#/" }]);
    }

    if (!base.length) {
      return head + noResults(query);
    }

    if (!results.length) {
      return head + chipRack(base, facets, query) +
        '<div class="empty"><p>Those filters together leave nothing. ' +
        'Take one off above, or <a href="' + esc(findHash(query, [])) +
        '" data-label="Clear filters">clear them all</a>.</p></div>';
    }

    return head + chipRack(results, facets, query) +
      blockList(results, { query: query }) +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function chipRack(results, facets, query) {
    var counts = facetCounts(results);
    var out = "";

    function rack(legend, kind, items) {
      var chips = items.map(function (it) {
        var token = kind + ":" + it.value;
        var on = facets.indexOf(token) !== -1;
        var next = on
          ? facets.filter(function (t) { return t !== token; })
          : facets.concat([token]);
        return '<li><button type="button" class="chip' + (on ? " chip--on" : "") + '"' +
          ' data-ev="facet" data-goto="' + esc(findHash(query, next)) + '"' +
          ' data-facet="' + esc(token) + '" data-facet-on="' + (on ? "off" : "on") + '"' +
          ' data-label="' + esc((on ? "Remove filter: " : "Filter: ") + it.name) + '">' +
          esc(it.name) +
          '<span class="chip__n">' + it.n + "</span>" +
          (on ? '<span aria-hidden="true">×</span>' : "") +
          "</button></li>";
      }).join("");
      if (chips) {
        out += '<p class="chips__legend">' + esc(legend) + "</p>" +
               '<ul class="chips">' + chips + "</ul>";
      }
    }

    rack("Narrow by category", "c", D.categories.filter(function (c) {
      return counts.c[c.slug];
    }).map(function (c) { return { value: c.slug, name: c.name, n: counts.c[c.slug] }; }));

    rack("Narrow by group", "g", D.groups.filter(function (g) {
      return counts.g[g.slug];
    }).map(function (g) { return { value: g.slug, name: g.name, n: counts.g[g.slug] }; }));

    rack("Narrow by lesson moment", "m", D.moments.filter(function (m) {
      return counts.m[m.key];
    }).map(function (m) { return { value: m.key, name: m.name, n: counts.m[m.key] }; }));

    return out;
  }

  function noResults(query) {
    var terms = nearestTerms(query).map(function (t) {
      return '<button type="button" data-act="try" data-q="' + esc(t) + '">' + esc(t) + "</button>";
    }).join("");
    var cats = D.categories.map(function (c) {
      return tile("#/c/" + c.slug, c.name,
                  plural(blocksInCategory(c.slug).length, "skill", "skills"),
                  "Category: " + c.name, c.trial ? "tile--trial" : "");
    }).join("");

    return '<div class="noresults">' +
      '<p class="noresults__q">Nothing here matched <strong>“' + esc(query) +
      '”</strong> &mdash; not in the skill wording, and not in the words ' +
      "teachers used in our studies.</p>" +
      '<p class="chips__legend">Words this search does know</p>' +
      '<div class="suggests">' + terms + "</div>" +
      '<p class="chips__legend">Or start from a category</p>' +
      '<ul class="grid">' + cats + "</ul>" +
      "</div>";
  }

  function viewLog() {
    var entries = readLog();
    var body = entries.length
      ? '<div class="scrollx"><table class="logtable"><thead><tr>' +
          LOG_FIELDS.map(function (f) { return "<th>" + esc(f) + "</th>"; }).join("") +
        "</tr></thead><tbody>" +
        entries.slice().reverse().map(function (e) {
          return "<tr>" + LOG_FIELDS.map(function (f) {
            var cls = (f === "seq" || f === "rank" || f === "resultCount" || f === "time") ? ' class="num"' : "";
            return "<td" + cls + ">" + esc(e[f] === undefined ? "" : e[f]) + "</td>";
          }).join("") + "</tr>";
        }).join("") +
        "</tbody></table></div>"
      : '<div class="empty">Nothing logged yet. Browse or search, then come back.</div>';

    return crumbs([{ text: "Home", href: "#/" }, { text: "Session log" }]) +
      here("Instrument", "Session log",
           plural(entries.length, "entry", "entries") +
           " kept in this browser, newest first.") +
      '<p class="meta">Every navigation click, every search, every filter, every ' +
      "result opened and every jump out to the manual. A result row carries the " +
      "query that produced it and where it sat in the list, so a run can be " +
      "reconstructed from the prompt forward.</p>" +
      '<p class="tools">' +
        '<button type="button" class="btn btn--primary" data-act="log-json">Export JSON</button>' +
        '<button type="button" class="btn" data-act="log-csv">Export CSV</button>' +
        '<button type="button" class="btn" data-act="log-copy">Copy JSON</button>' +
        '<button type="button" class="btn" data-act="log-clear">Clear log</button>' +
      "</p>" +
      '<div id="copy-mount"></div>' +
      body +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function notFound() {
    return "<h1>Nothing here</h1>" +
      '<p class="lede">That address does not match anything in this prototype.</p>' +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  /* --------------------------------------------------------------- routing */

  function findHash(query, facets) {
    var h = "#/find?q=" + encodeURIComponent(query);
    if (facets && facets.length) {
      h += "&f=" + facets.map(encodeURIComponent).join("~");
    }
    return h;
  }

  function parseHash() {
    var raw = currentRoute();
    var qi = raw.indexOf("?");
    var path = qi === -1 ? raw : raw.slice(0, qi);
    var qs   = qi === -1 ? "" : raw.slice(qi + 1);
    var params = {};
    qs.split("&").forEach(function (kv) {
      if (!kv) { return; }
      var i = kv.indexOf("=");
      var k = i === -1 ? kv : kv.slice(0, i);
      var v = i === -1 ? "" : kv.slice(i + 1);
      try { params[k] = decodeURIComponent(v.replace(/\+/g, " ")); }
      catch (e) { params[k] = v; }
    });
    return {
      seg: path.split("/").filter(function (p) { return p !== ""; }),
      params: params
    };
  }

  function go(hash) {
    if (window.location.hash === hash) { render(); }
    else { window.location.hash = hash; }
  }

  // The accent is spent once per screen. This is the only place that decides
  // where it lands; v1.css holds the four rules.
  var FOCUS = { "/": "search", find: "search", c: "here", g: "here", m: "here",
                b: "manual", log: "export" };

  var lastLoggedQuery = null;

  function render() {
    var r = parseHash();
    var seg = r.seg;
    var head = seg.length ? seg[0] : "/";

    var query = r.params.q || "";
    var facets = (r.params.f || "").split("~").filter(Boolean);

    var html;
    if (!seg.length)            { html = viewHome(); }
    else if (head === "c")      { html = viewCategory(seg[1]); }
    else if (head === "g")      { html = viewGroup(seg[1], seg[2]); }
    else if (head === "m")      { html = viewMoment(seg[1]); }
    else if (head === "b")      { html = viewBlock(decodeURIComponent(seg.slice(1).join("/"))); }
    else if (head === "find")   { html = viewFind(query, facets); }
    else if (head === "log")    { html = viewLog(); }
    else                        { html = notFound(); }

    app.innerHTML = html;
    document.body.setAttribute("data-focus", FOCUS[head] || "search");
    field.value = head === "find" ? query : "";

    // A query is logged once, when it first produces a screen — not again on
    // every filter click or back button.
    if (head === "find" && query && query !== lastLoggedQuery) {
      lastLoggedQuery = query;
      var n = search(query).filter(function (x) {
        return facets.every(function (t) { return facetMatch(x.block, t); });
      }).length;
      record({ event: "search", query: query, toRoute: currentRoute(), resultCount: n,
               label: "Search: " + query });
    }
    if (head !== "find") { lastLoggedQuery = null; }

    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------- event handlers */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = field.value.trim();
    if (!q) { return; }
    go(findHash(q, []));
  });

  // Every anchor click is an event: in-app navigation, a search result opened,
  // or a jump out to the manual.
  document.addEventListener("click", function (e) {
    var node = e.target;
    while (node && node !== document && node.tagName !== "A") { node = node.parentNode; }
    if (!node || node.tagName !== "A") { return; }

    var href = node.getAttribute("href") || "";
    var ev   = node.getAttribute("data-ev") || "nav";
    var label = (node.getAttribute("data-label") || node.textContent || "")
                  .replace(/\s+/g, " ").trim();

    if (href.charAt(0) === "#") {
      record({ event: ev, toRoute: href.slice(1) || "/", label: label,
               blockId: node.getAttribute("data-block") || "",
               query: node.getAttribute("data-query") || "",
               rank: node.getAttribute("data-rank") || "" });
      return;
    }
    if (ev === "manual") {
      record({ event: "manual", toRoute: href, label: label,
               blockId: node.getAttribute("data-block") || "" });
    }
  });

  document.addEventListener("click", function (e) {
    var node = e.target;
    while (node && node !== document && node.tagName !== "BUTTON") { node = node.parentNode; }
    if (!node || node.tagName !== "BUTTON") { return; }

    var act = node.getAttribute("data-act");
    var ev  = node.getAttribute("data-ev");

    if (ev === "facet") {
      var to = node.getAttribute("data-goto");
      record({ event: "facet", toRoute: to.slice(1),
               facet: node.getAttribute("data-facet") + " " + node.getAttribute("data-facet-on"),
               label: node.getAttribute("data-label") || "",
               query: (parseHash().params.q || "") });
      go(to);
      return;
    }

    if (act === "try") {
      go(findHash(node.getAttribute("data-q"), []));
    } else if (act === "log-json") {
      download("teama-v1-log-" + stamp() + ".json", JSON.stringify(readLog(), null, 2), "application/json");
    } else if (act === "log-csv") {
      download("teama-v1-log-" + stamp() + ".csv", logCsv(readLog()), "text/csv");
    } else if (act === "log-copy") {
      offerCopy("copy-mount", JSON.stringify(readLog(), null, 2));
    } else if (act === "log-clear") {
      if (window.confirm("Clear the whole session log for this browser?")) {
        writeLog([]);
        lastLoggedQuery = null;
        render();
      }
    }
  });

  /* ------------------------------------------------------------------ boot */

  window.addEventListener("hashchange", render);
  render();

})();
