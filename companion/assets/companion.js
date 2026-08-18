/* ============================================================================
   companion.js — shared runtime for every page of the CS 356 companion.

   Loaded (with `defer`) by every companion page, AFTER assets/studies-data.js.

   It does three things:
     1. Injects the global fiction banner at the top of <body>. Every companion
        page gets it, always, with no per-page markup required.
     2. Renders registry-driven views into placeholder elements, when present:
          <div data-companion="arc">      the study arc (hub)
          <div data-companion="versions"> the version gallery (hub)
          <nav data-companion="arcnav">   prev/next arc nav (study pages; the
                                          page identifies itself with
                                          <body data-study="card-sort">)
     3. Keeps the site free of dead links: entries that are not finished render
        as clearly labeled, UNLINKED "in progress" items. Only studies with
        status "published" and versions with status "built"/"live" become links.

   No build step, no dependencies, no network requests. ES5-compatible on
   purpose — this file has to be readable by students who are learning.
   ========================================================================== */
(function () {
  'use strict';

  /* --- The global banner's exact wording (CONTENT-PLAN §5). Do not paraphrase:
         this text is the honest-fiction contract's most visible surface. ----- */
  var BANNER = {
    flag: 'Fictitious teaching example.',
    text: 'All participants, quotes, and data on this page are invented for CS 356. The site and its design decisions are real.',
    link: "What's real and what's not →"
  };

  var LABELS = {
    inProgress: 'In progress',
    studyPending: 'Page not written yet',
    versionPending: 'Snapshot not built yet',
    retired: 'Retired',
    noRegistry: 'The companion registry did not load, so this section is empty.'
  };

  /* ---------------------------------------------------------------- helpers */

  /* Tiny DOM builder. Children are strings (become text nodes) or nodes.
     Everything is built as DOM rather than innerHTML, so registry text can
     never be interpreted as markup. */
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    var key;
    if (attrs) {
      for (key in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, key)) { continue; }
        if (attrs[key] === null || attrs[key] === undefined) { continue; }
        node.setAttribute(key, String(attrs[key]));
      }
    }
    append(node, children);
    return node;
  }

  function append(node, children) {
    if (children === null || children === undefined) { return node; }
    if (!isArray(children)) { children = [children]; }
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child === null || child === undefined || child === false) { continue; }
      node.appendChild(typeof child === 'string' || typeof child === 'number'
        ? document.createTextNode(String(child))
        : child);
    }
    return node;
  }

  function isArray(x) {
    return Object.prototype.toString.call(x) === '[object Array]';
  }

  function clear(node) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
  }

  function each(list, fn) {
    if (!list) { return; }
    for (var i = 0; i < list.length; i++) { fn(list[i], i); }
  }

  function findAll(selector) {
    if (!document.querySelectorAll) { return []; }
    return document.querySelectorAll(selector);
  }

  /* --------------------------------------------------------- path resolution
     Companion pages live at two depths (companion/ and companion/studies/), and
     version snapshots sit deeper still. Rather than hard-coding depth into each
     page, derive the path back to companion/ from this script's own src — which
     the page already had to write correctly for the script to be running at all.
     Falls back to counting path segments after "/companion/". ---------------- */
  function computeBase() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].getAttribute('src');
      if (!src) { continue; }
      var m = src.match(/^(.*?)assets\/companion\.js(?:[?#].*)?$/);
      if (m && !/^https?:/i.test(m[1])) { return m[1]; }
    }
    var path = (window.location && window.location.pathname) || '';
    var marker = '/companion/';
    var idx = path.indexOf(marker);
    if (idx >= 0) {
      var rest = path.slice(idx + marker.length);
      var depth = rest.split('/').length - 1;
      var up = '';
      for (var d = 0; d < depth; d++) { up += '../'; }
      return up;
    }
    return '';
  }

  var BASE = computeBase();

  /* Resolve a registry href. Registry paths are written relative to companion/;
     absolute URLs (the church site, etc.) pass through untouched. */
  function resolve(href) {
    if (!href) { return null; }
    if (/^(https?:)?\/\//i.test(href) || href.charAt(0) === '#' ||
        /^mailto:/i.test(href)) {
      return href;
    }
    return BASE + href;
  }

  /* ------------------------------------------------------------- the banner */

  function buildBanner() {
    return h('div', { 'class': 'fiction-banner', 'role': 'note',
                      'aria-label': 'Fictitious teaching example' }, [
      h('div', { 'class': 'fiction-banner__inner' }, [
        h('strong', { 'class': 'fiction-banner__flag' }, BANNER.flag),
        ' ',
        h('span', { 'class': 'fiction-banner__text' }, BANNER.text),
        ' ',
        h('a', { 'class': 'fiction-banner__link', 'href': resolve('fiction.html') },
          BANNER.link)
      ])
    ]);
  }

  function injectBanner() {
    if (!document.body) { return; }
    if (document.body.getAttribute('data-companion-banner') === 'done') { return; }
    document.body.insertBefore(buildBanner(), document.body.firstChild);
    document.body.setAttribute('data-companion-banner', 'done');
  }

  /* ------------------------------------------------------ registry accessors */

  function registry() {
    var data = window.CS356_COMPANION;
    if (!data || !isArray(data.studies) || !isArray(data.versions)) { return null; }
    return data;
  }

  function studyById(data, id) {
    for (var i = 0; i < data.studies.length; i++) {
      if (data.studies[i].id === id) { return data.studies[i]; }
    }
    return null;
  }

  function versionById(data, id) {
    for (var i = 0; i < data.versions.length; i++) {
      if (data.versions[i].id === id) { return data.versions[i]; }
    }
    return null;
  }

  /* THE NO-DEAD-LINKS RULE lives in these two predicates. */
  function studyIsLive(study) {
    return !!study && study.status === 'published';
  }

  function versionIsLive(version) {
    return !!version && (version.status === 'built' || version.status === 'live');
  }

  /* A link when the target exists, otherwise plain text plus a pending pill. */
  function linkOrPending(isLive, href, label, pendingText, extraClass) {
    if (isLive && href) {
      return h('a', { 'class': extraClass || null, 'href': href }, label);
    }
    return h('span', { 'class': 'is-pending' + (extraClass ? ' ' + extraClass : '') }, [
      h('span', { 'class': 'is-pending__label' }, label),
      ' ',
      h('span', { 'class': 'pill pill--pending' }, pendingText)
    ]);
  }

  function badge(text) {
    return h('span', { 'class': 'fiction-badge' }, text || 'FICTITIOUS DATA');
  }

  /* ------------------------------------------------------------- the arc ---- */

  function studyNumbers(data) {
    /* Studies are numbered 1..5; the interlude sits in the walk without a
       number, so numbering is counted rather than read from `order`. */
    var map = {};
    var n = 0;
    each(data.studies, function (s) {
      if (s.kind === 'interlude') { map[s.id] = null; return; }
      n += 1;
      map[s.id] = n;
    });
    return map;
  }

  function versionChips(data, slugs) {
    if (!isArray(slugs) || !slugs.length) { return null; }
    var list = h('ul', { 'class': 'chips' });
    each(slugs, function (slug) {
      var v = versionById(data, slug);
      if (!v) { return; }
      list.appendChild(h('li', { 'class': 'chips__item' }, [
        linkOrPending(versionIsLive(v), resolve(v.path), v.title,
          LABELS.versionPending, 'chip')
      ]));
    });
    return list.firstChild ? list : null;
  }

  function studyChips(data, slugs) {
    if (!isArray(slugs) || !slugs.length) { return null; }
    var list = h('ul', { 'class': 'chips' });
    each(slugs, function (slug) {
      var s = studyById(data, slug);
      if (!s) { return; }
      list.appendChild(h('li', { 'class': 'chips__item' }, [
        linkOrPending(studyIsLive(s), resolve(s.page), s.title,
          LABELS.studyPending, 'chip')
      ]));
    });
    return list.firstChild ? list : null;
  }

  function arcItem(data, study, numbers) {
    var isInterlude = study.kind === 'interlude';
    var number = numbers[study.id];
    var marker = isInterlude ? 'Interlude' : 'Study ' + number;
    var classes = 'arc-item' + (isInterlude ? ' arc-item--interlude' : '') +
      (studyIsLive(study) ? '' : ' arc-item--pending');

    var head = h('h3', { 'class': 'arc-item__title' }, [
      linkOrPending(studyIsLive(study), resolve(study.page), study.title,
        study.status === 'retired' ? LABELS.retired : LABELS.inProgress)
    ]);

    var body = [
      h('p', { 'class': 'arc-item__method' }, study.method || ''),
      study.question ? h('p', { 'class': 'arc-item__question' }, [
        h('span', { 'class': 'micro-label' }, 'Question'), ' ', study.question
      ]) : null,
      study.keyFinding ? h('p', { 'class': 'arc-item__finding' }, [
        h('span', { 'class': 'micro-label' }, 'Finding'), ' ', study.keyFinding
      ]) : null
    ];

    var chips = versionChips(data, study.versions);
    if (chips) {
      body.push(h('div', { 'class': 'arc-item__versions' }, [
        h('span', { 'class': 'micro-label' }, 'Versions'), chips
      ]));
    }

    return h('li', { 'class': classes }, [
      h('div', { 'class': 'arc-item__marker' }, marker),
      h('div', { 'class': 'arc-item__body' }, [head].concat(body))
    ]);
  }

  function renderArc(container, data) {
    var numbers = studyNumbers(data);
    var list = h('ol', { 'class': 'arc-list' });
    each(data.studies, function (study) {
      list.appendChild(arcItem(data, study, numbers));
    });
    clear(container);
    append(container, [
      h('p', { 'class': 'fiction-note' }, [
        badge('FICTITIOUS DATA'), ' ',
        'The one-line findings, participant counts, and study parameters below ' +
        'are invented for CS 356. The methods, the design decisions, and the ' +
        'commits they cite are real.'
      ]),
      list
    ]);
  }

  /* ------------------------------------------------------ the version gallery */

  function kindLabel(version) {
    if (version.kind === 'live') { return 'Live site'; }
    if (version.kind === 'constructed') { return 'Constructed for teaching'; }
    return 'Real git snapshot';
  }

  function versionCard(data, version) {
    var live = versionIsLive(version);
    var classes = 'version-card version-card--' + (version.kind || 'real') +
      (live ? '' : ' version-card--pending');

    var parts = [
      h('div', { 'class': 'version-card__rung' }, [
        h('span', { 'class': 'version-card__fidelity' }, String(version.fidelity)),
        h('span', { 'class': 'version-card__rung-name' }, version.rung || '')
      ]),
      h('h3', { 'class': 'version-card__title' }, [
        linkOrPending(live, resolve(version.path), version.title,
          version.kind === 'live' ? LABELS.inProgress : LABELS.versionPending)
      ]),
      h('p', { 'class': 'version-card__kind' }, [
        h('span', { 'class': 'pill pill--kind' }, kindLabel(version)),
        version.optional ? h('span', { 'class': 'pill pill--optional' }, 'Optional') : null
      ]),
      version.source ? h('p', { 'class': 'version-card__source' }, [
        h('span', { 'class': 'micro-label' }, 'Provenance'), ' ', version.source
      ]) : null,
      version.shows ? h('p', { 'class': 'version-card__shows' }, version.shows) : null
    ];

    var chips = studyChips(data, version.studies);
    if (chips) {
      parts.push(h('div', { 'class': 'version-card__studies' }, [
        h('span', { 'class': 'micro-label' }, 'Studied in'), chips
      ]));
    }

    return h('li', { 'class': classes }, parts);
  }

  function renderVersions(container, data) {
    var list = h('ul', { 'class': 'version-gallery' });
    each(data.versions, function (version) {
      list.appendChild(versionCard(data, version));
    });
    clear(container);
    append(container, list);
  }

  /* ------------------------------------------------------- prev/next arc nav */

  function navSide(study, direction) {
    var label = direction === 'prev' ? 'Previous' : 'Next';
    var classes = 'arcnav__side arcnav__side--' + direction;
    if (!study) {
      return h('span', { 'class': classes + ' arcnav__side--empty' }, [
        h('span', { 'class': 'micro-label' }, label),
        h('span', { 'class': 'arcnav__title' },
          direction === 'prev' ? 'Start of the arc' : 'End of the arc')
      ]);
    }
    return h('span', { 'class': classes }, [
      h('span', { 'class': 'micro-label' }, label),
      linkOrPending(studyIsLive(study), resolve(study.page), study.title,
        LABELS.inProgress, 'arcnav__title')
    ]);
  }

  function renderArcNav(container, data, currentId) {
    var index = -1;
    for (var i = 0; i < data.studies.length; i++) {
      if (data.studies[i].id === currentId) { index = i; break; }
    }
    if (index < 0) { return; }
    // Pages only need the data-companion hook; the styling class rides along.
    if ((' ' + container.className + ' ').indexOf(' arcnav ') < 0) {
      container.className = (container.className ? container.className + ' ' : '') + 'arcnav';
    }
    clear(container);
    append(container, [
      navSide(index > 0 ? data.studies[index - 1] : null, 'prev'),
      h('a', { 'class': 'arcnav__hub', 'href': resolve('index.html') },
        'The whole arc'),
      navSide(index < data.studies.length - 1 ? data.studies[index + 1] : null, 'next')
    ]);
  }

  /* ------------------------------------------------------------------ boot -- */

  function renderAll() {
    var data = registry();
    var targets = [];
    each(findAll('[data-companion]'), function (node) { targets.push(node); });

    if (!data) {
      each(targets, function (node) {
        clear(node);
        append(node, h('p', { 'class': 'is-pending' }, LABELS.noRegistry));
      });
      return;
    }

    each(targets, function (node) {
      var what = node.getAttribute('data-companion');
      if (what === 'arc') {
        renderArc(node, data);
      } else if (what === 'versions') {
        renderVersions(node, data);
      } else if (what === 'arcnav') {
        var current = node.getAttribute('data-study') ||
          (document.body && document.body.getAttribute('data-study'));
        if (current) { renderArcNav(node, data, current); }
      }
    });
  }

  function start() {
    injectBanner();
    renderAll();
  }

  if (document.readyState === 'loading') {
    if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', start, false);
    } else {
      window.setTimeout(start, 0);
    }
  } else {
    start();
  }
})();
