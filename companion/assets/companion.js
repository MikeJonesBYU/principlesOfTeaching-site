/* ============================================================================
   companion.js — shared runtime for every page of the CS 356 companion.

   Loaded (with `defer`) by every companion page, AFTER assets/studies-data.js.

   It does three things:
     1. Injects the global fiction banner at the top of <body>. Every companion
        page gets it, always, with no per-page markup required.
     2. Renders registry-driven views into placeholder elements, when present:
          <div data-companion="chain">    the design cycle (hub)
          <nav data-companion="arcnav">   prev/next arc nav (study pages; the
                                          page identifies itself with
                                          <body data-arc="card-sort">)
     3. Keeps the site free of dead links: stations that are not finished render
        as clearly labeled, UNLINKED "in progress" items. Only studies with
        status "published" and prototypes with status "built"/"frozen"/"shipped"
        become links.

   NOTE: prototype artifacts under prototypes/<slug>/ do NOT load this file —
   they are self-contained specimens with their own static banner
   (ARCHITECTURE §6).

   No build step, no dependencies, no network requests. ES5-compatible on
   purpose — this file has to be readable by students who are learning.
   ========================================================================== */
(function () {
  'use strict';

  /* --- The global banner's exact wording (CONTENT-PLAN §8). Do not paraphrase:
         this text is the honest-fiction contract's most visible surface. ----- */
  var BANNER = {
    flag: 'Fictitious teaching example.',
    text: 'All participants, quotes, and data on this page are invented for CS 356. The site and its design decisions are real.',
    link: "What's real and what's not →"
  };

  var LABELS = {
    inProgress: 'In progress',
    studyPending: 'Page not written yet',
    prototypePending: 'Not built yet',
    retired: 'Retired',
    frozen: 'Frozen',
    shipped: 'Shipped',
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
     Companion pages live at two depths (companion/ and companion/studies/).
     Rather than hard-coding depth into each page, derive the path back to
     companion/ from this script's own src — which the page already had to
     write correctly for the script to be running at all. Falls back to
     counting path segments after "/companion/". ----------------------------- */
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
    if (!data || !isArray(data.arc)) { return null; }
    return data;
  }

  function stationById(data, id) {
    for (var i = 0; i < data.arc.length; i++) {
      if (data.arc[i].id === id) { return data.arc[i]; }
    }
    return null;
  }

  /* THE NO-DEAD-LINKS RULE lives in this predicate. */
  function stationIsLive(station) {
    if (!station) { return false; }
    if (station.kind === 'prototype') {
      return station.status === 'built' || station.status === 'frozen' ||
        station.status === 'shipped';
    }
    return station.status === 'published';
  }

  function stationHref(station) {
    return station.kind === 'prototype' ? station.path : station.page;
  }

  function pendingLabel(station) {
    if (station.status === 'retired') { return LABELS.retired; }
    return station.kind === 'prototype'
      ? LABELS.prototypePending : LABELS.studyPending;
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

  /* ------------------------------------------------------------ the chain ---
     One list, chain order: Study 1, Prototype 1, Study 2, … Studies and
     prototypes are numbered separately, so markers read "Study 2" and
     "Prototype 2" without either renumbering the other. ------------------- */

  function stationNumbers(data) {
    var map = {};
    var s = 0, p = 0;
    each(data.arc, function (st) {
      if (st.kind === 'prototype') { p += 1; map[st.id] = 'Prototype ' + p; }
      else { s += 1; map[st.id] = 'Study ' + s; }
    });
    return map;
  }

  function chainItem(data, station, numbers) {
    var isProto = station.kind === 'prototype';
    var live = stationIsLive(station);
    var classes = 'arc-item' + (isProto ? ' arc-item--prototype' : '') +
      (live ? '' : ' arc-item--pending');

    var head = h('h3', { 'class': 'arc-item__title' }, [
      linkOrPending(live, resolve(stationHref(station)), station.title,
        pendingLabel(station))
    ]);

    var body = [
      h('p', { 'class': 'arc-item__method' },
        isProto ? ('Prototype — ' + (station.fidelity || '') + ' fidelity')
                : (station.method || '')),
      station.question ? h('p', { 'class': 'arc-item__question' }, [
        h('span', { 'class': 'micro-label' }, 'Question'), ' ', station.question
      ]) : null,
      station.shows ? h('p', { 'class': 'arc-item__finding' }, [
        h('span', { 'class': 'micro-label' }, isProto ? 'Notice' : 'Delivers'),
        ' ', station.shows
      ]) : null
    ];

    /* Cross-link: what this station feeds, or the study that tests it. */
    var partnerId = isProto ? station.testedBy : station.feeds;
    var partner = partnerId ? stationById(data, partnerId) : null;
    if (partner) {
      body.push(h('p', { 'class': 'arc-item__links' }, [
        h('span', { 'class': 'micro-label' },
          isProto ? 'Tested by' : 'Feeds'),
        ' ',
        linkOrPending(stationIsLive(partner), resolve(stationHref(partner)),
          partner.title, pendingLabel(partner), 'chip')
      ]));
    }
    if (isProto && station.status === 'frozen') {
      body.push(h('p', { 'class': 'arc-item__links' }, [
        h('span', { 'class': 'pill pill--kind' }, LABELS.frozen)
      ]));
    }
    if (isProto && station.status === 'shipped') {
      body.push(h('p', { 'class': 'arc-item__links' }, [
        h('span', { 'class': 'pill pill--kind' }, LABELS.shipped)
      ]));
    }

    return h('li', { 'class': classes }, [
      h('div', { 'class': 'arc-item__marker' }, numbers[station.id]),
      h('div', { 'class': 'arc-item__body' }, [head].concat(body))
    ]);
  }

  function renderChain(container, data) {
    var numbers = stationNumbers(data);
    var list = h('ol', { 'class': 'arc-list' });
    each(data.arc, function (station) {
      list.appendChild(chainItem(data, station, numbers));
    });
    clear(container);
    append(container, [
      h('p', { 'class': 'fiction-note' }, [
        badge('FICTITIOUS DATA'), ' ',
        'The study questions, findings, and participant details below are ' +
        'invented for CS 356. The prototypes are real working artifacts, and ' +
        'the design decisions the studies land on are really implemented in ' +
        'the next prototype in the chain.'
      ]),
      list
    ]);
  }

  /* ------------------------------------------------------- prev/next arc nav */

  function navSide(station, direction) {
    var label = direction === 'prev' ? 'Previous' : 'Next';
    var classes = 'arcnav__side arcnav__side--' + direction;
    if (!station) {
      return h('span', { 'class': classes + ' arcnav__side--empty' }, [
        h('span', { 'class': 'micro-label' }, label),
        h('span', { 'class': 'arcnav__title' },
          direction === 'prev' ? 'Start of the chain' : 'End of the chain')
      ]);
    }
    return h('span', { 'class': classes }, [
      h('span', { 'class': 'micro-label' }, label),
      linkOrPending(stationIsLive(station), resolve(stationHref(station)),
        station.title, pendingLabel(station), 'arcnav__title')
    ]);
  }

  function renderArcNav(container, data, currentId) {
    var index = -1;
    for (var i = 0; i < data.arc.length; i++) {
      if (data.arc[i].id === currentId) { index = i; break; }
    }
    if (index < 0) { return; }
    // Pages only need the data-companion hook; the styling class rides along.
    if ((' ' + container.className + ' ').indexOf(' arcnav ') < 0) {
      container.className = (container.className ? container.className + ' ' : '') + 'arcnav';
    }
    clear(container);
    append(container, [
      navSide(index > 0 ? data.arc[index - 1] : null, 'prev'),
      h('a', { 'class': 'arcnav__hub', 'href': resolve('index.html') },
        'The whole chain'),
      navSide(index < data.arc.length - 1 ? data.arc[index + 1] : null, 'next')
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
      if (what === 'chain') {
        renderChain(node, data);
      } else if (what === 'arcnav') {
        var current = node.getAttribute('data-arc') ||
          (document.body && document.body.getAttribute('data-arc'));
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
