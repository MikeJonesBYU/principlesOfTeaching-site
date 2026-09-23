# -*- coding: utf-8 -*-
"""Invented card-sort dataset for the CS 356 companion's NORTHERN FINLAND
version: the same open card sort, the same 24-card deck, re-run (in fiction)
with invented members of the real Jyväskylä Finland Stake.

Stats are COMPUTED from the pile data so the analysis prose can never drift
from the appendix. The deck is not retyped here: CARDS is read straight out of
the Timpanogos study's own data file (../../studies/01-card-sort-data.py), so
"the same deck" is checkable, card for card. The Timpanogos SORTS are read
from the same file for the two-stake comparison at the end.

Every pile label below is the English form of what the participant wrote.
Five sorts used the Finnish deck and their labels were translated by the team
(Report A, element 1); three sorts used the English deck and their labels are
verbatim. Everything here is invented; nothing was measured.

Run:  python3 01-card-sort-data.py [fragments.json]
With an output path, also writes the page's HTML fragments to that file.
"""
import ast, json, pathlib, sys
from itertools import combinations
from collections import defaultdict

HERE = pathlib.Path(__file__).resolve().parent
UTAH_FILE = HERE.parent.parent / "studies" / "01-card-sort-data.py"


def _read_assignments(path, names):
    """Pull literal assignments (CARDS, SORTS) out of the Timpanogos data file
    without running it — that file writes a fragments file as a side effect."""
    tree = ast.parse(path.read_text(encoding="utf-8"))
    found = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1:
            t = node.targets[0]
            if isinstance(t, ast.Name) and t.id in names:
                found[t.id] = ast.literal_eval(node.value)
    missing = set(names) - set(found)
    assert not missing, missing
    return found


_utah = _read_assignments(UTAH_FILE, {"CARDS", "SORTS", "STD"})
CARDS = _utah["CARDS"]          # C-number -> (skill id, section, verbatim, handle)
UTAH_SORTS = _utah["SORTS"]
UTAH_STD = _utah["STD"]         # the Timpanogos report's own standardization
assert sorted(CARDS) == list(range(1, 25))

# sorts: (sort id, participant(s), scheme note, deck language, [(pile label, [cards])])
SORTS = [
 ("S1", "F01 Aino Karjalainen", "a trained teacher’s categories", "FI", [
   ("Wait time and listening",       [7, 11, 12, 14, 21]),
   ("Inclusion",                     [6, 9, 23]),
   ("Cooperation with the home",     [10, 24]),
   ("Christ as the content",         [1, 2, 3, 5]),
   ("Planning",                      [16, 17, 18, 22]),
   ("Speaking of one’s own faith",   [4, 15, 19]),
   ("Devotional stillness",          [8, 13, 20]),
 ]),
 ("S2", "F02 Jukka Heikkinen", "situations in a quiet adult class", "FI", [
   ("Reading the silence",           [7, 11, 12, 14, 21]),
   ("Good questions",                [3, 16, 19]),
   ("The Savior",                    [1, 2, 5]),
   ("What we don’t easily say aloud", [4, 15, 20, 23]),
   ("Before Sunday",                 [8, 17, 18, 22]),
   ("Knowing the people",            [6, 9, 24]),
   ("Not in our class",              [10, 13]),
 ]),
 ("S3", "F03 Maricel Virtanen", "situations, and the children’s ages", "EN", [
   ("Getting them to open up",       [11, 12, 14, 21]),
   ("For the little ones",           [2, 13, 20]),
   ("For the big ones",              [16, 19, 23]),
   ("Loving them",                   [6, 7, 8, 9, 10]),
   ("About Jesus",                   [1, 3, 4, 5, 15]),
   ("My preparation",                [17, 18, 22, 24]),
 ]),
 ("S4", "F04 Eero Laitinen", "his missionary training", "FI", [
   ("Teaching by the Spirit",        [8, 13, 14, 15]),
   ("Asking inspired questions",     [3, 11, 12, 16, 21]),
   ("Invitations and following up",  [5, 22, 23, 24]),
   ("Love and trust",                [4, 6, 7, 9, 10]),
   ("The Savior",                    [1, 2]),
   ("Study",                         [17, 18, 19, 20]),
 ]),
 ("S5", "F05 Liisa Niemi", "where the class happens", "FI", [
   ("At home, with my own children", [10, 17, 20, 24]),
   ("When we’re all in the chapel",  [2, 6, 9, 13, 23]),
   ("On the video link",             [11, 12, 14, 16, 21]),
   ("Saturday evening",              [8, 18, 22]),
   ("Everywhere",                    [1, 3, 4, 5, 7, 15, 19]),
 ]),
 ("S6", "F06 Oksana Kovalenko", "the parts of a lesson", "EN", [
   ("Before the lesson",             [8, 16, 17, 18]),
   ("Beginning of the lesson",       [6, 13, 20, 22]),
   ("New material",                  [2, 3, 4, 15, 19]),
   ("Checking understanding",        [7, 11, 12, 14, 21, 23]),
   ("End of the lesson — applying it", [1, 5]),
   ("Outside the lesson",            [9, 10, 24]),
 ]),
 ("S7", "F07 + F08 Tuula & Pekka Hämäläinen (pair)", "stillness, and what is hard to say", "FI", [
   ("Stillness",                     [8, 13, 14, 20]),
   ("The Savior",                    [1, 2, 3, 5]),
   ("What is hard to say out loud",  [4, 15, 23]),
   ("The people in the branch",      [6, 7, 9, 10]),
   ("Asking and waiting",            [11, 12, 16, 21]),
   ("Preparing",                     [17, 18, 19, 22, 24]),
 ]),
 ("S8", "F09 Samuel Owusu", "situations in an adult class", "EN", [
   ("Getting discussion going",      [11, 12, 14, 16, 21, 23]),
   ("Knowing your brothers",         [6, 7, 9]),
   ("For the Primary teachers",      [10]),
   ("Spirit and testimony",          [4, 8, 13, 15]),
   ("Centering on Christ",           [1, 2, 3, 5]),
   ("Preparing well",                [17, 18, 19, 22]),
   ("Making it apply",               [20, 24]),
 ]),
]

# What each sorter teaches — for the one analysis that turns on it (C10).
AUDIENCE = {"S1": "adults", "S2": "adults", "S3": "children", "S4": "youth",
            "S5": "children", "S6": "adults", "S7": "adults", "S8": "adults"}
BORN = {"S1": "Finland", "S2": "Finland", "S3": "Philippines", "S4": "Finland",
        "S5": "Finland", "S6": "Ukraine", "S7": "Finland", "S8": "Ghana"}

# ---------------------------------------------------------------- validation
for sid, who, scheme, deck, piles in SORTS:
    seen = [c for _, cards in piles for c in cards]
    assert sorted(seen) == list(range(1, 25)), (sid, sorted(seen))
print("all 8 sorts valid: 24 cards each, no dupes\n")


def cooccur(sorts, unpack):
    pair = defaultdict(int)
    for s in sorts:
        for _, cards in unpack(s):
            for a, b in combinations(sorted(cards), 2):
                pair[(a, b)] += 1
    return pair


fi_piles = lambda s: s[4]
ut_piles = lambda s: s[3]
PAIR = cooccur(SORTS, fi_piles)
UPAIR = cooccur(UTAH_SORTS, ut_piles)


def together(pair, *cards):
    return pair[tuple(sorted(cards))]


def all_together(sorts, unpack, cards):
    n = 0
    for s in sorts:
        if any(set(cards) <= set(p) for _, p in unpack(s)):
            n += 1
    return n


print("STRONG PAIRS (together in >=6 of 8 sorts):")
for (a, b), n in sorted(PAIR.items(), key=lambda kv: -kv[1]):
    if n >= 6:
        print(f"  C{a:02d}+C{b:02d}  {n}/8   {CARDS[a][3]}  ||  {CARDS[b][3]}")

print("\nKEY PAIRS AND CLUSTERS (Finland / Timpanogos):")
KEY = [(1, 5), (1, 15), (4, 15), (8, 13), (8, 10), (13, 20), (6, 9), (17, 18),
       (11, 12), (11, 21), (12, 21), (11, 14), (12, 14), (14, 21)]
for a, b in KEY:
    print(f"  C{a:02d}+C{b:02d}  FI {together(PAIR, a, b)}/8   UT {together(UPAIR, a, b)}/8")
tri = (11, 12, 21)
quad = (11, 12, 14, 21)
print(f"  C11+C12+C21 in one pile      FI {all_together(SORTS, fi_piles, tri)}/8   "
      f"UT {all_together(UTAH_SORTS, ut_piles, tri)}/8")
print(f"  C11+C12+C14+C21 in one pile  FI {all_together(SORTS, fi_piles, quad)}/8   "
      f"UT {all_together(UTAH_SORTS, ut_piles, quad)}/8")

# Where did C14 go when it left the asking cluster?
print("\nC14 WHEN IT LEFT C11/C12/C21:")
for sid, who, scheme, deck, piles in SORTS:
    for lbl, cards in piles:
        if 14 in cards and not set(tri) <= set(cards):
            print(f"  {sid} {who}: “{lbl}” {cards}")

# ---------------------------------------------------------------- STANDARDIZE
# pile label -> standardized bucket. Two whole sorts organized by a scheme
# rather than by content: Liisa's by place (SETTING:*) and Oksana's by the
# parts of a lesson (MOMENT:*). Those feed the facet findings, not the
# category list — the same rule the Timpanogos study applied to Jenae's sort.
STD = {
 # asking, listening, waiting (the discussion cluster)
 "Wait time and listening": "ASK", "Reading the silence": "ASK",
 "Getting them to open up": "ASK", "Asking inspired questions": "ASK",
 "Asking and waiting": "ASK", "Getting discussion going": "ASK",
 # the Savior
 "Christ as the content": "CHRIST", "The Savior": "CHRIST", "About Jesus": "CHRIST",
 "Centering on Christ": "CHRIST",
 # the people
 "Inclusion": "PEOPLE", "Knowing the people": "PEOPLE", "Loving them": "PEOPLE",
 "Love and trust": "PEOPLE", "The people in the branch": "PEOPLE",
 "Knowing your brothers": "PEOPLE",
 # before Sunday
 "Planning": "PREP", "Before Sunday": "PREP", "My preparation": "PREP",
 "Study": "PREP", "Saturday evening": "PREP", "Before the lesson": "PREP",
 "Preparing": "PREP", "Preparing well": "PREP",
 # stillness / the Spirit
 "Devotional stillness": "STILL", "Teaching by the Spirit": "STILL",
 "Stillness": "STILL", "Spirit and testimony": "STILL",
 # hard to say out loud
 "Speaking of one’s own faith": "ALOUD", "What we don’t easily say aloud": "ALOUD",
 "What is hard to say out loud": "ALOUD",
 # carrying it past Sunday
 "Cooperation with the home": "AFTER", "Making it apply": "AFTER",
 # one-offs
 "Invitations and following up": "INVITE", "Good questions": "QUESTIONS",
 # who is in the room / where it happens (the setting facet)
 "For the little ones": "SETTING:younger children",
 "For the big ones": "SETTING:older children",
 "For the Primary teachers": "SETTING:children’s classes only",
 "Not in our class": "SETTING:not in our class",
 "At home, with my own children": "SETTING:at home",
 "When we’re all in the chapel": "SETTING:in the chapel",
 "On the video link": "SETTING:on the video link",
 "Everywhere": "SETTING:anywhere",
 # the parts of a lesson (the moment facet)
 "Beginning of the lesson": "MOMENT:opening", "New material": "MOMENT:during",
 "Checking understanding": "MOMENT:during",
 "End of the lesson — applying it": "MOMENT:closing",
 "Outside the lesson": "MOMENT:after",
}
BUCKET_NAMES = {
 "ASK": "Asking and waiting (the discussion cluster)",
 "CHRIST": "The Savior", "PEOPLE": "Knowing the people",
 "PREP": "Before Sunday", "STILL": "Stillness and the Spirit",
 "ALOUD": "Saying it out loud", "AFTER": "Carrying it past Sunday",
 "INVITE": "Invitations and follow-up (missionary term)",
 "QUESTIONS": "Crafting good questions",
}
for sid, who, scheme, deck, piles in SORTS:
    for lbl, _ in piles:
        assert lbl in STD, lbl


def root(b):
    return b.split(":")[0]


appear = defaultdict(set)
for sid, who, scheme, deck, piles in SORTS:
    for lbl, _ in piles:
        appear[root(STD[lbl])].add(sid)
print("\nBUCKET APPEARANCE (of 8 sorts):")
for b, s in sorted(appear.items(), key=lambda kv: -len(kv[1])):
    print(f"  {b:9s} {len(s)}/8  {sorted(s)}")

# The discussion cluster's labels, by who wrote them.
print("\nLABEL ON THE PILE HOLDING C11 (the asking cluster), by sorter:")
for sid, who, scheme, deck, piles in SORTS:
    for lbl, cards in piles:
        if 11 in cards:
            print(f"  {sid} deck={deck} born={BORN[sid]:11s} {STD[lbl]:22s} “{lbl}”")

# Splitters: distinct standardized homes per card (sub-values count).
print("\nDISTINCT STANDARDIZED HOMES PER CARD (all 8 sorts):")
homes = defaultdict(list)
for sid, who, scheme, deck, piles in SORTS:
    for lbl, cards in piles:
        for c in cards:
            homes[c].append(STD[lbl])
for c, hs in sorted(homes.items(), key=lambda kv: -len(set(kv[1]))):
    n = len(set(hs))
    flag = " <-- SPLITTER" if n >= 6 else ""
    print(f"  C{c:02d} {n} homes{flag}   [{CARDS[c][3]}]")

# C10 by what the sorter teaches.
print("\nC10 (positive message to a parent), by what each sorter teaches:")
for sid, who, scheme, deck, piles in SORTS:
    for lbl, cards in piles:
        if 10 in cards:
            print(f"  {sid} teaches {AUDIENCE[sid]:8s} -> {STD[lbl]:32s} “{lbl}”")

# Sorts with at least one pile built on who is in the room or where.
setting_sorts = sorted({sid for sid, _, _, _, piles in SORTS
                        for lbl, _ in piles if STD[lbl].startswith("SETTING")})
print(f"\nSORTS WITH A SETTING PILE: {len(setting_sorts)}/8 {setting_sorts}")

# ---------------------------------------------------------- the two stakes
# Bucket counts use each study's OWN standardization map: the Timpanogos
# report's STD (read from its data file above) and this study's STD.


def sorts_in_bucket(sorts, unpack, std, test):
    return sum(1 for s in sorts if any(test(std[l]) for l, _ in unpack(s)))


is_spirit_ut = lambda b: b == "SPIRIT"
is_spirit_fi = lambda b: b == "STILL"
is_attn = lambda b: b == "ATTN"
is_setting = lambda b: b.startswith("SETTING")
compare = [
    ("C01 + C05 in the same pile (the Savior pair)",
     together(UPAIR, 1, 5), together(PAIR, 1, 5), "held"),
    ("C11 + C12 + C21 in one pile (the asking cluster)",
     all_together(UTAH_SORTS, ut_piles, tri), all_together(SORTS, fi_piles, tri), "held"),
    ("C17 + C18 in the same pile (preparation)",
     together(UPAIR, 17, 18), together(PAIR, 17, 18), "held"),
    ("C13 + C20 in the same pile (sacred music / ponder)",
     together(UPAIR, 13, 20), together(PAIR, 13, 20), "held, new meaning"),
    ("C15, testify, filed with C01 (the Savior)",
     together(UPAIR, 1, 15), together(PAIR, 1, 15), "moved"),
    ("C04 + C15 in the same pile",
     together(UPAIR, 4, 15), together(PAIR, 4, 15), "moved"),
    ("C08 + C10 in the same pile (pray for them / message a parent)",
     together(UPAIR, 8, 10), together(PAIR, 8, 10), "moved"),
    ("C06 + C09 in the same pile (their interests / needed)",
     together(UPAIR, 6, 9), together(PAIR, 6, 9), "moved"),
    ("C08 + C13 in the same pile (pray / sacred music)",
     together(UPAIR, 8, 13), together(PAIR, 8, 13), "moved"),
    ("Sorts with a Spirit or stillness pile",
     sorts_in_bucket(UTAH_SORTS, ut_piles, UTAH_STD, is_spirit_ut),
     sorts_in_bucket(SORTS, fi_piles, STD, is_spirit_fi), "moved"),
    ("Sorts with a keeping-their-attention pile",
     sorts_in_bucket(UTAH_SORTS, ut_piles, UTAH_STD, is_attn),
     sorts_in_bucket(SORTS, fi_piles, STD, is_attn), "moved"),
    ("Sorts with a pile built on who is in the room, or where",
     sorts_in_bucket(UTAH_SORTS, ut_piles, UTAH_STD, is_setting),
     sorts_in_bucket(SORTS, fi_piles, STD, is_setting), "moved"),
]
assert compare[-1][2] == len(setting_sorts)
print("\nTHE TWO STAKES (Timpanogos Shadows Ward -> Jyväskylä Finland Stake):")
for label, ut, fi, kind in compare:
    print(f"  [{kind:17s}] UT {ut}/8 -> FI {fi}/8   {label}")

# ------------------------------------------------------------ HTML FRAGMENTS
import html as H


def esc(s):
    return H.escape(s, quote=False)


frags = {}
DECK_NAME = {"FI": "Finnish deck", "EN": "English deck"}

figs = []
for sid, who, scheme, deck, piles in SORTS:
    cols = []
    for lbl, cards in piles:
        chips = "\n".join(
            f'            <li class="pile__card"><span class="pile__cardnum">C{c:02d}</span> {esc(CARDS[c][3])}</li>'
            for c in cards)
        cols.append(
            '          <div class="pile">\n'
            f'            <p class="pile__label">&ldquo;{esc(lbl)}&rdquo;</p>\n'
            f'            <ul class="pile__cards">\n{chips}\n            </ul>\n'
            '          </div>')
    figs.append(
        f'        <figure class="sort-photo" id="sort-{sid.lower()}">\n'
        '          <figcaption class="sort-photo__head">\n'
        f'            <span class="sort-photo__id">{sid}</span>\n'
        f'            <span class="sort-photo__who">{esc(who)}</span>\n'
        f'            <span class="sort-photo__scheme">sorted by {esc(scheme)} &middot; {DECK_NAME[deck]}</span>\n'
        '            <span class="fiction-badge">FICTITIOUS DATA</span>\n'
        '          </figcaption>\n'
        '          <div class="sort-photo__piles">\n' + "\n".join(cols) + '\n          </div>\n'
        '        </figure>')
frags["SORT_FIGURES"] = figs

rows = []
for c in range(1, 25):
    sid_, sec, name, short = CARDS[c]
    rows.append(f'            <tr><td class="deck__num">C{c:02d}</td>'
                f'<td class="deck__text">{esc(name)}</td>'
                f'<td class="deck__sec">{esc(sec)}</td>'
                f'<td class="deck__id"><code>{sid_}</code></td></tr>')
frags["DECK_ROWS"] = "\n".join(rows)

order = ["PREP", "ASK", "CHRIST", "PEOPLE", "STILL", "ALOUD", "AFTER", "INVITE", "QUESTIONS"]
by_bucket = defaultdict(list)
scheme_rows = defaultdict(list)
for sid, who, scheme, deck, piles in SORTS:
    for lbl, cards in piles:
        b = STD[lbl]
        if ":" in b:
            scheme_rows[root(b)].append((lbl, sid, b.split(":", 1)[1]))
        else:
            by_bucket[b].append((lbl, sid))
srows = []
for b in order:
    entries = by_bucket[b]
    lbls = "; ".join(f"&ldquo;{esc(l)}&rdquo; ({s})" for l, s in entries)
    n = len({s for _, s in entries})
    srows.append(f'            <tr><td class="std__cat">{esc(BUCKET_NAMES[b])}</td>'
                 f'<td class="std__n">{n}/8</td><td class="std__labels">{lbls}</td></tr>')
for key, name in (("SETTING", "Who is in the room, or where (the setting facet)"),
                  ("MOMENT", "Parts of a lesson (opening / during / closing / after)")):
    ents = scheme_rows[key]
    lbls = "; ".join(f"&ldquo;{esc(l)}&rdquo; ({s}: {esc(v)})" for l, s, v in ents)
    n = len({s for _, s, _ in ents})
    srows.append(f'            <tr><td class="std__cat">{esc(name)}</td>'
                 f'<td class="std__n">{n}/8</td><td class="std__labels">{lbls}</td></tr>')
frags["STD_ROWS"] = "\n".join(srows)

crow = []
for label, ut, fi, kind in compare:
    crow.append(f'            <tr><td>{esc(label)}</td><td class="std__n">{ut}/8</td>'
                f'<td class="std__n">{fi}/8</td><td>{kind}</td></tr>')
frags["COMPARE_ROWS"] = "\n".join(crow)

if len(sys.argv) > 1:
    out = pathlib.Path(sys.argv[1])
    out.write_text(json.dumps(frags, ensure_ascii=False), encoding="utf-8")
    print("\nfragments written:", out, {k: len(v) for k, v in frags.items()})
