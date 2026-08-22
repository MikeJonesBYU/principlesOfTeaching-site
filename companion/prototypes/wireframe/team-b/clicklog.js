/* clicklog.js - records the clicks people make while testing our wireframe. */

var clickLog = [];

function clickLogLabel(el) {
  var t = "";
  if (el && el.textContent) {
    t = el.textContent.replace(/\s+/g, " ").replace(/^ | $/g, "");
  }
  if (t.length > 60) {
    t = t.substring(0, 60) + "...";
  }
  return t;
}

function clickLogRecord(e) {
  var el = e.target;
  var href = "";
  if (el && el.getAttribute) {
    href = el.getAttribute("href") || "";
  }
  clickLog.push({
    n: clickLog.length + 1,
    time: new Date().toLocaleTimeString(),
    page: document.title,
    text: clickLogLabel(el),
    href: href
  });
  var counter = document.getElementById("clicklog-count");
  if (counter) {
    counter.innerHTML = clickLog.length;
  }
}

function clickLogText() {
  var lines = ["#\ttime\tpage\tclicked\tlink"];
  for (var i = 0; i < clickLog.length; i++) {
    var r = clickLog[i];
    lines.push(r.n + "\t" + r.time + "\t" + r.page + "\t" + r.text + "\t" + r.href);
  }
  return lines.join("\n");
}

document.addEventListener("click", clickLogRecord, true);

document.addEventListener("DOMContentLoaded", function () {
  var btn = document.getElementById("clicklog-export");
  var out = document.getElementById("clicklog-out");
  if (btn && out) {
    btn.onclick = function () {
      out.style.display = "block";
      out.value = clickLogText();
    };
  }
});
