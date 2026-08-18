# Companion Site — Architecture

*A course companion that uses the Principles of Teaching site as a running example
of prototyping methods and user-study methods for CS 356 (BYU).*

Status: **approved plan** (2026-08-18). This document guides construction; update it
as decisions change. Its sibling `CONTENT-PLAN.md` holds the study arc, version
inventory, and content templates.

---

## 1. Purpose and audiences

Two audiences share one deployed Pages site and must never be confused:

| Audience | What they use | What they must not see |
|---|---|---|
| **Real ward members / teachers** | The teaching site at the root URL (`/`) | Any course scaffolding, fake data, or "case study" framing |
| **CS 356 students** | The companion at `/companion/` | Nothing withheld — they may (and should) also use the live site |

**Separation rule (decided):** the teaching site contains **zero visible links** to
the companion. Students reach `/companion/` from course materials. Companion pages
link freely *to* the teaching site.

## 2. The honest-fiction contract

This is the single most important editorial rule of the companion.

- The **site is real** — really built, really deployed, really used by a real ward.
- The **design decisions are real** — the git history documents them.
- The **studies are fictitious reconstructions**: participants, quotes, sessions,
  and every number are invented for teaching. The invented data is *constructed to
  be consistent with* the real decisions it illustrates — the fiction dramatizes a
  real design rationale, it does not fabricate one.
- The fictitious setting is the **Timpanogos Shadows Ward** (invented Utah County
  unit; background content authored by the instructor — see CONTENT-PLAN §4).

Marking standard ("very, very clearly marked"):

1. **Global banner** on every companion page, injected by `companion.js`. The
   canonical wording is CONTENT-PLAN §5 (single source for boilerplate):
   *"Fictitious teaching example. All participants, quotes, and data on this page
   are invented for CS 356. The site and its design decisions are real."* Links to
   `fiction.html`.
2. **`.fiction-badge`** component stamped directly on every table, chart, quote
   block, or number that contains invented data (badge text: "FICTITIOUS DATA").
3. **`fiction.html`** — the canonical full statement of what is real vs invented.
4. Every study page opens with a **scope note** listing exactly what on that page
   is real (the artifact, the decision) and what is invented (the people, the data).

## 3. Where it lives, how it deploys

- All companion files live in **this repo** under `companion/`, on `master` once
  merged (developed on the `companion` branch).
- Deployment is the existing two-remote flow — push `master` to `origin` (private)
  and `site` (public Pages). No build step; everything is static and committed.
- Public URL: `https://mikejonesbyu.github.io/principlesOfTeaching-site/companion/`.
- The companion is **English-only** (course material). It does **not** load the
  teaching site's `i18n.js` or per-language bundles.
- Relationship to `cs356-rebuild` (decided): **fresh, self-contained example.** No
  content is shared with the Team Juniper / Lakeridge worked examples. Method
  explanations are summarized in place; if the course site becomes public, method
  pages may be *additionally* linked, but the companion must stand alone.

## 4. Directory layout

```
companion/
  index.html                  Hub: what this is, the study arc, map of everything
  brief.html                  The canned design brief (STABLE — rarely changes)
  ward.html                   "Meet the Timpanogos Shadows Ward" (fictitious setting)
  fiction.html                What's real vs invented — canonical honesty statement
  studies/
    01-contextual-study.html  One long-form page per study (see CONTENT-PLAN §3)
    02-card-sort.html
    02b-fidelity-ladder.html  The prototyping-ladder interlude (kind:"interlude")
    03-tree-test.html
    04-task-test.html
    05-external-review.html
  versions/
    <slug>/                   Frozen, self-contained site snapshots (see §6)
  assets/
    companion.css             Companion's own look (deliberately distinct from the
                              teaching site — this is a site ABOUT that site)
    companion.js              Injects fiction banner; renders nav/index from registry
    studies-data.js           THE REGISTRY — single source for studies & versions (§5)
  ARCHITECTURE.md             This document
  CONTENT-PLAN.md             Study arc, version inventory, ward bible, templates
tools/
  build-version.sh            Export a git ref → companion/versions/<slug>/ (§6)
```

## 5. Single source, multiple views (the registry)

The course's own architectural commitment — *one clean structured source, many
views* — is practiced here, exactly as the teaching site already does with
`skills-data.js` and `problems-data.js`.

`companion/assets/studies-data.js` defines `window.CS356_COMPANION`:

```js
window.CS356_COMPANION = {
  version: "YYYY-MM-DD",
  studies: [
    { id: "card-sort",              // stable slug (students bookmark; never rename)
      order: 2,
      title: "Open card sort",
      method: "Open card sorting",  // method name as taught
      status: "published",          // draft | published | retired
      page: "studies/02-card-sort.html",
      question: "How do teachers naturally group the 53 skills?",
      keyFinding: "…one-line fictitious finding…",
      decisions: ["…design decision it illustrates…"],
      versions: ["v1-hierarchy", "v3-problem-driven"]   // version slugs it links
    }, …
  ],
  versions: [
    { id: "v-sketch",
      title: "Low-fidelity sketch",
      kind: "real",                 // real (git snapshot) | constructed | live
      fidelity: 1,                  // position on the fidelity ladder
      source: "branch sketched @ 20bae25",   // provenance (git ref or 'authored')
      path: "versions/v-sketch/",
      shows: "…what a student should notice…",
      studies: ["card-sort"] }, …
    // The LIVE site is a registry entry with kind:"live" and path:"../" —
    // it is linked, never snapshotted.
  ]
};
```

Note on `order`: it is the **arc/walk position** (interludes included), not the
displayed study number — study numbers are counted over `kind:"study"` entries
only, so the interlude sits between "Study 2" and "Study 3" without renumbering.

**What renders from the registry:** the hub's arc diagram/table, per-study
prev/next navigation, the version gallery, and cross-links between studies and
versions. **What does not:** the study pages' long-form prose — those are
hand-authored HTML documents (they are the worked example itself). The registry
carries metadata only, so adding/retiring a study is: write/remove the page, edit
one registry entry.

**Change policy (decided):** studies and methods are *expected to change* —
`studies/` pages and registry entries are the volatile surface. `brief.html`, the
source-material description, and published `versions/` are **stable/frozen**.
A retired study keeps its URL with a "retired" note (status flag) rather than
being deleted mid-semester.

## 6. Version snapshots (the multiple live versions)

**Decided: hybrid.** Real milestones from git history where they exist,
constructed rungs where pedagogy needs one the history lacks. Every version is a
**frozen, fully self-contained static copy** under `companion/versions/<slug>/` —
committed to git, no build step at deploy time, live forever at a stable URL.

Mechanics:

- `tools/build-version.sh <git-ref> <slug>` exports the deployable files of a past
  commit/branch (`git archive`-style) into `versions/<slug>/`, then post-processes:
  - Injects the **version banner** into every page: *"Archived teaching version
    ('<title>') — part of the CS 356 companion, not the live site."* with links to
    the live site and the companion hub.
  - Adds `<meta name="robots" content="noindex">` to every page (archived versions
    must not compete with the live site in search).
  - Verifies the snapshot is self-contained (all assets relative, church links
    remain absolute).
- **Constructed** versions (e.g. the wireframe rung) are authored directly in
  `versions/<slug>/` in the same self-contained shape, same banner, same noindex.
- Snapshots are **never edited after publication** except to repair the banner or
  a broken asset. Design flaws in old versions are the curriculum, not bugs.
- The **current live site is never snapshotted** — the registry links to `../` so
  "current" is always actually current.

Initial version inventory (provenance in CONTENT-PLAN §2): sketch theme (real,
`sketched` branch), constructed wireframe, initial coded site (real, `782ddb5`),
bilingual pre-problem site (real, `52f8dda`), the live problem-driven site (live).

## 7. Look, feel, and UX rules

- The companion gets its **own visual identity** (`companion.css`) — clearly not
  the teaching site's brand, so screenshots and embedded views of the teaching
  site read as *specimens* inside a lab notebook.
- Voice (decided): **designer's notebook** — first-person-plural instructor voice
  ("we ran…", "this convinced us…"), with the honest-fiction contract visible.
  Fictional named individuals appear only as *participants/reviewers*, never as
  the designers.
- Norman/Krug basics apply: every page states what it is in the first screenful;
  the arc is walkable start-to-finish with prev/next; every fictitious artifact
  links to the real thing it discusses (live page, version, or commit).
- Study pages may embed live versions via screenshots or iframes; either way the
  caption names the version slug and links to it.

## 8. Quality gates (each build task ends with these)

1. All companion + version pages return 200 on the Pages mirror; no console errors.
2. Fiction banner present on every companion page; version banner + noindex on
   every version page; `.fiction-badge` on every invented dataset.
3. Registry validates: every `studies[].versions` slug exists in `versions[]`;
   every `page`/`path` resolves; no orphan version folders.
4. Teaching-site regression: root pages unchanged byte-for-byte except intended
   edits (the separation rule holds — no stray links).
5. Slugs/URLs stable once pushed to the public site.
