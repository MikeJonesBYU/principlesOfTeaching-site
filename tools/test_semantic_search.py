#!/usr/bin/env python3
"""Test the semantic build of prototype v1 without a browser.

Replicates the app.js ranking math exactly — the literal layer (word-prefix
matches against label / name / taxonomy / moment, weights 6/4/2/1) plus the
semantic layer (greedy longest-known-phrase lookup in semantic-index.js,
weight/100 * 6 per hit) — then runs a suite of meaning-queries and asserts
the expected skill lands in the top 3.

    python3 tools/test_semantic_search.py [-v]
"""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_semantic_index import ROOT, load_v1_data, norm

W_LABEL, W_NAME, W_TAXON, W_MOMENT, W_SEM = 6, 4, 2, 1, 6

# Team A's stoplist plus the pronouns and question words that were producing
# junk literal hits ("their" matching half the manual). The alternative
# build's one change to the literal layer.
JS_STOP = set(("a an the of to in on for and or is it that this with my me i you your s "
               "how was were they them their there then than what when where why who "
               "which does did been being am so if but just really").split())

def tokens(s):
    return [t for t in norm(s).split() if len(t) > 1 and t not in JS_STOP]

def load_sem():
    src = open(os.path.join(ROOT, "companion/prototypes/v1/semantic/semantic-index.js")).read()
    return json.loads(re.search(r"window\.V1_SEM\s*=\s*(\{.*\});", src, re.S).group(1))

def build_lookups(data):
    cats = {c["slug"]: c for c in data["categories"]}
    grps = {g["slug"]: g for g in data["groups"]}
    moms = {m["key"]: m for m in data["moments"]}
    return cats, grps, moms

def haystacks(s, cats, grps, moms):
    cn, gn = [], []
    for f in s["filings"]:
        c = cats.get(f["category"]); g = grps.get(f.get("group"))
        if c: cn.append(c["name"])
        if g:
            gn.append(g["name"])
            if g.get("subtitle"): gn.append(g["subtitle"])
    return {
        "label": norm(s.get("label", "")),
        "name": norm(s["name"]),
        "taxon": norm(" ".join(cn + gn)),
        "moment": norm(" ".join(moms[k]["name"] for k in s["moment"])),
    }

def has_word(hay, tok):
    return any(w.startswith(tok) for w in hay.split())

def sem_segments(query, terms):
    """Every known n-gram (4..1) at every position, each term once. A phrase
    and the words inside it may both count — they point at the same meaning.
    A word is 'unknown' only if no known segment covers it."""
    nq = norm(query)
    toks = nq.split()
    found, covered = [], set()
    if nq in terms and len(toks) > 4:
        found.append(nq); covered.update(range(len(toks)))
    for i in range(len(toks)):
        for n in (4, 3, 2, 1):
            cand = " ".join(toks[i:i+n])
            if len(toks[i:i+n]) == n and cand in terms:
                found.append(cand); covered.update(range(i, i+n))
    unknown = [toks[i] for i in range(len(toks))
               if i not in covered and len(toks[i]) > 1 and toks[i] not in JS_STOP]
    seen, out = set(), []
    for t in found:
        if t not in seen: seen.add(t); out.append(t)
    return out, unknown

def search(query, data, sem, cats, grps, moms):
    toks = tokens(query)
    scored = {}
    def slot(s):
        return scored.setdefault(s["id"], {"block": s, "score": 0.0, "words": 0, "why": []})
    for s in data["skills"]:
        h = haystacks(s, cats, grps, moms)
        score, words = 0, 0
        for t in toks:
            w = 0
            if has_word(h["label"], t):  w = max(w, W_LABEL)
            if has_word(h["name"], t):   w = max(w, W_NAME)
            if has_word(h["taxon"], t):  w = max(w, W_TAXON)
            if has_word(h["moment"], t): w = max(w, W_MOMENT)
            if w: score += w; words += 1
        if words:
            r = slot(s); r["score"] += score; r["words"] = words
    ids = sem["ids"]
    by_id = {s["id"]: s for s in data["skills"]}
    found, _unknown = sem_segments(query, sem["terms"])
    for term in found:
        for si, w, pi, *_ in sem["terms"][term]:
            s = by_id[ids[si]]
            r = slot(s)
            r["score"] += w / 100.0 * W_SEM
            snip = sem["snips"].get(str(si), {}).get(str(pi), "")
            r["why"].append((w, f"“{term}” is close in meaning to “{snip}”"))
    def title(r): return r["block"].get("label") or r["block"]["name"]
    return sorted(scored.values(),
                  key=lambda r: (-r["score"], -r["words"], title(r).lower()))

# ------------------------------------------------------------------- suite
# expect: ("id", "<skill id>") | ("cat", "<slug>") | ("group", "<slug>")
SUITE = [
    ("kids are noisy",                ("cat", "attention")),
    ("restless",                      ("cat", "attention")),
    ("bored ten minutes in",          ("cat", "attention")),
    ("teenagers on their phones",     ("cat", "attention")),
    ("how do i know it was the spirit", ("id", "020.title_number3")),
    ("is it the spirit",              ("id", "020.title_number3")),
    # the IA files "making the room safe to speak up" under love, so either
    # branch is a correct landing for a shy class
    ("shy class",                     ("anyof", [("cat", "talk"),
                                                ("group", "safe-to-speak-up")])),
    ("nobody answers my questions",   ("cat", "talk")),
    ("awkward silence after i ask",   ("cat", "talk")),
    ("singing",                       ("id", "019.title_number2")),
    ("art",                           ("id", "004.title_number2")),
    ("object lesson",                 ("id", "006.title_number2")),
    ("getting to know my students",   ("cat", "love")),
    ("prepare my lesson saturday night", ("cat", "prep")),
    ("testimony",                     ("anyof", [("group", "bearing-witness-in-class"),
                                                ("id", "017.title_number2"),
                                                ("id", "021.title_number1"),
                                                ("id", "021.title_number2"),
                                                ("id", "024.title_number2")])),
    ("follow up during the week",     ("group", "during-the-week")),
    # literal regressions — exact wording must still win
    ("pictures",                      ("id", "004.title_number2")),
    ("symbols",                       ("id", "006.title_number1")),
]

def matches(block, kind, val):
    if kind == "anyof": return any(matches(block, k, v) for k, v in val)
    if kind == "id":    return block["id"] == val
    if kind == "cat":   return any(f["category"] == val for f in block["filings"])
    if kind == "group": return any(f.get("group") == val for f in block["filings"])
    return False

def main():
    verbose = "-v" in sys.argv
    data, sem = load_v1_data(), load_sem()
    cats, grps, moms = build_lookups(data)
    failures = 0
    for query, (kind, val) in SUITE:
        rs = search(query, data, sem, cats, grps, moms)
        top3 = rs[:3]
        ok = any(matches(r["block"], kind, val) for r in top3)
        mark = "ok " if ok else "FAIL"
        if not ok: failures += 1
        print(f"[{mark}] {query!r} -> expect {kind}:{val}")
        if verbose or not ok:
            for r in top3:
                b = r["block"]
                filed = ",".join(f["category"] for f in b["filings"])
                print(f"        {r['score']:5.2f}  {b['id']}  [{filed}]  {(b.get('label') or b['name'])[:70]}")
            _, unknown = sem_segments(query, sem["terms"])
            if unknown: print(f"        unknown words: {unknown}")
    print(f"\n{len(SUITE) - failures}/{len(SUITE)} passed")
    sys.exit(1 if failures else 0)

if __name__ == "__main__":
    main()
