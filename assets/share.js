/* Teacher Development Skills — shared "permanent link" helper.
   Builds a link to summary.html for a set of skill ids, copies it to the
   clipboard, and shows a small toast. Used by the generator (app.js) and the
   summary page (summary.js) so both produce the same kind of link. */
(function () {
  "use strict";

  // Absolute URL to summary.html (same folder as the current page) for the ids,
  // carrying the active language so the saved link reopens in the same language.
  function permalinkFor(ids) {
    var dir = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
    var lang = (window.TDS_I18N && window.TDS_I18N.lang) || "eng";
    var q = (lang && lang !== "eng") ? "?lang=" + lang : "";
    return dir + "summary.html" + q + "#sel=" + ids.join(",");
  }

  // Localized string with a safe English fallback.
  function t(key, fallback) {
    var s = (window.TDS_I18N && window.TDS_I18N.t(key));
    return (s && s !== key) ? s : fallback;
  }

  function toast(msg) {
    var t = document.getElementById("tds-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "tds-toast";
      t.className = "toast";
      t.setAttribute("role", "status");
      t.setAttribute("aria-live", "polite");
      document.body.appendChild(t);
    }
    t.textContent = msg;
    // force reflow so re-triggering the animation works
    void t.offsetWidth;
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove("show"); }, 4000);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (e) { reject(e); }
    });
  }

  function copyPermalink(ids) {
    if (!ids || !ids.length) return;
    var url = permalinkFor(ids);
    copyText(url).then(function () {
      toast(t("toastCopied", "Link copied to your clipboard. Save it to return to these five skills anytime."));
    }).catch(function () {
      toast(t("toastCopyFail", "Couldn’t copy automatically. Your link:") + " " + url);
    });
  }

  window.TDSshare = {
    permalinkFor: permalinkFor,
    toast: toast,
    copyText: copyText,
    copyPermalink: copyPermalink
  };
})();
