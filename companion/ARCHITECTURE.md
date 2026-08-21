# Companion Site — Architecture

*A course companion that uses the Principles of Teaching site as a running
example for CS 356 (BYU): a chain of user studies and prototypes that designs
the site's next version.*

Status: **restarted plan** (2026-08-21; original 2026-08-18). This document
guides construction; update it as decisions change. Its sibling
`CONTENT-PLAN.md` holds the design cycle, station briefs, and content templates.

---

## 1. Purpose and audiences

Two audiences share one deployed Pages site and must never be confused:

| Audience | What they use | What they must not see |
|---|---|---|
| **Real ward members / teachers** | The teaching site at the root URL (`/`) | Any course scaffolding, fake data, or "case study" framing |
| **CS 356 students** | The companion at `/companion/` | Nothing withheld — they may (and should) also use the live site |

**Separation rule (decided):** the teaching site contains **zero visible links**
to the companion. Students reach `/companion/` from course materials. Companion
pages link freely *to* the teaching site.

**The companion's job (restated 2026-08-21):** demonstrate Project 1's design
cycle — card sort → wireframe → tree test → functional prototype v1 → talk-aloud
task test → final prototype — with a worked example of **each study and each
prototype**, using the current live site as "the existing version you're
unimpressed by." The final prototype graduates to become the next deployed
teaching site.

## 2. The honest-fiction contract

This is the single most important editorial rule of the companion.

- The **site is real** — really built, really deployed, really used by a real
  ward.
- The **prototypes are real** — working artifacts, actually built, actually
  clickable, frozen once studied.
- The **studies are fictitious**: participants, quotes, sessions, and every
  number are invented for teaching.
- **The fiction runs forward (changed 2026-08-21).** The invented studies
  drive real design decisions: the next version of the deployed site is built
  from them. Two rules keep that honest — invented findings may only encode
  beliefs the instructor genuinely holds about real teachers (the fiction
  supplies specificity, never conviction), and the shipped site must stand on
  the instructor's design judgment without the fiction as evidence
  (CONTENT-PLAN §2 has the full statement).
- The fictitious setting is the **Timpanogos Shadows Ward** (invented Utah
  County unit; content authored by the instructor — see CONTENT-PLAN §7).

Marking standard ("very, very clearly marked"):

1. **Global banner** on every companion page, injected by `companion.js`. The
   canonical wording is CONTENT-PLAN §8 (single source for boilerplate):
   *"Fictitious teaching example. All participants, quotes, and data on this
   page are invented for CS 356. The site and its design decisions are real."*
   Links to `fiction.html`.
2. **`.fiction-badge`** component stamped directly on every table, chart, quote
   block, or number that contains invented data. Default badge text:
   "FICTITIOUS DATA"; on quotation blocks the variant "INVENTED QUOTE" is
   allowed (same component, same styling). A "CONSTRUCTED …" variant (e.g.
   "CONSTRUCTED DECK") is allowed for material *assembled from verified real
   sources with authored presentation* — a study instrument built out of real
   content, like the card deck drawn verbatim from the 53-skill inventory —
   provided the block prints a traceability key back to the real source.
   Stamping such material "FICTITIOUS DATA" would itself be a small lie;
   stamping it real would be a larger one.
3. **`fiction.html`** — the canonical full statement of what is real vs
   invented.
   3a. **Speculation marking.** Where the fiction is set *after* a real-world
   change that had not yet taken effect when the page was written (e.g., the
   September 2026 Sunday schedule change, written about in August 2026), the
   page must say so explicitly: a dated speculation note near the top, and the
   badge variant "SPECULATION" on passages whose content is a guess about the
   future rather than ordinary invented data.
4. Every study page opens with a **scope note** listing exactly what on that
   page is real (the deck, the prototype, the decisions) and what is invented
   (the people, the data).

## 3. Where it lives, how it deploys

- All companion files live in **this repo** under `companion/`, on `master`
  once merged (developed on the `companion` branch).
- Deployment is the existing two-remote flow — push `master` to `origin`
  (private) and `site` (public Pages). No build step; everything is static and
  committed.
- Public URL: `https://mikejonesbyu.github.io/principlesOfTeaching-site/companion/`.
- The companion is **English-only** (course material). It does **not** load the
  teaching site's `i18n.js` or per-language bundles.
- Relationship to `cs356-rebuild` (decided): **fresh, self-contained example.**
  Method explanations are summarized in place; if the course site becomes
  public, method pages may be *additionally* linked, but the companion must
  stand alone. The Project 1 sequence itself is sourced from the Fall 2026
  working schedule ("high level flow" sheet).

## 4. Directory layout

```
companion/
  index.html                  Hub: what this is, the chain, map of everything
  ward.html                   "Meet the Timpanogos Shadows Ward" (fictitious setting)
  fiction.html                What's real vs invented — canonical honesty statement
  studies/
    01-card-sort.html         One exemplary study report per study (CONTENT-PLAN §6)
    02-tree-test.html
    03-task-test.html
  prototypes/
    wireframe/                Real, working, self-contained prototype artifacts.
    v1/                       Own minimal prototype banner + noindex; do NOT
    final/                    load companion.js/css. Each has its own single
                              source (e.g. wireframe-data.js). Frozen once the
                              study that tests them has "run" (§6).
  assets/
    companion.css             Companion's own look (deliberately distinct from the
                              teaching site — this is a site ABOUT that site)
    companion.js              Injects fiction banner; renders the chain/nav from
                              the registry
    studies-data.js           THE REGISTRY — single source for the arc (§5)
  ARCHITECTURE.md             This document
  CONTENT-PLAN.md             Design cycle, station briefs, ward bible, templates
  DELEGATION.md               Agent build playbook
```

Gone since the restart: `brief.html`, `versions/`, `tools/build-version.sh`,
and the interlude page — the git-history snapshot machinery belonged to the
backwards-running fiction. Old-format pages are recoverable at `4d4b177`.

## 5. Single source, multiple views (the registry)

The course's own architectural commitment — *one clean structured source, many
views* — is practiced here, exactly as the teaching site does with
`skills-data.js` and `problems-data.js`, and as each prototype does with its
own data file.

`companion/assets/studies-data.js` defines `window.CS356_COMPANION`:

```js
window.CS356_COMPANION = {
  version: "YYYY-MM-DD",
  arc: [
    // Stations in chain order. kind: "study" | "prototype".
    { id: "card-sort",             // stable slug (students bookmark; never rename)
      kind: "study",
      title: "Open card sort",
      method: "Open card sorting",  // studies: method name as taught
      status: "draft",              // studies: draft | published | retired
      page: "studies/01-card-sort.html",
      question: "How do teachers group and label the 53 skills?",
      feeds: "wireframe",           // the station this one's output drives
      shows: "…one-line 'what to notice'…" },
    { id: "wireframe",
      kind: "prototype",
      title: "2–3 level wireframe",
      fidelity: "wireframe",        // prototypes: wireframe | functional | final
      status: "planned",            // prototypes: planned | built | frozen | shipped
      path: "prototypes/wireframe/",
      testedBy: "tree-test",        // the study that runs against it
      shows: "…what a student should notice…" },
    …
  ]
};
```

**What renders from the registry:** the hub's chain, per-page prev/next arc
navigation, and cross-links between studies and prototypes. **What does not:**
the study pages' long-form prose — hand-authored HTML documents (they are the
worked example itself). Adding/retiring a station is: write/remove the page or
artifact, edit one registry entry.

**No-dead-links rule:** stations that aren't finished render as clearly
labeled, unlinked "in progress" items. Only `status: "published"` studies and
`status: "built" | "frozen" | "shipped"` prototypes become links.

**Change policy:** slugs and URLs are stable once pushed to the public site. A
retired study keeps its URL with a "retired" note rather than being deleted
mid-semester.

## 6. Prototypes (real artifacts, forward-frozen)

Replaces the version-snapshot machinery. Prototypes are **built forward**, not
exported from git history:

- Each prototype is a **self-contained static artifact** under
  `companion/prototypes/<slug>/` — committed, no build step, own data file,
  all assets relative.
- Every page of every prototype carries the **prototype banner**
  (CONTENT-PLAN §8) and `<meta name="robots" content="noindex">` (prototypes
  must not compete with the live site in search).
- **Freeze rule:** the moment a study "runs" against a prototype, that
  prototype freezes (`status: "frozen"`). The study page's citations must stay
  checkable forever; refinements land in the *next* prototype. After freezing,
  edits only repair a broken banner or asset.
- **Graduation:** `prototypes/final/` is promoted to the site root as the next
  deployed teaching site (a real redeploy; mechanics tracked in CONTENT-PLAN
  §9). The companion keeps its frozen copy; the root site keeps zero companion
  links.
- The **current live site is never copied into the companion** — the registry
  and pages link to `../` so "the existing site" is always actually current
  until the graduation replaces it.

## 7. Look, feel, and UX rules

- The companion gets its **own visual identity** (`companion.css`) — clearly
  not the teaching site's brand, so screenshots and embedded views of the
  teaching site and prototypes read as *specimens* inside a lab notebook.
- Voice (decided): **designer's notebook** — first-person-plural instructor
  voice ("we ran…", "this convinced us…"), with the honest-fiction contract
  visible. Fictional named individuals appear only as *participants*, never as
  the designers.
- Norman/Krug basics apply: every page states what it is in the first
  screenful; the chain is walkable start-to-finish with prev/next; every
  fictitious artifact links to the real thing it discusses (live page,
  prototype, or commit).
- Study pages may embed prototypes via screenshots or iframes; either way the
  caption names the prototype slug and links to it.

## 8. Quality gates (each build task ends with these)

1. All companion + prototype pages return 200 on the Pages mirror; no console
   errors.
2. Fiction banner present on every companion page; prototype banner + noindex
   on every prototype page; `.fiction-badge` on every invented dataset.
3. Registry validates: every `feeds`/`testedBy` slug exists in `arc[]`; every
   `page`/`path` resolves; no orphan prototype folders.
4. Teaching-site regression: root pages unchanged byte-for-byte except intended
   edits (the separation rule holds — no stray links) — until the graduation,
   which is its own deliberate, checklisted change.
5. Slugs/URLs stable once pushed to the public site.
