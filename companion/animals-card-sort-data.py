#!/usr/bin/env python3
"""
animals-card-sort-data.py — the in-class Utah-animals card sort, as data.

REAL DATA. In September 2026 the CS 356 class ran an open card sort in class
on 28 cards naming animals that live in Utah. Ten groups of two or three
students each produced one sort; six of the finished sorts were photographed
(assets/animals-sort-s*.webp) and every group's labels were copied onto the
whiteboard (assets/animals-whiteboard.webp). This file is the transcription
of those photographs, plus every number that animals-card-sort.html prints.

Edit the data here and re-run; never hand-edit a count in the HTML.

  python3 animals-card-sort-data.py            # prints the analysis
  python3 animals-card-sort-data.py --html DIR # also writes HTML fragments
                                               # (table rows, the raw-data
                                               # appendix, a co-occurrence
                                               # CSV) into DIR, for pasting
                                               # into the page

Two different denominators, on purpose:
  /10  label-level findings (standardized group names, schemes) use all ten
       sorts — the whiteboard has every group's labels;
  /6   card-level findings (strong pairs, splitters) use only the six sorts
       that were photographed — for the other four we know the labels but
       not which card went where.
"""
import itertools
import os
import sys
from collections import Counter, defaultdict

# ---------------------------------------------------------------- the deck
# Numbered as printed on the cards (alphabetical).
CARDS = [
    "American bison", "Bald eagle", "Black bear", "Black-billed magpie",
    "Black-tailed jackrabbit", "Bonneville cutthroat trout", "California gull",
    "Cat", "Chicken", "Cow", "Coyote", "Desert tortoise", "Dog", "Elk",
    "Great Basin rattlesnake", "Great horned owl", "Honeybee", "Horse",
    "Moose", "Mountain lion", "Mule deer", "Pet rabbit", "Porcupine",
    "Pronghorn", "Raccoon", "Red fox", "Striped skunk", "Yellow-bellied marmot",
]
NUM = {c: i + 1 for i, c in enumerate(CARDS)}
assert len(CARDS) == 28

# ------------------------------------------------------ the ten sorts
# Sort ids follow the whiteboard left to right: S1–S8 are the eight columns,
# S9 and S10 the two lists written underneath. `piles` is verbatim label →
# cards, transcribed from the photograph; a None label is an unlabeled
# leftover. Label-only sorts carry `labels` (from the whiteboard) and no
# piles.
SORTS = {
    "S1": {
        "who": "Group 1", "photo": None,
        "labels": ["Insects", "Mammals", "Birds", "Reptiles", "Fishes", "Uncategorized"],
        "scheme": "biology-class taxonomy",
    },
    "S2": {
        "who": "Group 2", "photo": "animals-sort-s2.webp",
        "scheme": "how often you meet it",
        "piles": {
            "Domestic": ["Horse", "Pet rabbit", "Cat", "Chicken", "Cow", "Dog"],
            "Common": ["California gull", "Red fox", "Coyote", "Honeybee",
                       "Black-billed magpie", "Raccoon"],
            "Uncommon": ["Great Basin rattlesnake", "Striped skunk",
                         "Great horned owl", "Porcupine"],
            "Wild – region specific": ["Moose", "Mule deer", "Black bear",
                                       "American bison", "Bonneville cutthroat trout",
                                       "Bald eagle", "Elk", "Mountain lion"],
            "Usually unseen": ["Black-tailed jackrabbit", "Yellow-bellied marmot",
                               "Pronghorn", "Desert tortoise"],
        },
    },
    "S3": {
        "who": "Group 3", "photo": "animals-sort-s3.webp",
        "scheme": "kind of animal, mammals split by size and role",
        "piles": {
            "large mammals": ["Elk", "Pronghorn", "Mule deer", "American bison", "Moose"],
            "predators": ["Coyote", "Black bear", "Mountain lion"],
            "scaly animals": ["Great Basin rattlesnake", "Bonneville cutthroat trout",
                              "Desert tortoise"],
            "small mammals": ["Black-tailed jackrabbit", "Porcupine",
                              "Yellow-bellied marmot", "Striped skunk", "Red fox", "Raccoon"],
            "domesticated animals": ["Honeybee", "Horse", "Cow", "Cat", "Pet rabbit",
                                     "Chicken", "Dog"],
            "birds": ["California gull", "Great horned owl", "Black-billed magpie",
                      "Bald eagle"],
        },
    },
    "S4": {
        "who": "Group 4", "photo": "animals-sort-s4.webp",
        "scheme": "visible features (flight, horns, scales), plus role",
        "piles": {
            "flight": ["California gull", "Great horned owl", "Black-billed magpie",
                       "Bald eagle", "Honeybee"],
            "horns": ["Pronghorn", "Mule deer", "American bison", "Elk", "Moose"],
            "rodents": ["Black-tailed jackrabbit", "Raccoon", "Yellow-bellied marmot",
                        "Striped skunk"],
            "domesticated": ["Horse", "Pet rabbit", "Dog", "Chicken", "Cat", "Cow"],
            "scales": ["Bonneville cutthroat trout", "Great Basin rattlesnake",
                       "Desert tortoise"],
            "medium to large predators": ["Coyote", "Red fox", "Mountain lion", "Black bear"],
            None: ["Porcupine"],
        },
    },
    "S5": {
        "who": "Group 5", "photo": "animals-sort-s5.webp",
        "scheme": "kind of animal, plus role",
        "piles": {
            "Domestic Animals": ["Cow", "Pet rabbit", "Cat", "Chicken", "Horse", "Dog",
                                 "Honeybee"],
            "Reptiles": ["Desert tortoise", "Great Basin rattlesnake"],
            "Antlers/Horns": ["Elk", "Pronghorn", "Mule deer", "American bison", "Moose"],
            "Rodents": ["Porcupine", "Yellow-bellied marmot", "Black-tailed jackrabbit",
                        "Striped skunk", "Raccoon"],
            "Birds": ["Black-billed magpie", "Bald eagle", "Great horned owl",
                      "California gull"],
            "Fish": ["Bonneville cutthroat trout"],
            "Predators": ["Coyote", "Black bear", "Red fox", "Mountain lion"],
        },
    },
    "S6": {
        "who": "Group 6", "photo": "animals-sort-s6.webp",
        "scheme": "kind of animal, mammals split three ways by size",
        "piles": {
            "Domesticated / Pets": ["Pet rabbit", "Cat", "Chicken", "Cow", "Dog", "Horse"],
            "Birds": ["California gull", "Great horned owl", "Bald eagle",
                      "Black-billed magpie"],
            "Desert": ["Desert tortoise", "Great Basin rattlesnake"],
            "large-sized mammals": ["American bison", "Black bear", "Mountain lion"],
            "Insects": ["Honeybee"],
            "small-sized mammals": ["Black-tailed jackrabbit", "Striped skunk",
                                    "Yellow-bellied marmot", "Porcupine"],
            "Deer-like Animals": ["Pronghorn", "Mule deer", "Moose", "Elk"],
            "fish": ["Bonneville cutthroat trout"],
            "medium-sized mammals": ["Coyote", "Red fox", "Raccoon"],
        },
    },
    "S7": {
        "who": "Group 7", "photo": None,
        "labels": ["Predators", "Horned animals", "Rodents", "Avians", "Reptiles",
                   "Domestic animals", "Food producing animals"],
        "scheme": "kind of animal, plus role; pets split from food animals",
    },
    "S8": {
        "who": "Group 8", "photo": "animals-sort-s8.webp",
        "scheme": "kind of animal, mammals split by size and predator/prey",
        "piles": {
            "Domestic Animals": ["Pet rabbit", "Dog", "Cow", "Horse", "Chicken", "Cat"],
            "Birds": ["Great horned owl", "California gull", "Black-billed magpie",
                      "Bald eagle"],
            "Large predators": ["Coyote", "Black bear", "Mountain lion"],
            "Large prey": ["Mule deer", "Moose", "American bison", "Elk", "Pronghorn"],
            "Small animals": ["Striped skunk", "Red fox", "Raccoon", "Porcupine",
                              "Desert tortoise", "Great Basin rattlesnake",
                              "Black-tailed jackrabbit", "Yellow-bellied marmot"],
            "Other": ["Bonneville cutthroat trout", "Honeybee"],
        },
    },
    "S9": {
        "who": "Group 9", "photo": None,
        "labels": ["Animals you can own", "Animals to stay away from",
                   "Animals specific to places", "Destructive animals", "Forest animals"],
        "scheme": "your relationship to the animal",
    },
    "S10": {
        "who": "Group 10", "photo": None,
        "labels": ["Fish", "Desert", "Mountainous", "Household", "Antlers/Horns",
                   "Road kill", "Birds", "Farm"],
        "scheme": "where you meet it, mixed with kind",
    },
}
PHOTOGRAPHED = [s for s in SORTS if SORTS[s].get("piles")]
LABEL_ONLY = [s for s in SORTS if not SORTS[s].get("piles")]
assert PHOTOGRAPHED == ["S2", "S3", "S4", "S5", "S6", "S8"]

# Every photographed sort must place all 28 cards exactly once.
for sid in PHOTOGRAPHED:
    placed = [c for cards in SORTS[sid]["piles"].values() for c in cards]
    assert sorted(placed) == sorted(CARDS), (sid, sorted(set(CARDS) ^ set(placed)))

# ------------------------------------------- standardizing the group names
# Standardized category ← verbatim labels. Piles are standardized by what is
# IN them where a photo exists (S6's "Desert" holds the two reptiles, so it
# is a reptile pile with a habitat word on it), and by the word alone where
# only the whiteboard survives. Labels that are a scheme rather than a
# category (Common / Uncommon, Desert / Mountainous, Road kill) are kept
# under SCHEME_WORDS below.
STD = {
    "Domestic / farm & pets": {
        "S2": ["Domestic"], "S3": ["domesticated animals"], "S4": ["domesticated"],
        "S5": ["Domestic Animals"], "S6": ["Domesticated / Pets"],
        "S7": ["Domestic animals", "Food producing animals"],
        "S8": ["Domestic Animals"], "S9": ["Animals you can own"],
        "S10": ["Household", "Farm"],
    },
    "Birds": {
        "S1": ["Birds"], "S3": ["birds"], "S4": ["flight"], "S5": ["Birds"],
        "S6": ["Birds"], "S7": ["Avians"], "S8": ["Birds"], "S10": ["Birds"],
    },
    "Deer, elk & other antlered or horned animals": {
        "S3": ["large mammals"], "S4": ["horns"], "S5": ["Antlers/Horns"],
        "S6": ["Deer-like Animals"], "S7": ["Horned animals"], "S8": ["Large prey"],
        "S10": ["Antlers/Horns"],
    },
    "Reptiles (and other scaly things)": {
        "S1": ["Reptiles"], "S3": ["scaly animals"], "S4": ["scales"],
        "S5": ["Reptiles"], "S6": ["Desert"], "S7": ["Reptiles"],
    },
    "Predators / animals to stay away from": {
        "S3": ["predators"], "S4": ["medium to large predators"], "S5": ["Predators"],
        "S7": ["Predators"], "S8": ["Large predators"],
        "S9": ["Animals to stay away from"],
    },
    "Small mammals": {
        "S3": ["small mammals"], "S4": ["rodents"], "S5": ["Rodents"],
        "S6": ["small-sized mammals"], "S7": ["Rodents"], "S8": ["Small animals"],
    },
    "Fish": {
        "S1": ["Fishes"], "S5": ["Fish"], "S6": ["fish"], "S10": ["Fish"],
    },
    "Insects": {
        "S1": ["Insects"], "S6": ["Insects"],
    },
    "Mammals, undivided": {"S1": ["Mammals"]},
    "Mammals by size alone": {"S6": ["large-sized mammals", "medium-sized mammals"]},
    "Leftovers": {"S1": ["Uncategorized"], "S4": ["(one card left unlabeled)"], "S8": ["Other"]},
}
# Labels that are really a second organizing principle, not a category of
# animal. Counted separately as scheme evidence.
SCHEME_WORDS = {
    "Where you meet it (habitat / place)": {
        "S2": ["Wild – region specific"], "S6": ["Desert"],
        "S9": ["Animals specific to places", "Forest animals"],
        "S10": ["Desert", "Mountainous", "Household", "Farm"],
    },
    "How often you meet it, or what it does to you": {
        "S2": ["Common", "Uncommon", "Usually unseen"],
        "S9": ["Animals you can own", "Animals to stay away from", "Destructive animals"],
        "S10": ["Road kill"],
    },
    "Size words in labels": {
        "S3": ["large mammals", "small mammals"],
        "S4": ["medium to large predators"],
        "S6": ["large-sized mammals", "medium-sized mammals", "small-sized mammals"],
        "S8": ["Large predators", "Large prey", "Small animals"],
    },
    "Predator / prey words in labels": {
        "S3": ["predators"], "S4": ["medium to large predators"], "S5": ["Predators"],
        "S7": ["Predators"], "S8": ["Large predators", "Large prey"],
    },
    "Visible-feature words in labels": {
        "S3": ["scaly animals"], "S4": ["flight", "horns", "scales"],
        "S5": ["Antlers/Horns"], "S6": ["Deer-like Animals"], "S7": ["Horned animals"],
        "S10": ["Antlers/Horns"],
    },
}

# Verbatim pile label → standardized category, for the photographed sorts.
PILE_STD = {}
for cat, by_sort in STD.items():
    for sid, labels in by_sort.items():
        for lab in labels:
            PILE_STD[(sid, lab)] = cat
# S2's frequency piles are a scheme, not categories: standardize them to
# themselves so card-level tallies can still see where each card went.
for lab in ["Common", "Uncommon", "Usually unseen", "Wild – region specific"]:
    PILE_STD[("S2", lab)] = "(S2: " + lab + ")"
PILE_STD[("S4", None)] = "Leftovers"
PILE_STD[("S6", "large-sized mammals")] = "Mammals by size alone"
PILE_STD[("S6", "medium-sized mammals")] = "Mammals by size alone"

# Every verbatim pile in a photographed sort must be standardized.
for sid in PHOTOGRAPHED:
    for lab in SORTS[sid]["piles"]:
        assert (sid, lab) in PILE_STD, (sid, lab)
# Every label-only whiteboard label must be accounted for somewhere.
for sid in LABEL_ONLY:
    for lab in SORTS[sid]["labels"]:
        found = any(lab in d.get(sid, []) for d in STD.values()) or \
                any(lab in d.get(sid, []) for d in SCHEME_WORDS.values())
        assert found, (sid, lab)

# --------------------------------------------------------------- analysis
def category_counts():
    """(category, n sorts of 10, [(sid, label), …]) — label-level, all ten."""
    rows = []
    for cat, by_sort in STD.items():
        rows.append((cat, len(by_sort), [(sid, lab) for sid in SORTS for lab in by_sort.get(sid, [])]))
    rows.sort(key=lambda r: -r[1])
    return rows


def scheme_counts():
    return [(name, len(by_sort), [(sid, lab) for sid in SORTS for lab in by_sort.get(sid, [])])
            for name, by_sort in SCHEME_WORDS.items()]


def pile_of(sid, card):
    for lab, cards in SORTS[sid]["piles"].items():
        if card in cards:
            return lab
    raise KeyError((sid, card))


def cooccurrence():
    """{frozenset({a, b}): n of 6 photographed sorts where a and b share a pile}."""
    co = Counter()
    for sid in PHOTOGRAPHED:
        for cards in SORTS[sid]["piles"].values():
            for a, b in itertools.combinations(sorted(cards), 2):
                co[frozenset((a, b))] += 1
    return co


def clusters(co, k):
    """Maximal sets of cards that are pairwise together in >= k of 6 sorts."""
    n = len(PHOTOGRAPHED)
    strong = defaultdict(set)
    for pair, c in co.items():
        if c >= k:
            a, b = tuple(pair)
            strong[a].add(b); strong[b].add(a)
    found = []
    # Greedy: grow cliques from each card, keep maximal unique ones.
    for start in CARDS:
        if start not in strong:
            continue
        clique = {start}
        for c in CARDS:
            if c != start and all(c in strong[m] for m in clique):
                clique.add(c)
        if len(clique) >= 2 and not any(clique <= f for f in found):
            found = [f for f in found if not f <= clique] + [clique]
    return sorted(found, key=lambda s: (-len(s), sorted(s)))


def homes(card):
    """Standardized home of `card` in each photographed sort."""
    return [(sid, pile_of(sid, card), PILE_STD[(sid, pile_of(sid, card))]) for sid in PHOTOGRAPHED]


def distinct_homes(card, exclude_s2=False):
    hs = [h[2] for h in homes(card) if not (exclude_s2 and h[0] == "S2")]
    return len(set(hs))


def report():
    n10, n6 = len(SORTS), len(PHOTOGRAPHED)
    print(f"Deck: {len(CARDS)} cards. Sorts: {n10} ({n6} photographed, {n10 - n6} labels only).")
    print(f"Piles per photographed sort: " + ", ".join(f"{s}={len(SORTS[s]['piles'])}" for s in PHOTOGRAPHED))
    print("\n== Standardized group names (of 10) ==")
    for cat, n, labs in category_counts():
        print(f"{n:2}/10  {cat:48} " + "; ".join(f"{lab} ({sid})" for sid, lab in labs))
    print("\n== Scheme words (of 10) ==")
    for name, n, labs in scheme_counts():
        print(f"{n:2}/10  {name:48} " + "; ".join(f"{lab} ({sid})" for sid, lab in labs))

    co = cooccurrence()
    print(f"\n== Strong pairs (of {n6} photographed sorts) ==")
    for k in (6, 5):
        print(f"-- together in {k}/{n6}:")
        for cl in clusters(co, k):
            print("   " + ", ".join(sorted(cl, key=lambda c: NUM[c])))
    print("\n== Pairs at 6/6:", sum(1 for c in co.values() if c == 6), " at 5/6:", sum(1 for c in co.values() if c == 5))

    print("\n== Splitters: distinct standardized homes per card (of 6; then excluding S2's frequency scheme) ==")
    rows = sorted(CARDS, key=lambda c: (-distinct_homes(c), -distinct_homes(c, True), c))
    for c in rows:
        hs = homes(c)
        print(f"{distinct_homes(c)} / {distinct_homes(c, True)}  {c:28} " + " | ".join(f"{sid}:{lab}" for sid, lab, _ in hs))

    print("\n== Systematic splits (the five kind-scheme sorts: S3 S4 S5 S6 S8) ==")
    for c in ["Red fox", "American bison", "Bonneville cutthroat trout", "Honeybee",
              "Coyote", "Raccoon", "Porcupine", "Desert tortoise", "Great Basin rattlesnake"]:
        tally = Counter(std for sid, lab, std in homes(c) if sid != "S2")
        print(f"{c:28} " + "; ".join(f"{k} ×{v}" for k, v in tally.most_common()))


# ------------------------------------------------------------ html output
def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace("“", "&ldquo;").replace("”", "&rdquo;"))


def html_fragments(outdir):
    os.makedirs(outdir, exist_ok=True)
    n6 = len(PHOTOGRAPHED)

    # 1. standardization table rows
    with open(os.path.join(outdir, "std-rows.html"), "w") as f:
        for cat, n, labs in category_counts():
            f.write(f'<tr><td class="std__cat">{esc(cat)}</td><td class="std__n">{n}/10</td>'
                    f'<td class="std__labels">' + "; ".join(f"&ldquo;{esc(lab)}&rdquo; ({sid})" for sid, lab in labs) + "</td></tr>\n")
    with open(os.path.join(outdir, "scheme-rows.html"), "w") as f:
        for name, n, labs in scheme_counts():
            f.write(f'<tr><td class="std__cat">{esc(name)}</td><td class="std__n">{n}/10</td>'
                    f'<td class="std__labels">' + "; ".join(f"&ldquo;{esc(lab)}&rdquo; ({sid})" for sid, lab in labs) + "</td></tr>\n")

    # 2. appendix: every photographed sort as piles, verbatim labels
    with open(os.path.join(outdir, "appendix-piles.html"), "w") as f:
        for sid in PHOTOGRAPHED:
            s = SORTS[sid]
            f.write(f'<div class="sort-photo" id="raw-{sid.lower()}">\n'
                    f'  <p class="sort-photo__head"><span class="sort-photo__id">{sid}</span> '
                    f'<span class="sort-photo__who">{esc(s["who"])}</span> '
                    f'<span class="sort-photo__scheme">{esc(s["scheme"])}</span></p>\n'
                    f'  <div class="sort-photo__piles">\n')
            for lab, cards in s["piles"].items():
                title = f"&ldquo;{esc(lab)}&rdquo;" if lab else "<em>(no label)</em>"
                f.write(f'    <div class="pile"><p class="pile__label">{title}</p><ul class="pile__cards">\n')
                for c in cards:
                    f.write(f'      <li class="pile__card"><span class="pile__cardnum">{NUM[c]:02}</span> {esc(c)}</li>\n')
                f.write('    </ul></div>\n')
            f.write('  </div>\n</div>\n')
        for sid in LABEL_ONLY:
            s = SORTS[sid]
            f.write(f'<div class="sort-photo sort-photo--labels" id="raw-{sid.lower()}">\n'
                    f'  <p class="sort-photo__head"><span class="sort-photo__id">{sid}</span> '
                    f'<span class="sort-photo__who">{esc(s["who"])}</span> '
                    f'<span class="sort-photo__scheme">{esc(s["scheme"])} &middot; labels only, from the whiteboard</span></p>\n'
                    f'  <p class="labels-only">' + " &middot; ".join(f"&ldquo;{esc(l)}&rdquo;" for l in s["labels"]) + '</p>\n</div>\n')

    # 3. splitter rows: each card's home in each photographed sort
    with open(os.path.join(outdir, "homes-rows.html"), "w") as f:
        for c in sorted(CARDS, key=lambda c: (-distinct_homes(c, True), -distinct_homes(c), c)):
            cells = "".join(f'<td>{esc(lab) if lab else "<em>none</em>"}</td>' for sid, lab, _ in homes(c))
            f.write(f'<tr><td>{esc(c)}</td>{cells}<td class="std__n">{distinct_homes(c, True)}</td></tr>\n')

    # 4. co-occurrence matrix as CSV (the raw-data appendix's checkable form)
    co = cooccurrence()
    with open(os.path.join(outdir, "cooccurrence.csv"), "w") as f:
        f.write("card," + ",".join(CARDS) + "\n")
        for a in CARDS:
            f.write(a + "," + ",".join("" if a == b else str(co[frozenset((a, b))]) for b in CARDS) + "\n")
    print(f"\nFragments written to {outdir}/")


if __name__ == "__main__":
    report()
    if "--html" in sys.argv:
        i = sys.argv.index("--html")
        html_fragments(sys.argv[i + 1] if len(sys.argv) > i + 1 else "animals-fragments")
