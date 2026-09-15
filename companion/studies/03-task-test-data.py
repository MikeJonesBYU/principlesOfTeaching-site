# -*- coding: utf-8 -*-
"""Invented five-user task-test datasets for the CS 356 companion (study 03).

Same discipline as 01-card-sort-data.py and 02-tree-test-data.py: the *data*
is invented, once, up top; every number the report page prints is COMPUTED
from it here, so the prose can never drift from the appendix.

Two datasets:

  TEAM A — 5 participants x 5 tasks, run on the card build of prototype v1
           (prototypes/v1/cards/, the newest build in the v1 line) on the
           participants' own phones. Each run is a legal walk of that build's
           real routes; every search query is scored by a Python
           re-implementation of the build's own ranking (literal layer +
           the precomputed meaning index, same weights), so the rank and
           resultCount columns are what the prototype itself would have
           logged. Emits 03-task-test-raw-team-a.csv in the build's exact
           Session-log export schema, with the two columns Team A prepended
           (participant, task) when they concatenated five exports.

  TEAM B — 5 people x 5 tasks on Team B's own prototype v1
           (prototypes/v1/team-b/). Their log is two untied streams (clicks
           and searches) that persist per browser and were never reset
           between people who shared a device, so the export is three
           blobs for five people. Their search is a title-substring match
           over searchdata.js, computed here the same way search.html does
           it. Emits 03-task-test-raw-team-b.json exactly as their "copy our
           log" textarea produces it, three times over.

Real: both prototypes, their routes, their ranking rules, the 53-skill
inventory underneath. Invented: every participant, path, query, second and
quotation.

Run: python3 03-task-test-data.py    (stdlib only)
"""

import csv
import datetime as dt
import json
import os
import re
from collections import Counter, OrderedDict
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
V1 = os.path.join(HERE, "..", "prototypes", "v1")
CARDS_DIR = os.path.join(V1, "cards")
TEAM_A_DIR = os.path.join(V1, "team-a")
SEM_DIR = os.path.join(V1, "semantic")
TEAM_B_DIR = os.path.join(V1, "team-b")

BAR = "=" * 78
bar = "-" * 78


def head(title):
    print("\n" + BAR)
    print(title)
    print(BAR)


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


# ============================================================================
# PART 0 — read the real artifacts, so the invented data can be checked
#          against them instead of against a copy of them.
# ============================================================================

_A_SRC = read(os.path.join(TEAM_A_DIR, "v1-data.js"))
_C_SRC = read(os.path.join(CARDS_DIR, "cards-data.js"))
_S_SRC = read(os.path.join(SEM_DIR, "semantic-index.js"))
_APP = read(os.path.join(CARDS_DIR, "app.js"))

_cats_blk = _A_SRC[_A_SRC.index("categories: ["):_A_SRC.index("groups: [")]
CATS = OrderedDict(re.findall(r'\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)"', _cats_blk))
GROUPS = OrderedDict()
for g in re.finditer(r'\{\s*slug:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*name:\s*"([^"]+)"'
                     r'(?:,\s*subtitle:\s*"([^"]+)")?\s*\}', _A_SRC):
    GROUPS[g.group(1)] = dict(category=g.group(2), name=g.group(3), subtitle=g.group(4))
MOMENTS = OrderedDict(re.findall(r'\{\s*key:\s*"([^"]+)",\s*name:\s*"([^"]+)"', _A_SRC))
SKILLS = []
for m in re.finditer(r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]*)",(?:\s*label:\s*"([^"]*)",)?'
                     r'\s*url:\s*"([^"]*)",\s*filings:\s*\[(.*?)\],\s*moment:\s*\[([^\]]*)\]',
                     _A_SRC, re.S):
    sid, name, label, url, fil, mom = m.groups()
    filings = [dict(category=c, group=(None if g == "null" else g.strip('"')))
               for c, g in re.findall(r'category:\s*"([^"]+)",\s*group:\s*(null|"[^"]+")', fil)]
    SKILLS.append(dict(id=sid, name=name, label=label, url=url, filings=filings,
                       moment=re.findall(r'"([^"]+)"', mom)))
BY_ID = {s["id"]: s for s in SKILLS}

CARDS = {}
for m in re.finditer(r'"([0-9a-z_.]+)":\s*\{(.*?)prep:\s*"(none|ahead)"\s*\}', _C_SRC, re.S):
    body = m.group(2)
    CARDS[m.group(1)] = dict(sit=re.search(r'sit:\s*"([^"]*)"', body).group(1),
                             first=re.search(r'first:\s*"([^"]*)"', body).group(1),
                             prep=m.group(3))
PREP_NAMES = dict(re.findall(r'(none|ahead):\s*"([^"]+)"', _C_SRC[_C_SRC.index("prepNames"):]))

SEM = json.loads(_S_SRC[_S_SRC.index("{"):_S_SRC.rstrip().rstrip(";").rindex("}") + 1])

# The block-page trail labels the app really prints (the wireframe-era map).
GROUP_LABELS = dict(re.findall(r'"([a-z-]+)":\s*"([^"]+)"',
                               _APP[_APP.index("var GROUP_LABELS"):_APP.index("/* ----", _APP.index("var GROUP_LABELS"))]))

assert len(CATS) == 6 and "feels" in CATS, CATS
assert len(GROUPS) == 15
assert len(MOMENTS) == 4
assert len(SKILLS) == 53
assert len(CARDS) == 53
assert SEM["termCount"] == len(SEM["terms"])
assert GROUP_LABELS["planning-the-lesson"] == "Planning what happens in class", \
    "the card build's trail label for the planning group must be the renamed one"

PREP_NONE = sorted(k for k, v in CARDS.items() if v["prep"] == "none")
PREP_AHEAD = sorted(k for k, v in CARDS.items() if v["prep"] == "ahead")
assert len(PREP_NONE) == 31 and len(PREP_AHEAD) == 22

# --- the card build's search, re-implemented ---------------------------------
# Mirrors app.js: norm(), the STOP list, tokens(), haystacks() with the sit
# line at W_SIT=3, word-PREFIX matching, semSegments() over the meaning
# index, w/100*W_SEM, and the sort (score desc, words desc, title asc).

STOP = set(re.findall(r'"([a-z\']+)":1', _APP[_APP.index("var STOP"):_APP.index("function tokens")]))
assert "not" not in STOP and "no" not in STOP and "nothing" not in STOP, \
    "the function-word defect the study finds depends on these not being stop words"

W_LABEL, W_NAME, W_SIT, W_TAXON, W_MOMENT, W_SEM = 6, 4, 3, 2, 1, 6


def norm(s):
    s = s.lower().replace("‘", "'").replace("’", "'")
    s = re.sub(r"[^a-z0-9']+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def tokens(s):
    return [t for t in norm(s).split(" ") if t and len(t) > 1 and t not in STOP]


def block_title(s):          # what the log calls a block (blockTitle in app.js)
    return s["label"] or s["name"]


def block_lead(s):           # what a card leads with (blockLead in app.js)
    return s["label"] or CARDS[s["id"]]["sit"] or s["name"]


def moment_names(keys):
    return [MOMENTS.get(k, k) for k in keys]


def haystacks(s):
    cats, grps = [], []
    for f in s["filings"]:
        cats.append(CATS[f["category"]])
        if f["group"]:
            g = GROUPS[f["group"]]
            grps.append(g["name"])
            if g["subtitle"]:
                grps.append(g["subtitle"])
    return dict(label=norm(s["label"] or ""), name=norm(s["name"]),
                sit=norm(CARDS[s["id"]]["sit"]), taxon=norm(" ".join(cats + grps)),
                moment=norm(" ".join(moment_names(s["moment"]))))


def has_word(hay, tok):
    return bool(hay) and any(w.startswith(tok) for w in hay.split(" "))


def sem_segments(q):
    nq = norm(q)
    toks = [t for t in nq.split(" ") if t]
    found, covered, seen = [], set(), set()
    if len(toks) > 4 and nq in SEM["terms"]:
        found.append(nq)
        seen.add(nq)
        covered.update(range(len(toks)))
    for i in range(len(toks)):
        for n in range(4, 0, -1):
            if i + n > len(toks):
                continue
            cand = " ".join(toks[i:i + n])
            if cand in SEM["terms"]:
                if cand not in seen:
                    seen.add(cand)
                    found.append(cand)
                covered.update(range(i, i + n))
    unknown = [t for i, t in enumerate(toks) if i not in covered and len(t) > 1 and t not in STOP]
    return found, unknown


def search(q):
    """Ranked results for a query: list of (skill, score). Same arithmetic as
    the prototype; checked against the live build in a browser for eight
    queries before this file was committed."""
    toks = tokens(q)
    scored = {}

    def slot(s):
        if s["id"] not in scored:
            scored[s["id"]] = dict(block=s, score=0.0, words=0)
        return scored[s["id"]]

    if toks:
        for s in SKILLS:
            h = haystacks(s)
            score = 0
            words = 0
            for t in toks:
                w = 0
                if has_word(h["label"], t):
                    w = max(w, W_LABEL)
                if has_word(h["name"], t):
                    w = max(w, W_NAME)
                if has_word(h["sit"], t):
                    w = max(w, W_SIT)
                if has_word(h["taxon"], t):
                    w = max(w, W_TAXON)
                if has_word(h["moment"], t):
                    w = max(w, W_MOMENT)
                if w:
                    score += w
                    words += 1
            if words:
                r = slot(s)
                r["score"] += score
                r["words"] = words
    found, _unknown = sem_segments(q)
    for term in found:
        for e in SEM["terms"][term]:
            s = BY_ID[SEM["ids"][e[0]]]
            r = slot(s)
            r["score"] += e[1] / 100.0 * W_SEM
    res = sorted(scored.values(),
                 key=lambda r: (-r["score"], -r["words"], block_title(r["block"]).lower()))
    return [(r["block"], r["score"]) for r in res]


def facet_ok(s, token):
    kind, value = token[0], token[2:]
    if kind == "c":
        return any(f["category"] == value for f in s["filings"])
    if kind == "g":
        return any(f["group"] == value for f in s["filings"])
    if kind == "m":
        return value in s["moment"]
    if kind == "p":
        return CARDS[s["id"]]["prep"] == value
    return True


def results_for(q, facets):
    return [(s, sc) for s, sc in search(q) if all(facet_ok(s, t) for t in facets)]


def find_route(q, facets):
    h = "/find?q=" + quote(q, safe="-_.!~*'()")
    if facets:
        h += "&f=" + "~".join(quote(t, safe="-_.!~*'()") for t in facets)
    return h


# ============================================================================
# PART 1 — TEAM A: the invented data
# ============================================================================

# Five fresh participants (P21–P25: none of the twenty earlier roster members
# — nine card sorters, eleven tree-testers — has seen this prototype). Session
# start is local Mountain Standard Time; the log stamps UTC.
A_PARTICIPANTS = [
    ("P21", "Deanne Whitlock",   "Primary · 10–11s, second teacher (called 18 Oct)", "iPhone", "2026-11-16", "19:00"),
    ("P22", "Marcus Pulsipher",  "Young Men · Teachers quorum adviser",        "Android", "2026-11-16", "20:15"),
    ("P23", "Karalee Stringham", "Primary · 6-year-olds",                      "iPhone",  "2026-11-17", "18:30"),
    ("P24", "Lyle Farnsworth",   "Elders quorum · instructor",                 "Android", "2026-11-17", "19:45"),
    ("P25", "Hal Bagley",        "Primary · Sunbeams (3-year-olds)",           "Android", "2026-11-18", "18:00"),
]
A_PID = [p[0] for p in A_PARTICIPANTS]

# The five tasks, written from the recruits' own next lessons. `accept` is the
# set of block ids counted as success — decided and written down before the
# first session. T3 accepts any block whose card says "No prep — use it live".
A_TASKS = OrderedDict([
    ("T1", dict(short="The eight-minute story", source="P22",
                text="You are teaching from a conference talk on Sunday. There is a story you love that takes eight minutes to tell, and the whole class is twenty-five. Find something that helps you decide whether the story stays in.",
                accept=["025.title_number3"], predicted="search")),
    ("T2", dict(short="Felt nothing", source="P21",
                text="One of the girls in your class says she prayed about something and felt nothing, and she wants to know how anybody is supposed to tell when the Spirit is there. Find something for next Sunday.",
                accept=["020.title_number3"], predicted="/c/feels")),
    ("T3", dict(short="The 7:40 text", source="P24",
                text="It is Sunday morning. The teacher texted at 7:40 that he is sick, and you are teaching in an hour with nothing prepared. Find something you could do in class today with nothing in your hands.",
                accept=list(PREP_NONE), predicted="search")),
    ("T4", dict(short="Thirteen Sunbeams", source="P25",
                text="Your class of three-year-olds comes in from singing time wound up, and the first five minutes are gone every week. Find something to open with that gets them settled and into the lesson.",
                accept=["019.title_number2", "027.title_number2"], predicted="/m/opening")),
    ("T5", dict(short="The two who never come", source="P23",
                text="Two of the children in your class have not been to Primary in a month. Their parents are in sacrament meeting every week. Find something the site suggests you do about it this week.",
                accept=["013.intro2", "015.title_number1"], predicted="/c/love")),
])

# Cyclic Latin square: every task in every position exactly once.
A_ORDER = {
    "P21": ["T1", "T2", "T3", "T4", "T5"],
    "P22": ["T2", "T3", "T4", "T5", "T1"],
    "P23": ["T3", "T4", "T5", "T1", "T2"],
    "P24": ["T4", "T5", "T1", "T2", "T3"],
    "P25": ["T5", "T1", "T2", "T3", "T4"],
}
for _pos in range(5):
    assert sorted(A_ORDER[p][_pos] for p in A_PID) == list(A_TASKS), "not a Latin square"

# ---------------------------------------------------------------- the runs
# One entry per participant per task: (seconds, gave_up, steps). Steps are
# exactly the things the prototype logs (plus "back", the phone's back
# gesture, which it does NOT log — it shows up as a discontinuity in
# fromRoute). Every step is validated against the real routes below.
#   ("nav", route)          an in-app link tapped (label derived from route)
#   ("backnav", route)      a "← Home" / "← Category" link at the foot of a page
#   ("titlebar",)           the "Principles of Teaching" title bar → home
#   ("search", query)       a query submitted from the search box
#   ("try", query)          a "Try searching" suggestion button on the home screen
#   ("facet", token, on)    a "Narrow by …" chip
#   ("result", block_id)    a search result opened (rank computed live)
#   ("manual", block_id)    "Read it in the manual →"
#   ("back",)               phone back gesture; no log row
def C(slug): return "/c/" + slug
def G(cat, grp): return "/g/" + cat + "/" + grp
def M(key): return "/m/" + key
def B(bid): return "/b/" + bid

A_RUNS = {
    ("P21", "T1"): (38.4, False, [("nav", C("prep")), ("nav", G("prep", "planning-the-lesson")),
                                  ("nav", B("025.title_number3")), ("manual", "025.title_number3")]),
    ("P21", "T2"): (21.7, False, [("nav", C("feels")), ("nav", B("020.title_number3")),
                                  ("manual", "020.title_number3")]),
    ("P21", "T3"): (49.8, False, [("nav", C("talk")), ("nav", G("talk", "asking-for-a-real-answer")),
                                  ("nav", B("026.intro2"))]),
    ("P21", "T4"): (29.5, False, [("nav", M("opening")), ("nav", B("019.title_number2")),
                                  ("manual", "019.title_number2")]),
    ("P21", "T5"): (55.3, False, [("nav", C("love")), ("nav", G("love", "getting-to-know-them")),
                                  ("backnav", C("love")), ("nav", G("love", "during-the-week")),
                                  ("nav", B("013.intro2"))]),

    ("P22", "T2"): (12.3, False, [("search", "felt nothing"), ("result", "020.title_number3")]),
    ("P22", "T3"): (41.6, False, [("search", "nothing prepared"), ("facet", "p:none", True),
                                  ("result", "020.intro2")]),
    ("P22", "T4"): (16.8, False, [("try", "kids are noisy"), ("result", "019.title_number2")]),
    ("P22", "T5"): (97.4, False, [("search", "kids who don't come"), ("search", "not coming"),
                                  ("result", "015.title_number1"), ("back",), ("titlebar",),
                                  ("nav", C("love")), ("nav", G("love", "during-the-week")),
                                  ("nav", B("013.intro2"))]),
    ("P22", "T1"): (14.9, False, [("search", "story too long"), ("result", "025.title_number3")]),

    ("P23", "T3"): (58.7, False, [("nav", M("during")), ("nav", B("007.title_number1"))]),
    ("P23", "T4"): (31.2, False, [("nav", C("attention")), ("nav", G("attention", "see-or-hear")),
                                  ("nav", B("019.title_number2"))]),
    ("P23", "T5"): (142.6, True, [("nav", C("love")), ("nav", G("love", "getting-to-know-them")),
                                  ("backnav", C("love")), ("nav", G("love", "safe-to-speak-up")),
                                  ("nav", B("014.title_number3")), ("backnav", "/"),
                                  ("search", "not coming to primary")]),
    ("P23", "T1"): (71.2, False, [("nav", C("attention")), ("nav", G("attention", "see-or-hear")),
                                  ("backnav", C("attention")), ("nav", G("attention", "do-not-watch")),
                                  ("backnav", "/"), ("search", "story"), ("result", "025.title_number3")]),
    ("P23", "T2"): (44.0, False, [("nav", C("christ")), ("nav", G("christ", "bearing-witness-in-class")),
                                  ("nav", B("020.title_number3")), ("manual", "020.title_number3")]),

    ("P24", "T4"): (36.1, False, [("nav", C("attention")), ("nav", G("attention", "do-not-watch")),
                                  ("nav", B("027.title_number2"))]),
    ("P24", "T5"): (33.9, False, [("nav", C("love")), ("nav", G("love", "during-the-week")),
                                  ("nav", B("013.intro2"))]),
    ("P24", "T1"): (52.6, False, [("nav", C("prep")), ("nav", G("prep", "getting-yourself-ready")),
                                  ("backnav", C("prep")), ("nav", G("prep", "planning-the-lesson")),
                                  ("nav", B("025.title_number3")), ("manual", "025.title_number3")]),
    ("P24", "T2"): (27.9, False, [("nav", C("feels")), ("nav", B("020.title_number3"))]),
    ("P24", "T3"): (88.2, False, [("search", "substitute"), ("search", "no time to prepare"),
                                  ("facet", "p:none", True), ("result", "029.title_number2")]),

    ("P25", "T5"): (168.9, True, [("nav", C("love")), ("nav", G("love", "getting-to-know-them")),
                                  ("backnav", C("love")), ("nav", G("love", "during-the-week")),
                                  ("backnav", C("love")), ("backnav", "/"), ("search", "absent")]),
    ("P25", "T1"): (96.3, False, [("nav", C("prep")), ("nav", G("prep", "planning-the-lesson")),
                                  ("nav", B("025.title_number3"))]),
    ("P25", "T2"): (41.2, False, [("nav", C("feels")), ("nav", B("020.title_number3"))]),
    ("P25", "T3"): (64.0, False, [("nav", C("prep")), ("nav", G("prep", "getting-yourself-ready")),
                                  ("nav", B("017.title_number2"))]),
    ("P25", "T4"): (47.7, False, [("search", "singing time"), ("result", "019.title_number2"),
                                  ("manual", "019.title_number2")]),
}
assert len(A_RUNS) == 25

# Moderator's timing sheet: seconds from session start to the first task, and
# the pause between tasks (moderator reads the next card; participant taps the
# title bar to go home, which the log records).
A_FIRST_TASK_AT = {"P21": 250, "P22": 190, "P23": 305, "P24": 240, "P25": 420}
A_GAP = {"P21": 62, "P22": 48, "P23": 71, "P24": 66, "P25": 95}


# ---------------------------------------------------------------- validate
def route_label(route):
    """The data-label the app puts on the link that leads to `route`."""
    if route == "/":
        return "Back: ← Home"
    seg = route.split("?")[0].split("/")[1:]
    if seg[0] == "c":
        return "Category: " + CATS[seg[1]]
    if seg[0] == "g":
        return "Group: " + GROUPS[seg[2]]["name"]
    if seg[0] == "m":
        return "Moment: " + MOMENTS[seg[1]]
    if seg[0] == "b":
        return "Block: " + block_title(BY_ID[seg[1]])
    raise ValueError(route)


def route_exists(route):
    seg = route.split("?")[0].split("/")[1:]
    if route == "/":
        return True
    if seg[0] == "c":
        return seg[1] in CATS
    if seg[0] == "g":
        return seg[2] in GROUPS and GROUPS[seg[2]]["category"] == seg[1]
    if seg[0] == "m":
        return seg[1] in MOMENTS
    if seg[0] == "b":
        return seg[1] in BY_ID
    return route.startswith("/find?q=")


def links_from(route):
    """Routes reachable by an in-app link from `route` (the real views)."""
    seg = route.split("?")[0].split("/")[1:]
    out = {"/"}
    if route == "/":
        out |= {C(c) for c in CATS} | {M(m) for m in MOMENTS}
    elif seg[0] == "c":
        cat = seg[1]
        gs = [g for g, v in GROUPS.items() if v["category"] == cat]
        if gs:
            out |= {G(cat, g) for g in gs}
        else:   # trial branch files its blocks directly
            out |= {B(s["id"]) for s in SKILLS if any(f["category"] == cat for f in s["filings"])}
    elif seg[0] == "g":
        out |= {C(seg[1])} | {B(s["id"]) for s in SKILLS if any(f["group"] == seg[2] for f in s["filings"])}
    elif seg[0] == "m":
        out |= {B(s["id"]) for s in SKILLS if seg[1] in s["moment"]}
    elif seg[0] == "b":
        s = BY_ID[seg[1]]
        for f in s["filings"]:
            out.add(C(f["category"]))
            if f["group"]:
                out.add(G(f["category"], f["group"]))
        out |= {M(k) for k in s["moment"]}
    elif seg[0] == "find":
        out |= {B(s["id"]) for s in SKILLS}   # results, validated separately
    return out


def walk(run):
    """Replay a run's steps against the real build; return (rows, ended_on,
    backtracks, clicks, queries). rows are log rows minus seq/time."""
    seconds, gave_up, steps = run
    rows, visited, backtracks, clicks, queries = [], ["/"], 0, 0, []
    cur, query, facets = "/", None, []
    for st in steps:
        kind = st[0]
        if kind in ("nav", "backnav"):
            to = st[1]
            assert route_exists(to), to
            assert to in links_from(cur), (cur, to)
            label = ("Back: ← " + ("Home" if to == "/" else CATS[to.split("/")[2]])) \
                if kind == "backnav" else route_label(to)
            rows.append(dict(event="nav", fromRoute=cur, toRoute=to, label=label))
            if to in visited:
                backtracks += 1
            visited.append(to)
            cur = to
            clicks += 1
        elif kind == "titlebar":
            rows.append(dict(event="nav", fromRoute=cur, toRoute="/", label="Home (title bar)"))
            if "/" in visited:
                backtracks += 1
            visited.append("/")
            cur = "/"
            clicks += 1
        elif kind in ("search", "try"):
            query, facets = st[1], []
            to = find_route(query, facets)
            n = len(results_for(query, facets))
            rows.append(dict(event="search", fromRoute=to, toRoute=to, label="Search: " + query,
                             query=query, resultCount=n))
            queries.append((query, n))
            visited.append(to)
            cur = to
        elif kind == "facet":
            token, on = st[1], st[2]
            assert query is not None
            nxt = [t for t in facets if t != token] if not on else facets + [token]
            to = find_route(query, nxt)
            rows.append(dict(event="facet", fromRoute=cur, toRoute=to,
                             label=("Filter: " if on else "Remove filter: ") + PREP_NAMES[token[2:]],
                             query=query, facet=token + (" on" if on else " off")))
            facets = nxt
            visited.append(to)
            cur = to
            clicks += 1
        elif kind == "result":
            bid = st[1]
            res = results_for(query, facets)
            ids = [s["id"] for s, _ in res]
            assert bid in ids, ("result not on screen", query, facets, bid)
            rank = ids.index(bid) + 1
            rows.append(dict(event="result", fromRoute=cur, toRoute=B(bid),
                             label="Block: " + block_title(BY_ID[bid]), query=query,
                             blockId=bid, rank=rank))
            visited.append(B(bid))
            cur = B(bid)
            clicks += 1
        elif kind == "manual":
            bid = st[1]
            assert cur == B(bid), (cur, bid)
            rows.append(dict(event="manual", fromRoute=cur, toRoute=BY_ID[bid]["url"],
                             label="Manual: " + bid, blockId=bid))
        elif kind == "back":
            # phone back gesture: the app re-renders but logs nothing
            prev = visited[-2] if len(visited) >= 2 else "/"
            backtracks += 1
            visited.append(prev)
            cur = prev
        else:
            raise ValueError(kind)
    ended = cur if cur.startswith("/b/") else None
    path = []
    for r in rows:
        if r["event"] == "search":
            path.append("search “%s” (%d)" % (r["query"], r["resultCount"]))
        elif r["event"] == "facet":
            path.append("chip: " + r["label"].replace("Filter: ", ""))
        elif r["event"] == "result":
            path.append("result #%d → %s" % (r["rank"], r["toRoute"]))
        elif r["event"] == "manual":
            path.append("manual ↗")
        else:
            path.append(r["toRoute"])
    walk.last_path = " › ".join(path)
    return rows, ended, backtracks, clicks, queries


LOG_FIELDS = ["seq", "time", "event", "fromRoute", "toRoute", "label",
              "query", "blockId", "rank", "facet", "resultCount"]


def mst_to_utc(day, hm):
    local = dt.datetime.strptime(day + " " + hm, "%Y-%m-%d %H:%M")
    return local + dt.timedelta(hours=7)     # MST = UTC−7 in November


def iso(t):
    return t.strftime("%Y-%m-%dT%H:%M:%S.") + "%03dZ" % (t.microsecond // 1000)


def build_team_a():
    """Replay every run, stamp times, and assemble the concatenated export."""
    out_rows, per_run = [], OrderedDict()
    for pid, name, calling, phone, day, hm in A_PARTICIPANTS:
        t = mst_to_utc(day, hm) + dt.timedelta(seconds=A_FIRST_TASK_AT[pid])
        seq = 0
        for i, tid in enumerate(A_ORDER[pid]):
            run = A_RUNS[(pid, tid)]
            seconds, gave_up, _steps = run
            rows, ended, backtracks, clicks, queries = walk(run)
            # spread the run's rows over its seconds: a first tap comes after
            # reading; the rest fall proportionally, the last one at the end
            n = len(rows)
            for j, r in enumerate(rows):
                frac = (j + 1) / float(n) if n > 1 else 1.0
                at = t + dt.timedelta(seconds=round(seconds * (0.35 + 0.65 * frac), 1) if n > 1
                                      else seconds)
                seq += 1
                row = dict(participant=pid, task=tid, seq=seq, time=iso(at), event=r["event"],
                           fromRoute=r["fromRoute"], toRoute=r["toRoute"], label=r["label"],
                           query=r.get("query", ""), blockId=r.get("blockId", ""),
                           rank=r.get("rank", ""), facet=r.get("facet", ""),
                           resultCount=r.get("resultCount", ""))
                out_rows.append(row)
            accepted = A_TASKS[tid]["accept"]
            success = (not gave_up) and ended is not None and ended[3:] in accepted
            first = rows[0]["toRoute"] if rows else None
            per_run[(pid, tid)] = dict(seconds=seconds, gave_up=gave_up, ended=ended,
                                       success=success, backtracks=backtracks, clicks=clicks,
                                       queries=queries, first=first, position=i + 1,
                                       rows=len(rows), path=walk.last_path)
            t += dt.timedelta(seconds=seconds)
            if i < 4:   # between tasks: pause, then the title bar tap the log sees
                t += dt.timedelta(seconds=A_GAP[pid])
                seq += 1
                out_rows.append(dict(participant=pid, task="", seq=seq, time=iso(t), event="nav",
                                     fromRoute=(ended or rows[-1]["toRoute"]), toRoute="/",
                                     label="Home (title bar)", query="", blockId="", rank="",
                                     facet="", resultCount=""))
                t += dt.timedelta(seconds=4)
    return out_rows, per_run


A_ROWS, A_RESULT = build_team_a()

# Every give-up must end on a search screen or a branch, never on a block;
# every non-give-up must end on a block.
for (pid, tid), r in A_RESULT.items():
    if r["gave_up"]:
        assert r["ended"] is None, (pid, tid)
        assert not r["success"]
    else:
        assert r["ended"] is not None, (pid, tid)


def first_kind(route):
    if route is None:
        return "—"
    if route.startswith("/find"):
        return "search"
    if route.startswith("/c/feels"):
        return "trial tile"
    if route.startswith("/c/"):
        return "category: " + CATS[route.split("/")[2]]
    if route.startswith("/m/"):
        return "moment: " + MOMENTS[route.split("/")[2]]
    return route


def predicted_kind(p):
    return "search" if p == "search" else first_kind(p)


def a_task_stats():
    stats = OrderedDict()
    for tid, task in A_TASKS.items():
        runs = [A_RESULT[(p, tid)] for p in A_PID]
        firsts = Counter(first_kind(r["first"]) for r in runs)
        modal, modal_n = firsts.most_common(1)[0]
        tie = [k for k, v in firsts.items() if v == modal_n]
        ends = Counter((r["ended"] or "gave up") for r in runs)
        stats[tid] = dict(
            success=sum(r["success"] for r in runs),
            gave_up=sum(r["gave_up"] for r in runs),
            wrong=sum((not r["success"]) and (not r["gave_up"]) for r in runs),
            mean_s=sum(r["seconds"] for r in runs) / 5.0,
            mean_clicks=sum(r["clicks"] for r in runs) / 5.0,
            backtracks=sum(r["backtracks"] for r in runs),
            firsts=firsts, modal=modal, modal_n=modal_n, tie=sorted(tie),
            predicted=predicted_kind(task["predicted"]),
            match=(predicted_kind(task["predicted"]) in tie),
            ends=ends,
            queries=[q for r in runs for q in r["queries"]],
        )
    return stats


A_STATS = a_task_stats()


def write_team_a_csv():
    path = os.path.join(HERE, "03-task-test-raw-team-a.csv")
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(["participant", "task"] + LOG_FIELDS)
        for r in A_ROWS:
            w.writerow([r["participant"], r["task"]] + [r[k] for k in LOG_FIELDS])
    return path, len(A_ROWS)


# ============================================================================
# PART 2 — TEAM B: the invented data
# ============================================================================

_B_SEARCHDATA = read(os.path.join(TEAM_B_DIR, "searchdata.js"))
B_SEARCH = [dict(id=i, title=t, page=p, cat=c) for i, t, p, c in re.findall(
    r'\{\s*id:\s*"(C\d+)",\s*title:\s*"([^"]+)",\s*page:\s*"([^"]+)",\s*cat:\s*"([^"]+)"\s*\}',
    _B_SEARCHDATA)]
assert len(B_SEARCH) == 20 and not any(b["id"] == "C13" for b in B_SEARCH), \
    "C13 must be absent from Team B's search data"

B_PAGE_TITLE = {}     # file -> document.title
B_H1 = {}
for f in sorted(os.listdir(TEAM_B_DIR)):
    if f.endswith(".html"):
        src = read(os.path.join(TEAM_B_DIR, f))
        B_PAGE_TITLE[f] = re.search(r"<title>(.*?)</title>", src).group(1).replace("&mdash;", "—")
        B_H1[f] = re.search(r"<h1[^>]*>(.*?)</h1>", src).group(1)
B_IN_PAGE = {f: re.findall(r'href="(block-c\d+\.html)"', read(os.path.join(TEAM_B_DIR, f)))
             for f in B_PAGE_TITLE}
assert "block-c13.html" not in sum([v for k, v in B_IN_PAGE.items() if k.startswith("cat-")], [])
assert "block-c13.html" in B_IN_PAGE["sec-teach-by-the-spirit.html"]

# The tile text the click log records for the home-page tiles (h2 + p).
B_TILE_TEXT = {}
for href, h2, p in re.findall(r'<a class="tile" href="([^"]+)">\s*<h2>([^<]+)</h2>\s*<p>([^<]+)</p>',
                              read(os.path.join(TEAM_B_DIR, "index.html"))):
    B_TILE_TEXT[href] = (h2 + " " + p).replace("&rsquo;", "’")
B_SECTION_LINKS = dict((href, txt) for href, txt in re.findall(
    r'<a[^>]*href="(sec-[^"]+)"[^>]*>([^<]+)</a>', read(os.path.join(TEAM_B_DIR, "index.html"))))


def b_search(q):
    """search.html: trim, lower-case, title substring."""
    q = q.strip().lower()
    return [b for b in B_SEARCH if q in b["title"].lower()] if q else []


B_PEOPLE = [
    ("Cami",    "Cami Sprague (P15) · Primary 5-year-olds · did our card sort and tree test", "her iPhone"),
    ("Braxton", "Braxton Sprague · Cami's husband, not a teacher · did our tree test",        "Cami's iPhone"),
    ("Shanna",  "Shanna Ricks (P26) · Primary 8–9s · new",                                    "her iPhone"),
    ("Tanner",  "Tanner · Kyle's roommate, CS major, not in the ward",                        "the laptop"),
    ("Jace",    "Jace · our other roommate, CS 240, not in the ward",                         "the laptop"),
]
B_TASKS = OrderedDict([
    ("B1", ("Nobody in your class answers your questions. Find something to try.", "C16")),
    ("B2", ("Find something under Preparation you could do this week.", "any-preparation")),
    ("B3", ("You want to use a song in your lesson. Find how.", "C13")),
    ("B4", ("Look around and find something you would actually use in your next lesson.", "any")),
    ("B5", ("One of your kids is going through a hard time at home and you want to reach out to the parents. Find what to do.", "C10")),
])
B_PREP_BLOCKS = [p[len("block-"):-len(".html")].upper() for p in B_IN_PAGE["cat-preparation.html"]]

# Per person per task: (first thing they did, where they ended, seconds on the
# stopwatch, [searches typed], note). Same order for everyone, B1..B5.
B_RUNS = {
    ("Cami", "B1"):    ("Asking Great Questions", "C16", 18, [], "knew where Questions was"),
    ("Cami", "B2"):    ("Preparation", "C17", 14, [], ""),
    ("Cami", "B3"):    ("search", "C13", 95, ["song", "music"], "remembered from the tree test that some are only under the sections"),
    ("Cami", "B4"):    ("Asking Great Questions", "C20", 25, [], "she likes that one"),
    ("Cami", "B5"):    ("Love", "C10", 16, [], ""),
    ("Braxton", "B1"): ("Teaching Fundamentals", "C21", 34, [], ""),
    ("Braxton", "B2"): ("Preparation", "C08", 22, [], ""),
    ("Braxton", "B3"): ("search", None, 190, ["music", "hymn", "sing"], "we let him stop after about 3 minutes"),
    ("Braxton", "B4"): ("Keeping Them Engaged", "C09", 40, [], ""),
    ("Braxton", "B5"): ("Love", "C10", 20, [], ""),
    ("Shanna", "B1"):  ("Asking Great Questions", "C16", 30, [], ""),
    ("Shanna", "B2"):  ("Preparation", "C24", 19, [], ""),
    ("Shanna", "B3"):  ("search", "C02", 84, ["song"], "said pictures and videos was probably it"),
    ("Shanna", "B4"):  ("Preparation", "C22", 47, [], ""),
    ("Shanna", "B5"):  ("Love", "C04", 38, [], "said 'feel God's love' sounded right for a kid going through something"),
    ("Tanner", "B1"):  ("search", "C16", 21, ["questions"], ""),
    ("Tanner", "B2"):  ("Preparation", "C06", 15, [], ""),
    ("Tanner", "B3"):  ("search", "C13", 120, ["song", "music"], "we told him to try the sections at the bottom"),
    ("Tanner", "B4"):  ("Search", "C11", 33, [], "clicked the Search tile, said 'that's just search'"),
    ("Tanner", "B5"):  ("search", "C10", 41, ["parents"], "no results, then went to Love"),
    ("Jace", "B1"):    ("Asking Great Questions", "C14", 27, [], ""),
    ("Jace", "B2"):    ("Preparation", "C17", 12, [], ""),
    ("Jace", "B3"):    ("search", None, 140, ["sing", "song"], "two searches, nothing, said 'it's not in here' and stopped"),
    ("Jace", "B4"):    ("Spiritual Teaching", "C01", 29, [], ""),
    ("Jace", "B5"):    ("search", "C10", 36, ["parent"], ""),
}
assert len(B_RUNS) == 25


def b_success(tid, ended):
    key = B_TASKS[tid][1]
    if ended is None:
        return False
    if key == "any":
        return True
    if key == "any-preparation":
        return ended in B_PREP_BLOCKS
    return ended == key


B_RESULT = OrderedDict()
for (who, tid), (first, ended, secs, qs, note) in B_RUNS.items():
    B_RESULT[(who, tid)] = dict(first=first, ended=ended, secs=secs, queries=qs, note=note,
                                success=b_success(tid, ended),
                                hits=[(q, [b["id"] for b in b_search(q)]) for q in qs])

B_TASK_STATS = OrderedDict()
for tid in B_TASKS:
    runs = [B_RESULT[(p[0], tid)] for p in B_PEOPLE]
    B_TASK_STATS[tid] = dict(success=sum(r["success"] for r in runs),
                             gave_up=sum(r["ended"] is None for r in runs),
                             mean_s=sum(r["secs"] for r in runs) / 5.0,
                             firsts=Counter(r["first"] for r in runs),
                             ends=Counter(r["ended"] or "gave up" for r in runs))
B_TOTAL_SUCCESS = sum(s["success"] for s in B_TASK_STATS.values())


def b_cat_page_for(block):
    for f, blocks in B_IN_PAGE.items():
        if f.startswith("cat-") and ("block-" + block.lower() + ".html") in blocks:
            return f
    return None


def build_team_b_json():
    """Their log: {clicks:[{n,time,page,clicked,href}], searches:[{n,time,query,results}]}
    per browser, never reset between people sharing a device. Local times,
    no dates — toLocaleTimeString() — so nothing says which evening."""
    devices = OrderedDict([("cami-iphone", ["Cami", "Braxton"]),
                           ("shanna-iphone", ["Shanna"]),
                           ("laptop", ["Tanner", "Jace"])])
    starts = {"Cami": (19, 12, 0), "Braxton": (19, 41, 0), "Shanna": (18, 6, 0),
              "Tanner": (21, 3, 0), "Jace": (21, 27, 0)}
    export = []
    for dev, people in devices.items():
        clicks, searches = [], []
        for who in people:
            h, m, s = starts[who]
            t = dt.datetime(2026, 11, 17, h, m, s)
            t += dt.timedelta(seconds=140)
            for tid in B_TASKS:
                r = B_RESULT[(who, tid)]
                first, ended, secs, qs = r["first"], r["ended"], r["secs"], r["queries"]
                cur = "index.html"
                elapsed = 0.0
                n_steps = 1 + len(qs) + (1 if ended else 0) + (2 if ended and not first == "search" else 0)
                step = secs / float(n_steps)

                def tick():
                    nonlocal elapsed
                    elapsed += step
                    return (t + dt.timedelta(seconds=round(elapsed))).strftime("%-I:%M:%S %p")

                if first == "search":
                    clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                       clicked="Search", href="search.html"))
                    cur = "search.html"
                    for q in qs:
                        searches.append(dict(n=len(searches) + 1, time=tick(), query=q,
                                             results=len(b_search(q))))
                    if ended is not None:
                        hits = [b for b in b_search(qs[-1]) if b["id"] == ended] if qs else []
                        if hits:
                            clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                               clicked=hits[0]["title"], href=hits[0]["page"]))
                        else:
                            # left the search page and browsed there instead
                            clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                               clicked="Home", href="index.html"))
                            cur = "index.html"
                            if ended == "C13":
                                sec = "sec-teach-by-the-spirit.html"
                                clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                                   clicked=B_SECTION_LINKS[sec], href=sec))
                                cur = sec
                            else:
                                cat = b_cat_page_for(ended)
                                clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                                   clicked=B_TILE_TEXT[cat], href=cat))
                                cur = cat
                            page = "block-" + ended.lower() + ".html"
                            clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                               clicked=B_H1[page], href=page))
                else:
                    tile = [h for h, txt in B_TILE_TEXT.items() if txt.startswith(first)][0]
                    clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                       clicked=B_TILE_TEXT[tile], href=tile))
                    cur = tile
                    if ended is not None:
                        page = "block-" + ended.lower() + ".html"
                        if tile == "search.html":
                            clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                               clicked="Home", href="index.html"))
                            cur = "index.html"
                            cat = b_cat_page_for(ended)
                            clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                               clicked=B_TILE_TEXT[cat], href=cat))
                            cur = cat
                        clicks.append(dict(n=len(clicks) + 1, time=tick(), page=B_PAGE_TITLE[cur],
                                           clicked=B_H1[page], href=page))
                t += dt.timedelta(seconds=secs + 40)
                # back to the home page between tasks (they clicked "Home")
                clicks.append(dict(n=len(clicks) + 1, time=(t).strftime("%-I:%M:%S %p"),
                                   page=B_PAGE_TITLE["block-" + ended.lower() + ".html"] if ended else B_PAGE_TITLE["search.html"],
                                   clicked="Home", href="index.html"))
                t += dt.timedelta(seconds=25)
        export.append(OrderedDict([("device", dev), ("people", " then ".join(people)),
                                   ("clicks", clicks), ("searches", searches)]))
    return export


B_EXPORT = build_team_b_json()


def write_team_b_json():
    path = os.path.join(HERE, "03-task-test-raw-team-b.json")
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(B_EXPORT, fh, indent=2, ensure_ascii=False)
    return path


# ============================================================================
# PART 3 — print everything the page needs
# ============================================================================

if __name__ == "__main__":
    head("TEAM A — the card build under test")
    print("categories:", list(CATS.values()))
    print("no-prep blocks: %d   takes-getting-ready: %d" % (len(PREP_NONE), len(PREP_AHEAD)))

    head("TEAM A — tasks (verbatim), correct block(s), predicted first click")
    for tid, t in A_TASKS.items():
        acc = t["accept"] if len(t["accept"]) < 4 else ["any of the %d no-prep blocks" % len(t["accept"])]
        print("%s · %s  (from %s)\n   %s\n   accept: %s\n   predicted first click: %s"
              % (tid, t["short"], t["source"], t["text"], acc, predicted_kind(t["predicted"])))

    head("TEAM A — per task")
    tot_success = tot_giveup = tot_wrong = 0
    tot_s = tot_clicks = tot_back = 0.0
    for tid, s in A_STATS.items():
        tot_success += s["success"]; tot_giveup += s["gave_up"]; tot_wrong += s["wrong"]
        tot_s += s["mean_s"] * 5; tot_clicks += s["mean_clicks"] * 5; tot_back += s["backtracks"]
        print("%s %-24s success %d/5  gave up %d  wrong %d  mean %5.1fs  clicks %.1f  backtracks %d"
              % (tid, A_TASKS[tid]["short"], s["success"], s["gave_up"], s["wrong"], s["mean_s"],
                 s["mean_clicks"], s["backtracks"]))
        print("     first clicks:", dict(s["firsts"]), "| predicted:", s["predicted"],
              "| %s" % ("MATCH" if s["match"] else "MISS"))
        print("     ended on:", dict(s["ends"]))
        for pid in A_PID:
            r = A_RESULT[(pid, tid)]
            print("       %s pos%d %6.1fs %-8s first=%-40s end=%s bt=%d q=%s"
                  % (pid, r["position"], r["seconds"], "GAVE UP" if r["gave_up"] else ("ok" if r["success"] else "WRONG"),
                     first_kind(r["first"]), r["ended"], r["backtracks"],
                     [q for q, n in r["queries"]]))
    print(bar)
    print("paths (as the page prints them):")
    for pid in A_PID:
        for tid in A_ORDER[pid]:
            r = A_RESULT[(pid, tid)]
            print("   %s %s pos%d %6.1fs %s :: %s" % (pid, tid, r["position"], r["seconds"],
                  "GAVE UP" if r["gave_up"] else ("ok" if r["success"] else "WRONG"), r["path"]))
    print(bar)
    print("overall: %d/25 success (%.0f%%), %d give-ups, %d wrong, mean %.1fs, mean %.1f clicks, %d backtracks"
          % (tot_success, tot_success * 4, tot_giveup, tot_wrong, tot_s / 25, tot_clicks / 25, tot_back))
    print("per participant success:", {p: sum(A_RESULT[(p, t)]["success"] for t in A_TASKS) for p in A_PID})
    print("per participant mean s:", {p: round(sum(A_RESULT[(p, t)]["seconds"] for t in A_TASKS) / 5, 1) for p in A_PID})
    fk = Counter(first_kind(A_RESULT[(p, t)]["first"]) for p in A_PID for t in A_TASKS)
    print("first clicks overall:", dict(fk))
    print("search-first runs by participant:", {p: sum(first_kind(A_RESULT[(p, t)]["first"]) == "search" for t in A_TASKS) for p in A_PID})
    print("moment-first runs:", sum(v for k, v in fk.items() if k.startswith("moment")))
    print("predictions matched: %d of 5" % sum(s["match"] for s in A_STATS.values()))

    head("TEAM A — every query, in session order, with what the build returned")
    nq = 0
    for pid in A_PID:
        for tid in A_ORDER[pid]:
            r = A_RESULT[(pid, tid)]
            for q, n in r["queries"]:
                nq += 1
                res = search(q)
                top = [(s["id"], round(sc, 2)) for s, sc in res[:3]]
                acc = A_TASKS[tid]["accept"]
                ranks = [i + 1 for i, (s, _) in enumerate(res) if s["id"] in acc]
                print("%-4s %s %-24r %2d results  top3=%s  correct-at=%s"
                      % (pid, tid, q, n, top, ranks[:3] if ranks else "—"))
    print("queries:", nq, "| zero-result:", sum(1 for pid in A_PID for tid in A_TASKS for q, n in A_RESULT[(pid, tid)]["queries"] if n == 0))
    print("'not' / 'no' prefix-matching the D4 label 'When you do not know the answer':")
    for q in ["not coming", "no time to prepare", "not coming to primary", "not enough time"]:
        res = search(q)
        ids = [s["id"] for s, _ in res]
        print("   %-24r rank of 026.title_number3 = %s" % (q, ids.index("026.title_number3") + 1 if "026.title_number3" in ids else "—"))
    res = search("nothing prepared")
    print("'nothing prepared': first %d results are all prep=ahead; usable (no-prep) results start at rank %d of %d"
          % (next(i for i, (s, _) in enumerate(res) if CARDS[s["id"]]["prep"] == "none"),
             next(i for i, (s, _) in enumerate(res) if CARDS[s["id"]]["prep"] == "none") + 1, len(res)))
    print("'absent' no-results screen offered:", [k for k in list(SEM["terms"]) if " " in k and any(w.startswith("absent") or "absent".startswith(w) for w in k.split(" "))][:6])

    head("TEAM A — events by type; facet uses; manual taps")
    ev = Counter(r["event"] for r in A_ROWS if r["task"])
    print("rows in the export: %d (%d inside tasks, %d title-bar resets)" % (len(A_ROWS), sum(1 for r in A_ROWS if r["task"]), sum(1 for r in A_ROWS if not r["task"])))
    print("events inside tasks:", dict(ev))
    print("manual taps by participant:", dict(Counter(r["participant"] for r in A_ROWS if r["event"] == "manual")))
    print("facet uses:", [(r["participant"], r["task"], r["facet"], r["query"]) for r in A_ROWS if r["event"] == "facet"])
    print("prep of the block each T3 run ended on:", {p: (A_RESULT[(p, "T3")]["ended"] or "—", CARDS.get((A_RESULT[(p, "T3")]["ended"] or "/b/x")[3:], {}).get("prep", "—")) for p in A_PID})
    print("lead vs chip on 017.title_number2:", CARDS["017.title_number2"]["sit"], "/", PREP_NAMES[CARDS["017.title_number2"]["prep"]])
    print("lead vs chip on 023.title_number1:", block_lead(BY_ID["023.title_number1"]), "/", PREP_NAMES[CARDS["023.title_number1"]["prep"]])
    ahead_live_sounding = [(k, CARDS[k]["sit"]) for k in PREP_AHEAD]
    print("all 22 'takes getting ready' leads (for the hand audit):")
    for k, sit in ahead_live_sounding:
        print("   %-18s %s" % (k, sit))

    head("TEAM A — the home screen on a phone: tile order")
    print([CATS[c] for c in CATS])
    print("moment page 'The first few minutes' card order:",
          [(s["id"], s["filings"][0]["category"]) for c in CATS for s in SKILLS if "opening" in s["moment"] and s["filings"][0]["category"] == c])
    print("moment page 'In the middle of the lesson' holds %d cards" % sum(1 for s in SKILLS if "during" in s["moment"]))
    print("group sizes:", {g: sum(1 for s in SKILLS if any(f["group"] == g for f in s["filings"])) for g in GROUPS})

    head("TEAM A — session timing (log is UTC; sessions were MST evenings)")
    for pid, name, calling, phone, day, hm in A_PARTICIPANTS:
        rows = [r for r in A_ROWS if r["participant"] == pid]
        print("%s %-18s %s %s %-8s first row %s  last row %s  (%d rows)"
              % (pid, name, day, hm, phone, rows[0]["time"], rows[-1]["time"], len(rows)))

    path, n = write_team_a_csv()
    print("\nwrote", os.path.relpath(path, HERE), "(%d data rows)" % n)

    head("TEAM B — their prototype, checked")
    print("search list holds %d blocks; C13 absent: %s" % (len(B_SEARCH), not any(b["id"] == "C13" for b in B_SEARCH)))
    print("C13 reachable only from:", [f for f, v in B_IN_PAGE.items() if "block-c13.html" in v])
    print("Preparation category holds:", B_PREP_BLOCKS)

    head("TEAM B — per task (their key)")
    for tid, (text, key) in B_TASKS.items():
        s = B_TASK_STATS[tid]
        print("%s key=%-16s right %d/5  gave up %d  mean %5.1fs  firsts=%s  ends=%s"
              % (tid, key, s["success"], s["gave_up"], s["mean_s"], dict(s["firsts"]), dict(s["ends"])))
    print("total right: %d/25 = %.1f%%" % (B_TOTAL_SUCCESS, B_TOTAL_SUCCESS * 4))
    print("per person right:", {p[0]: sum(B_RESULT[(p[0], t)]["success"] for t in B_TASKS) for p in B_PEOPLE})
    print("label-echo task B2 and open task B4 together: %d/10; the other three: %d/15"
          % (B_TASK_STATS["B2"]["success"] + B_TASK_STATS["B4"]["success"],
             B_TASK_STATS["B1"]["success"] + B_TASK_STATS["B3"]["success"] + B_TASK_STATS["B5"]["success"]))

    head("TEAM B — every search and what search.html returned (title substring)")
    for who, tid in B_RUNS:
        for q, hits in B_RESULT[(who, tid)]["hits"]:
            print("%-8s %s %-12r -> %s" % (who, tid, q, hits or "No results."))
    print("searches: %d; zero-result: %d; people who searched on B3: %d of 5"
          % (sum(len(r["queries"]) for r in B_RESULT.values()),
             sum(1 for r in B_RESULT.values() for q, h in r["hits"] if not h),
             sum(1 for p in B_PEOPLE if B_RESULT[(p[0], "B3")]["queries"])))
    print("'sing' substring-matches:", [b["title"] for b in b_search("sing")])
    print("'parents' substring-matches:", [b["title"] for b in b_search("parents")], "| 'parent':", [b["id"] for b in b_search("parent")])

    path = write_team_b_json()
    print("\nwrote", os.path.relpath(path, HERE), "— %d exports: %s"
          % (len(B_EXPORT), [(e["device"], e["people"], len(e["clicks"]), len(e["searches"])) for e in B_EXPORT]))
