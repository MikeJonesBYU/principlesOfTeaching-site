/* log.js - Team B, prototype v1.

   Last time our click log started over every single time somebody clicked a
   link, which basically made it useless for seeing a path. So this one saves
   to localStorage and keeps going across pages, and the export button is on
   every page now instead of only the home page. */

var LOG_CLICK_KEY = "teamb_v1_clicks";
var LOG_SEARCH_KEY = "teamb_v1_searches";

function logRead(key) {
  var raw = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch (e) {
    return [];
  }
  if (!raw) { return []; }
  try {
    var rows = JSON.parse(raw);
    if (Object.prototype.toString.call(rows) === "[object Array]") { return rows; }
  } catch (e) {
    return [];
  }
  return [];
}

function logWrite(key, rows) {
  try {
    window.localStorage.setItem(key, JSON.stringify(rows));
  } catch (e) {
    /* private browsing, nothing we can do about it */
  }
}

function logLabel(el) {
  var t = "";
  if (el && el.textContent) {
    t = el.textContent.replace(/\s+/g, " ").replace(/^ | $/g, "");
  }
  if (t.length > 60) { t = t.substring(0, 60) + "..."; }
  return t;
}

function logCount() {
  var counter = document.getElementById("log-count");
  if (counter) {
    counter.innerHTML = logRead(LOG_CLICK_KEY).length;
  }
}

function logRecordClick(e) {
  var el = e.target;
  /* The tiles on the home page are a link with an h2 and a p inside them, so
     e.target is the h2 and not the link. Walk up to the actual link first,
     otherwise those clicks get logged with no href at all. */
  var link = null;
  if (el && el.closest) {
    link = el.closest("a");
  }
  var hit = link || el;
  var href = "";
  if (hit && hit.getAttribute) {
    href = hit.getAttribute("href") || "";
  }
  var rows = logRead(LOG_CLICK_KEY);
  rows.push({
    n: rows.length + 1,
    time: new Date().toLocaleTimeString(),
    page: document.title,
    clicked: logLabel(hit),
    href: href
  });
  logWrite(LOG_CLICK_KEY, rows);
  logCount();
}

/* searches go in their own list so they don't get mixed in with the clicks */
function logRecordSearch(query, hits) {
  var rows = logRead(LOG_SEARCH_KEY);
  rows.push({
    n: rows.length + 1,
    time: new Date().toLocaleTimeString(),
    query: query,
    results: hits
  });
  logWrite(LOG_SEARCH_KEY, rows);
}

function logText() {
  return JSON.stringify({
    clicks: logRead(LOG_CLICK_KEY),
    searches: logRead(LOG_SEARCH_KEY)
  }, null, 2);
}

document.addEventListener("click", logRecordClick, true);

document.addEventListener("DOMContentLoaded", function () {
  logCount();

  var out = document.getElementById("log-out");
  var copy = document.getElementById("log-copy");
  var reset = document.getElementById("log-reset");

  if (copy && out) {
    copy.onclick = function () {
      out.style.display = "block";
      out.value = logText();
      out.focus();
      out.select();
    };
  }

  if (reset) {
    reset.onclick = function () {
      logWrite(LOG_CLICK_KEY, []);
      logWrite(LOG_SEARCH_KEY, []);
      if (out) { out.value = ""; out.style.display = "none"; }
      logCount();
    };
  }
});
