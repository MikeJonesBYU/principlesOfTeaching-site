#!/usr/bin/env python3
"""Build the semantic search index for prototype v1's alternative build.

Reads Team A's v1-data.js (the 53 blocks and their filings) and the live
site's descriptions.js (each skill's full Define text), embeds every passage
and a large vocabulary of plausible teacher words and phrases with a local
sentence-embedding model (all-MiniLM-L6-v2 — runs entirely on this machine,
no API), and distills the result into a static lookup table:

    term -> [(skill, weight 1..100, best-matching passage), ...]

Only that table ships. The browser never runs a model and never calls a
server: search is dictionary lookups and addition. Rebuild with:

    python3 tools/build_semantic_index.py

Output: companion/prototypes/v1/semantic/semantic-index.js
"""
import argparse, datetime, html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- JS parsing

def strip_js_comments(src):
    """Remove // comments outside of string literals."""
    out, i, n, in_str = [], 0, len(src), None
    while i < n:
        c = src[i]
        if in_str:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(src[i+1]); i += 2; continue
            if c == in_str: in_str = None
            i += 1; continue
        if c in ('"', "'"):
            in_str = c; out.append(c); i += 1; continue
        if c == "/" and i + 1 < n and src[i+1] == "/":
            while i < n and src[i] != "\n": i += 1
            continue
        out.append(c); i += 1
    return "".join(out)

def js_object_to_json(src):
    """Quote bare keys and drop trailing commas, outside strings."""
    src = strip_js_comments(src)
    out, i, n, in_str = [], 0, len(src), None
    while i < n:
        c = src[i]
        if in_str:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(src[i+1]); i += 2; continue
            if c == in_str: in_str = None
            i += 1; continue
        if c in ('"', "'"):
            in_str = c; out.append(c); i += 1; continue
        m = re.match(r"[A-Za-z_$][A-Za-z0-9_$]*(?=\s*:)", src[i:])
        prev = next((ch for ch in reversed(out) if not ch.isspace()), "")
        if m and prev in ("", "{", "[", ","):
            out.append('"' + m.group(0) + '"'); i += len(m.group(0)); continue
        if c == ",":
            j = i + 1
            while j < n and src[j] in " \t\r\n": j += 1
            if j < n and src[j] in "}]": i += 1; continue
        out.append(c); i += 1
    return "".join(out)

def load_v1_data():
    src = open(os.path.join(ROOT, "companion/prototypes/v1/team-a/v1-data.js")).read()
    m = re.search(r"window\.V1_DATA\s*=\s*(\{.*\});?\s*$", src, re.S)
    return json.loads(js_object_to_json(m.group(1)))

def load_descriptions():
    src = open(os.path.join(ROOT, "assets/lang/eng/descriptions.js")).read()
    m = re.search(r"window\.TDS_DESCRIPTIONS\s*=\s*(\{.*\})\s*;?\s*$", src, re.S)
    return json.loads(m.group(1))

# ------------------------------------------------------------- text helpers

def strip_html(s):
    s = re.sub(r"<[^>]+>", " ", s)
    return re.sub(r"\s+", " ", html.unescape(s)).strip()

def sentences(text):
    parts = re.split(r"(?<=[.!?…])\s+(?=[A-Z“\"'(])", text)
    return [p.strip() for p in parts if len(p.strip()) >= 25]

def norm(s):
    """Mirror of app.js norm(): lowercase, curly quotes -> ', strip the rest."""
    s = s.lower().replace("‘", "'").replace("’", "'")
    s = re.sub(r"[^a-z0-9']+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

STOP = set("""a an the of to in on for and or is it that this with my me i you
your s are be as at by we our us they them he she his her from was were will
can not do does did have has had what when where how why who which""".split())

def content_words(s):
    return [t for t in norm(s).split() if len(t) >= 3 and t not in STOP]

# ------------------------------------------------------------------- corpus

# Instructor-authored situation sentences, one per branch: each category and
# group described in the language of the classroom situation a teacher is in,
# not the action the manual prescribes. Same design move as the D4 label
# field, in prose — the embedding model generalizes each sentence to nearby
# words nobody wrote down.
SITUATIONS = {
    "christ": ["You want the lesson to actually be about the Savior, not just about getting through the material."],
    "attention": ["The class is bored and restless — phones out, eyes wandering, side conversations starting. You are losing them.",
                  "The class is bored and restless",
                  "Phones out, eyes wandering, side conversations starting",
                  "You are losing them"],
    "love": ["You want everyone to feel known, welcome, and safe — including the quiet ones and the ones who rarely come."],
    "prep": ["It is before Sunday and you are not sure what to prepare or where to start.",
             "Not sure what to prepare or where to start"],
    "talk": ["You ask a question and get silence. Nobody wants to answer, or the same person answers every time.",
             "You ask a question and get silence",
             "Nobody wants to answer, or the same person answers every time"],
    "feels": ["You felt something during a lesson — or are not sure you did — and wonder whether it was the Spirit."],
    "about-their-own-life": ["Helping them see what a scripture or principle has to do with their own everyday life."],
    "finding-him-in-the-scriptures": ["Helping the class notice Jesus Christ in the verses themselves."],
    "bearing-witness-in-class": ["Sharing testimony — yours and theirs — out loud in class."],
    "what-the-prophets-say": ["Bringing in what prophets and apostles have taught."],
    "see-or-hear": ["Using pictures, videos, music, art, or objects to wake the lesson up."],
    "do-not-watch": ["Getting them doing something — moving, handling, writing — instead of just sitting and listening."],
    "safe-to-speak-up": ["Making it safe to say something imperfect out loud without being embarrassed.",
                         "Too shy or embarrassed to speak up"],
    "getting-to-know-them": ["Learning names, interests, and lives, so the lesson fits real people."],
    "during-the-week": ["Reaching out between Sundays — a text, a visit, a follow-up on an invitation."],
    "getting-yourself-ready": ["Your own spiritual preparation, before you ever write a lesson plan."],
    "planning-the-lesson": ["Deciding what will actually happen in class — questions, activities, timing."],
    "invitations-they-take-home": ["Sending them home with something specific to try or think about."],
    "not-answering-it-yourself": ["Resisting the urge to fill the silence and answer your own question."],
    "talking-to-each-other": ["Getting them discussing with each other, not just with you."],
    "asking-for-a-real-answer": ["Asking questions that invite real thought instead of a one-word answer."],
}

def build_passages(data, descs):
    """Per skill: list of (passage_text, kind). kind 'own' = the block's own
    wording; 'branch' = a category/group/moment it is filed under (weighted
    down at build, like Team A's concept weights ranked block > branch)."""
    cats = {c["slug"]: c["name"] for c in data["categories"]}
    grps = {g["slug"]: g["name"] for g in data["groups"]}
    moms = {m["key"]: m for m in data["moments"]}
    per_skill = []
    for s in data["skills"]:
        ps = []
        if s.get("label"):
            ps.append((s["label"], "own"))
        ps.append((s["name"], "own"))
        for f in s["filings"]:
            trail = cats.get(f["category"], f["category"])
            if f.get("group"):
                trail += " — " + grps.get(f["group"], f["group"])
            ps.append((trail, "branch"))
            # the situation sentence(s) for each branch: the first entry is
            # the full sentence; later entries are deliberate short clauses,
            # because a one-word query lands harder on "phones out, eyes
            # wandering" than on a long sentence containing it
            for slug in (f["category"], f.get("group")):
                for sit in SITUATIONS.get(slug, []):
                    ps.append((sit, "sit"))
        for k in s["moment"]:
            ps.append((moms[k]["name"] + " — " + moms[k]["blurb"], "branch"))
        define = strip_html(descs.get(s["id"], ""))
        ps.extend((t, "own") for t in sentences(define)[:8])
        per_skill.append(ps)
    return per_skill

# The vocabulary the index will understand. Broad on purpose: terms that turn
# out to mean nothing near any skill are dropped by the floor below.
SEED = """
noisy chaos chaotic wiggly fidgety squirmy rowdy shy quiet awkward silence
crying fussy toddlers teens teenagers youth adults elderly phones scrolling
distracted daydreaming sleepy tired zoned whispering giggling interrupting
testimony testify witness feelings doubt doubting struggling wavering
reverence irreverent sacred spiritual prayer praying pondering fasting
scriptures verses stories parables likening applying discussion participation
volunteer volunteering answering silence awkward-silence lecture lecturing
preparing preparation unprepared procrastinated lastminute cramming
visit visiting ministering texting checking-in remembering names newcomer
new-member less-active nonmember investigator friend neighbor
attention span bored boredom engaging engagement activity activities games
handout handouts whiteboard chalkboard pictures video music singing hymn
object-lesson props hands-on role-play groups pairs
love belonging safe welcome welcoming judgment judged embarrassed
questions asking follow-up open-ended yes-or-no rhetorical wait-time
on-their-phones texting-in-class staring-at-screens checked-out zoning-out
wont-stop-talking talking-over-each-other wont-participate no-one-talks
one-word-answers running-out-of-time lesson-fell-flat losing-the-room
"""

def build_vocab(data, per_skill):
    vocab = set()
    # 1. common-English wordlist
    wl = os.path.join(ROOT, "tools/wordlist-10k.txt")
    if os.path.exists(wl):
        for w in open(wl):
            w = w.strip()
            if len(w) >= 3 and w.isalpha() and w not in STOP:
                vocab.add(w)
    # 2. corpus words + bigrams
    for ps in per_skill:
        for p, _kind in ps:
            ws = content_words(p)
            vocab.update(ws)
            toks = norm(p).split()
            for i in range(len(toks) - 1):
                if toks[i] not in STOP and toks[i+1] not in STOP \
                   and len(toks[i]) >= 3 and len(toks[i+1]) >= 3:
                    vocab.add(toks[i] + " " + toks[i+1])
    # 3. the study vocabulary Team A committed by hand (terms + variants),
    #    kept as whole phrases so multi-word queries hit directly
    for c in data.get("concepts", []):
        vocab.add(norm(c["term"]))
        for a in c.get("also", []):
            vocab.add(norm(a))
        vocab.update(content_words(c["term"]))
        for a in c.get("also", []):
            vocab.update(content_words(a))
    # 4. words from the study pages (the vocabulary participants used)
    sdir = os.path.join(ROOT, "companion/studies")
    if os.path.isdir(sdir):
        for fn in os.listdir(sdir):
            if fn.endswith(".html"):
                txt = strip_html(open(os.path.join(sdir, fn)).read())
                vocab.update(content_words(txt))
    # 5. hand seed of teacher-situation words
    for w in SEED.split():
        vocab.add(w.replace("-", " "))
    # 6. structure names as phrases
    for c in data["categories"]: vocab.add(norm(c["name"]))
    for g in data["groups"]:     vocab.add(norm(g["name"]))
    for m in data["moments"]:    vocab.add(norm(m["name"]))
    return sorted(v for v in vocab if v)

# -------------------------------------------------------------------- build

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--floor", type=float, default=0.35)
    ap.add_argument("--topk", type=int, default=8)
    ap.add_argument("--out", default="companion/prototypes/v1/semantic/semantic-index.js")
    args = ap.parse_args()

    import numpy as np
    from sentence_transformers import SentenceTransformer

    data = load_v1_data()
    descs = load_descriptions()
    per_skill = build_passages(data, descs)
    ids = [s["id"] for s in data["skills"]]

    flat, owner, kinds = [], [], []
    for si, ps in enumerate(per_skill):
        for pi, (p, kind) in enumerate(ps):
            flat.append(p); owner.append((si, pi)); kinds.append(kind)
    vocab = build_vocab(data, per_skill)
    print(f"{len(ids)} skills, {len(flat)} passages, {len(vocab)} vocabulary terms")

    model = SentenceTransformer("all-MiniLM-L6-v2")
    P = model.encode(flat, normalize_embeddings=True, batch_size=128,
                     show_progress_bar=False)
    T = model.encode(vocab, normalize_embeddings=True, batch_size=128,
                     show_progress_bar=False)
    sims = T @ P.T   # terms x passages

    topk = args.topk
    # Per-term-length floors: a single word runs cooler against a sentence
    # than a phrase does, so it gets a lower bar and its own scale cap.
    FLOORS = {1: (0.22, 0.55), 2: (0.30, 0.68)}   # n-words -> (floor, cap)
    DEFAULT_FC = (0.34, 0.75)
    BRANCH_MULT = 0.7   # a branch hit is worth less than the block's own words
    terms, used_snips = {}, {}
    for ti, term in enumerate(vocab):
        n = len(term.split())
        floor, cap = FLOORS.get(n, DEFAULT_FC)
        row = sims[ti]
        best = {}   # skill_idx -> (cos, passage_idx, kind)
        for pj, cos in enumerate(row):
            si, pi = owner[pj]
            if si not in best or cos > best[si][0]:
                best[si] = (float(cos), pi, kinds[pj])
        # discrimination damping: a term equally close to every skill carries
        # little information, so its scores shrink toward its own mean
        vals = [v[0] for v in best.values()]
        mean = sum(vals) / len(vals)
        ranked = []
        for si, (cos, pi, kind) in best.items():
            eff = cos - 0.5 * max(0.0, mean - 0.15)
            if eff < floor: continue
            w = 100 * (eff - floor) / (cap - floor)
            if kind == "branch": w *= BRANCH_MULT
            # "sit" passages keep full weight: they are authored precisely as
            # the query-side vocabulary of the branch they describe
            w = max(1, min(100, round(w)))
            ranked.append((w, cos, si, pi))
        if not ranked: continue
        ranked.sort(key=lambda t: (-t[0], -t[1]))
        entry = []
        for w, cos, si, pi in ranked[:topk]:
            entry.append([si, w, pi])
            used_snips.setdefault(si, set()).add(pi)
        terms[term] = entry

    # ---- anchors: the vocabulary Team A committed from the card sort and
    # tree test keeps its hand-built targets, at weights that echo the
    # original concept layer's ordering (block > group > category/moment).
    # Computed entries merge in underneath by max weight — the committed
    # vocabulary stays authoritative; the model only speaks where the
    # studies are silent.
    A_BLOCK, A_GROUP, A_CAT, A_MOM = 95, 70, 55, 55
    id_ix = {sid: i for i, sid in enumerate(ids)}
    grp_of, cat_of, mom_of = {}, {}, {}
    for si, sk in enumerate(data["skills"]):
        for f in sk["filings"]:
            cat_of.setdefault(f["category"], []).append(si)
            if f.get("group"): grp_of.setdefault(f["group"], []).append(si)
        for k in sk["moment"]:
            mom_of.setdefault(k, []).append(si)
    # passage index of each skill's situation/branch snippet, for why-lines
    def branch_pi(si, want_text):
        for pi, (txt, _k) in enumerate(per_skill[si]):
            if txt == want_text: return pi
        return 1 if data["skills"][si].get("label") else 0
    anchor_n = 0
    for c in data.get("concepts", []):
        to = c.get("to", {})
        hits = {}   # si -> (w, pi)
        for b in to.get("blocks", []):
            si = id_ix.get(b)
            if si is None: continue
            pi = 0   # the block's label if it has one, else its name
            hits[si] = max(hits.get(si, (0, 0)), (A_BLOCK, pi))
        for g in to.get("groups", []):
            sit = (SITUATIONS.get(g) or [None])[0]
            for si in grp_of.get(g, []):
                pi = branch_pi(si, sit) if sit else 0
                hits[si] = max(hits.get(si, (0, 0)), (A_GROUP, pi))
        for cs in to.get("categories", []):
            sit = (SITUATIONS.get(cs) or [None])[0]
            for si in cat_of.get(cs, []):
                pi = branch_pi(si, sit) if sit else 0
                hits[si] = max(hits.get(si, (0, 0)), (A_CAT, pi))
        for k in to.get("moments", []):
            for si in mom_of.get(k, []):
                hits[si] = max(hits.get(si, (0, 0)), (A_MOM, 0))
        for phrase in [c["term"]] + c.get("also", []):
            key = norm(phrase)
            if not key: continue
            merged = {e[0]: tuple(e[1:]) for e in terms.get(key, [])}
            for si, (w, pi) in hits.items():
                if w > merged.get(si, (0, 0, 0))[0]:
                    merged[si] = (w, pi, 1)   # 1 = committed by the studies
                    used_snips.setdefault(si, set()).add(pi)
            terms[key] = sorted(([si] + list(rest) for si, rest in merged.items()),
                                key=lambda e: -e[1])[:max(topk, len(hits))]
            anchor_n += 1
    print(f"anchored {anchor_n} committed phrases")

    # display snippets: only the passages that some term actually points at
    snips = {}
    for si, pis in used_snips.items():
        m = {}
        for pi in sorted(pis):
            t = per_skill[si][pi][0]
            m[pi] = t if len(t) <= 110 else t[:109].rsplit(" ", 1)[0] + "…"
        snips[str(si)] = m

    out = {
        "builtBy": "tools/build_semantic_index.py",
        "model": "sentence-transformers/all-MiniLM-L6-v2, run at build time on the instructor's machine",
        "built": datetime.date.today().isoformat(),
        "floors": {str(k): list(v) for k, v in FLOORS.items()},
        "floorDefault": list(DEFAULT_FC),
        "branchMult": BRANCH_MULT,
        "topk": topk,
        "termCount": len(terms),
        "ids": ids,
        "snips": snips,
        "terms": {k: terms[k] for k in sorted(terms)},
    }
    path = os.path.join(ROOT, args.out)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write("/* Semantic index for prototype v1, alternative build. GENERATED — do not\n")
        f.write("   edit by hand; rebuild with tools/build_semantic_index.py. Every entry is\n")
        f.write("   term -> [skillIndex, weight 1..100, passageIndex], meaning computed once\n")
        f.write("   at build time. The browser only looks things up. */\n")
        f.write("window.V1_SEM = ")
        json.dump(out, f, separators=(",", ":"), ensure_ascii=False)
        f.write(";\n")
    kb = os.path.getsize(path) / 1024
    print(f"kept {len(terms)} terms -> {path} ({kb:.0f} KB)")

if __name__ == "__main__":
    main()
