// cs356 comments client — auto-injected by the server into every .html page.
// Provides an "Admin mode" toggle button. While admin mode is on, clicking any
// element on the page (other than the comments UI itself) opens a dialog to
// attach a comment. Existing comments appear as markers.

(function () {
  'use strict';

  const PAGE_PATH = window.location.pathname;
  const AUTHOR_KEY = 'cs356_comment_author';
  const PASSCODE_KEY = 'cs356_admin_passcode';

  let config = { enabled: false };
  let comments = []; // all loaded comments for this page
  let commentsLoaded = false;
  let adminMode = false;
  let repositionScheduled = false;

  // ---------- helpers ----------

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function getAuthor() {
    // Allow overriding via ?author=... for scripted use; otherwise prompt once
    // and store in localStorage.
    const params = new URLSearchParams(window.location.search);
    const fromUrl = (params.get('author') || '').trim();
    if (fromUrl) {
      localStorage.setItem(AUTHOR_KEY, fromUrl);
      return fromUrl;
    }
    let name = localStorage.getItem(AUTHOR_KEY);
    if (!name) {
      name = (prompt('Your name (used to label your comments):') || '').trim();
      if (name) localStorage.setItem(AUTHOR_KEY, name);
    }
    return name || '';
  }

  // Passcode support: when the server has ADMIN_PASSCODE set, all comment
  // reads/writes need the X-CS356-Passcode header. We store it after the
  // first prompt; a 401 clears it so the next attempt re-prompts.
  function getPasscode() {
    if (!config.passcodeRequired) return '';
    let code = localStorage.getItem(PASSCODE_KEY);
    if (!code) {
      code = (prompt('Admin passcode:') || '').trim();
      if (code) localStorage.setItem(PASSCODE_KEY, code);
    }
    return code || '';
  }

  function apiHeaders(extra) {
    const h = Object.assign({}, extra || {});
    const code = config.passcodeRequired ? (localStorage.getItem(PASSCODE_KEY) || '') : '';
    if (code) h['X-CS356-Passcode'] = code;
    return h;
  }

  function handleUnauthorized() {
    localStorage.removeItem(PASSCODE_KEY);
    alert('Wrong or missing admin passcode.');
  }

  // Build a reasonably stable selector for an element. Prefers IDs, falls back
  // to a chain of tag + :nth-of-type indices.
  function selectorFor(el) {
    if (el.id) return '#' + (window.CSS && CSS.escape ? CSS.escape(el.id) : el.id);
    const parts = [];
    let cur = el;
    while (cur && cur.nodeType === 1 && cur.tagName.toLowerCase() !== 'html') {
      let part = cur.tagName.toLowerCase();
      if (cur.id) { parts.unshift('#' + (window.CSS && CSS.escape ? CSS.escape(cur.id) : cur.id)); break; }
      const parent = cur.parentNode;
      if (parent) {
        const same = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
        if (same.length > 1) {
          const idx = same.indexOf(cur) + 1;
          part += `:nth-of-type(${idx})`;
        }
      }
      parts.unshift(part);
      cur = cur.parentNode;
    }
    return parts.join(' > ');
  }

  function inOurUi(el) {
    while (el) {
      if (el.classList && el.classList.contains('cs356-ui')) return true;
      el = el.parentNode;
    }
    return false;
  }

  // ---------- data ----------

  async function loadConfig() {
    try {
      const r = await fetch('/api/config');
      config = await r.json();
    } catch { config = { enabled: false }; }
  }

  async function loadComments() {
    try {
      const r = await fetch('/api/comments', { headers: apiHeaders() });
      if (r.status === 401) { handleUnauthorized(); comments = []; return false; }
      const xml = await r.text();
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      const seen = new Set();
      comments = Array.from(doc.querySelectorAll('comment'))
        .map(c => ({
          id: c.getAttribute('id'),
          status: c.getAttribute('status'),
          page: (c.querySelector('page') || {}).textContent || '',
          selector: (c.querySelector('selector') || {}).textContent || '',
          snippet: (c.querySelector('element-snippet') || {}).textContent || '',
          author: (c.querySelector('author') || {}).textContent || '',
          timestamp: (c.querySelector('timestamp') || {}).textContent || '',
          text: (c.querySelector('text') || {}).textContent || '',
        }))
        // A comment can surface twice (e.g. live file merged into main AND
        // still on the branch worktree) — keep the first copy of each id.
        .filter(c => c.page === PAGE_PATH)
        .filter(c => !c.id || (!seen.has(c.id) && (seen.add(c.id) || true)));
      commentsLoaded = true;
      return true;
    } catch { comments = []; return false; }
  }

  // ---------- UI ----------

  function buildAdminButton() {
    const btn = document.createElement('button');
    btn.id = 'cs356-admin-btn';
    btn.className = 'cs356-ui cs356-admin-btn';
    btn.type = 'button';
    btn.textContent = 'Admin mode';
    btn.addEventListener('click', toggleAdmin);
    document.body.appendChild(btn);
  }

  async function toggleAdmin() {
    if (!adminMode && config.passcodeRequired) {
      if (!getPasscode()) return; // cancelled the prompt
    }
    if (!adminMode && !commentsLoaded) {
      const ok = await loadComments();
      if (!ok && config.passcodeRequired) return; // bad passcode; stay out
    }
    adminMode = !adminMode;
    document.body.classList.toggle('cs356-admin-on', adminMode);
    const btn = document.getElementById('cs356-admin-btn');
    if (btn) {
      btn.textContent = adminMode ? 'Exit admin mode' : 'Admin mode';
      btn.classList.toggle('on', adminMode);
    }
    if (adminMode) {
      document.addEventListener('click', handleElementClick, true);
      renderMarkers();
    } else {
      document.removeEventListener('click', handleElementClick, true);
      clearMarkers();
    }
  }

  function handleElementClick(e) {
    if (inOurUi(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    openComposer(e.target);
  }

  function openComposer(target) {
    const author = getAuthor();
    if (!author) return;
    const sel = selectorFor(target);
    const snippet = (target.innerText || target.textContent || '').trim().slice(0, 100);

    const overlay = document.createElement('div');
    overlay.className = 'cs356-ui cs356-overlay';
    overlay.innerHTML = `
      <div class="cs356-card">
        <div class="cs356-card-header">
          New comment <span class="cs356-meta">as ${escapeHtml(author)}</span>
          <button type="button" class="cs356-close" aria-label="Close">&times;</button>
        </div>
        <div class="cs356-card-target">on: <code>${escapeHtml(sel)}</code></div>
        ${snippet ? `<div class="cs356-card-snippet">&ldquo;${escapeHtml(snippet)}&hellip;&rdquo;</div>` : ''}
        <textarea class="cs356-textarea" rows="4" placeholder="Your comment&hellip;"></textarea>
        <div class="cs356-actions">
          <button type="button" class="cs356-btn cs356-cancel">Cancel</button>
          <button type="button" class="cs356-btn cs356-primary cs356-save">Save comment</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    const ta = overlay.querySelector('.cs356-textarea');
    ta.focus();

    function close() { overlay.remove(); }
    overlay.querySelector('.cs356-cancel').addEventListener('click', close);
    overlay.querySelector('.cs356-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('.cs356-save').addEventListener('click', async () => {
      const text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      try {
        const r = await fetch('/api/comments', {
          method: 'POST',
          headers: apiHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            page: PAGE_PATH,
            selector: sel,
            snippet,
            text,
            author,
          }),
        });
        if (r.status === 401) { handleUnauthorized(); return; }
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || ('save failed: ' + r.status));
        }
        close();
        await loadComments();
        renderMarkers();
      } catch (e) {
        alert('Could not save comment: ' + (e.message || e));
      }
    });
  }

  // ---------- markers ----------

  function clearMarkers() {
    document.querySelectorAll('.cs356-marker').forEach(m => m.remove());
  }

  function renderMarkers() {
    clearMarkers();
    if (!adminMode) return;
    const bySel = new Map();
    for (const c of comments) {
      if (!bySel.has(c.selector)) bySel.set(c.selector, []);
      bySel.get(c.selector).push(c);
    }
    for (const [sel, list] of bySel) {
      let target = null;
      try { target = document.querySelector(sel); } catch { /* ignore */ }
      if (!target) continue;
      const openCount = list.filter(c => c.status === 'new').length;
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'cs356-ui cs356-marker' + (openCount ? ' has-new' : '');
      marker.textContent = `💬 ${list.length}` + (openCount ? ` (${openCount} new)` : '');
      marker.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openViewer(target, list);
      });
      positionMarker(marker, target);
      document.body.appendChild(marker);
    }
  }

  function positionMarker(marker, target) {
    const rect = target.getBoundingClientRect();
    marker.style.top = (window.scrollY + rect.top) + 'px';
    marker.style.left = (window.scrollX + rect.right + 4) + 'px';
  }

  function repositionAllMarkers() {
    if (!adminMode) return;
    document.querySelectorAll('.cs356-marker').forEach(m => {
      const sel = m.dataset.selector;
      if (!sel) return;
      let t = null;
      try { t = document.querySelector(sel); } catch {}
      if (t) positionMarker(m, t);
    });
  }

  function openViewer(target, list) {
    const overlay = document.createElement('div');
    overlay.className = 'cs356-ui cs356-overlay';
    list.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    overlay.innerHTML = `
      <div class="cs356-card">
        <div class="cs356-card-header">
          ${list.length} comment${list.length === 1 ? '' : 's'} on this element
          <button type="button" class="cs356-close" aria-label="Close">&times;</button>
        </div>
        <div class="cs356-list"></div>
      </div>
    `;
    const listEl = overlay.querySelector('.cs356-list');
    for (const c of list) {
      const item = document.createElement('div');
      item.className = `cs356-comment cs356-status-${c.status}`;
      item.innerHTML = `
        <div class="cs356-comment-meta">
          <strong>${escapeHtml(c.author)}</strong>
          <span class="cs356-ts">${escapeHtml(c.timestamp)}</span>
          <span class="cs356-status-badge cs356-status-${escapeHtml(c.status)}">${escapeHtml(c.status)}</span>
        </div>
        <div class="cs356-comment-text">${escapeHtml(c.text)}</div>
        <div class="cs356-comment-actions">
          <span class="cs356-mark-label">Mark as:</span>
          <button type="button" data-status="new">new</button>
          <button type="button" data-status="resolved">resolved</button>
          <button type="button" data-status="ignored">ignored</button>
        </div>
      `;
      item.querySelectorAll('.cs356-comment-actions button').forEach(b => {
        b.addEventListener('click', async () => {
          const newStatus = b.dataset.status;
          try {
            const r = await fetch('/api/comments/' + encodeURIComponent(c.id), {
              method: 'PATCH',
              headers: apiHeaders({ 'Content-Type': 'application/json' }),
              body: JSON.stringify({ status: newStatus }),
            });
            if (r.status === 401) { handleUnauthorized(); return; }
            if (!r.ok) {
              const err = await r.json().catch(() => ({}));
              throw new Error(err.error || ('update failed: ' + r.status));
            }
            overlay.remove();
            await loadComments();
            renderMarkers();
          } catch (e) {
            alert('Could not update comment: ' + (e.message || e));
          }
        });
      });
      listEl.appendChild(item);
    }
    function close() { overlay.remove(); }
    overlay.querySelector('.cs356-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
  }

  // ---------- lifecycle ----------

  function scheduleReposition() {
    if (repositionScheduled) return;
    repositionScheduled = true;
    requestAnimationFrame(() => {
      repositionScheduled = false;
      renderMarkers();
    });
  }

  window.addEventListener('scroll', scheduleReposition, { passive: true });
  window.addEventListener('resize', scheduleReposition);

  async function init() {
    await loadConfig();
    if (!config.enabled) return; // global kill switch
    if (document.readyState === 'loading') {
      await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
    }
    buildAdminButton();
    // With a passcode required, don't fetch the feed until admin mode is
    // entered (the request would just 401 and annoy the browser console).
    if (!config.passcodeRequired) await loadComments();
  }

  init();
})();
