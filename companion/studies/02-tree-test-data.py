# -*- coding: utf-8 -*-
"""Invented tree-test datasets for the CS 356 companion (study 02).

Same discipline as 01-card-sort-data.py: the *data* is invented, once, up top;
every number the report page prints is COMPUTED from it here, so the prose can
never drift from the appendix.

Two datasets:

  TEAM A — 11 participants x 10 tasks, run in the wireframe's own bonus test
           mode. Each path is a legal edge-walk of Team A's real tree, parsed
           out of prototypes/wireframe/team-a/wireframe-data.js. Emits
           02-tree-test-raw-team-a.csv in exactly the schema the prototype's
           "Export CSV" button produces.

  TEAM B — 6 participants x 10 tasks, hand-recorded on paper because their
           wireframe has no test mode. The protocol errors are baked into the
           SHAPE of the data (missing first clicks, rough times, no give-up
           option, one task keyed to a block their wireframe does not contain).
           The aggregates are therefore holey, and the holes are printed as
           holes.

Real: the two wireframes, their trees, their task scenarios, the 53-skill
inventory underneath. Invented: every participant, path, endpoint and second.

Run: python3 02-tree-test-data.py    (stdlib only)
"""

import csv
import datetime as dt
import os
import re
import random
import zlib
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
TEAM_A_DIR = os.path.join(HERE, "..", "prototypes", "wireframe", "team-a")
TEAM_B_DIR = os.path.join(HERE, "..", "prototypes", "wireframe", "team-b")

SEED = 356          # fixed: the shuffled task orders must be reproducible
BAR = "=" * 78
bar = "-" * 78


def head(title):
    print("\n" + BAR)
    print(title)
    print(BAR)


# ============================================================================
# PART 0 — read the real artifacts, so the invented data can be checked
#          against them instead of against a copy of them.
# ============================================================================

def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


_A_SRC = read(os.path.join(TEAM_A_DIR, "wireframe-data.js"))

A_CATEGORIES = dict(re.findall(
    r'\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)"\s*\}',
    _A_SRC[_A_SRC.index("categories: ["):_A_SRC.index("groups: [")]))

A_GROUPS = {}       # group slug -> (category name, group name)
for gslug, gcat, gname in re.findall(
        r'\{\s*slug:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*name:\s*"([^"]+)"\s*\}',
        _A_SRC):
    A_GROUPS[gslug] = (gcat, gname)

A_MOMENTS = dict(re.findall(
    r'\{\s*key:\s*"([^"]+)",\s*name:\s*"([^"]+)"', _A_SRC))

A_SKILLS = {}       # skill id -> dict(name, category, group, moments)
for sid, sname, _url, scat, sgrp, smom in re.findall(
        r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]*)",\s*url:\s*"([^"]*)",\s*'
        r'category:\s*"([^"]+)",\s*group:\s*"([^"]+)",\s*moment:\s*\[([^\]]*)\]',
        _A_SRC):
    A_SKILLS[sid] = {
        "name": sname,
        "category": scat,
        "group": sgrp,
        "moments": re.findall(r'"([^"]+)"', smom),
    }

A_TASKS = {}        # task id -> (scenario, expected skill id)
A_TASK_ORDER = []
for tid, scen, expect in re.findall(
        r'\{\s*id:\s*"(T\d+)",\s*scenario:\s*"([^"]*)",\s*expect:\s*"([^"]+)"\s*\}',
        _A_SRC):
    A_TASKS[tid] = (scen, expect)
    A_TASK_ORDER.append(tid)

assert len(A_CATEGORIES) == 5, A_CATEGORIES
assert len(A_GROUPS) == 15, len(A_GROUPS)
assert len(A_MOMENTS) == 4, A_MOMENTS
assert len(A_SKILLS) == 53, len(A_SKILLS)
assert len(A_TASKS) == 10, sorted(A_TASKS)

CAT_SLUG = {name: slug for slug, name in A_CATEGORIES.items()}

# Team B: what their wireframe actually contains, read off the artifact.
B_BLOCKS = sorted(
    f[len("block-"):-len(".html")].upper()
    for f in os.listdir(TEAM_B_DIR)
    if f.startswith("block-") and f.endswith(".html"))

B_CATEGORY_OF = {}      # block id -> category page label
B_CAT_LABEL = {
    "cat-teaching-fundamentals": "Teaching Fundamentals",
    "cat-spiritual-teaching": "Spiritual Teaching",
    "cat-engagement": "Engagement",
    "cat-questions": "Questions",
    "cat-preparation": "Preparation",
    "cat-love": "Love",
    "cat-misc": "Misc",
}
for page, label in B_CAT_LABEL.items():
    for blk in re.findall(r'block-(c\d+)\.html', read(os.path.join(TEAM_B_DIR, page + ".html"))):
        B_CATEGORY_OF[blk.upper()] = label

B_SECTION_PAGES = sorted(f[:-len(".html")] for f in os.listdir(TEAM_B_DIR)
                         if f.startswith("sec-") and f.endswith(".html"))
B_IN_SECTION_VIEW = set()
for page in B_SECTION_PAGES:
    for blk in re.findall(r'block-(c\d+)\.html', read(os.path.join(TEAM_B_DIR, page + ".html"))):
        B_IN_SECTION_VIEW.add(blk.upper())

assert len(B_BLOCKS) == 21, B_BLOCKS
assert "C18" not in B_BLOCKS, "C18 must be absent from Team B's wireframe"
assert {"C03", "C18", "C19"}.isdisjoint(B_BLOCKS)
assert set(B_CATEGORY_OF) == set(B_BLOCKS)
assert {"C10", "C22"} - B_IN_SECTION_VIEW == {"C10", "C22"}, "C10/C22 must be missing from the section view"


# ============================================================================
# PART 1 — TEAM A: the invented data
# ============================================================================

# The eleven participants, in session order. All fresh: none of them sorted
# cards for Report A (that was P01 P02 P04 P05 P06 P07 P08 P13 P15).
# note is the moderator's one-line characterisation, not a finding.
A_PARTICIPANTS = [
    ("P03", "Sione Latu",      "Elders quorum · instructor",     "2026-11-02", "18:05"),
    ("P09", "Wes Purdy",       "Class member · not a teacher",   "2026-11-02", "18:40"),
    ("P10", "Marlo Wheeler",   "Primary · music leader",         "2026-11-02", "19:15"),
    ("P11", "Nathan Kim",      "Sunday School · 12–13s",         "2026-11-02", "19:50"),
    ("P12", "Aubrey Delgado",  "Relief Society · instructor",    "2026-11-02", "20:25"),
    ("P14", "Bryce Tuckett",   "Sunday School president",        "2026-11-02", "21:00"),
    ("P16", "Garrett Nakamura", "Priests quorum · adviser",      "2026-11-03", "18:10"),
    ("P17", "Devin Ashworth",  "Elders quorum · instructor",     "2026-11-03", "18:45"),
    ("P18", "Tessa Bingham",   "Primary · 8–9s",                 "2026-11-03", "19:20"),
    ("P19", "Reed Mangum",     "Sunday School · 14–15s",         "2026-11-03", "19:55"),
    ("P20", "Sydnee Hafen",    "Young Women · 12–13s",           "2026-11-03", "20:30"),
]

# Team A wrote down, before the sessions, which first click they expected on
# each task. Scored below against what actually happened.
A_PREDICTED_FIRST_CLICK = {
    "T01": "/m/after",
    "T02": "/c/talk",
    "T03": "/c/talk",
    "T04": "/c/attention",
    "T05": "/c/prep",
    "T06": "/c/love",
    "T07": "/c/love",
    "T08": "/c/christ",
    "T09": "/c/love",
    "T10": "/c/attention",
}

# ---------------------------------------------------------------- the paths
# One entry per participant per task: (participant, seconds, [routes clicked]).
# The routes are exactly what the prototype records in a run: the walk starts
# at Home (the run puts you there) and every element is the hash the
# participant clicked. Reaching any /s/ page ENDS the task, so a path holds at
# most one /s/ route and it is always last; a path that ends anywhere else is
# a give-up ("I would give up" is a button in test mode).

A_RUNS = {
    "T01": [   # Saturday night, one thing to get yourself ready  -> 017.title_number2
        ("P03", 22.4, ["/c/prep", "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P09", 61.8, ["/c/prep", "/g/prep/planning-the-lesson", "/c/prep",
                       "/g/prep/getting-yourself-ready", "/s/017.title_number1"]),
        ("P10", 48.6, ["/c/prep", "/g/prep/planning-the-lesson", "/c/prep",
                       "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P11", 20.6, ["/m/after", "/s/017.title_number2"]),
        ("P12", 19.9, ["/c/prep", "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P14", 15.2, ["/c/prep", "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P16", 37.1, ["/c/prep", "/g/prep/planning-the-lesson", "/c/prep",
                       "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P17", 17.8, ["/c/prep", "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P18", 44.0, ["/c/prep", "/g/prep/planning-the-lesson", "/c/prep",
                       "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P19", 25.3, ["/c/prep", "/g/prep/getting-yourself-ready", "/s/017.title_number2"]),
        ("P20", 28.9, ["/m/after", "/s/017.title_number2"]),
    ],
    "T02": [   # you ask, nobody answers  -> 023.title_number1
        ("P03", 14.7, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P09", 39.4, ["/c/talk", "/g/talk/not-answering-it-yourself", "/c/talk",
                       "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P10", 26.2, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P11", 21.0, ["/m/during", "/s/023.title_number1"]),
        ("P12", 18.1, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P14", 11.9, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P16",  9.8, ["/c/talk", "/g/talk/not-answering-it-yourself", "/s/029.title_number1"]),
        ("P17", 13.4, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P18", 33.7, ["/c/talk", "/g/talk/talking-to-each-other", "/c/talk",
                       "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P19", 16.5, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P20", 12.8, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
    ],
    "T03": [   # a question you cannot answer  -> 026.title_number3
        ("P03", 18.9, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P09", 47.2, ["/c/christ", "/g/christ/bearing-witness-in-class", "/s/021.title_number2"]),
        ("P10", 31.6, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/026.title_number3"]),
        ("P11", 27.4, ["/m/during", "/s/026.title_number3"]),
        ("P12", 63.5, ["/c/christ", "/g/christ/what-the-prophets-say", "/c/christ", "/",
                       "/c/talk", "/g/talk/asking-for-a-real-answer", "/s/026.title_number3"]),
        ("P14", 19.7, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/026.title_number3"]),
        ("P16", 12.6, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/023.title_number1"]),
        ("P17", 22.3, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/026.title_number3"]),
        ("P18", 29.4, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/026.title_number3"]),
        ("P19", 35.8, ["/c/talk", "/g/talk/asking-for-a-real-answer", "/s/026.title_number3"]),
        ("P20", 30.2, ["/m/during", "/s/026.title_number3"]),
    ],
    "T04": [   # seven-year-olds, something to do with their hands -> 006.title_number2
        ("P03", 71.3, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/c/christ", "/",
                       "/c/attention", "/g/attention/do-not-watch", "/s/006.title_number2"]),
        ("P09", 96.4, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/c/christ",
                       "/g/christ/about-their-own-life", "/c/christ", "/", "/c/attention"]),
        ("P10", 41.7, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/s/006.title_number1"]),
        ("P11", 24.1, ["/m/during", "/s/006.title_number2"]),
        ("P12", 31.0, ["/m/during", "/s/006.title_number2"]),
        ("P14", 13.5, ["/c/attention", "/g/attention/do-not-watch", "/s/006.title_number2"]),
        ("P16", 19.2, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/s/006.title_number1"]),
        ("P17", 27.6, ["/c/attention", "/g/attention/see-or-hear", "/c/attention",
                       "/g/attention/do-not-watch", "/s/006.title_number2"]),
        ("P18", 18.4, ["/m/during", "/s/006.title_number2"]),
        ("P19", 33.8, ["/c/christ", "/g/christ/about-their-own-life", "/s/009.title_number2"]),
        ("P20", 22.7, ["/m/during", "/s/006.title_number2"]),
    ],
    "T05": [   # follow up on last week's invitation  -> 033.title_number1
        ("P03", 21.8, ["/c/prep", "/g/prep/invitations-they-take-home", "/s/033.title_number1"]),
        ("P09", 38.9, ["/c/prep", "/g/prep/invitations-they-take-home", "/s/031.title_number1"]),
        ("P10", 34.5, ["/c/prep", "/g/prep/planning-the-lesson", "/c/prep",
                       "/g/prep/invitations-they-take-home", "/s/033.title_number1"]),
        ("P11", 18.2, ["/m/after", "/s/033.title_number1"]),
        ("P12", 26.7, ["/c/prep", "/g/prep/invitations-they-take-home", "/s/033.title_number1"]),
        ("P14", 14.3, ["/c/prep", "/g/prep/invitations-they-take-home", "/s/033.title_number1"]),
        ("P16", 23.9, ["/m/after", "/s/033.title_number1"]),
        ("P17", 16.4, ["/c/prep", "/g/prep/invitations-they-take-home", "/s/033.title_number1"]),
        ("P18", 28.1, ["/c/prep", "/g/prep/invitations-they-take-home", "/s/033.title_number1"]),
        ("P19", 20.5, ["/c/prep", "/g/prep/invitations-they-take-home", "/s/033.title_number1"]),
        ("P20", 25.6, ["/m/opening", "/s/033.title_number1"]),
    ],
    "T06": [   # the boy at the back who thinks he is spare  -> 014.title_number3
        ("P03", 19.4, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
        ("P09", 33.2, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
        ("P10", 27.8, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
        ("P11", 22.5, ["/m/during", "/s/014.title_number3"]),
        ("P12", 15.9, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
        ("P14", 12.7, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
        ("P16", 16.9, ["/c/love", "/g/love/getting-to-know-them", "/s/011.title_number2"]),
        ("P17", 20.1, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
        ("P18", 24.6, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
        ("P19", 58.2, ["/c/talk", "/g/talk/talking-to-each-other", "/c/talk", "/",
                       "/c/love", "/g/love/safe-to-speak-up", "/s/014.intro2"]),
        ("P20", 18.8, ["/c/love", "/g/love/safe-to-speak-up", "/s/014.title_number3"]),
    ],
    "T07": [   # you noticed something good about a girl this week -> 015.title_number1
        ("P03", 13.6, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P09", 25.4, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P10", 18.9, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P11", 16.2, ["/m/after", "/s/015.title_number1"]),
        ("P12", 11.8, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P14",  9.4, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P16", 14.7, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P17", 12.1, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P18", 21.3, ["/c/love", "/g/love/getting-to-know-them", "/c/love",
                       "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P19", 17.5, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
        ("P20", 10.9, ["/c/love", "/g/love/during-the-week", "/s/015.title_number1"]),
    ],
    "T08": [   # the honesty lesson has gone to school  -> 004.title_number1
        ("P03", 20.7, ["/c/christ", "/g/christ/about-their-own-life", "/s/004.title_number1"]),
        ("P09", 44.1, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/s/005.title_number17"]),
        ("P10", 29.3, ["/c/christ", "/g/christ/about-their-own-life", "/s/004.title_number1"]),
        ("P11", 23.8, ["/m/during", "/s/004.title_number1"]),
        ("P12", 26.5, ["/m/during", "/s/004.title_number1"]),
        ("P14", 15.6, ["/c/christ", "/g/christ/about-their-own-life", "/s/004.title_number1"]),
        ("P16", 18.4, ["/c/christ", "/g/christ/about-their-own-life", "/s/004.title_number1"]),
        ("P17", 22.9, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/c/christ",
                       "/g/christ/about-their-own-life", "/s/004.title_number1"]),
        ("P18", 31.2, ["/c/christ", "/g/christ/bearing-witness-in-class", "/s/007.title_number1"]),
        ("P19", 27.1, ["/c/christ", "/g/christ/about-their-own-life", "/s/004.title_number1"]),
        ("P20", 19.8, ["/c/christ", "/g/christ/about-their-own-life", "/s/004.title_number1"]),
    ],
    "T09": [   # is that the Spirit or just me?  -> 020.title_number3
        ("P03", 104.6, ["/c/christ", "/g/christ/bearing-witness-in-class", "/c/christ",
                        "/g/christ/finding-him-in-the-scriptures", "/c/christ",
                        "/g/christ/bearing-witness-in-class", "/s/020.title_number3"]),
        ("P09", 121.7, ["/c/love", "/g/love/safe-to-speak-up", "/c/love",
                        "/g/love/getting-to-know-them", "/c/love", "/", "/c/christ", "/"]),
        ("P10", 138.2, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/c/christ",
                        "/g/christ/about-their-own-life", "/c/christ", "/", "/c/love",
                        "/g/love/safe-to-speak-up", "/"]),
        ("P11",  68.4, ["/m/during", "/s/020.title_number3"]),
        ("P12",  96.3, ["/c/love", "/g/love/during-the-week", "/c/love", "/", "/c/christ",
                        "/g/christ/bearing-witness-in-class", "/s/021.title_number2"]),
        ("P14",  51.8, ["/c/christ", "/g/christ/bearing-witness-in-class", "/s/020.title_number3"]),
        ("P16",  33.4, ["/c/christ", "/g/christ/about-their-own-life", "/s/009.title_number2"]),
        ("P17",  47.9, ["/c/christ", "/g/christ/bearing-witness-in-class", "/s/008.title_number1"]),
        ("P18", 145.9, ["/c/love", "/g/love/getting-to-know-them", "/c/love", "/", "/c/talk",
                        "/g/talk/asking-for-a-real-answer", "/c/talk", "/"]),
        ("P19",  88.5, ["/c/christ", "/g/christ/finding-him-in-the-scriptures", "/c/christ",
                        "/g/christ/what-the-prophets-say", "/s/024.title_number1"]),
        ("P20",  79.6, ["/m/during", "/", "/c/christ",
                        "/g/christ/bearing-witness-in-class", "/s/021.title_number2"]),
    ],
    "T10": [   # make the first two minutes land  -> 027.title_number2
        ("P03", 24.2, ["/c/attention", "/g/attention/do-not-watch", "/s/027.title_number2"]),
        ("P09", 52.7, ["/c/prep", "/g/prep/planning-the-lesson", "/s/031.title_number2"]),
        ("P10", 39.5, ["/c/attention", "/g/attention/see-or-hear", "/s/019.title_number2"]),
        ("P11", 19.6, ["/m/opening", "/s/027.title_number2"]),
        ("P12", 23.4, ["/m/opening", "/s/027.title_number2"]),
        ("P14", 17.1, ["/c/attention", "/g/attention/do-not-watch", "/s/027.title_number2"]),
        ("P16", 14.8, ["/c/attention", "/g/attention/see-or-hear", "/s/004.title_number2"]),
        ("P17", 28.3, ["/c/attention", "/g/attention/see-or-hear", "/c/attention",
                       "/g/attention/do-not-watch", "/s/027.title_number2"]),
        ("P18", 21.9, ["/m/opening", "/s/027.title_number2"]),
        ("P19", 26.0, ["/c/attention", "/g/attention/do-not-watch", "/s/027.title_number2"]),
        ("P20", 20.4, ["/m/opening", "/s/027.title_number2"]),
    ],
}


# ------------------------------------------------------- validating the walks

def route_kind(route):
    if route == "/":
        return "home"
    seg = route.strip("/").split("/")
    return {"c": "category", "g": "group", "m": "moment", "s": "skill"}.get(seg[0], "?")


def route_exists(route):
    if route == "/":
        return True
    seg = route.strip("/").split("/")
    if seg[0] == "c":
        return len(seg) == 2 and seg[1] in A_CATEGORIES
    if seg[0] == "g":
        return (len(seg) == 3 and seg[1] in A_CATEGORIES and seg[2] in A_GROUPS
                and A_GROUPS[seg[2]][0] == A_CATEGORIES[seg[1]])
    if seg[0] == "m":
        return len(seg) == 2 and seg[1] in A_MOMENTS
    if seg[0] == "s":
        return "/".join(seg[1:]) in A_SKILLS
    return False


def edges_from(route):
    """Every hash a participant can click FROM this page, per app.js's views."""
    out = set()
    if route == "/":
        out |= {"/c/" + s for s in A_CATEGORIES}
        out |= {"/m/" + k for k in A_MOMENTS}
        return out
    seg = route.strip("/").split("/")
    if seg[0] == "c":
        cat = A_CATEGORIES[seg[1]]
        out.add("/")
        out |= {"/g/%s/%s" % (seg[1], g) for g, (c, _n) in A_GROUPS.items() if c == cat}
    elif seg[0] == "g":
        gname = A_GROUPS[seg[2]][1]
        out |= {"/", "/c/" + seg[1]}
        out |= {"/s/" + sid for sid, s in A_SKILLS.items() if s["group"] == gname}
    elif seg[0] == "m":
        out.add("/")
        out |= {"/s/" + sid for sid, s in A_SKILLS.items() if seg[1] in s["moments"]}
    elif seg[0] == "s":
        pass        # arriving at a skill page ends the task (app.js render())
    return out


A_CELLS = []        # (pid, taskId, seconds, path, first, endpoint, hit, gave_up)
for tid in A_TASK_ORDER:
    rows = A_RUNS[tid]
    assert [p for p, _s, _pa in rows] == [p for p, _n, _c, _d, _t in A_PARTICIPANTS], tid
    expect = A_TASKS[tid][1]
    for pid, secs, path in rows:
        assert path, (pid, tid)
        here = "/"
        for step in path:
            assert route_exists(step), ("unknown route", pid, tid, step)
            assert step in edges_from(here), ("illegal walk", pid, tid, here, "->", step)
            here = step
        skills_in_path = [r for r in path if route_kind(r) == "skill"]
        assert len(skills_in_path) <= 1, ("a run ends at the first skill page", pid, tid)
        if skills_in_path:
            assert path[-1] == skills_in_path[0], (pid, tid)
        gave_up = route_kind(path[-1]) != "skill"
        endpoint = None if gave_up else path[-1][len("/s/"):]
        assert secs > 0
        A_CELLS.append({
            "pid": pid, "task": tid, "seconds": secs, "path": path,
            "first": path[0], "endpoint": endpoint,
            "hit": endpoint == expect, "gave_up": gave_up,
        })

assert len(A_CELLS) == 110, len(A_CELLS)
for c in A_CELLS:
    if c["endpoint"]:
        assert c["endpoint"] in A_SKILLS, c
assert set(A_PREDICTED_FIRST_CLICK) == set(A_TASKS)
for r in A_PREDICTED_FIRST_CLICK.values():
    assert route_exists(r), r


# --------------------------------------------------------- shuffled run order
rng = random.Random(SEED)
A_ORDER = {}
for pid, _name, _calling, _day, _time in A_PARTICIPANTS:
    order = A_TASK_ORDER[:]
    rng.shuffle(order)
    A_ORDER[pid] = order
    assert sorted(order) == sorted(A_TASK_ORDER)
# no two participants got the same order, and no task sat in one slot for all
assert len({tuple(v) for v in A_ORDER.values()}) == len(A_PARTICIPANTS)


# ============================================================================
# PART 2 — TEAM A: computed aggregates
# ============================================================================

def label_for(route):
    """Human label for a route, for the printed tables."""
    if route == "/":
        return "Home (gave up there)"
    seg = route.strip("/").split("/")
    if seg[0] == "c":
        return A_CATEGORIES[seg[1]]
    if seg[0] == "g":
        return "%s › %s" % (A_CATEGORIES[seg[1]], A_GROUPS[seg[2]][1])
    if seg[0] == "m":
        return "moment: " + A_MOMENTS[seg[1]]
    if seg[0] == "s":
        sid = "/".join(seg[1:])
        return "%s — %s" % (sid, A_SKILLS[sid]["name"][:52])
    return route


def mode_of(counter):
    """Most common value, with the tie made visible rather than broken quietly."""
    if not counter:
        return None, 0, []
    top = max(counter.values())
    winners = sorted(k for k, v in counter.items() if v == top)
    return winners[0], top, winners


def pct(n, d):
    return 0.0 if not d else round(100.0 * n / d, 1)


by_task = defaultdict(list)
by_pid = defaultdict(list)
for c in A_CELLS:
    by_task[c["task"]].append(c)
    by_pid[c["pid"]].append(c)

head("TEAM A — per-task results table  (n = 11 participants, 10 tasks)")
print("Columns are computed from the 110 recorded runs; nothing is typed in twice.\n")
print("%-5s %-34s %5s %-32s %5s %5s %6s %6s" %
      ("task", "first-click mode", "%", "destination mode", "%", "succ%", "giveup", "mean s"))
print(bar)
A_TASK_STATS = {}
for tid in A_TASK_ORDER:
    cells = by_task[tid]
    n = len(cells)
    fc = Counter(c["first"] for c in cells)
    fc_mode, fc_n, fc_tied = mode_of(fc)
    dest = Counter(c["endpoint"] or "(gave up)" for c in cells)
    d_mode, d_n, d_tied = mode_of(dest)
    hits = sum(1 for c in cells if c["hit"])
    gu = sum(1 for c in cells if c["gave_up"])
    mean = round(sum(c["seconds"] for c in cells) / n, 1)
    dlabel = "(gave up)" if d_mode == "(gave up)" else label_for("/s/" + d_mode)
    if len(d_tied) > 1:
        dlabel = "TIE " + " / ".join("(gave up)" if t == "(gave up)" else t for t in d_tied)
    A_TASK_STATS[tid] = dict(first_mode=fc_mode, first_n=fc_n, first_pct=pct(fc_n, n),
                             dest_mode=d_mode, dest_n=d_n, dest_pct=pct(d_n, n),
                             hits=hits, succ=pct(hits, n), giveups=gu, mean=mean,
                             first_counts=fc, dest_counts=dest,
                             first_tied=fc_tied, dest_tied=d_tied)
    print("%-5s %-34s %5s %-32s %5s %5s %6s %6s" % (
        tid, label_for(fc_mode)[:34], "%d/%d" % (fc_n, n),
        dlabel[:32], "%d/%d" % (d_n, n), "%d/%d" % (hits, n), gu, mean))

A_HITS = sum(1 for c in A_CELLS if c["hit"])
A_GU = sum(1 for c in A_CELLS if c["gave_up"])
print(bar)
print("OVERALL   success %d/%d = %s%%   give-ups %d   mean time %ss   mean clicks %s" % (
    A_HITS, len(A_CELLS), pct(A_HITS, len(A_CELLS)), A_GU,
    round(sum(c["seconds"] for c in A_CELLS) / len(A_CELLS), 1),
    round(sum(len(c["path"]) for c in A_CELLS) / len(A_CELLS), 1)))

head("TEAM A — full first-click distribution per task")
for tid in A_TASK_ORDER:
    st = A_TASK_STATS[tid]
    parts = ", ".join("%s %d (%s%%)" % (label_for(r), n, pct(n, 11))
                      for r, n in sorted(st["first_counts"].items(), key=lambda kv: (-kv[1], kv[0])))
    print("%-4s %s" % (tid, parts))

head("TEAM A — where the misses landed (every non-expected endpoint)")
for tid in A_TASK_ORDER:
    expect = A_TASKS[tid][1]
    misses = [c for c in by_task[tid] if not c["hit"]]
    if not misses:
        print("%-4s no misses" % tid)
        continue
    print("%-4s expected %s (%s › %s)" % (tid, expect, A_SKILLS[expect]["category"],
                                          A_SKILLS[expect]["group"]))
    for c in sorted(misses, key=lambda c: c["pid"]):
        if c["gave_up"]:
            print("       %s  GAVE UP after %d clicks, %ss, last page %s"
                  % (c["pid"], len(c["path"]), c["seconds"], label_for(c["path"][-1])))
        else:
            e = A_SKILLS[c["endpoint"]]
            same = "same group" if e["group"] == A_SKILLS[expect]["group"] else \
                   ("same category" if e["category"] == A_SKILLS[expect]["category"] else "elsewhere")
            print("       %s  -> %s  [%s]  %ss" % (c["pid"], c["endpoint"], same, c["seconds"]))

head("TEAM A — second click, where the first click was the same for most people")
print("(the first click alone hides the T01 finding: nine got to Prep, then split.")
print(" A skill id in this row means the participant went straight from a moment")
print(" page to the leaf — for them the second click WAS the answer.)\n")
for tid in A_TASK_ORDER:
    seconds_clicks = Counter()
    for c in by_task[tid]:
        if len(c["path"]) > 1:
            seconds_clicks[c["path"][1]] += 1
    parts = ", ".join("%s %d" % (label_for(r), n)
                      for r, n in sorted(seconds_clicks.items(), key=lambda kv: (-kv[1], kv[0])))
    print("%-4s %s" % (tid, parts))

head("TEAM A — the prep-group split (T01), stated as its own number")
t1 = by_task["T01"]
prep_first = [c for c in t1 if c["first"] == "/c/prep"]
opened_ready = [c for c in prep_first if c["path"][1] == "/g/prep/getting-yourself-ready"]
opened_plan = [c for c in prep_first if c["path"][1] == "/g/prep/planning-the-lesson"]
print("Participants whose first click was 'Getting ready before Sunday': %d of 11" % len(prep_first))
print("  opened 'Getting yourself ready' first : %d  (%s of the %d)"
      % (len(opened_ready), len(opened_ready), len(prep_first)))
print("  opened 'Planning the lesson' first    : %d  — all %d then backed out and crossed over"
      % (len(opened_plan), len(opened_plan)))
print("  mean seconds, went straight there     : %s"
      % round(sum(c["seconds"] for c in opened_ready) / len(opened_ready), 1))
print("  mean seconds, crossed over            : %s"
      % round(sum(c["seconds"] for c in opened_plan) / len(opened_plan), 1))
assert len(opened_ready) + len(opened_plan) == len(prep_first)

head("TEAM A — backtracks (a click to a page already visited in that task)")
print("%-5s %8s %8s" % ("task", "backtracks", "runs with >=1"))
for tid in A_TASK_ORDER:
    tot = 0
    runs = 0
    for c in by_task[tid]:
        seen = {"/"}
        n = 0
        for step in c["path"]:
            if step in seen:
                n += 1
            seen.add(step)
        tot += n
        runs += 1 if n else 0
    print("%-5s %8d %8d" % (tid, tot, runs))

head("TEAM A — per-participant summary")
print("%-5s %-18s %-28s %6s %7s %7s %6s" %
      ("id", "name", "calling", "succ", "mean s", "moment", "giveup"))
print(bar)
for pid, name, calling, _d, _t in A_PARTICIPANTS:
    cells = by_pid[pid]
    hits = sum(1 for c in cells if c["hit"])
    mom = sum(1 for c in cells if c["first"].startswith("/m/"))
    gu = sum(1 for c in cells if c["gave_up"])
    print("%-5s %-18s %-28s %6s %7s %7s %6s" % (
        pid, name, calling, "%d/10" % hits,
        round(sum(c["seconds"] for c in cells) / len(cells), 1),
        "%d/10" % mom, gu))
print(bar)
mv = [pid for pid, _n, _c, _d, _t in A_PARTICIPANTS
      if all(c["first"].startswith("/m/") for c in by_pid[pid])]
print("Entered by lesson moment on all ten tasks: %s" % (", ".join(mv) or "nobody"))
mom_cells = [c for c in A_CELLS if c["first"].startswith("/m/")]
cat_cells = [c for c in A_CELLS if c["first"].startswith("/c/")]
print("Runs entered by moment  : %d, success %s%%, mean %ss" % (
    len(mom_cells), pct(sum(1 for c in mom_cells if c["hit"]), len(mom_cells)),
    round(sum(c["seconds"] for c in mom_cells) / len(mom_cells), 1)))
print("Runs entered by category: %d, success %s%%, mean %ss" % (
    len(cat_cells), pct(sum(1 for c in cat_cells if c["hit"]), len(cat_cells)),
    round(sum(c["seconds"] for c in cat_cells) / len(cat_cells), 1)))

head("TEAM A — predicted first click vs observed mode")
print("%-5s %-30s %-30s %s" % ("task", "team predicted", "observed mode", "verdict"))
print(bar)
pred_hits = 0
for tid in A_TASK_ORDER:
    st = A_TASK_STATS[tid]
    ok = A_PREDICTED_FIRST_CLICK[tid] == st["first_mode"]
    pred_hits += 1 if ok else 0
    print("%-5s %-30s %-30s %s" % (
        tid, label_for(A_PREDICTED_FIRST_CLICK[tid])[:30],
        "%s (%d/11)" % (label_for(st["first_mode"])[:20], st["first_n"]),
        "hit" if ok else "MISS"))
print(bar)
print("Predicted-first-click hit rate: %d/10 = %s%%" % (pred_hits, pct(pred_hits, 10)))
print("Missed on: %s" % ", ".join(
    t for t in A_TASK_ORDER if A_PREDICTED_FIRST_CLICK[t] != A_TASK_STATS[t]["first_mode"]))

head("TEAM A — shuffled task order per participant (as run)")
for pid, name, _c, day, time in A_PARTICIPANTS:
    print("%-5s %-18s %s %s   %s" % (pid, name, day, time, " ".join(A_ORDER[pid])))
slot = defaultdict(Counter)
for pid, order in A_ORDER.items():
    for i, tid in enumerate(order):
        slot[i][tid] += 1
print("\nNo task ran in the same slot for everyone; worst slot concentration: %d/11"
      % max(max(c.values()) for c in slot.values()))


# ============================================================================
# PART 3 — TEAM A: the raw-log CSV, in the prototype's export schema
# ============================================================================
# Sessions were run on the evenings of 2 and 3 November 2026, Mountain time.
# The prototype stamps runs with new Date().toISOString(), i.e. UTC — so a
# 6:05 p.m. MST start is written 2026-11-03T01:05Z. That offset is real and is
# left in rather than tidied away.

MST_OFFSET = dt.timedelta(hours=7)      # November: UTC-7
BRIEF_SECONDS = 45                      # scenario card + think-aloud between tasks
INTRO_SECONDS = 90                      # consent, instructions, warm-up

RUN_IDS = {}
CSV_ROWS = []
rid_rng = random.Random(SEED + 1)
ALPH = "abcdefghijklmnopqrstuvwxyz0123456789"

for pid, name, _calling, day, time in A_PARTICIPANTS:
    local = dt.datetime.strptime(day + " " + time, "%Y-%m-%d %H:%M")
    started = local + MST_OFFSET
    started += dt.timedelta(seconds=INTRO_SECONDS)
    cells = {c["task"]: c for c in by_pid[pid]}
    total = sum(cells[t]["seconds"] + BRIEF_SECONDS for t in A_ORDER[pid])
    finished = started + dt.timedelta(seconds=total)

    def iso(t, ms):
        return t.strftime("%Y-%m-%dT%H:%M:%S") + ".%03dZ" % ms

    started_s = iso(started, 100 + zlib.crc32(pid.encode()) % 800)
    finished_s = iso(finished, 100 + zlib.crc32((pid + "f").encode()) % 800)
    rid = "run-" + started_s.replace(":", "-").replace(".", "-") + "-" + \
          "".join(rid_rng.choice(ALPH) for _ in range(5))
    RUN_IDS[pid] = rid

    for tid in A_ORDER[pid]:
        c = cells[tid]
        scen, expect = A_TASKS[tid]
        CSV_ROWS.append([
            rid, started_s, finished_s, tid, scen, expect,
            c["endpoint"] or "", "hit" if c["hit"] else "miss",
            c["seconds"], len(c["path"]), " > ".join(c["path"]),
        ])

CSV_HEADER = ["runId", "startedAt", "finishedAt", "taskId", "scenario",
              "expectedSkillId", "endpointSkillId", "asFiled", "seconds",
              "clicks", "path"]
CSV_PATH = os.path.join(HERE, "02-tree-test-raw-team-a.csv")
with open(CSV_PATH, "w", encoding="utf-8", newline="") as fh:
    w = csv.writer(fh, lineterminator="\r\n", quoting=csv.QUOTE_MINIMAL)
    w.writerow(CSV_HEADER)
    w.writerows(CSV_ROWS)

assert len(CSV_ROWS) == 110
assert len({r[0] for r in CSV_ROWS}) == 11
head("TEAM A — raw log written")
print("file   : %s" % os.path.basename(CSV_PATH))
print("schema : %s" % ",".join(CSV_HEADER))
print("rows   : %d data rows (11 runs x 10 tasks) + header, CRLF, minimal quoting" % len(CSV_ROWS))
print("note   : startedAt/finishedAt are UTC (the prototype uses toISOString);")
print("         the sessions were Mountain-time evenings on 2 and 3 Nov 2026,")
print("         so an 18:05 MST start is stamped 2026-11-03T01:06Z.")
print("\nfirst three rows:")
print(",".join(CSV_HEADER))
for r in CSV_ROWS[:3]:
    print(",".join('"%s"' % str(v).replace('"', '""') if re.search(r'[",\n\r]', str(v)) else str(v)
                   for v in r))


# ============================================================================
# PART 4 — TEAM B: the invented data (and the shape of its errors)
# ============================================================================

# Their ten tasks, written the week of the test. flags record the method
# problems the data has to carry; the team never named any of them.
#   echo     — the task quotes one of their own category labels
#   absent   — the keyed answer is a block their wireframe does not contain
#   miskey   — the keyed answer is not actually an answer to the task
B_TASKS = [
    ("B01", "You ask your class a question and nobody says anything. Find something to try.",
     "C21", []),
    ("B02", "A kid in your class never talks and you think he feels like the class would be "
            "fine without him. Find something that would help.", "C09", []),
    ("B03", "Find something in Preparation that you could do this week to get ready to teach.",
     "C17", ["echo"]),
    ("B04", "Your lesson is turning into a school lesson. Find how to bring Jesus into it.",
     "C01", []),
    ("B05", "You want to start your lesson with something that makes them think about their "
            "own life.", "C20", []),
    ("B06", "Find a skill under Questions about asking a question that does not lead them to "
            "the answer you want.", "C16", ["echo"]),
    ("B07", "You want to use a video in your lesson but you are not sure it fits. Find advice "
            "about choosing media and object lessons.", "C18", ["absent"]),
    ("B08", "You noticed something good about a kid in your class this week. Find something to "
            "do with that.", "C10", []),
    ("B09", "Find something under Love that you could do for a student during the week.",
     "C04", ["echo"]),
    ("B10", "A woman in your class says she can never tell whether a feeling is the Spirit or "
            "just her own thoughts. Find something that would help her.", "C15", ["miskey"]),
]
B_TASK_IDS = [t[0] for t in B_TASKS]
B_KEY = {t[0]: t[2] for t in B_TASKS}
B_FLAGS = {t[0]: t[3] for t in B_TASKS}

# Six participants, recorded by first name only. Three of them sorted cards for
# this same team a fortnight earlier (Report B used Margie, Curtis, Kade, Rylee
# and Cami) — they already know the seven category names. The first two
# sessions have no first clicks: nobody was writing them down yet.
B_PARTICIPANTS = [
    ("Margie", True,  False),
    ("Cami",   True,  False),
    ("Kade",   True,  True),
    ("Shauna", False, True),
    ("Braxton", False, True),
    ("Kenzie", False, True),
]

# name -> task -> (first click as written, where they ended, time as written)
# first click is None where the team did not record it; time is None where the
# sheet is blank. There is no give-up column: the protocol had no give-up.
B_CELLS_RAW = {
    "Margie": {
        "B01": (None, "C21", "~35"),
        "B02": (None, "C04", "~50"),
        "B03": (None, "C17", "15"),
        "B04": (None, "C01", "~30"),
        "B05": (None, "C22", "~45"),
        "B06": (None, "C16", "20"),
        "B07": (None, "C13", "about 2 min"),
        "B08": (None, "C06", "~40"),
        "B09": (None, "C04", "15"),
        "B10": (None, "C14", "~60"),
    },
    "Cami": {
        "B01": (None, "C11", "45ish"),
        "B02": (None, "C10", "about a minute"),
        "B03": (None, "C17", "~20"),
        "B04": (None, "C05", "40"),
        "B05": (None, "C22", "50"),
        "B06": (None, "C16", "~15"),
        "B07": (None, "cat-misc", "2 min+"),
        "B08": (None, "C10", "30"),
        "B09": (None, "C04", "20"),
        "B10": (None, "C13", "1 min"),
    },
    "Kade": {
        "B01": ("Teaching Fundamentals", "C21", "20"),
        "B02": ("Love", "C10", "55"),
        "B03": ("Preparation", "C17", "10"),
        "B04": ("Spiritual Teaching", "C15", "35"),
        "B05": ("Misc", "C22", "40"),
        "B06": ("Questions", "C16", "12"),
        "B07": ("Misc", "C02", "90ish"),
        "B08": ("Love", "C04", "35"),
        "B09": ("Love", "C04", "10"),
        "B10": ("Questions", "C14", "55"),
    },
    "Shauna": {
        "B01": ("Questions", "C14", "1 min"),
        "B02": ("Engagement", "C09", "25"),
        "B03": ("Preparation", "C17", "12"),
        "B04": ("Misc", "C02", "1 min"),
        "B05": ("Misc", "C13", "1 min"),
        "B06": ("Questions", "C16", "15"),
        "B07": ("Preparation", "C24", None),
        "B08": ("Engagement", "C09", "45"),
        "B09": ("Love", "C04", "15ish"),
        "B10": ("Spiritual Teaching", "C01", "1 min"),
    },
    "Braxton": {
        "B01": ("Questions", "C12", "40"),
        "B02": ("Questions", "C07", "1 min"),
        "B03": ("Preparation", "C17", "15ish"),
        "B04": ("Spiritual Teaching", "C05", "45ish"),
        "B05": ("Questions", "C20", "30"),
        "B06": ("Questions", "C16", "10"),
        "B07": ("Misc", "cat-misc", "2 min"),
        "B08": ("Preparation", "C24", "50"),
        "B09": ("Love", "C04", "12"),
        "B10": ("Questions", "C14", "70"),
    },
    "Kenzie": {
        "B01": ("Misc", "C22", None),
        "B02": ("Misc", "C13", "30-40"),
        "B03": ("Preparation", "C17", "20"),
        "B04": ("Spiritual Teaching", "C01", "25"),
        "B05": ("Questions", "C14", "35ish"),
        "B06": ("Questions", "C16", "18"),
        "B07": ("Questions", "C20", "1 min"),
        "B08": ("Love", "C04", "30ish"),
        "B09": ("Love", "C04", "14"),
        "B10": ("Misc", "C13", "90ish"),
    },
}

# ------------------------------------------------------------- validating B
B_NAMES = [p[0] for p in B_PARTICIPANTS]
assert set(B_CELLS_RAW) == set(B_NAMES)
for nm, cells in B_CELLS_RAW.items():
    assert list(cells) == B_TASK_IDS, nm
    recorded = dict(zip(B_NAMES, [p[2] for p in B_PARTICIPANTS]))[nm]
    for tid, (fc, end, _t) in cells.items():
        if recorded:
            assert fc in B_CAT_LABEL.values(), (nm, tid, fc)
        else:
            assert fc is None, (nm, tid)
        if end.startswith("C"):
            assert end in B_BLOCKS, ("endpoint not in Team B's wireframe", nm, tid, end)
        else:
            assert end in B_CAT_LABEL or end in B_SECTION_PAGES, (nm, tid, end)
# the keyed answers: nine exist, one does not
for tid, keyed in B_KEY.items():
    if "absent" in B_FLAGS[tid]:
        assert keyed not in B_BLOCKS, tid
    else:
        assert keyed in B_BLOCKS, (tid, keyed)
# a task flagged echo must name one of their own categories in its text
for tid, text, keyed, flags in B_TASKS:
    if "echo" in flags:
        assert any(lbl in text for lbl in B_CAT_LABEL.values()), tid
        assert B_CATEGORY_OF[keyed] in text, (tid, keyed)
# three of the six sorted cards for this team
assert sum(1 for _n, primed, _r in B_PARTICIPANTS if primed) == 3


TIME_NUM = re.compile(r"^~?(\d+)(?:ish)?$")
TIME_MIN = re.compile(r"^(?:about )?(\d+)\s*min$")


def b_seconds(raw):
    """What the team's handwriting can honestly be turned into. None = a hole."""
    if raw is None:
        return None
    m = TIME_NUM.match(raw)
    if m:
        return int(m.group(1))
    m = TIME_MIN.match(raw)
    if m:
        return int(m.group(1)) * 60
    return None


B_CELLS = []
for nm, primed, recorded in B_PARTICIPANTS:
    for tid in B_TASK_IDS:
        fc, end, raw = B_CELLS_RAW[nm][tid]
        B_CELLS.append({
            "name": nm, "primed": primed, "task": tid,
            "first": fc, "end": end, "raw_time": raw, "seconds": b_seconds(raw),
            "hit": end == B_KEY[tid],
        })
assert len(B_CELLS) == 60

b_by_task = defaultdict(list)
b_by_name = defaultdict(list)
for c in B_CELLS:
    b_by_task[c["task"]].append(c)
    b_by_name[c["name"]].append(c)

head("TEAM B — per-task results table  (n = 6 participants, 10 tasks)")
print("Scored against Team B's own answer key. Gaps are printed as gaps, not")
print("filled in: no first clicks for the first two sessions, no give-up column")
print("at all, and times only where the sheet says something a number can be")
print("read out of.\n")
print("%-5s %-22s %5s %-24s %5s %6s %7s %8s %s" %
      ("task", "first-click mode", "n/rec", "destination mode", "n/6", "succ", "give-up",
       "mean s", "flag"))
print(bar)
B_TASK_STATS = {}
for tid in B_TASK_IDS:
    cells = b_by_task[tid]
    rec = [c for c in cells if c["first"]]
    fc = Counter(c["first"] for c in rec)
    fc_mode, fc_n, _ft = mode_of(fc)
    dest = Counter(c["end"] for c in cells)
    d_mode, d_n, d_tied = mode_of(dest)
    hits = sum(1 for c in cells if c["hit"])
    times = [c["seconds"] for c in cells if c["seconds"] is not None]
    mean = round(sum(times) / len(times), 1) if times else None
    flags = ",".join(B_FLAGS[tid]) or "-"
    B_TASK_STATS[tid] = dict(first_mode=fc_mode, first_n=fc_n, recorded=len(rec),
                             dest_mode=d_mode, dest_n=d_n, hits=hits,
                             succ=pct(hits, 6), mean=mean, usable_times=len(times),
                             first_counts=fc, dest_counts=dest)
    print("%-5s %-22s %5s %-24s %5s %6s %7s %8s %s" % (
        tid, (fc_mode or "— not recorded")[:22], "%d/%d" % (fc_n, len(rec)) if rec else "0/0",
        (d_mode if len(d_tied) == 1 else "TIE " + "/".join(d_tied))[:24],
        "%d/6" % d_n, "%d/6" % hits, "n/a",
        ("%s (%d/6)" % (mean, len(times))) if mean is not None else "— (0/6)", flags))

B_HITS = sum(1 for c in B_CELLS if c["hit"])
print(bar)
print("OVERALL   success %d/%d = %s%% against their own key" % (B_HITS, 60, pct(B_HITS, 60)))
print("          first clicks recorded: %d of 60 cells (%s%%)"
      % (sum(1 for c in B_CELLS if c["first"]), pct(sum(1 for c in B_CELLS if c["first"]), 60)))
print("          times a number can be read out of: %d of 60 (%s%%)"
      % (sum(1 for c in B_CELLS if c["seconds"] is not None),
         pct(sum(1 for c in B_CELLS if c["seconds"] is not None), 60)))
print("          give-ups: not measurable — the protocol had no give-up option,")
print("          so a 2-minute wander is recorded exactly like a 12-second hit.")

head("TEAM B — the three task types, separated")
echo = [t for t in B_TASK_IDS if "echo" in B_FLAGS[t]]
plain = [t for t in B_TASK_IDS if not B_FLAGS[t]]
broken = [t for t in B_TASK_IDS if set(B_FLAGS[t]) & {"absent", "miskey"}]
for label, ids in (("tasks that quote a category label", echo),
                   ("ordinary tasks", plain),
                   ("tasks the key itself breaks", broken)):
    cells = [c for c in B_CELLS if c["task"] in ids]
    hits = sum(1 for c in cells if c["hit"])
    print("%-36s %s  success %d/%d = %s%%" % (label, ",".join(ids), hits, len(cells),
                                              pct(hits, len(cells))))
print("\nEvery one of the %d cells on the label-echo tasks succeeded." %
      len([c for c in B_CELLS if c["task"] in echo]))
print("B07's keyed answer is %s. Blocks in Team B's wireframe: %s." % (B_KEY["B07"], len(B_BLOCKS)))
print("%s is not one of them — it was pulled from the deck mid-card-sort and never came back," % B_KEY["B07"])
print("along with %s. Six participants hunted for it; the report says the task was 'hard'."
      % ", ".join(sorted({"C03", "C18", "C19"} - {B_KEY['B07']})))
print("B10's keyed answer is %s (%s), which does not answer the task; all six were" %
      (B_KEY["B10"], B_CATEGORY_OF[B_KEY["B10"]]))
print("marked wrong and the key was never questioned.")

head("TEAM B — first clicks, where they were written down (4 of 6 sessions, 40 cells)")
rec_cells = [c for c in B_CELLS if c["first"]]
allfc = Counter(c["first"] for c in rec_cells)
print("%-24s %6s %8s %10s" % ("first click", "n", "% of 40", "on a miss"))
print(bar)
for lbl, n in sorted(allfc.items(), key=lambda kv: (-kv[1], kv[0])):
    wrong = sum(1 for c in rec_cells if c["first"] == lbl and not c["hit"])
    print("%-24s %6d %8s %10s" % (lbl, n, pct(n, len(rec_cells)), "%d" % wrong))
print(bar)
misses = [c for c in rec_cells if not c["hit"]]
mq = sum(1 for c in misses if c["first"] in ("Misc", "Questions"))
print("Wrong first clicks: %d. On 'Misc' or 'Questions': %d (%s%%)."
      % (len(misses), mq, pct(mq, len(misses))))
print("Blocks Team B filed in Misc: %s"
      % ", ".join(sorted(b for b, cat in B_CATEGORY_OF.items() if cat == "Misc")))

head("TEAM B — per-participant summary")
print("%-9s %-8s %-11s %6s %8s %10s" %
      ("name", "primed", "first clks", "succ", "mean s", "usable times"))
print(bar)
for nm, primed, recorded in B_PARTICIPANTS:
    cells = b_by_name[nm]
    hits = sum(1 for c in cells if c["hit"])
    times = [c["seconds"] for c in cells if c["seconds"] is not None]
    print("%-9s %-8s %-11s %6s %8s %10s" % (
        nm, "yes" if primed else "no", "recorded" if recorded else "— none",
        "%d/10" % hits,
        round(sum(times) / len(times), 1) if times else "—",
        "%d/10" % len(times)))
print(bar)
pr = [c for c in B_CELLS if c["primed"]]
fr = [c for c in B_CELLS if not c["primed"]]
print("Sorted cards for this team : %d cells, success %s%%" %
      (len(pr), pct(sum(1 for c in pr if c["hit"]), len(pr))))
print("Fresh                      : %d cells, success %s%%" %
      (len(fr), pct(sum(1 for c in fr if c["hit"]), len(fr))))
print("Same task order for all six (they had no test mode to shuffle it):")
print("  " + " ".join(B_TASK_IDS))

head("TEAM B — the raw data, as the team typed it up")
print("(Team B has no exported log: their click log resets on every page load,")
print(" so what survives is a moderator's notes file. Paste this verbatim as the")
print(" study page's raw-data appendix for Report B.)\n")
print("    tree test notes.txt  —  typed up sunday night from the papers")
print("    " + "-" * 66)
print("    name\ttask\tfirst click\twhere they ended\ttime\tnotes")
for nm, primed, recorded in B_PARTICIPANTS:
    for tid in B_TASK_IDS:
        fc, end, raw = B_CELLS_RAW[nm][tid]
        note = ""
        if not recorded:
            note = "(forgot to write the first click down)" if tid == "B01" else ""
        if tid == "B07" and end.startswith("cat-"):
            note = "kept going back to Misc, said \"it's not in here\""
        if tid == "B03" and nm == "Kade":
            note = "went straight there"
        if tid == "B10" and end == "C14":
            note = "said this was the closest thing"
        print("    %s\t%s\t%s\t%s\t%s\t%s" % (
            nm, tid, fc if fc else "?", end, raw if raw else "", note))
print("    " + "-" * 66)
print("    (we did not have a give up button so everybody finished all 10)")


# ============================================================================
# PART 5 — the two teams side by side
# ============================================================================

head("BOTH TEAMS — headline numbers")
print("%-34s %-22s %-22s" % ("", "Team A", "Team B"))
print(bar)
print("%-34s %-22s %-22s" % ("participants", "11 (P03,P09–P12,P14,P16–P20)", "6 (first names only)"))
print("%-34s %-22s %-22s" % ("overlap with own card sort", "none", "3 of 6"))
print("%-34s %-22s %-22s" % ("tasks", "10, built into the prototype", "10, written that week"))
print("%-34s %-22s %-22s" % ("task order", "randomised per run", "identical for all six"))
print("%-34s %-22s %-22s" % ("instrument", "prototype test mode", "paper + stopwatch"))
print("%-34s %-22s %-22s" % ("cells", "110", "60"))
print("%-34s %-22s %-22s" % ("success", "%d/110 = %s%%" % (A_HITS, pct(A_HITS, 110)),
                             "%d/60 = %s%% (own key)" % (B_HITS, pct(B_HITS, 60))))
print("%-34s %-22s %-22s" % ("give-ups", "%d (measured)" % A_GU, "not measurable"))
print("%-34s %-22s %-22s" % ("first clicks recorded", "110/110", "40/60"))
print("%-34s %-22s %-22s" % ("times recorded", "110/110, to 0.1s",
                             "%d/60, roughly" % sum(1 for c in B_CELLS if c["seconds"] is not None)))
print("%-34s %-22s %-22s" % ("raw export", "CSV from the artifact", "a typed notes file"))
print(bar)
print("Both teams put the same situation in front of participants — 'is that the")
print("Spirit or just me?' (Team A T09, Team B B10). Team A measured a %s%%" % A_TASK_STATS["T09"]["succ"])
print("success rate and %d give-ups on it and reopened a decision. Team B keyed it" % A_TASK_STATS["T09"]["giveups"])
print("to %s, marked all six wrong, and wrote that the task was confusing." % B_KEY["B10"])

head("SELF-CHECK")
print("Team A paths are legal walks of the parsed tree            : %d/110 checked" % len(A_CELLS))
print("Team A endpoints exist in wireframe-data.js                : %d checked"
      % sum(1 for c in A_CELLS if c["endpoint"]))
print("Team A task ids and expected endpoints come FROM the file  : %s" % ", ".join(A_TASK_ORDER))
print("Team B endpoints exist among the 21 built block pages      : ok")
print("Team B key references C18, asserted absent from the build  : ok")
print("Participants: A uses %d fresh roster ids, B uses 6 first names, 3 of them sorters"
      % len(A_PARTICIPANTS))
sorters = {"P01", "P02", "P04", "P05", "P06", "P07", "P08", "P13", "P15"}
assert not sorters & {p[0] for p in A_PARTICIPANTS}, "tree-test participants must be fresh"
print("No Team A participant sorted cards for Report A            : ok")
print("\nAll asserts passed.")
