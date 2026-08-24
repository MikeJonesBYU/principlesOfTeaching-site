# Companion Site — Content Plan

Companion to `ARCHITECTURE.md`. This file holds the editorial substance: the
design cycle, the station briefs, the fictitious-setting outline, page templates,
and reusable boilerplate.

**Restarted 2026-08-21** against the reworked Project 1 sequence (source:
`cs356-rebuild/356 fall-2026-working-schedule 2.xlsx`, sheet "high level flow",
and the "Project 1: From User Studies to a Final Prototype" diagram). The two
big changes from the previous plan:

1. **The arc is now one chain**: card sort → wireframe → tree test → functional
   prototype v1 → talk-aloud task test → final prototype. Each build is tested
   by the next study; each study feeds the next build. Dropped entirely:
   contextual study, fidelity-ladder interlude, first-click testing, external
   review, teardown/data-scheme, search spec (deferred), the
   add-an-attribute-after-v1 requirement (deferred).
2. **The fiction now runs forward.** The companion's studies and prototypes are
   the actual design process for the *next* version of the deployed teaching
   site. The current live site plays the role the course assigns to "an existing
   version you're unimpressed by." The final prototype really ships. See §2.

---

## 1. The design cycle (the arc)

Six stations plus a graduation. Studies are fictitious; prototypes are real,
working artifacts. The chain alternates: every prototype is grounded in the
study before it, and tested by the study after it.

| # | Station (slug) | Kind | Turn-in | What it asks / builds | Feeds |
|---|---|---|---|---|---|
| 1 | `card-sort` | study | **1** | Open card sort on the skill inventory: how do teachers group and label the basic information block (a single skill)? → categories, groups, labels — and *facet signals* (§3) | the wireframe's data scheme |
| 2 | `wireframe` | prototype | **2** | 2–3 level clickable grayscale wireframe. Facets + values per PMEST/LATCH thinking; data scheme decoupled from display (single source, multiple views at wireframe fidelity) | the tree test's material |
| 3 | `tree-test` | study | **2** | Tree test, run as a moderated think-aloud on the wireframe: how are the organization and the labeling broken? → refined categories, groups, labels | prototype v1 |
| 4 | `prototype-v1` | prototype | **3** | First functional prototype. Visual design and color to direct precognitive attention; logs every click and the prompt that led to it | the task test's material |
| 5 | `task-test` | study | **3** | Five-user task test (talk-aloud) on prototype v1: does the visual design work? where does navigation break? → final refinements | the final prototype |
| 6 | `prototype-final` | prototype | **4** | Final functional prototype: brings it together on single source, multiple views, grounded in all three studies | **graduates to become the new live site** |

**Six stations, four turn-ins (settled 2026-08-22).** Students do not hand in
six things. Turn-ins 2 and 3 each bundle a prototype *and* the study that tests
it into one two-part report — Part 1 graded on the Prototype Rubric (60), Part 2
on the User Study Rubric (60), 120 points combined — because a prototype you
have not tested is not finished. Turn-in 1 is the card-sort report alone (60);
turn-in 4 is the final prototype alone. The companion hub renders the chain
grouped this way, in the flow diagram's four colors; the grouping is registry
data (`turnin` on each station, `turnins[]` for the metadata — ARCHITECTURE §5),
not markup.

The through-line (verbatim course doctrine, and this companion's editorial
spine): *deliberately avoid finding "the one true place" each item should go.*
Design a data scheme — information blocks, each with a set of attributes — and
make presentation a matter of selecting on attributes, decoupled from display,
because attributes will be added and modified.

Grading-emphasis questions each prototype must visibly answer (from the flow
sheet; the companion's examples are the demonstrations of "yes"):

- **Wireframe:** does the organization follow from the card sort, and does it
  have multiple facets per info block?
- **Prototype v1:** does the organization follow from the card-sort results,
  and is the requisite logging in place?
- **Final:** is the IA grounded in all three studies, and does the visual
  design intentionally direct attention somewhere useful?

## 2. The forward-fiction contract (what changed and why it is still honest)

Previously the fiction was written *backwards* from decisions already shipped.
Now it is written *forward into* decisions not yet made: the invented studies
will genuinely determine the next version of the real, ward-facing site.

That is a stronger claim and needs stronger rules:

1. **Invented findings may only encode beliefs the instructor genuinely holds
   about real teachers** — from years of teaching, observing, and talking with
   them. The fiction contributes specificity, names, sessions, and numbers; it
   must never contribute conviction the instructor doesn't have. If a finding
   wouldn't survive being asked "do you actually believe real teachers are like
   this?", it doesn't go in the data.
2. **The shipped site must stand without the fiction.** Ward members get a site
   whose design the instructor is prepared to defend as design judgment. The
   studies are the *teaching dramatization of that judgment*, not its evidence.
   `fiction.html` says this in so many words.
3. **The data cannot surprise its author — say so.** The honest-limit statement
   moves from "these studies were reverse-engineered" to "these studies are the
   instructor's design judgment wearing participant costumes." Students still
   learn form (how a study is designed, run, reported, converted into cited
   decisions); surprise still only comes from real users.
4. All marking machinery from ARCHITECTURE §2 stands unchanged: global banner,
   `.fiction-badge` stamps, scope notes, `fiction.html`, SPECULATION variant
   for the post-September-2026 ward setting.

## 3. Station brief: the card sort (detailed — next work session)

**The real substrate.** Cards are drawn from the real 53-skill inventory
(`assets/lang/eng/skills-data.js` at the site root: 5 manual sections — Focus on
Jesus Christ 12, Love Those You Teach 11, Teach the Doctrine 10, Invite Diligent
Learning 10, Teach By the Spirit 10). A card = one skill, verbatim from the
manual. The deck is real content with authored presentation → it carries the
"CONSTRUCTED DECK" badge variant with a traceability key, per ARCHITECTURE §2.

**Study design (fictitious, from the ward roster).**
- Open sort. N = 8 solo sorts, matching the course assignment ("teams recruit
  N=8 over the weekend"). Participants from the ward bible roster, spanning
  callings (Primary / SS / YM / YW / EQ / RS), experience, and comfort with the
  manual. No group sorts, no starter categories — that's the weak-work
  anti-pattern the rubric's Methods band punishes.
- Participants also *label* their piles in their own words at the end of the
  sort (the label harvest — source of wireframe link wording).

**Analysis plan (right-sized to n=8, per the rubric's calibration doctrine).**
- Raw data appendix: every sorter's piles with their own labels, verbatim.
- Group-name standardization table; per-card agreement counts.
- Similarity matrix optional (the course teaches it in studio); dendrograms
  treated skeptically at 8 sorts — judgment where data is ambiguous.
- **Disagreement is the payload, not noise.** A card sort forces each card into
  one pile. Where sorters split *systematically* — half place a skill by
  teaching situation ("when nobody talks"), half by principle or by prep-phase —
  that split is evidence the block needs **multiple facets**, not evidence that
  one faction is wrong. This is how the card sort genuinely seeds the "no one
  true place" doctrine and the wireframe's facet scheme.

**What the results must deliver** (because the wireframe really builds on them):
categories + groups in teacher language; harvested labels; facet signals — the
2–4 candidate facets and their values (e.g. situation → {too loud, not enough
participation, not enough time}); and an explicit statement of what the sort
did *not* resolve (feeds the tree test's question).

**Decisions to make together in the work session (OPEN):**
- Card count: all 53 vs a curated subset. Lean: **all 53** — the real redesign
  must place every skill, and a subset would leave the new IA undetermined.
- Card face wording: the verbatim skill names are full sentences — unsortable
  on a card. Lean: short handles on the face, full sentence on request (a
  real method decision worth demonstrating and defending in the write-up).
- Whether to show a similarity matrix in the example or model restraint.
- The invented results themselves: the piles, the labels, the facet signals —
  i.e., the actual seed of the new IA. This is the substantive design work.

## 4. Station brief: the wireframe (updated 2026-08-21 to the settled assignment spec)

**Two real, working artifacts** — the graded-pair pattern (§6) extended to
prototypes: `prototypes/wireframe/team-a/` (the strong team, binding on the
chain) and `prototypes/wireframe/team-b/` (the middle-of-the-road team, flaws
engineered against the prototype-rubric bands), with a plain chooser page at
`prototypes/wireframe/index.html`. Self-contained, grayscale, own minimal
banner + noindex; do not load companion.css/js (ARCHITECTURE §6).

The governing assignment spec (settled with the instructor; memory:
wireframe-assignment-spec): true wireframe fidelity (black & white, one font,
generic boxes); every information block from the team's card sort present with
labeled placeholder leaves; **two categorizations** of the same blocks (single
source, multiple views; PMEST offered as a lens); ≥2 levels of hierarchy;
click-through to a clear end state; **click recording with an exportable
JSON/CSV log** (this supersedes the earlier "no logging at this rung" note);
bonus credit for a 10-scenario randomized, timed, persistent test mode.
Grading instrument: the generic prototype rubric (Functional 18 / Visual 13 /
IA 13 / Grounded 16).

- **Team A** — single source `wireframe-data.js`: all 53 skills as info
  blocks with `category` (the five harvested categories; deliberately no
  Spirit), `group` (harvested L2 labels), `moment: [opening|during|closing|
  after]`. Every page renders by *selecting on attributes*; no block
  hand-placed. Views: by category (3 levels) and by lesson moment. Verbatim
  skill names appear only at L3, linking to the real manual page. Ships the
  full bonus test mode — which becomes the tree test's instrument.
- **Team B** — hand-authored multi-page HTML (the anti-pattern): 21 of their
  24 deck cards (the three pulled mid-study never returned), their seven
  primed categories incl. a Misc dump, second view = the manual's sections
  (which their own analysis rejected) missing two blocks, two fonts and
  default-blue links creeping in, click log that resets on every page load,
  no bonus mode. Earnest, not parody.
- **Freeze rule:** the moment the tree-test study "runs" against Team A's
  wireframe, both artifacts freeze (ARCHITECTURE §6). Refinements land in v1,
  so the study page's citations stay checkable forever.

## 5. Station briefs: the rest of the chain (sketch — detail later)

- **Tree test (`tree-test`).** Moderated think-aloud on the frozen wireframe.
  Tasks written from real teacher situations (the card sort's situation facet
  is the task generator). Fictitious participants from the roster (fresh ones —
  not the sorters). Results: per-task path tables, first-/wrong-turn analysis
  in prose, refined categories + labels. Decisions feed v1.
- **Prototype v1 (`prototype-v1`).** Spec settled with the instructor
  2026-08-22 (memory: v1-prototype-spec); two real artifacts at
  `prototypes/v1/team-a|team-b/` + chooser, same graded-pair pattern as the
  wireframe. The governing assignment spec:
  - **IA inherited, not invented** — the hierarchy IS the revised hierarchy
    from the team's own tree test (their marked-up outline); both wireframe
    views survive; coverage rule unchanged. Single source, multiple views now
    has teeth: hierarchy views AND search results render from one data file,
    and info blocks render through ONE information-designed template, never
    hard-coded per block. Blocks hold structured stubs (title + summary);
    full content waits for the final prototype.
  - **Visual design for precognitive attention** — required color system:
    monochromatic on a single hue (base + tint + shade) plus ONE
    complementary accent used sparingly, only where the eye should go first;
    neutrals free. Type hierarchy, alignment grid, shape language now in
    play. Gestalt grounding named in the rationale: figure-ground (accent,
    shape, white space, occasional elevation) and alignment/proximity. The
    turn-in states the palette's exact values.
  - **Search, invented but not from nothing** — grounded in think-aloud
    vocabulary from the card sort and tree test, no dedicated study, no AI:
    literal keyword baseline PLUS a hand-built, committed concept/synonym
    layer defensible term by term; results are another view of the single
    source; facet-narrowing buttons on results; designed no-results state;
    search reachable from every page.
  - **Logging is the task test's instrument** — every click and every search
    query, result-clicks tied to the query that produced them, persistent,
    exportable JSON/CSV.
  - **Bonus: test mode** (wireframe-style scenarios) — optional; full marks
    attainable without it. Team A deliberately skips it.
  - Graded on the Prototype Rubric (Canvas 198705) as Part 1 of turn-in 3.
    Frozen when the task test runs.
- **Prototype v1, alternate build (2026-08-24).** An instructor exploration
  at `prototypes/v1/semantic/`: Team A's build loading Team A's own data file
  and stylesheet by reference, with the search grown into a precomputed
  meaning index (`tools/build_semantic_index.py`; committed vocabulary kept
  authoritative as anchors; authored situation sentences per branch; twin
  Python test harness, 18-query suite). Reported to the Part 1 spec and
  graded on the prototype rubric at `companion/semantic-build-report.html`
  (57/60 — deductions on provenance: authored sentences, bent no-AI rule).
  Outside the graded chain: not binding, no Part 2; linked from the hub's
  prototype-v1 station via the registry's `alt` field.
- **Task test (`task-test`).** Five users, talk-aloud, on their own phones.
  Task success, paths from the real logs (fictitiously generated), quotes.
  Results: how navigation is broken → final refinement list.
- **Final prototype (`prototype-final`).** All refinements landed; single
  source, multiple views demonstrated end to end. Graduates: promoted to the
  site root as the next deployed Principles of Teaching site (real redeploy,
  real users). The companion keeps the frozen copy; the live root keeps zero
  companion links.

Deferred, may return: search spec; the add-a-new-attribute-after-v1
architecture test (the course's proof that decoupling paid off).

## 6. Study-page template (graded pair — readopted 2026-08-21)

Each study page presents **two contrasting turn-ins for the same
assignment** — a full-marks report and a low-scoring report (its own weaker
study: short recruitment, primed sorts, a negotiated group sort, a deck that
changed mid-study) — with the grader's reasoning after every element,
quoting the band language of the rubric it applies — studies use
`user-study-rubric.md` (repo root; Canvas rubric 198046), prototype turn-ins
use the Prototype Rubric (Canvas rubric 198705). Page order (settled at
card-sort v5, reused by the tree-test page): scope note → a **3-sentence**
assignment summary → Report A (full marks, elements + grader boxes +
scorecard) → Report B (a separate, weaker study — its errors engineered
against rubric bands and disclosed innocently in the work itself —
elements + grader boxes + scorecard) → "what separates the scores" → shared
appendices (deck, standardization). Report A is **binding on the chain**: its
categories/decisions are what the next prototype implements. Report B's
errors are constructed to hit specific rubric bands (recap-not-synthesis,
over-claiming cap, decisions that predate the data), and each grader box
names the band it applied.

**Two-part reports (added 2026-08-22).** When an assignment is a combined
turn-in — the wireframe + tree test report is the model
(`studies/02-tree-test.html`) — each team's report carries Part 1 (the
prototype turn-in, graded on the Prototype Rubric, 60) and Part 2 (the study
turn-in, graded on the study rubric, 60) with a scorecard per part and a
combined 120-pt line. The study's raw data ships as a real committed file in
the study's real export format (e.g. `02-tree-test-raw-team-a.csv`), invented
by a committed data script (`02-tree-test-data.py`) that parses the real
prototypes rather than hard-coding them, so every number on the page is
re-derivable by a stranger.

**Full-hierarchy element (added 2026-08-22).** Immediately after the design
decisions, each report presents a complete outline of its information
hierarchy *as tested* — every level, every block, every view, verbose on
purpose (the instructor wants to see how each team organized things without
opening the artifact). Distinct from the marked-up *revised* outline that
ends the design-decisions element: this is the unmarked baseline the marks
were made against. Report A models the practice (generated from
`wireframe-data.js`, raw-log ids attached, both views exact); Report B's is
hand-typed from memory with four engineered discrepancies against its own
artifact (a duplicated block, a phantom card id, a dropped block, a phantom
filing in the second view) that the grader box catches. Nine elements total
in Part 2 (the ignore element and raw log renumbered to 8 and 9).

Report A's element skeleton (keep the order):

1. **Scope note** — what on this page is real, what is invented (per-page
   specifics; the global banner is injected).
2. **The method** — 2–3 paragraphs, course vocabulary, self-contained.
3. **Study design** — question, participants (roster), materials, protocol.
   Written to be copied by students.
4. **Results** — presented properly for the method at the claimed sample size;
   every invented artifact stamped `.fiction-badge`.
5. **Analysis** — cross-participant synthesis; claims calibrated to the data;
   ambiguity kept visible.
6. **Design decisions** — every decision explicitly cites its finding; "keep"
   decisions count; concrete enough to act on. These decisions are *live* —
   the next prototype in the chain really implements them.
7. **Raw data appendix** — on-page, stamped.
8. **See it in the chain** — links to the prototype it tested and the
   prototype its decisions produced.
9. Arc navigation hooks: `<body data-arc="<slug>">` + empty
   `<nav data-companion="arcnav">` (companion.js fills it).

Prototype stations don't get long-form pages for now: the artifact is the
example. The registry card carries "what to notice" and the neighboring study
pages discuss it. (Open item: whether each prototype earns a short intro page.)

## 7. "Meet the Timpanogos Shadows Ward" (ward bible)

Unchanged by the restart; `ward.html` and its roster carry over as-is.

- Invented Utah County unit; all members fictitious; names checked against
  real-acquaintance collisions. Set November 2026 under the new Sunday
  schedule — SPECULATION marking rules apply (ARCHITECTURE §2.3a).
- The roster is the participant pool for all three studies. Consistency rule:
  the same person keeps their calling, phone, and personality across studies;
  sorters and tree-test participants don't overlap.
- Instructor authors/extends the setting content; participant IDs are stable.

## 8. Reusable boilerplate

Global banner (injected by `companion.js` on every companion page — wording
unchanged, still accurate under the forward contract):

> **Fictitious teaching example.** All participants, quotes, and data on this
> page are invented for CS 356. The site and its design decisions are real.
> *What's real and what's not →* (`fiction.html`)

Prototype banner (small, static, on every page of every prototype artifact):

> **CS 356 companion prototype — "<title>".** A working design artifact from
> the case study, not the live teaching site. *Live site →* · *Back to the
> companion →*

Scope-note opener (per study page, adapted):

> Real: the skill inventory this study sorts, the prototype it tests, and the
> design decisions at the end — decisions the next prototype really implements.
> Invented: every participant, session, quote, and number in between.

## 9. Open items

- **Next session: the card-sort example** — settle §3's OPEN decisions and
  author the invented results (this is the seed of the new IA).
- Wireframe facet scheme — direct output of the above.
- Instructor pass on ward bible roster (blocks final polish, not structure).
- Whether prototypes earn short intro pages.
- Deferred course elements: search spec; add-attribute-after-v1.
- Eventually: the promotion mechanics for `prototype-final` → site root
  (redeploy checklist, redirects if URLs change, i18n handling).
