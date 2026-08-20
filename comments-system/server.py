#!/usr/bin/env python3
"""cs356 comments server — zero-dependency Python 3 stdlib.

Serves the project root as static files, auto-injects the comments UI into
every .html response, and exposes a small JSON+XML API for comments.

Run from the repo root:
    python3 comments-system/server.py
or:
    PORT=4000 python3 comments-system/server.py
"""

import base64
import hmac
import json
import os
import re
import secrets
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Optional
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parent.parent
PORT = int(os.environ.get("PORT", "3035"))
# Bind localhost when run on a laptop; bind all interfaces on Render (which
# sets RENDER=true) or when HOST is given explicitly.
HOST = os.environ.get("HOST") or ("0.0.0.0" if os.environ.get("RENDER") else "127.0.0.1")
CONFIG_PATH = ROOT / "comments-config.json"
XML_DIR = ROOT / "comments"
# Legacy single-file store, kept for backward compatibility on read. New
# comments are written to per-author files: comments/comments-<author>.xml.
LEGACY_XML_PATH = XML_DIR / "comments.xml"
XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>\n<comments>\n'
XML_FOOTER = "</comments>\n"

# Tree-test responses are appended, one JSON object per line (JSONL), to a file
# tracked in the repo so runs sync via git — same idea as the comments store.
TREE_TEST_PATH = ROOT / "examples" / "tree-test-results.jsonl"

# ---------------------------------------------------------------------------
# Live mode (the deployed server on Render).
#
# The deployed filesystem is ephemeral, so in live mode every comment is
# written as its OWN file under comments/live/ (and every tree-test session
# under examples/tree-test-live/), and each write is committed to the
# COMMENTS_BRANCH branch on GitHub via the contents API. One-file-per-comment
# means commits never conflict and a redeploy can't lose anything that reached
# GitHub. On boot the server downloads those directories back from the branch.
#
# Locally (live mode off) nothing changes — per-author files as before — but
# if the live-comments branch has been pulled into a parallel worktree
# (see pull-live-comments.sh), its live comments are merged into the feed so
# they show up as markers on the local pages too.
# ---------------------------------------------------------------------------
LIVE_MODE = os.environ.get("COMMENTS_LIVE", "").strip().lower() in ("1", "true", "yes", "on")
LIVE_XML_DIR = XML_DIR / "live"
TREE_TEST_LIVE_DIR = ROOT / "examples" / "tree-test-live"

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "").strip()
GITHUB_REPO = os.environ.get("GITHUB_REPO", "").strip()  # e.g. MikeJonesBYU/cs356-rebuild
COMMENTS_BRANCH = os.environ.get("COMMENTS_BRANCH", "live-comments").strip()
GITHUB_SYNC = bool(LIVE_MODE and GITHUB_TOKEN and GITHUB_REPO)

# Optional shared passcode. When set, reading the comment feed / tree-test
# results and all comment writes require the X-CS356-Passcode header.
# Submitting a tree test stays open (students do that).
ADMIN_PASSCODE = os.environ.get("ADMIN_PASSCODE", "").strip()

# Parallel worktree where the live-comments branch is checked out locally.
LIVE_WORKTREE = Path(os.environ.get("LIVE_WORKTREE") or (ROOT.parent / "cs356-live-comments"))

MAX_BODY_BYTES = 1_000_000  # cap request bodies; this is a comments API
WRITE_LOCK = threading.Lock()

XML_DIR.mkdir(parents=True, exist_ok=True)

if not CONFIG_PATH.exists():
    CONFIG_PATH.write_text(json.dumps({"enabled": True}, indent=2) + "\n", encoding="utf-8")


MIME = {
    ".html": "text/html; charset=utf-8",
    ".htm":  "text/html; charset=utf-8",
    ".css":  "text/css; charset=utf-8",
    ".js":   "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml":  "application/xml; charset=utf-8",
    ".md":   "text/markdown; charset=utf-8",
    ".txt":  "text/plain; charset=utf-8",
    ".png":  "image/png",
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif":  "image/gif",
    ".svg":  "image/svg+xml",
    ".webp": "image/webp",
    ".pdf":  "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

INJECT_TAGS = (
    '\n  <link rel="stylesheet" href="/comments-system/comments.css">'
    '\n  <script src="/comments-system/comments.js" defer></script>\n'
)


def read_config():
    try:
        cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    except Exception:
        cfg = {"enabled": False}
    # The COMMENTS_ENABLED env var (set in the Render dashboard) wins over the
    # committed config file, so the live site can be toggled without a commit.
    env = os.environ.get("COMMENTS_ENABLED")
    if env is not None and env.strip() != "":
        cfg["enabled"] = env.strip().lower() in ("1", "true", "yes", "on")
    cfg["passcodeRequired"] = bool(ADMIN_PASSCODE)
    return cfg


def inject_into(html: str) -> str:
    # Replace the first </body> case-insensitively, or append if missing.
    pattern = re.compile(r"</body>", re.IGNORECASE)
    if pattern.search(html):
        return pattern.sub(INJECT_TAGS + "</body>", html, count=1)
    return html + INJECT_TAGS


def safe_resolve(req_path: str) -> Optional[Path]:
    # Strip any leading slash and resolve relative to ROOT.
    decoded = urllib.parse.unquote(req_path)
    if decoded.endswith("/"):
        decoded += "index.html"
    candidate = (ROOT / decoded.lstrip("/")).resolve()
    try:
        candidate.relative_to(ROOT)
    except ValueError:
        return None
    return candidate


def make_id() -> str:
    ts = format(int(time.time() * 1000), "x")
    return f"c-{ts}-{secrets.token_hex(3)}"


def author_slug(author: str) -> str:
    """Filename-safe slug for an author name, e.g. 'Mike Jones' -> 'mike-jones'."""
    slug = re.sub(r"[^a-z0-9]+", "-", (author or "").strip().lower()).strip("-")
    return slug or "unknown"


def xml_path_for_author(author: str) -> Path:
    return XML_DIR / f"comments-{author_slug(author)}.xml"


def ensure_xml_file(path: Path) -> None:
    if not path.exists():
        path.write_text(XML_HEADER + XML_FOOTER, encoding="utf-8")


def comment_files():
    """Every comment file: one per author, live per-comment files, plus the
    legacy shared file if present. Locally, live comments pulled into the
    parallel worktree are included too (the client dedupes by id)."""
    files = sorted(XML_DIR.glob("comments-*.xml"))
    if LIVE_XML_DIR.exists():
        files += sorted(LIVE_XML_DIR.glob("*.xml"))
    if not LIVE_MODE:
        wt_live = LIVE_WORKTREE / "comments" / "live"
        if wt_live.exists():
            files += sorted(wt_live.glob("*.xml"))
    if LEGACY_XML_PATH.exists():
        files.append(LEGACY_XML_PATH)
    return files


def aggregated_comments_xml() -> bytes:
    """Merge all per-author files into one <comments> document for the client."""
    parts = []
    for f in comment_files():
        try:
            txt = f.read_text(encoding="utf-8")
        except Exception:
            continue
        m = re.search(r"<comments\b[^>]*>(.*)</comments>", txt, re.DOTALL)
        inner = (m.group(1) if m else "").strip("\n")
        if inner.strip():
            parts.append(inner)
    body = ("\n".join(parts) + "\n") if parts else ""
    return (XML_HEADER + body + XML_FOOTER).encode("utf-8")


def read_tree_test_records():
    """Every tree-test submission: JSONL lines plus live per-session files
    (including any pulled into the parallel worktree when running locally)."""
    out = []
    if TREE_TEST_PATH.exists():
        for line in TREE_TEST_PATH.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                out.append(json.loads(line))
            except Exception:
                continue
    live_dirs = [TREE_TEST_LIVE_DIR]
    if not LIVE_MODE:
        live_dirs.append(LIVE_WORKTREE / "examples" / "tree-test-live")
    seen_names = set()
    for d in live_dirs:
        if not d.exists():
            continue
        for f in sorted(d.glob("*.json")):
            if f.name in seen_names:
                continue
            seen_names.add(f.name)
            try:
                out.append(json.loads(f.read_text(encoding="utf-8")))
            except Exception:
                continue
    out.sort(key=lambda r: r.get("submittedAt") or "")
    return out


def file_containing_comment(cid: str) -> Optional[Path]:
    """Locate the per-author file that holds a given comment id."""
    pat = re.compile(rf'<comment id="{re.escape(cid)}"')
    for f in comment_files():
        try:
            if pat.search(f.read_text(encoding="utf-8")):
                return f
        except Exception:
            continue
    return None


# --- GitHub persistence (live mode) ----------------------------------------

GH_API = "https://api.github.com"


def gh_request(method: str, path: str, payload=None):
    """Minimal GitHub REST call. Returns (status, parsed-json-or-{})."""
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(
        GH_API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "cs356-comments-server",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read()
            return r.status, (json.loads(body) if body else {})
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read() or b"{}")
        except Exception:
            body = {}
        return e.code, body


def gh_ensure_branch() -> bool:
    """Create COMMENTS_BRANCH off the default branch if it doesn't exist."""
    status, _ = gh_request("GET", f"/repos/{GITHUB_REPO}/git/ref/heads/{COMMENTS_BRANCH}")
    if status == 200:
        return True
    if status != 404:
        print(f"[github] checking branch failed: HTTP {status}", flush=True)
        return False
    status, repo = gh_request("GET", f"/repos/{GITHUB_REPO}")
    default = repo.get("default_branch") if status == 200 else None
    if not default:
        print(f"[github] could not read repo default branch: HTTP {status}", flush=True)
        return False
    status, ref = gh_request("GET", f"/repos/{GITHUB_REPO}/git/ref/heads/{default}")
    sha = (ref.get("object") or {}).get("sha") if status == 200 else None
    if not sha:
        print(f"[github] could not resolve {default} HEAD: HTTP {status}", flush=True)
        return False
    status, _ = gh_request(
        "POST",
        f"/repos/{GITHUB_REPO}/git/refs",
        {"ref": f"refs/heads/{COMMENTS_BRANCH}", "sha": sha},
    )
    if status in (200, 201):
        print(f"[github] created branch {COMMENTS_BRANCH} from {default}", flush=True)
        return True
    print(f"[github] creating branch failed: HTTP {status}", flush=True)
    return False


def gh_push_file(rel_path: str, content: bytes, message: str) -> bool:
    """Commit one file to COMMENTS_BRANCH via the contents API. Retries the
    fetch-sha/PUT cycle a few times to ride out commit races."""
    url_path = urllib.parse.quote(rel_path)
    for attempt in range(3):
        status, existing = gh_request(
            "GET", f"/repos/{GITHUB_REPO}/contents/{url_path}?ref={COMMENTS_BRANCH}"
        )
        payload = {
            "message": message,
            "content": base64.b64encode(content).decode("ascii"),
            "branch": COMMENTS_BRANCH,
        }
        if status == 200 and isinstance(existing, dict) and existing.get("sha"):
            payload["sha"] = existing["sha"]
        status, body = gh_request("PUT", f"/repos/{GITHUB_REPO}/contents/{url_path}", payload)
        if status in (200, 201):
            return True
        if status in (409, 422):
            time.sleep(0.5 * (attempt + 1))
            continue
        print(f"[github] push of {rel_path} failed: HTTP {status} {body}", flush=True)
        return False
    print(f"[github] push of {rel_path} gave up after conflicts", flush=True)
    return False


def gh_boot_sync() -> None:
    """Download comments/live/ and examples/tree-test-live/ from the branch so
    a fresh deploy starts with everything previously written on the live site."""
    for branch_dir, local_dir in (
        ("comments/live", LIVE_XML_DIR),
        ("examples/tree-test-live", TREE_TEST_LIVE_DIR),
    ):
        status, listing = gh_request(
            "GET", f"/repos/{GITHUB_REPO}/contents/{branch_dir}?ref={COMMENTS_BRANCH}"
        )
        if status == 404:
            continue  # nothing written yet
        if status != 200 or not isinstance(listing, list):
            print(f"[github] boot sync: listing {branch_dir} failed: HTTP {status}", flush=True)
            continue
        local_dir.mkdir(parents=True, exist_ok=True)
        n = 0
        for item in listing:
            if item.get("type") != "file":
                continue
            st, filebody = gh_request(
                "GET",
                f"/repos/{GITHUB_REPO}/contents/{branch_dir}/{urllib.parse.quote(item['name'])}"
                f"?ref={COMMENTS_BRANCH}",
            )
            content = filebody.get("content") if st == 200 and isinstance(filebody, dict) else None
            if not content:
                print(f"[github] boot sync: could not fetch {item.get('name')}", flush=True)
                continue
            (local_dir / item["name"]).write_bytes(base64.b64decode(content))
            n += 1
        print(f"[github] boot sync: restored {n} file(s) into {branch_dir}", flush=True)


class Handler(BaseHTTPRequestHandler):
    server_version = "cs356-comments/1.0"

    # quieter logging
    def log_message(self, fmt, *args):
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    # --- writers ---

    def _send_json(self, status: int, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_bytes(self, status: int, ctype: str, body: bytes):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_head(self, status: int, ctype: str):
        # Response headers only, no body — for HEAD requests.
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.end_headers()

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY_BYTES:
            raise ValueError(f"body too large ({length} bytes)")
        raw = self.rfile.read(length) if length else b""
        if not raw:
            return {}
        return json.loads(raw.decode("utf-8"))

    def _passcode_ok(self) -> bool:
        if not ADMIN_PASSCODE:
            return True
        supplied = self.headers.get("X-CS356-Passcode") or ""
        return hmac.compare_digest(supplied, ADMIN_PASSCODE)

    def _require_passcode(self) -> bool:
        """Send a 401 and return False when the admin passcode is missing/wrong."""
        if self._passcode_ok():
            return True
        self._send_json(401, {"error": "passcode required"})
        return False

    # --- dispatch ---

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/config":
            return self._send_json(200, read_config())
        if parsed.path == "/api/comments":
            if not self._require_passcode():
                return
            return self._send_bytes(
                200, "application/xml; charset=utf-8", aggregated_comments_xml()
            )
        if parsed.path == "/api/tree-test":
            if not self._require_passcode():
                return
            return self._send_json(200, {"sessions": read_tree_test_records()})
        if parsed.path.startswith("/api/"):
            return self._send_json(404, {"error": "no such api endpoint"})
        return self._serve_static(parsed.path)

    def do_HEAD(self):
        # Health checks (e.g. the preview launcher) send HEAD /. Answer with the
        # same status a GET would produce, but no body.
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path in ("/api/config", "/api/comments", "/api/tree-test"):
            return self._send_head(200, "application/json; charset=utf-8")
        if parsed.path.startswith("/api/"):
            return self._send_head(404, "application/json; charset=utf-8")
        target = safe_resolve(parsed.path)
        if target is None:
            return self._send_head(403, "text/plain; charset=utf-8")
        if not target.exists():
            return self._send_head(404, "text/html; charset=utf-8")
        ext = target.suffix.lower()
        ctype = "text/html; charset=utf-8" if target.is_dir() else MIME.get(ext, "application/octet-stream")
        return self._send_head(200, ctype)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/comments":
            return self._handle_create_comment()
        if parsed.path == "/api/tree-test":
            return self._handle_tree_test_submit()
        return self._send_json(404, {"error": "no such api endpoint"})

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith("/api/comments/"):
            cid = urllib.parse.unquote(parsed.path[len("/api/comments/"):])
            return self._handle_update_status(cid)
        return self._send_json(404, {"error": "no such api endpoint"})

    # --- API handlers ---

    def _handle_tree_test_submit(self):
        try:
            body = self._read_json_body()
        except Exception as e:
            return self._send_json(400, {"error": f"bad json: {e}"})
        tasks = body.get("tasks")
        if not isinstance(tasks, list) or not tasks:
            return self._send_json(400, {"error": "tasks (a non-empty list) is required"})
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        record = {
            "submittedAt": ts,
            "tree": (body.get("tree") or "byucs"),
            "participant": (str(body.get("participant") or "").strip())[:80],
            "summary": body.get("summary") if isinstance(body.get("summary"), dict) else {},
            "tasks": tasks,
        }
        if LIVE_MODE:
            # One file per session; committed to the live-comments branch.
            name = f"{make_id().replace('c-', 't-', 1)}.json"
            payload = json.dumps(record, ensure_ascii=False, indent=2) + "\n"
            TREE_TEST_LIVE_DIR.mkdir(parents=True, exist_ok=True)
            with WRITE_LOCK:
                (TREE_TEST_LIVE_DIR / name).write_text(payload, encoding="utf-8")
                synced = (
                    gh_push_file(
                        f"examples/tree-test-live/{name}",
                        payload.encode("utf-8"),
                        f"tree-test session {record['participant'] or 'anonymous'}",
                    )
                    if GITHUB_SYNC
                    else False
                )
            return self._send_json(200, {"ok": True, "submittedAt": ts, "synced": synced})
        TREE_TEST_PATH.parent.mkdir(parents=True, exist_ok=True)
        with WRITE_LOCK:
            with TREE_TEST_PATH.open("a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")
        return self._send_json(200, {"ok": True, "submittedAt": ts})

    def _handle_create_comment(self):
        if not read_config().get("enabled"):
            return self._send_json(403, {"error": "commenting is disabled"})
        if not self._require_passcode():
            return
        try:
            body = self._read_json_body()
        except Exception as e:
            return self._send_json(400, {"error": f"bad json: {e}"})
        text = (body.get("text") or "").strip()[:10_000]
        page = (body.get("page") or "").strip()[:500]
        selector = (body.get("selector") or "").strip()[:1_000]
        if not text or not page or not selector:
            return self._send_json(400, {"error": "text, page, and selector are required"})
        snippet = (body.get("snippet") or "")[:200]
        author = (body.get("author") or "unknown")[:80]
        cid = make_id()
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        entry = (
            f'  <comment id="{xml_escape(cid)}" status="new">\n'
            f"    <page>{xml_escape(page)}</page>\n"
            f"    <selector>{xml_escape(selector)}</selector>\n"
            f"    <element-snippet>{xml_escape(snippet)}</element-snippet>\n"
            f"    <author>{xml_escape(author)}</author>\n"
            f"    <timestamp>{ts}</timestamp>\n"
            f"    <text>{xml_escape(text)}</text>\n"
            f"  </comment>\n"
        )
        if LIVE_MODE:
            # One file per comment; committed to the live-comments branch.
            doc = XML_HEADER + entry + XML_FOOTER
            LIVE_XML_DIR.mkdir(parents=True, exist_ok=True)
            with WRITE_LOCK:
                (LIVE_XML_DIR / f"{cid}.xml").write_text(doc, encoding="utf-8")
                synced = (
                    gh_push_file(
                        f"comments/live/{cid}.xml",
                        doc.encode("utf-8"),
                        f"live comment by {author} on {page}",
                    )
                    if GITHUB_SYNC
                    else False
                )
            return self._send_json(
                200, {"id": cid, "status": "new", "timestamp": ts, "synced": synced}
            )
        path = xml_path_for_author(author)
        with WRITE_LOCK:
            ensure_xml_file(path)
            xml = path.read_text(encoding="utf-8")
            if "</comments>" not in xml:
                return self._send_json(500, {"error": f"{path.name} is malformed (no </comments>)"})
            xml = xml.replace("</comments>", entry + "</comments>", 1)
            path.write_text(xml, encoding="utf-8")
        return self._send_json(200, {"id": cid, "status": "new", "timestamp": ts})

    def _handle_update_status(self, cid: str):
        if not read_config().get("enabled"):
            return self._send_json(403, {"error": "commenting is disabled"})
        if not self._require_passcode():
            return
        try:
            body = self._read_json_body()
        except Exception as e:
            return self._send_json(400, {"error": f"bad json: {e}"})
        new_status = body.get("status")
        if new_status not in ("new", "resolved", "ignored"):
            return self._send_json(400, {"error": "status must be new, resolved, or ignored"})
        path = file_containing_comment(cid)
        if path is None:
            return self._send_json(404, {"error": "comment not found"})
        if LIVE_MODE and path.parent != LIVE_XML_DIR:
            # Comments baked into the deploy from the repo are read-only on the
            # live site — editing them here would fork them from main.
            return self._send_json(
                403, {"error": "this comment lives in the repo; change its status locally"}
            )
        with WRITE_LOCK:
            xml = path.read_text(encoding="utf-8")
            pat = re.compile(rf'(<comment id="{re.escape(cid)}" status=")[^"]*(")')
            if not pat.search(xml):
                return self._send_json(404, {"error": "comment not found"})
            xml = pat.sub(rf'\g<1>{new_status}\g<2>', xml, count=1)
            path.write_text(xml, encoding="utf-8")
            synced = (
                gh_push_file(
                    f"comments/live/{path.name}",
                    xml.encode("utf-8"),
                    f"comment {cid} marked {new_status}",
                )
                if (GITHUB_SYNC and path.parent == LIVE_XML_DIR)
                else None
            )
        resp = {"id": cid, "status": new_status}
        if synced is not None:
            resp["synced"] = synced
        return self._send_json(200, resp)

    # --- static file serving ---

    def _serve_static(self, req_path: str):
        target = safe_resolve(req_path)
        if target is None:
            return self._send_bytes(403, "text/plain; charset=utf-8", b"forbidden")
        if not target.exists():
            msg = f"<h1>404</h1><p>Not found: <code>{xml_escape(req_path)}</code></p>"
            return self._send_bytes(404, "text/html; charset=utf-8", msg.encode("utf-8"))
        if target.is_dir():
            return self._serve_directory_listing(req_path, target)
        ext = target.suffix.lower()
        ctype = MIME.get(ext, "application/octet-stream")
        if ext in (".html", ".htm"):
            html = target.read_text(encoding="utf-8", errors="replace")
            out = inject_into(html).encode("utf-8")
            return self._send_bytes(200, ctype, out)
        return self._send_bytes(200, ctype, target.read_bytes())

    def _serve_directory_listing(self, req_path: str, dir_path: Path):
        if not req_path.endswith("/"):
            req_path += "/"
        entries = sorted(
            [p for p in dir_path.iterdir() if not p.name.startswith(".")],
            key=lambda p: (not p.is_dir(), p.name.lower()),
        )
        items = []
        for p in entries:
            name = p.name + ("/" if p.is_dir() else "")
            href = urllib.parse.quote(req_path + name)
            items.append(f'<li><a href="{href}">{xml_escape(name)}</a></li>')
        html = (
            '<!doctype html><meta charset="utf-8">'
            f"<title>{xml_escape(req_path)}</title>"
            "<style>body{font:14px -apple-system,system-ui,sans-serif;padding:24px;}"
            "h1{font-size:18px;}a{text-decoration:none;color:#2b6cb0;}"
            "a:hover{text-decoration:underline;}</style>"
            f"<h1>{xml_escape(req_path)}</h1><ul>{''.join(items)}</ul>"
        )
        return self._send_bytes(200, "text/html; charset=utf-8", html.encode("utf-8"))


def main():
    cfg = read_config()
    print(f"cs356 server listening on http://{HOST}:{PORT}/", flush=True)
    print(
        f"Comments are currently {'ENABLED' if cfg.get('enabled') else 'DISABLED'} "
        "(COMMENTS_ENABLED env var overrides comments-config.json)",
        flush=True,
    )
    if LIVE_MODE:
        print(f"LIVE MODE: comments go to comments/live/, one file each", flush=True)
        if GITHUB_SYNC:
            print(
                f"GitHub sync ON -> {GITHUB_REPO}@{COMMENTS_BRANCH}", flush=True
            )
            try:
                if gh_ensure_branch():
                    gh_boot_sync()
            except Exception as e:
                print(f"[github] boot sync failed: {e} — continuing without it", flush=True)
        else:
            print(
                "WARNING: GitHub sync OFF (set GITHUB_TOKEN and GITHUB_REPO) — "
                "live comments will NOT survive a redeploy",
                flush=True,
            )
        if not ADMIN_PASSCODE:
            print(
                "WARNING: no ADMIN_PASSCODE set — anyone who finds the site can "
                "read and leave comments",
                flush=True,
            )
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nshutting down")
        httpd.server_close()


if __name__ == "__main__":
    main()
