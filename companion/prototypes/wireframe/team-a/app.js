/* Team A — wireframe app.
   Hash router over window.WIREFRAME_DATA. Every list on every page is produced
   by filtering the same 53 records on their attributes; nothing is hand-placed.
   Also carries the two instruments: the click log, and the bonus test mode. */
(function () {
  "use strict";

  var D = window.WIREFRAME_DATA;

  var LOG_KEY  = "wf.teama.log.v1";
  var RUNS_KEY = "wf.teama.runs.v1";
  var LOG_CAP  = 3000;

  var app     = document.getElementById("app");
  var testbar = document.getElementById("testbar");
  var utilNav = document.getElementById("util-nav");
  var topHome = document.getElementById("top-home");

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

  /* ---------------------------------------------------- selecting on attrs */

  function skillsIn(categoryName) {
    return D.skills.filter(function (s) { return s.category === categoryName; });
  }
  function skillsInGroup(groupName) {
    return D.skills.filter(function (s) { return s.group === groupName; });
  }
  function skillsAt(momentKey) {
    return D.skills.filter(function (s) { return s.moment.indexOf(momentKey) !== -1; });
  }
  function groupsIn(categoryName) {
    return D.groups.filter(function (g) { return g.category === categoryName; });
  }
  function categoryBySlug(slug) {
    return D.categories.filter(function (c) { return c.slug === slug; })[0];
  }
  function groupBySlug(slug) {
    return D.groups.filter(function (g) { return g.slug === slug; })[0];
  }
  function momentByKey(key) {
    return D.moments.filter(function (m) { return m.key === key; })[0];
  }
  function skillById(id) {
    return D.skills.filter(function (s) { return s.id === id; })[0];
  }
  function categoryOf(skill) {
    return D.categories.filter(function (c) { return c.name === skill.category; })[0];
  }
  function groupOf(skill) {
    return D.groups.filter(function (g) { return g.name === skill.group; })[0];
  }
  function taskById(id) {
    return D.tasks.filter(function (t) { return t.id === id; })[0];
  }

  function momentNames(keys) {
    return keys.map(function (k) {
      var m = momentByKey(k);
      return m ? m.name : k;
    });
  }

  /* --------------------------------------------------------- the click log */

  function readLog()  { return store(LOG_KEY, []); }
  function writeLog(entries) { return save(LOG_KEY, entries); }

  function logNav(from, to, label) {
    var entries = readLog();
    entries.push({ t: new Date().toISOString(), from: from, to: to, label: label });
    if (entries.length > LOG_CAP) { entries = entries.slice(entries.length - LOG_CAP); }
    writeLog(entries);
  }

  /* --------------------------------------------------------- test-mode state */

  var test = {
    // idle        — normal browsing, no run
    // interrupted — a stored run was left unfinished; participant must choose
    // brief       — scenario card, timer not started
    // running     — participant is navigating; clicks go to the run
    // recorded    — interstitial between tasks
    // done        — summary. The run is already saved and closed enough that
    //               normal navigation works again (see inRun below).
    phase: "idle",
    runId: null,
    startedAt: null,
    order: [],
    index: 0,
    results: [],
    taskStart: 0,
    stopAt: 0,
    path: [],
    tick: null,
    pending: null      // an unfinished stored run awaiting Resume / End run
  };

  // "In a run" means the run owns the screen and swallows clicks. The summary
  // is deliberately excluded: by then the run is saved, so the links on that
  // screen have to work.
  function inRun() {
    return test.phase === "interrupted" || test.phase === "brief" ||
           test.phase === "running"     || test.phase === "recorded";
  }

  // One definition of elapsed time, so the clock on screen and the number we
  // record can never disagree. Frozen once stopAt is set.
  function elapsedSeconds() {
    return Math.round(((test.stopAt || Date.now()) - test.taskStart) / 100) / 10;
  }

  function readRuns()  { return store(RUNS_KEY, []); }

  function persistRun(finished) {
    var runs = readRuns();
    var record = {
      runId: test.runId,
      startedAt: test.startedAt,
      finishedAt: finished ? new Date().toISOString() : null,
      taskCount: test.order.length,
      order: test.order.slice(),   // kept so an interrupted run can resume
      results: test.results
    };
    var found = -1;
    for (var i = 0; i < runs.length; i++) {
      if (runs[i].runId === test.runId) { found = i; break; }
    }
    if (found === -1) { runs.push(record); } else { runs[found] = record; }
    save(RUNS_KEY, runs);
  }

  function shuffled(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function startRun() {
    test.runId = "run-" + new Date().toISOString().replace(/[:.]/g, "-") +
                 "-" + Math.random().toString(36).slice(2, 7);
    test.startedAt = new Date().toISOString();
    test.order = shuffled(D.tasks.map(function (t) { return t.id; }));
    test.index = 0;
    test.results = [];
    test.phase = "brief";
    persistRun(false);
    go("#/test");
  }

  function beginTask() {
    test.phase = "running";
    test.taskStart = Date.now();
    test.stopAt = 0;
    test.path = [];
    go("#/");
  }

  function finishTask(endpointSkillId) {
    var task = taskById(test.order[test.index]);
    test.results.push({
      taskId: task.id,
      scenario: task.scenario,
      expectedSkillId: task.expect,
      endpointSkillId: endpointSkillId,
      correct: endpointSkillId === task.expect,
      seconds: elapsedSeconds(),
      path: test.path.slice()
    });
    test.phase = "recorded";
    persistRun(false);
    go("#/test");
  }

  function nextTask() {
    test.index += 1;
    if (test.index >= test.order.length) {
      test.phase = "done";
      persistRun(true);
    } else {
      test.phase = "brief";
    }
    go("#/test");
  }

  // Wipe the in-memory run. Never touches storage — whoever calls this has
  // already written the record.
  function closeRun() {
    if (test.tick) { clearInterval(test.tick); test.tick = null; }
    test.phase = "idle";
    test.runId = null;
    test.startedAt = null;
    test.order = [];
    test.index = 0;
    test.results = [];
    test.path = [];
    test.taskStart = 0;
    test.stopAt = 0;
    test.pending = null;
  }

  /* --------------------------------------------- interrupted runs (reloads) */

  function findUnfinishedRun() {
    var runs = readRuns();
    for (var i = runs.length - 1; i >= 0; i--) {
      if (!runs[i].finishedAt && runs[i].order && runs[i].order.length) { return runs[i]; }
    }
    return null;
  }

  function loadPending() {
    var p = test.pending;
    test.runId     = p.runId;
    test.startedAt = p.startedAt;
    test.order     = p.order.slice();
    test.results   = (p.results || []).slice();
    test.index     = test.results.length;
    test.path      = [];
    test.taskStart = 0;
    test.stopAt    = 0;
    test.pending   = null;
  }

  function resumePending() {
    loadPending();
    if (test.index >= test.order.length) {
      // Every task was answered; the run just never reached its summary.
      test.phase = "done";
      persistRun(true);
    } else {
      test.phase = "brief";
    }
    go("#/test");
  }

  function endPending() {
    loadPending();
    persistRun(true);          // finished, incomplete — an honest record
    closeRun();
    go("#/test");
  }

  /* ------------------------------------------------- navigation recording */

  document.addEventListener("click", function (e) {
    var node = e.target;
    while (node && node !== document && node.tagName !== "A") { node = node.parentNode; }
    if (!node || node.tagName !== "A") { return; }
    var href = node.getAttribute("href") || "";
    if (href.charAt(0) !== "#") { return; }          // outbound manual links: not navigation

    var to    = href.slice(1) || "/";
    var from  = (window.location.hash || "#/").slice(1) || "/";
    var label = (node.getAttribute("data-label") || node.textContent || "")
                  .replace(/\s+/g, " ").trim();

    if (test.phase === "running") {
      test.path.push({ t: new Date().toISOString(), to: to, label: label });
    } else if (!inRun()) {
      logNav(from, to, label);
    }
  });

  /* ------------------------------------------------------------ exporting */

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

  /* ------------------------------------------------------- page fragments */

  function crumbs(parts) {
    var html = parts.map(function (p, i) {
      var piece = p.href
        ? '<a href="' + esc(p.href) + '" data-label="' + esc("Breadcrumb: " + p.text) + '">' + esc(p.text) + "</a>"
        : "<span>" + esc(p.text) + "</span>";
      return (i ? "&rsaquo; " : "") + piece;
    }).join(" ");
    return '<p class="crumbs">' + html + "</p>";
  }

  function tile(href, name, sub, label) {
    return '<li><a class="tile" href="' + esc(href) + '" data-label="' + esc(label) + '">' +
           '<span class="tile__name">' + esc(name) + "</span>" +
           (sub ? '<span class="tile__sub">' + esc(sub) + "</span>" : "") +
           "</a></li>";
  }

  function skillRows(list) {
    return '<ul class="stack">' + list.map(function (s) {
      return "<li>" +
        '<a href="#/s/' + esc(s.id) + '" data-label="' + esc("Skill: " + s.name) + '">' +
        esc(s.name) + "</a>" +
        '<span class="stack__tags">' + esc(momentNames(s.moment).join(" · ")) + "</span>" +
        "</li>";
    }).join("") + "</ul>";
  }

  /* ------------------------------------------------------------ the views */

  function viewHome() {
    var cats = D.categories.map(function (c) {
      var n = skillsIn(c.name).length;
      var gs = groupsIn(c.name).length;
      return tile("#/c/" + c.slug, c.name,
                  plural(n, "skill", "skills") + " in " + plural(gs, "group", "groups"),
                  "Category: " + c.name);
    }).join("");

    var moments = D.moments.map(function (m) {
      return tile("#/m/" + m.key, m.name,
                  m.blurb + " " + plural(skillsAt(m.key).length, "skill", "skills") + ".",
                  "Moment: " + m.name);
    }).join("");

    return "<h1>Find something to try on Sunday</h1>" +
      '<p class="lede">Two ways in: pick the problem you are having, or pick the ' +
      "part of the lesson you are standing in. Both land on the same " +
      D.skills.length + " skills &mdash; each one is filed under a single problem " +
      "and tagged with every moment it fits, so nothing has to be put in two places.</p>" +
      "<h2>Start with the problem you are having</h2>" +
      '<ul class="tiles">' + cats + "</ul>" +
      "<h2>Start with where you are in the lesson</h2>" +
      '<ul class="tiles">' + moments + "</ul>";
  }

  function viewCategory(slug) {
    var cat = categoryBySlug(slug);
    if (!cat) { return notFound(); }
    var gs = groupsIn(cat.name);
    var tiles = gs.map(function (g) {
      var n = skillsInGroup(g.name).length;
      return tile("#/g/" + cat.slug + "/" + g.slug, g.name,
                  plural(n, "skill", "skills"), "Group: " + g.name);
    }).join("");

    return crumbs([{ text: "Home", href: "#/" }, { text: cat.name }]) +
      "<h1>" + esc(cat.name) + "</h1>" +
      '<p class="meta">' + plural(skillsIn(cat.name).length, "skill", "skills") +
      ", sorted into " + plural(gs.length, "group", "groups") + ".</p>" +
      '<ul class="tiles">' + tiles + "</ul>" +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function viewGroup(catSlug, groupSlug) {
    var cat = categoryBySlug(catSlug);
    var grp = groupBySlug(groupSlug);
    if (!cat || !grp || grp.category !== cat.name) { return notFound(); }
    var list = skillsInGroup(grp.name);

    return crumbs([
        { text: "Home", href: "#/" },
        { text: cat.name, href: "#/c/" + cat.slug },
        { text: grp.name }
      ]) +
      "<h1>" + esc(grp.name) + "</h1>" +
      '<p class="meta">In &ldquo;' + esc(cat.name) + "&rdquo; &middot; " +
      plural(list.length, "skill", "skills") + ". The small type is when in the lesson each one fits.</p>" +
      skillRows(list) +
      backnav([
        { text: "← " + cat.name, href: "#/c/" + cat.slug },
        { text: "← Home", href: "#/" }
      ]);
  }

  function viewMoment(key) {
    var m = momentByKey(key);
    if (!m) { return notFound(); }
    var list = skillsAt(m.key);

    var blocks = D.categories.map(function (c) {
      var mine = list.filter(function (s) { return s.category === c.name; });
      if (!mine.length) { return ""; }
      return "<h2>" + esc(c.name) + "</h2>" + skillRows(mine);
    }).join("");

    return crumbs([{ text: "Home", href: "#/" }, { text: m.name }]) +
      "<h1>" + esc(m.name) + "</h1>" +
      '<p class="meta">' + esc(m.blurb) + " " +
      plural(list.length, "skill", "skills") + " are tagged for this moment, " +
      "shown under the problem each one is filed against.</p>" +
      blocks +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function viewSkill(id) {
    var s = skillById(id);
    if (!s) { return notFound(); }
    var cat = categoryOf(s);
    var grp = groupOf(s);

    var momentLinks = s.moment.map(function (k) {
      var m = momentByKey(k);
      return '<a href="#/m/' + esc(k) + '" data-label="' + esc("Moment: " + m.name) + '">' +
             esc(m.name) + "</a>";
    }).join(", ");

    return crumbs([
        { text: "Home", href: "#/" },
        { text: cat.name, href: "#/c/" + cat.slug },
        { text: grp.name, href: "#/g/" + cat.slug + "/" + grp.slug },
        { text: "Skill" }
      ]) +
      '<div class="endstate">' +
        '<p class="endstate__label">You reached this skill</p>' +
        '<p class="endstate__name">' + esc(s.name) + "</p>" +
      "</div>" +
      "<table class=\"attrs\"><tbody>" +
        "<tr><th>Filed under</th><td>" +
          '<a href="#/c/' + esc(cat.slug) + '" data-label="' + esc("Category: " + cat.name) + '">' + esc(cat.name) + "</a>" +
          " &rsaquo; " +
          '<a href="#/g/' + esc(cat.slug) + "/" + esc(grp.slug) + '" data-label="' + esc("Group: " + grp.name) + '">' + esc(grp.name) + "</a>" +
        "</td></tr>" +
        "<tr><th>When in the lesson</th><td>" + momentLinks + "</td></tr>" +
        "<tr><th>Block id</th><td>" + esc(s.id) + "</td></tr>" +
      "</tbody></table>" +

      '<div class="ph"><p class="ph__label">What this skill means</p>' +
        '<div class="bar"></div><div class="bar"></div><div class="bar bar--80"></div></div>' +
      '<div class="ph"><p class="ph__label">How to practice it this week</p>' +
        '<div class="bar"></div><div class="bar bar--60"></div></div>' +
      '<div class="ph"><p class="ph__label">What it looks like in a real class</p>' +
        '<div class="ph__box"></div></div>' +
      '<div class="ph"><p class="ph__label">Related skills</p>' +
        '<div class="bar bar--40"></div><div class="bar bar--40"></div></div>' +

      '<p class="outlink"><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' +
        "Read this skill in the manual &rarr;</a> " +
        '<span class="hint">(opens the real Teacher Development Skills page)</span></p>' +

      backnav([
        { text: "← " + grp.name, href: "#/g/" + cat.slug + "/" + grp.slug },
        { text: "← " + cat.name, href: "#/c/" + cat.slug },
        { text: "← Home", href: "#/" }
      ]);
  }

  function backnav(items) {
    return '<p class="backnav">' + items.map(function (i) {
      return '<a href="' + esc(i.href) + '" data-label="' + esc("Back: " + i.text) + '">' + esc(i.text) + "</a>";
    }).join("") + "</p>";
  }

  function notFound() {
    return "<h1>Nothing here</h1>" +
      '<p class="lede">That address does not match anything in the wireframe.</p>' +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  /* ------------------------------------------------------------ the log view */

  function viewLog() {
    var entries = readLog();
    var body = entries.length
      ? '<div class="scrollx"><table class="logtable"><thead><tr>' +
          "<th>#</th><th>Time</th><th>From</th><th>To</th><th>Link clicked</th>" +
        "</tr></thead><tbody>" +
        entries.map(function (e, i) {
          return "<tr>" +
            '<td class="num">' + (i + 1) + "</td>" +
            '<td class="num">' + esc(e.t) + "</td>" +
            "<td>" + esc(e.from) + "</td>" +
            "<td>" + esc(e.to) + "</td>" +
            "<td>" + esc(e.label) + "</td>" +
          "</tr>";
        }).join("") +
        "</tbody></table></div>"
      : '<p class="empty">Nothing logged yet. Click around the wireframe and come back.</p>';

    return crumbs([{ text: "Home", href: "#/" }, { text: "Click log" }]) +
      "<h1>Click log</h1>" +
      '<p class="meta">Every navigation click, kept in this browser across sessions. ' +
      plural(entries.length, "entry", "entries") + " stored. Clicks made during a " +
      "test run are kept with the run instead, so the two instruments do not mix.</p>" +
      '<p class="tools">' +
        '<button type="button" data-act="log-json">Export JSON</button>' +
        '<button type="button" data-act="log-csv">Export CSV</button>' +
        '<button type="button" data-act="log-copy">Copy JSON</button>' +
        '<button type="button" data-act="log-clear">Clear log</button>' +
      "</p>" +
      '<div id="copy-mount"></div>' +
      body +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function logCsv(entries) {
    var rows = [["n", "t", "from", "to", "label"]];
    entries.forEach(function (e, i) { rows.push([i + 1, e.t, e.from, e.to, e.label]); });
    return csv(rows);
  }

  /* ---------------------------------------------------------- test-mode views */

  function viewTest() {
    if (test.phase === "interrupted") { return viewInterrupted(); }
    if (test.phase === "brief")       { return viewTaskBrief(); }
    if (test.phase === "recorded")    { return viewRecorded(); }
    if (test.phase === "done")        { return viewSummary(); }
    return viewTestIntro();
  }

  function viewInterrupted() {
    var p = test.pending;
    var done = (p.results || []).length;
    return '<div class="card">' +
        '<p class="card__count">Run interrupted</p>' +
        '<p class="card__scenario">This browser has a test run that never finished &mdash; ' +
          "it stopped after " + plural(done, "situation", "situations") +
          " of " + p.taskCount + ".</p>" +
        '<button type="button" class="btn btn--big" data-act="run-resume">Resume &mdash; carry on at situation ' +
          (done + 1) + "</button> " +
        '<button type="button" class="btn btn--big" data-act="run-end">End this run</button>' +
      "</div>" +
      '<p class="hint">Resuming keeps the ' + plural(done, "answer", "answers") +
      " already recorded and starts the next situation fresh. Ending it files the run " +
      "as incomplete, with what was recorded. Either way nothing is lost, and normal " +
      "browsing stays out of the run.</p>" +
      '<p class="hint">Run id: ' + esc(p.runId) + " &middot; started " + esc(p.startedAt) + "</p>";
  }

  function viewTestIntro() {
    return crumbs([{ text: "Home", href: "#/" }, { text: "Test mode" }]) +
      "<h1>Test mode</h1>" +
      '<p class="lede">' + D.tasks.length + " short situations, one at a time, in a " +
      "different order every run. Read the situation, press OK, then find the skill " +
      "you would use &mdash; starting from the home screen, the way you normally would. " +
      "Landing on any skill page ends that task.</p>" +
      '<p class="meta">We record where you end up, how long you took, and every link ' +
      "you clicked on the way. There is no wrong answer we are grading; we are testing " +
      "our organization, not you. If you would give up in real life, press " +
      "&ldquo;I would give up&rdquo; &mdash; that is a result too.</p>" +
      '<p class="tools"><button type="button" class="btn btn--big" data-act="test-start">Start a run</button></p>' +
      '<p class="hint">Past runs are kept in this browser: ' +
      '<a href="#/results" data-label="Test results">see the results &rarr;</a></p>' +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function viewTaskBrief() {
    var task = taskById(test.order[test.index]);
    return '<div class="card">' +
        '<p class="card__count">Situation ' + (test.index + 1) + " of " + test.order.length + "</p>" +
        '<p class="card__scenario">' + esc(task.scenario) + "</p>" +
        '<button type="button" class="btn btn--big" data-act="task-begin">OK &mdash; start</button>' +
      "</div>" +
      '<p class="hint">The timer starts when you press OK.</p>';
  }

  function viewRecorded() {
    var last = test.results[test.results.length - 1];
    var more = test.index + 1 < test.order.length;
    return '<div class="card">' +
        '<p class="card__count">Recorded</p>' +
        '<p class="card__scenario">Situation ' + (test.index + 1) + " of " + test.order.length +
          ", " + plural(last.seconds, "second", "seconds") + ", " +
          plural(last.path.length, "click", "clicks") + ".</p>" +
        '<button type="button" class="btn btn--big" data-act="task-next">' +
          (more ? "Next situation" : "See the summary") + "</button>" +
      "</div>";
  }

  function viewSummary() {
    var hit = test.results.filter(function (r) { return r.correct; }).length;
    var secs = test.results.reduce(function (a, r) { return a + r.seconds; }, 0);
    var rows = test.results.map(function (r) {
      var end = r.endpointSkillId ? skillById(r.endpointSkillId) : null;
      return "<tr>" +
        "<td>" + esc(r.taskId) + "</td>" +
        "<td>" + (end ? esc(end.name) : "gave up") + "</td>" +
        '<td class="num">' + (r.correct ? "yes" : "no") + "</td>" +
        '<td class="num">' + r.seconds + "s</td>" +
        '<td class="num">' + r.path.length + "</td>" +
      "</tr>";
    }).join("");

    return "<h1>Run finished</h1>" +
      '<p class="lede">' + hit + " of " + test.results.length +
      " situations ended on the skill we filed the answer under, in " +
      plural(Math.round(secs), "second", "seconds") +
      " of clicking. Thank you &mdash; that is the whole session.</p>" +
      '<div class="scrollx"><table class="logtable"><thead><tr>' +
        "<th>Task</th><th>Ended on</th><th>As filed</th><th>Time</th><th>Clicks</th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
      '<p class="tools">' +
        '<button type="button" class="btn" data-act="test-finish">Close this run</button>' +
      "</p>" +
      '<p class="hint">This run is saved, and the wireframe is yours to browse again: ' +
      '<a href="#/results" data-label="Test results">all stored runs &rarr;</a></p>' +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function viewResults() {
    var runs = readRuns();
    var body = runs.length
      ? '<ul class="runlist">' + runs.slice().reverse().map(function (run) {
          var done = run.results.length;
          var hit = run.results.filter(function (r) { return r.correct; }).length;
          var rows = run.results.map(function (r) {
            var end = r.endpointSkillId ? skillById(r.endpointSkillId) : null;
            var exp = skillById(r.expectedSkillId);
            return "<tr>" +
              "<td>" + esc(r.taskId) + "</td>" +
              "<td>" + (end ? esc(end.name) : "<em>gave up</em>") + "</td>" +
              "<td>" + (exp ? esc(exp.name) : esc(r.expectedSkillId)) + "</td>" +
              '<td class="num mark">' + (r.correct ? "hit" : "miss") + "</td>" +
              '<td class="num">' + r.seconds + "s</td>" +
              '<td class="num">' + r.path.length + "</td>" +
            "</tr>";
          }).join("");
          return "<li>" +
            '<div class="run__head">' +
              "<span>" + esc(run.runId) + "</span>" +
              "<span>started " + esc(run.startedAt) + "</span>" +
              "<span>" + (run.finishedAt
                ? (done < run.taskCount ? "ended early &mdash; " + done + " of " + run.taskCount : "completed")
                : "still open") + "</span>" +
              "<span>" + hit + "/" + done + " as filed</span>" +
            "</div>" +
            '<div class="scrollx"><table class="logtable"><thead><tr>' +
              "<th>Task</th><th>Ended on</th><th>We filed it under</th><th></th><th>Time</th><th>Clicks</th>" +
            "</tr></thead><tbody>" + rows + "</tbody></table></div>" +
          "</li>";
        }).join("") + "</ul>"
      : '<p class="empty">No runs stored yet. <a href="#/test" data-label="Test mode">Start one &rarr;</a></p>';

    return crumbs([{ text: "Home", href: "#/" }, { text: "Test results" }]) +
      "<h1>Test results</h1>" +
      '<p class="meta">' + plural(runs.length, "run", "runs") + " kept in this browser, newest first. " +
      "&ldquo;We filed it under&rdquo; is our own answer key, not a score for the participant.</p>" +
      '<p class="tools">' +
        '<button type="button" data-act="runs-json">Export JSON</button>' +
        '<button type="button" data-act="runs-csv">Export CSV</button>' +
        '<button type="button" data-act="runs-copy">Copy JSON</button>' +
        '<button type="button" data-act="runs-clear">Clear all runs</button>' +
      "</p>" +
      '<div id="copy-mount"></div>' +
      body +
      backnav([{ text: "← Home", href: "#/" }]);
  }

  function runsCsv(runs) {
    var rows = [["runId", "startedAt", "finishedAt", "taskId", "scenario",
                 "expectedSkillId", "endpointSkillId", "asFiled", "seconds",
                 "clicks", "path"]];
    runs.forEach(function (run) {
      run.results.forEach(function (r) {
        rows.push([
          run.runId, run.startedAt, run.finishedAt || "", r.taskId, r.scenario,
          r.expectedSkillId, r.endpointSkillId || "", r.correct ? "hit" : "miss",
          r.seconds, r.path.length,
          r.path.map(function (p) { return p.to; }).join(" > ")
        ]);
      });
    });
    return csv(rows);
  }

  /* --------------------------------------------------------------- test bar */

  // No chrome may look clickable while it is not. The instrument links are
  // hidden for the whole run; the title stays a live navigation target while
  // the participant is browsing, and goes inert on the modal card screens.
  function paintChrome() {
    var modal = test.phase === "interrupted" || test.phase === "brief" ||
                test.phase === "recorded";
    utilNav.hidden = inRun();
    if (modal) {
      topHome.classList.add("is-inert");
      topHome.removeAttribute("href");
    } else {
      topHome.classList.remove("is-inert");
      topHome.setAttribute("href", "#/");
    }
  }

  function paintTestbar() {
    paintChrome();
    if (test.phase !== "running") {
      testbar.hidden = true;
      testbar.innerHTML = "";
      if (test.tick) { clearInterval(test.tick); test.tick = null; }
      return;
    }
    var task = taskById(test.order[test.index]);
    testbar.hidden = false;
    testbar.innerHTML =
      '<div class="testbar__row">' +
        '<span class="testbar__task"><strong>' + (test.index + 1) + "/" + test.order.length +
          "</strong> " + esc(task.scenario) + "</span>" +
        '<span class="testbar__clock" id="clock">' + elapsedSeconds().toFixed(1) + "s</span>" +
        '<button type="button" data-act="task-giveup">I would give up</button>' +
      "</div>";
    if (test.tick) { clearInterval(test.tick); test.tick = null; }
    if (test.stopAt) { return; }   // arrived at a skill: leave the clock frozen
    test.tick = setInterval(function () {
      var el = document.getElementById("clock");
      if (el) { el.textContent = elapsedSeconds().toFixed(1) + "s"; }
    }, 100);
  }

  /* --------------------------------------------------------------- routing */

  function go(hash) {
    if (window.location.hash === hash) { render(); }
    else { window.location.hash = hash; }
  }

  function render() {
    var raw = (window.location.hash || "#/").slice(1) || "/";
    var seg = raw.split("/").filter(function (p) { return p !== ""; });

    // The summary is terminal: the run is already saved, so leaving it simply
    // closes it and hands the wireframe back.
    if (test.phase === "done" && seg[0] !== "test") { closeRun(); }

    // A test run in a non-browsing phase owns the screen.
    if (inRun() && test.phase !== "running" && seg[0] !== "test") {
      go("#/test");
      return;
    }

    // Freeze the clock at the moment of arrival, before anything is painted,
    // so the bar shows the time we are about to record rather than 0.0s.
    var arrived = null;
    if (test.phase === "running" && seg[0] === "s") {
      arrived = skillById(decodeURIComponent(seg.slice(1).join("/")));
      if (arrived) { test.stopAt = Date.now(); }
    }

    var html;
    if (seg.length === 0)            { html = viewHome(); }
    else if (seg[0] === "c")         { html = viewCategory(seg[1]); }
    else if (seg[0] === "g")         { html = viewGroup(seg[1], seg[2]); }
    else if (seg[0] === "m")         { html = viewMoment(seg[1]); }
    else if (seg[0] === "s")         { html = viewSkill(decodeURIComponent(seg.slice(1).join("/"))); }
    else if (seg[0] === "log")       { html = inRun() ? viewTest() : viewLog(); }
    else if (seg[0] === "test")      { html = viewTest(); }
    else if (seg[0] === "results")   { html = inRun() ? viewTest() : viewResults(); }
    else                             { html = notFound(); }

    app.innerHTML = html;
    paintTestbar();

    // Reaching any L3 skill page ends the running task — after a beat, so the
    // participant sees the end state naming what they found.
    if (arrived) {
      setTimeout(function () {
        if (test.phase === "running") { finishTask(arrived.id); }
      }, 1100);
    }

    if (seg[0] !== "s" || test.phase !== "running") { window.scrollTo(0, 0); }
  }

  /* ------------------------------------------------------- button dispatch */

  document.addEventListener("click", function (e) {
    var node = e.target;
    while (node && node !== document && node.tagName !== "BUTTON") { node = node.parentNode; }
    if (!node || node.tagName !== "BUTTON") { return; }
    var act = node.getAttribute("data-act");
    if (!act) { return; }

    if (act === "log-json") {
      download("teama-clicklog-" + stamp() + ".json", JSON.stringify(readLog(), null, 2), "application/json");
    } else if (act === "log-csv") {
      download("teama-clicklog-" + stamp() + ".csv", logCsv(readLog()), "text/csv");
    } else if (act === "log-copy") {
      offerCopy("copy-mount", JSON.stringify(readLog(), null, 2));
    } else if (act === "log-clear") {
      if (window.confirm("Clear the whole click log for this browser?")) { writeLog([]); render(); }

    } else if (act === "runs-json") {
      download("teama-testruns-" + stamp() + ".json", JSON.stringify(readRuns(), null, 2), "application/json");
    } else if (act === "runs-csv") {
      download("teama-testruns-" + stamp() + ".csv", runsCsv(readRuns()), "text/csv");
    } else if (act === "runs-copy") {
      offerCopy("copy-mount", JSON.stringify(readRuns(), null, 2));
    } else if (act === "runs-clear") {
      if (window.confirm("Delete every stored test run in this browser?")) { save(RUNS_KEY, []); render(); }

    } else if (act === "test-start")   { startRun();
    } else if (act === "task-begin")   { beginTask();
    } else if (act === "task-next")    { nextTask();
    } else if (act === "task-giveup")  { finishTask(null);
    } else if (act === "test-finish")  { closeRun(); go("#/test");
    } else if (act === "run-resume")   { resumePending();
    } else if (act === "run-end")      { endPending();
    }
  });

  /* ------------------------------------------------------------------ boot */

  // A run left unfinished by a reload or a closed tab must be dealt with
  // explicitly — otherwise the participant lands back in normal browsing and
  // their clicks quietly leak into the click log.
  var interrupted = findUnfinishedRun();
  if (interrupted) {
    test.pending = interrupted;
    test.phase = "interrupted";
  }

  window.addEventListener("hashchange", render);
  render();

})();
