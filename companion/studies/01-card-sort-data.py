# -*- coding: utf-8 -*-
"""Invented card-sort dataset for the CS 356 companion. Stats are COMPUTED from
the pile data so the analysis prose can never drift from the appendix."""
from itertools import combinations
from collections import defaultdict

# C-number -> (skill id, section, verbatim name, short display handle)
CARDS = {
 1:("004.title_number1","Focus on Jesus Christ","Help students connect what they are learning with how Christ exemplifies the principle.","Connect learning to Christ’s example"),
 2:("004.title_number2","Focus on Jesus Christ","Use pictures and videos of Jesus Christ to illustrate a gospel principle.","Pictures & videos of Christ"),
 3:("006.title_number1","Focus on Jesus Christ","Ask questions that help students learn about Jesus Christ through symbols in the scriptures.","Symbols of Christ in scripture"),
 4:("008.title_number1","Focus on Jesus Christ","Statements that help students know and feel the love of Heavenly Father and Jesus Christ.","Statements: feel God’s love"),
 5:("009.title_number2","Focus on Jesus Christ","Invite students to look for ways to follow the example of Jesus Christ in their personal lives.","Invite: follow Christ personally"),
 6:("012.intro2","Love Those You Teach","Observe and ask about students’ interests.","Ask about their interests"),
 7:("012.title_number3","Love Those You Teach","Seek to clarify and understand the real intent of students’ questions, feelings, and beliefs.","Understand the real question"),
 8:("013.intro2","Love Those You Teach","Pray and ask how you can help your students and follow the promptings from the Holy Ghost.","Pray for students by name"),
 9:("014.title_number3","Love Those You Teach","Communicate that students are not only welcome but needed.","Students are needed, not just welcome"),
 10:("015.title_number1","Love Those You Teach","Send a message to a student’s parent about something positive you have noticed about their child.","Positive message to a parent"),
 11:("018.title_number1","Teach By the Spirit","Ask a question to assess learning before moving on in the lesson.","Check learning before moving on"),
 12:("018.title_number2","Teach By the Spirit","Listen to and observe students to ask follow-up questions.","Listen, then ask follow-ups"),
 13:("019.title_number2","Teach By the Spirit","Use sacred music. Invite students to identify lines and phrases in sacred music that connect with the truths they are learning.","Use sacred music"),
 14:("020.intro2","Teach By the Spirit","Before responding to a student’s question or comment, pause and think, “What can I ask them?” or “What can I invite them to do?”","Pause: “what can I ask them?”"),
 15:("021.title_number2","Teach By the Spirit","Testify more frequently and more powerfully of Jesus Christ.","Testify more often of Christ"),
 16:("023.title_number1","Teach the Doctrine","Create open-ended search questions that help learners discover gospel doctrine and principles for themselves and do not lead students to a specific response.","Open-ended search questions"),
 17:("023.title_number2","Teach the Doctrine","Search the scriptures and words of the prophets for deeper understanding.","Search scriptures for depth"),
 18:("025.title_number3","Teach the Doctrine","Consider assessment questions to carefully choose media, personal stories, and object lessons.","Choose media & stories carefully"),
 19:("026.title_number3","Teach the Doctrine","Respond to questions in a way that avoids speculation and nondoctrinal personal ideas.","Answer without speculating"),
 20:("027.title_number2","Teach the Doctrine","Start a learning activity by inviting students to ponder a personal circumstance.","Open with a personal circumstance"),
 21:("029.title_number1","Invite Diligent Learning","Resist the tendency to respond to every comment and question and invite the class to respond.","Resist answering everything yourself"),
 22:("031.title_number2","Invite Diligent Learning","Create a meaningful invitation connected to the lesson outcome to be used at the beginning of each lesson.","Opening invitation tied to outcome"),
 23:("032.title_number3","Invite Diligent Learning","Prepare invitations for students to share with each other what they are learning.","Students share with each other"),
 24:("033.title_number1","Invite Diligent Learning","Plan to follow up on invitations given in a previous class and invite learners to share their experiences living what they learned.","Follow up on past invitations"),
}

# sorts: (sort#, participant ids+names, scheme note, [(verbatim pile label, [cards])])
SORTS = [
 ("S1","P01 Margie Ostler","situations (Primary)",[
   ("Getting them to talk",[9,11,12,14,16,19,21,23]),
   ("Keeping their attention",[2,13,18,20]),
   ("Loving the kids",[4,6,7,8,10]),
   ("Teaching about Jesus",[1,3,5,15]),
   ("My homework",[17,22,24]),
 ]),
 ("S2","P02 Trent Larkin","tasks/problems (adult class)",[
   ("Running a discussion",[11,12,14,16,21]),
   ("Handling questions",[7,19]),
   ("Preparation",[8,17,18,22]),
   ("Making it personal",[1,4,5,20]),
   ("Class culture",[6,9,23]),
   ("Follow-through",[10,24]),
   ("Christ-focused content",[2,3,13,15]),
 ]),
 ("S3","P04 Whitney Kartchner","situations (YW)",[
   ("Getting the girls talking",[9,11,14,16,21,23]),
   ("When I don’t know what to say",[7,12,19]),
   ("Knowing them",[6,8,10]),
   ("About the Savior",[1,2,3,4,5,15]),
   ("Openers",[13,20,22]),
   ("Prep I should do",[17,18,24]),
 ]),
 ("S4","P05 Curtis Openshaw","the manual’s principles (attempted)",[
   ("Center on Christ",[1,2,3,4,5,15]),
   ("Love the students",[6,7,8,9,10]),
   ("By the Spirit",[13,14]),
   ("Teach the doctrine",[16,17,18,19]),
   ("Get them learning",[11,12,20,21,22,23,24]),
 ]),
 ("S5","P06 Jenae Rowley","lesson sequence",[
   ("During the week before",[2,3,8,16,17,18,22]),
   ("Opening minutes",[13,20]),
   ("The discussion itself",[7,9,11,12,14,19,21,23]),
   ("Landing it",[1,4,5,15]),
   ("After Sunday",[6,10,24]),
 ]),
 ("S6","P07+P08 Kade & Rylee Beckstrand (pair)","situations (Primary, 7-year-olds)",[
   ("Keeping seven-year-olds alive",[2,6,13,20]),
   ("Getting answers out of them",[11,12,14,16,21,23]),
   ("Loving them",[4,7,8,9,10]),
   ("Jesus cards",[1,3,5,15]),
   ("Grown-up homework",[17,18,19,22,24]),
 ]),
 ("S7","P13 Lonnie Tolman","classroom-teacher categories",[
   ("Engagement",[2,9,13,20,23]),
   ("Questioning strategies",[7,11,12,14,16,19,21]),
   ("Relationships",[4,6,8,10]),
   ("The content",[1,3,5,15,17]),
   ("Planning",[18,22,24]),
 ]),
 ("S8","P15 Cami Sprague","relationship to herself",[
   ("I think I already do this",[2,4,6,9]),
   ("I want to try this",[11,12,13,20,22,23]),
   ("I should do this but don’t",[1,5,8,10,15,17,21]),
   ("I don’t know what this means",[3,7,14,16,18,19,24]),
 ]),
]

# validate: every sort uses each of the 24 cards exactly once
for sid,who,scheme,piles in SORTS:
    seen=[c for _,cards in piles for c in cards]
    assert sorted(seen)==list(range(1,25)), (sid, sorted(seen))
print("all 8 sorts valid: 24 cards each, no dupes\n")

# co-occurrence
pair=defaultdict(int)
for sid,who,scheme,piles in SORTS:
    for _,cards in piles:
        for a,b in combinations(sorted(cards),2):
            pair[(a,b)]+=1
top=sorted(pair.items(),key=lambda kv:-kv[1])
print("STRONG PAIRS (together in >=6 of 8 sorts):")
for (a,b),n in top:
    if n>=6:
        print(f"  C{a:02d}+C{b:02d}  {n}/8   {CARDS[a][3]}  ||  {CARDS[b][3]}")

# splitters: count, for each card, max co-occurrence with any other card
print("\nSPLITTERS (no companion card in more than 3 sorts):")
for c in range(1,25):
    best=max(pair[tuple(sorted((c,o)))] for o in range(1,25) if o!=c)
    if best<=3:
        print(f"  C{c:02d}  best companion {best}/8   {CARDS[c][3]}")

# how often did a pile-mate set for each card change? (distinct homes narrative)
print("\nPER-CARD HOME LABELS:")
for c in [13,20,22,16,15]:
    homes=[]
    for sid,who,scheme,piles in SORTS:
        for lbl,cards in piles:
            if c in cards: homes.append(f"{sid}:{lbl}")
    print(f"  C{c:02d} {CARDS[c][3]}: " + " | ".join(homes))

# ---------------------------------------------------------------- STANDARDIZE
# pile label -> standardized bucket. Sequence-scheme piles standardize to
# MOMENT:* buckets (they feed the facet finding, not the category list).
# Cami's self-relevance piles standardize to SELF (analyzed separately).
STD = {
 "Getting them to talk":"TALK","Running a discussion":"TALK",
 "Getting the girls talking":"TALK","Getting answers out of them":"TALK",
 "Questioning strategies":"TALK","Get them learning":"TALK",
 "The discussion itself":"MOMENT:during",
 "Keeping their attention":"ATTN","Keeping seven-year-olds alive":"ATTN",
 "Engagement":"ATTN",
 "Openers":"MOMENT:opening","Opening minutes":"MOMENT:opening",
 "Landing it":"MOMENT:closing","After Sunday":"MOMENT:after",
 "Loving the kids":"LOVE","Knowing them":"LOVE","Love the students":"LOVE",
 "Loving them":"LOVE","Relationships":"LOVE","Class culture":"LOVE",
 "Teaching about Jesus":"CHRIST","Christ-focused content":"CHRIST",
 "About the Savior":"CHRIST","Center on Christ":"CHRIST","Jesus cards":"CHRIST",
 "The content":"CHRIST","Making it personal":"CHRIST",
 "My homework":"PREP","Preparation":"PREP","Prep I should do":"PREP",
 "During the week before":"PREP","Grown-up homework":"PREP","Planning":"PREP",
 "Handling questions":"HARDQ","When I don’t know what to say":"HARDQ",
 "Follow-through":"AFTER",
 "By the Spirit":"SPIRIT","Teach the doctrine":"DOCTRINE",
 "I think I already do this":"SELF","I want to try this":"SELF",
 "I should do this but don’t":"SELF","I don’t know what this means":"SELF",
}
BUCKET_NAMES = {"TALK":"Getting people to talk","ATTN":"Keeping their attention",
 "LOVE":"Knowing & loving the people you teach","CHRIST":"Teaching about Jesus Christ",
 "PREP":"Getting ready before Sunday","HARDQ":"Hard moments / handling questions",
 "AFTER":"After class / follow-through","SPIRIT":"By the Spirit",
 "SELF":"(self-relevance — Cami’s scheme)","DOCTRINE":"Teach the doctrine (manual’s term)"}

for sid,who,scheme,piles in SORTS:
    for lbl,_ in piles: assert lbl in STD, lbl

# category appearance: how many of the 8 sorts produced each bucket
from collections import defaultdict
appear=defaultdict(set)
for sid,who,scheme,piles in SORTS:
    for lbl,_ in piles:
        b=STD[lbl]
        appear[b.split(":")[0] if b.startswith("MOMENT") else b].add(sid)
print("BUCKET APPEARANCE (of 8 sorts):")
for b,s in sorted(appear.items(), key=lambda kv:-len(kv[1])):
    print(f"  {b:8s} {len(s)}/8  {sorted(s)}")

# splitters: distinct standardized homes per card (excluding Cami's SELF sort)
print("\nDISTINCT STANDARDIZED HOMES PER CARD (S1-S7 only):")
homes=defaultdict(list)
for sid,who,scheme,piles in SORTS:
    if sid=="S8": continue
    for lbl,cards in piles:
        for c in cards: homes[c].append(STD[lbl])
ranked=sorted(homes.items(), key=lambda kv:-len(set(kv[1])))
for c,hs in ranked:
    n=len(set(hs))
    flag=" <-- SPLITTER" if n>=4 else ""
    print(f"  C{c:02d} {len(set(hs))} homes: {sorted(set(hs))}{flag}   [{CARDS[c][3]}]")

# ------------------------------------------------------------ HTML FRAGMENTS
import html as H
def esc(s): return H.escape(s, quote=False)

frags = {}

# --- per-sort figures (element 2 of the turn-in: "pictures" of each sort) ---
figs = []
for sid,who,scheme,piles in SORTS:
    cols = []
    for lbl,cards in piles:
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
        f'            <span class="sort-photo__scheme">sorted by {esc(scheme)}</span>\n'
        '            <span class="fiction-badge">FICTITIOUS DATA</span>\n'
        '          </figcaption>\n'
        '          <div class="sort-photo__piles">\n' + "\n".join(cols) + '\n          </div>\n'
        '        </figure>')
frags['SORT_FIGURES'] = "\n".join(figs)

# --- deck appendix table (CONSTRUCTED DECK: verbatim real content) ----------
rows = []
for c in range(1,25):
    sid_, sec, name, short = CARDS[c]
    rows.append(f'            <tr><td class="deck__num">C{c:02d}</td>'
                f'<td class="deck__text">{esc(name)}</td>'
                f'<td class="deck__sec">{esc(sec)}</td>'
                f'<td class="deck__id"><code>{sid_}</code></td></tr>')
frags['DECK_ROWS'] = "\n".join(rows)

# --- standardization table --------------------------------------------------
order = ["TALK","LOVE","CHRIST","PREP","ATTN","HARDQ","AFTER","SPIRIT","DOCTRINE","SELF"]
labels_by_bucket = {}
moment_rows = []
for sid,who,scheme,piles in SORTS:
    for lbl,cards in piles:
        b = STD[lbl]
        if b.startswith("MOMENT"):
            moment_rows.append((lbl, sid, b.split(":")[1]))
        else:
            labels_by_bucket.setdefault(b, []).append((lbl, sid))
srows = []
for b in order:
    entries = labels_by_bucket.get(b, [])
    lbls = "; ".join(f'&ldquo;{esc(l)}&rdquo; ({s})' for l,s in entries)
    n = len({s for _,s in entries})
    srows.append(f'            <tr><td class="std__cat">{esc(BUCKET_NAMES[b])}</td>'
                 f'<td class="std__n">{n}/8</td><td class="std__labels">{lbls}</td></tr>')
mlbls = "; ".join(f'&ldquo;{esc(l)}&rdquo; ({s}: {m})' for l,s,m in moment_rows)
srows.append(f'            <tr><td class="std__cat">Lesson-moment piles (opening / during / closing / after)</td>'
             f'<td class="std__n">2/8</td><td class="std__labels">{mlbls}</td></tr>')
frags['STD_ROWS'] = "\n".join(srows)

import json, pathlib
out = pathlib.Path(__file__).parent / "fragments.json"
out.write_text(json.dumps(frags))
print("fragments written:", {k: len(v) for k,v in frags.items()})
