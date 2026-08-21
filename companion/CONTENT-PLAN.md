# Companion Site — Content Plan

Companion to `ARCHITECTURE.md`. This file holds the editorial substance: the study
arc, the version inventory, the fictitious-setting outline, page templates, and
reusable boilerplate. The **methods/studies here are expected to evolve**; the
brief and source-material description are stable.

Method selection follows the CS 356 Project 1 definition (canned IA mini-project,
`cs356-rebuild/planning/cs356_three_project_structure.html`): contextual study →
open card sort + taxonomy → spec → tree test → ship → five-user task test, with
the fidelity ladder for prototyping and an external review closing the arc.

---

## 1. The study arc (initial set — five studies + one interlude)

Each study page pairs a **method** with a **fictitious study** whose findings
illustrate a **real design decision**, and links the **version(s)** where students
can see the before/after. Real provenance is cited by commit so students can check.

| # | Study (slug) | Method | Fictitious core finding | Real decision it illustrates (provenance) | Linked versions |
|---|---|---|---|---|---|
| 1 | `contextual-study` | Contextual study / observation (NN/g-style, 1 session per participant) | A Primary teacher with a real lesson and a real problem ("my class won't sit still") spends 9 minutes on the church manual site and never finds a usable skill; she navigates by principle names that don't match her problem. | The redesign exists at all; the brief's claim that the IA (not the content) is the obstacle. (Site inception) | church site (external), `v1-hierarchy` |
| 2 | `card-sort` | Open card sort, 21 verbatim skill cards — presented in the **graded-turn-in format** (see §3a): the real assignment text, the real rubric, and two invented example turn-ins (full-marks 60/60 with 5 solo sorts; weak 31/60 with 3 primed group sorts), each section followed by the grader's score and reasoning | Full-marks turn-in: nobody reproduces the 5 principles; piles form around *teaching situations* in teacher language. Weak turn-in: starter categories, over-claiming, and decisions that predate the data. | The 7 problem categories and teacher-language problem statements in `assets/problems-data.js`. (`e2bf223`) | `v1-hierarchy`, live site `problems.html` |
| — | `fidelity-ladder` (interlude page, not a study) | Prototyping methods: sketch → wireframe → coded, per Buxton + the AI-era amendment | n/a — this page narrates the ladder itself: what each rung invited ("the sketch got strangers to propose reorganizations; the polished site got font comments") | The real `sketched` branch (de-fidelity experiment, `20bae25`); the coded first version (`782ddb5`) | `v-sketch`, `v-wireframe`, `v1-hierarchy` |
| 3 | `tree-test` | Tree test, 10 fictitious participants, 4 lesson-drawn tasks; proposed structure vs church-site baseline | Problem-first tree wins on problem-shaped tasks (83% vs 41% pass) **but** assigned-topic tasks ("prepare something on symbols of Christ") still need the principle hierarchy — neither structure dominates. | Both paths coexist deliberately: browse-by-principle (`select.html`, `structure.html`) *and* problem-driven (`problems.html`); three equal home buttons. (`0dcf6c5`) | `v2-bilingual`, live site |
| 4 | `task-test` | Five-user task test on the deployed site, recorded (fictitious) sessions on participants' own phones | Users type natural sentences into search — "learner isn't feeling god's love" — and strict all-words matching returns nothing; two users read the gold button as "the only real option". | Soft search: stemming, synonyms, IDF ranking, typo tolerance (`d476c8c`); uniform home buttons (`0dcf6c5`). | live site (search), `v3-pre-softsearch` *(optional snapshot)* |
| 5 | `external-review` | External-reviewer study: two fictitious outside reviewers (an IA practitioner and a non-LDS UX designer) do independent walkthroughs, then a joint punch-list session | The IA holds; punch list targets copy tone, empty states, and the Spanish problem-content gap (chrome localizes, problem text doesn't). One "outsider" finding: the site assumes church vocabulary the newest teacher doesn't have. | Open future-work list (real, honest): Spanish problem content, onboarding path for brand-new teachers. | live site |

Arc-level narrative rule: each page ends with "what changed because of this" and
"what we'd do differently", so the arc reads as one continuous designer's notebook.

## 2. Version inventory (initial)

| Slug | Kind | Fidelity rung | Source / provenance | What students should notice |
|---|---|---|---|---|
| `v-sketch` | real | 1 — sketch | branch `sketched` (`20bae25`): the Buxton de-fidelity theme | Same IA, hand-drawn finish; the critique it invites differs from the polished site |
| `v-wireframe` | constructed | 2 — wireframe | authored for the companion | Grayscale boxes + real labels; IA visible, visual design withheld |
| `v1-hierarchy` | real | 3 — first coded | `782ddb5` (initial commit): generator + select/summary + hierarchy browse, English-only | A faithful mirror of the manual's hierarchy; no problem-driven path yet |
| `v2-bilingual` | real | 4 — shipped v2 | `52f8dda` (i18n complete, pre-problem-page) | i18n architecture; still navigable only by principle |
| `v3-pre-softsearch` | real (optional) | 4.5 | snapshot at `e2bf223` (problem page present; immediately before the soft search in `d476c8c`) | Problem page exists but strict search fails natural sentences — pairs with study 4 |
| *(live)* | live | 5 — current | `../` (never snapshotted) | Problem-driven + soft search + uniform buttons |

## 3. Study-page template

Every `studies/NN-<slug>.html` follows this skeleton (keep the order; students
learn the genre by repetition):

1. **Scope note** (fiction banner is global; this is the per-page specifics):
   what on this page is real, what is invented.
2. **The method** — what it is, when to use it, 2–3 paragraph summary in course
   vocabulary (self-contained; optional link to course material if public).
3. **Study design** — research question, participants (fictitious, from the ward
   roster), materials, protocol. Written as a reusable design students can copy.
4. **Results** — the invented data, presented properly for the method **at the
   sample size claimed** (for an 8-sort card sort: the raw group-name table and a
   standardization table — *not* a dendrogram or similarity matrix, which
   manufacture structure from too few observations and hide minority schemes;
   pass–time–directness table for tree test…), every artifact stamped
   `.fiction-badge`.
5. **Discussion** — what the results mean, honestly including ambiguity.
6. **Decisions** — the real design decisions, cited to commits/files.
7. **See it in the site** — links to the linked version(s) + the live page.
8. Prev/next arc navigation (rendered from the registry). Required hooks:
   `<body data-study="<slug>">` and an empty `<nav data-companion="arcnav">`
   element (companion.js fills it and adds the styling class).

### 3a. Alternative template: the graded turn-in (adopted for study 2, 2026-08-19)

A study page may instead present the method **the way the grader sees it**:

1. **Scope note** (as above).
2. **The assignment** — the real "what to turn in" text from the course.
3. **The rubric** — the real banded criteria (`user-study-rubric.md`, repo root;
   source of truth is `cs356-rebuild`), compact.
4. **Two example turn-ins** for the same assignment: one full-marks, one weak.
   Each follows the assignment's own element list, and **every element is
   followed by a grader box** (red-pen styling) giving the rubric band, the
   points, and why — concise, quoting the rubric's language. Each turn-in ends
   with a scorecard.
5. **"What separates the scores"** — a short closing synthesis.
6. See-it-in-the-site links + arc nav (same hooks as above).

Rules: the full-marks turn-in's decisions must land on the *real* shipped
decisions (grader box may cite commits, the turn-in itself cites only its data);
the weak turn-in's errors are constructed to hit specific rubric bands and each
grader box names the exact band language it applied. All fiction-marking rules
from ARCHITECTURE §2 apply to both turn-ins.

## 4. "Meet the Timpanogos Shadows Ward" (ward bible)

**The extensive setting content will be authored by the instructor** — this
outlines the container and the constraints so study pages can reference it
consistently before it's final.

- Invented Utah County unit; name checked to not collide with a real ward's
  common usage. All members fictitious; names must not match real acquaintances.
- Planned sections: ward geography & rhythm; demographics (families, students,
  callings); the teaching corps (Primary/SS/YM/YW/EQ/RS/seminary, experience
  levels, devices); the **participant roster** — the named fictitious members who
  appear across studies (consistency: the same person keeps their calling, phone,
  and personality across all studies); ward vocabulary quirks used in the
  controlled-vocabulary work.
- `ward.html` ships first as a skeleton with the roster stub the studies need;
  instructor content replaces/extends it without changing participant IDs.

## 5. Reusable boilerplate

Global banner (injected by `companion.js` on every companion page):

> **Fictitious teaching example.** All participants, quotes, and data on this page
> are invented for CS 356. The site and its design decisions are real. *What's
> real and what's not →* (`fiction.html`)

Version banner (injected into every snapshot page):

> **Archived teaching version — "<title>".** Part of the CS 356 companion, not
> the live site. *View the live site →* · *Back to the case study →*

Scope-note opener (per study page, adapted):

> Real: the artifact this study examines, and the design decision at the end.
> Invented: every participant, session, quote, and number in between.

## 6. Open items (tracked as tasks)

- Ward bible content from the instructor (roster names/details) — blocks final
  polish of studies 1–5, not scaffolding.
- Whether `v3-pre-softsearch` earns a snapshot or study 4 just links the live
  search with before/after examples.
- If/when the course site goes public, add method-page links alongside the
  self-contained summaries.
