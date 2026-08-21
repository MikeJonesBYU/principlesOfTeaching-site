/* ============================================================================
   studies-data.js — THE REGISTRY for the CS 356 companion.

   This file is the single source of truth for the companion's structure. The
   hub's study arc, the version gallery, the per-study prev/next navigation, and
   every study<->version cross-link are RENDERED FROM HERE by companion.js. The
   long-form prose of each study page is NOT here — those pages are hand-authored
   documents (they are the worked example itself). This file carries metadata only.

   Same pattern the teaching site already practices with problems-data.js:
   one clean structured source, many views.

   ---------------------------------------------------------------------------
   HOW TO ADD A STUDY
     1. Write the page at companion/studies/NN-<slug>.html.
     2. Add ONE entry to studies[] in arc order, with a new stable `id`.
     3. Flip its `status` to "published" only when the page actually exists.
   HOW TO RETIRE A STUDY
     Set `status: "retired"` and leave the entry (and the page) in place with a
     retired note. Do not delete it mid-semester — students bookmark URLs.
   HOW TO ADD A VERSION SNAPSHOT
     1. Build it into companion/versions/<slug>/ (tools/build-version.sh for real
        git milestones; hand-authored for constructed rungs).
     2. Add ONE entry to versions[] at its place on the fidelity ladder.
     3. Flip its `status` to "built" only when the folder actually exists.

   NEVER RENAME A PUBLISHED SLUG. `studies[].id`, `versions[].id`, and the
   `page`/`path` they point at are public URLs the moment they ship. Renaming one
   breaks every bookmark, every course link, and every citation. Retire, redirect,
   or supersede — never rename.

   STATUS DRIVES LINKING. companion.js links ONLY entries whose status is
   "published" (studies) or "built"/"live" (versions). Everything else renders as
   a visibly labeled, UNLINKED "in progress" item, so the deployed companion is
   coherent at every stage of the build — there are never dead links.

   ---------------------------------------------------------------------------
   SHAPE

   window.CS356_COMPANION = {
     version: "YYYY-MM-DD",            // registry revision date

     studies: [ {
       id:         "card-sort",        // STABLE SLUG — never rename once published
       order:      2,                  // position in the arc (interludes share the
                                       //   walk but carry no study number)
       kind:       "study",            // "study" | "interlude"
       title:      "Open card sort",   // short display name
       method:     "Open card sorting",// method name as taught in CS 356
       status:     "draft",            // "draft" | "published" | "retired"
       page:       "studies/02-card-sort.html",   // relative to companion/
       question:   "…the research question…",
       keyFinding: "…one-line FICTITIOUS finding…",
       decisions:  ["…the REAL design decision it illustrates, cited to a commit…"],
       versions:   ["v1-hierarchy", "live"],      // slugs; must exist in versions[]
       links:      [ { label: "…", href: "…" } ]  // optional: live-site pages or
                                       //   external sites that are not registry
                                       //   versions. `href` is relative to
                                       //   companion/ or absolute.
     } ],

     versions: [ {
       id:      "v-sketch",            // STABLE SLUG — never rename once published
       title:   "Low-fidelity sketch",
       kind:    "real",                // "real" (git snapshot) | "constructed"
                                       //   (authored for teaching) | "live"
       status:  "planned",             // "planned" | "built" | "live"
       fidelity: 1,                    // position on the fidelity ladder
       rung:    "sketch",              // short rung label for the gallery
       source:  "branch `sketched` (20bae25)",  // PROVENANCE: git ref, or
                                       //   "authored for the companion"
       commit:  "20bae25",             // optional: the real commit, when there is one
       path:    "versions/v-sketch/",  // relative to companion/ (live uses "../")
       shows:   "…what a student should notice here…",
       studies: ["fidelity-ladder"]    // slugs; must exist in studies[]
     } ]
   };

   INVARIANTS (checked by the quality gates in ARCHITECTURE.md §8)
     - every studies[].versions slug exists in versions[]
     - every versions[].studies slug exists in studies[]
     - every page/path of a "published"/"built" entry actually resolves
     - the live site is a registry entry (kind "live", path "../"), never a
       snapshot — "current" must always be actually current
   ========================================================================== */
window.CS356_COMPANION = {
  "version": "2026-08-18",

  /* -------------------------------------------------------------------------
     THE STUDY ARC — five studies plus one interlude, in the order a student
     walks them. Every entry is status "draft" until its page is written; the
     hub shows drafts as unlinked "in progress" items.
     Findings below are FICTITIOUS (see fiction.html); the decisions and commit
     hashes are real.
     ---------------------------------------------------------------------- */
  "studies": [

    {
      "id": "contextual-study",
      "order": 1,
      "kind": "study",
      "title": "Contextual study",
      "method": "Contextual study / observation (NN/g style, one session per participant)",
      "status": "draft",
      "page": "studies/01-contextual-study.html",
      "question": "What actually happens when a teacher with a real lesson and a real problem goes looking for help in the existing manual?",
      "keyFinding": "A Primary teacher spent nine minutes on the church manual site and never found a usable skill. She navigated by her problem; the site indexes by principle, and the two vocabularies never met.",
      "decisions": [
        "The redesign exists at all — the brief's central claim that the information architecture, not the content, is the obstacle. (Site inception, 782ddb5)"
      ],
      "versions": ["v1-hierarchy"],
      "links": [
        {
          "label": "Teacher Development Skills manual (churchofjesuschrist.org)",
          "href": "https://www.churchofjesuschrist.org/study/manual/teacher-development-skills?lang=eng"
        }
      ]
    },

    {
      "id": "card-sort",
      "order": 2,
      "kind": "study",
      "title": "Open card sort",
      "method": "Open card sorting (21 cards, each one a skill name quoted verbatim from the 53-skill inventory), presented as two graded example turn-ins — one full-marks (60/60), one weak (31/60) — with every section scored against the real course rubric",
      "status": "published",
      "page": "studies/02-card-sort.html",
      "question": "What does a full-marks card-sort turn-in look like next to a weak one — and where does the rubric actually spend its points?",
      "keyFinding": "Twenty-eight group titles across five sorts, and not one is a section name. Seventeen name a situation — “Getting them to talk”, “Running out of time (what to cut)”, “Do they feel like they belong?” — in the teacher's own words, never the manual's.",
      "decisions": [
        "Group by the teacher's situation, not the manual's section: the seven problem categories in problems.html, defined in assets/problems-data.js. (e2bf223)",
        "Label in teacher language — each entry a first-person sentence about trouble, not a topic — and let one skill appear under several problems. (e2bf223)"
      ],
      "versions": ["v1-hierarchy", "live"],
      "links": [
        { "label": "The problem-driven page on the live site", "href": "../problems.html" }
      ]
    },

    {
      "id": "fidelity-ladder",
      "order": 3,
      "kind": "interlude",
      "title": "The fidelity ladder",
      "method": "Prototyping methods: sketch → wireframe → coded (Buxton, plus the AI-era amendment)",
      "status": "draft",
      "page": "studies/02b-fidelity-ladder.html",
      "question": "What does each rung of the fidelity ladder invite people to say — and what does it stop them saying?",
      "keyFinding": "Not a study. This interlude narrates the ladder itself: the sketch got strangers proposing reorganizations; the polished site got comments about fonts.",
      "decisions": [
        "The real `sketched` branch — a deliberate de-fidelity experiment on a site that was already coded. (20bae25)",
        "The first coded version: generator, select/summary, hierarchy browse. (782ddb5)"
      ],
      "versions": ["v-sketch", "v-wireframe", "v1-hierarchy"],
      "links": []
    },

    {
      "id": "tree-test",
      "order": 4,
      "kind": "study",
      "title": "Tree test",
      "method": "Tree testing (10 participants, 4 lesson-drawn tasks; proposed structure vs. church-site baseline)",
      "status": "draft",
      "page": "studies/03-tree-test.html",
      "question": "Does a problem-first tree beat the principle hierarchy for the tasks teachers actually arrive with?",
      "keyFinding": "The problem-first tree won on problem-shaped tasks (83% vs. 41% pass) but assigned-topic tasks — “prepare something on symbols of Christ” — still needed the principle hierarchy. Neither structure dominated.",
      "decisions": [
        "Both paths ship deliberately: browse-by-principle (select.html, structure.html) alongside problem-driven (problems.html).",
        "Three visually identical home buttons, so no path reads as the “real” one. (0dcf6c5)"
      ],
      "versions": ["v2-bilingual", "live"],
      "links": [
        { "label": "Browse by principle on the live site", "href": "../structure.html" }
      ]
    },

    {
      "id": "task-test",
      "order": 5,
      "kind": "study",
      "title": "Five-user task test",
      "method": "Task-based usability test (five users, deployed site, participants' own phones, recorded sessions)",
      "status": "draft",
      "page": "studies/04-task-test.html",
      "question": "Can five teachers, on their own phones, get from a problem in their own words to a skill they can use on Sunday?",
      "keyFinding": "Users typed whole natural sentences into search — “learner isn't feeling god's love” — and strict all-words matching returned nothing. Two users read the gold button as the only real option on the page.",
      "decisions": [
        "Soft search: stemming, synonyms, IDF ranking, typo tolerance. (d476c8c)",
        "Uniform home buttons, removing the false hierarchy of the gold button. (0dcf6c5)"
      ],
      "versions": ["v3-pre-softsearch", "live"],
      "links": [
        { "label": "Search on the live problem-driven page", "href": "../problems.html" }
      ]
    },

    {
      "id": "external-review",
      "order": 6,
      "kind": "study",
      "title": "External review",
      "method": "External-reviewer study (two independent expert walkthroughs, then a joint punch-list session)",
      "status": "draft",
      "page": "studies/05-external-review.html",
      "question": "What does the site look like to people from outside the ward — and from outside the church?",
      "keyFinding": "The IA held. The punch list targeted copy tone, empty states, and the Spanish gap: the chrome localizes, the problem content does not. One reviewer found the site assumes church vocabulary the newest teacher does not have.",
      "decisions": [
        "An open, honest future-work list rather than a claim of completion: Spanish problem content, and an onboarding path for brand-new teachers."
      ],
      "versions": ["live"],
      "links": [
        { "label": "The live site", "href": "../" }
      ]
    }

  ],

  /* -------------------------------------------------------------------------
     VERSION INVENTORY — the fidelity ladder, in rung order. Snapshots are
     frozen, self-contained copies under companion/versions/<slug>/; none exist
     yet, so every snapshot is status "planned" and renders unlinked.
     The live site is never snapshotted: it is the entry below with kind "live"
     and path "../", so "current" is always actually current.
     ---------------------------------------------------------------------- */
  "versions": [

    {
      "id": "v-sketch",
      "title": "Low-fidelity sketch",
      "kind": "real",
      "status": "planned",
      "fidelity": 1,
      "rung": "Sketch",
      "source": "branch `sketched` (20bae25) — the Buxton de-fidelity theme",
      "commit": "20bae25",
      "path": "versions/v-sketch/",
      "shows": "The same information architecture in a hand-drawn finish. Notice that the critique it invites is different from the critique the polished site invites.",
      "studies": ["fidelity-ladder"]
    },

    {
      "id": "v-wireframe",
      "title": "Grayscale wireframe",
      "kind": "constructed",
      "status": "planned",
      "fidelity": 2,
      "rung": "Wireframe",
      "source": "authored for the companion — a rung the real history skipped",
      "commit": null,
      "path": "versions/v-wireframe/",
      "shows": "Boxes and real labels, no visual design. The IA is fully visible and everything else is deliberately withheld.",
      "studies": ["fidelity-ladder"]
    },

    {
      "id": "v1-hierarchy",
      "title": "First coded site — hierarchy only",
      "kind": "real",
      "status": "planned",
      "fidelity": 3,
      "rung": "First coded",
      "source": "782ddb5 (initial commit) — generator + select/summary + hierarchy browse, English only",
      "commit": "782ddb5",
      "path": "versions/v1-hierarchy/",
      "shows": "A faithful mirror of the manual's own hierarchy. There is no problem-driven path yet — this is the structure the card sort argued with.",
      "studies": ["contextual-study", "card-sort", "fidelity-ladder"]
    },

    {
      "id": "v2-bilingual",
      "title": "Bilingual site — pre-problem-page",
      "kind": "real",
      "status": "planned",
      "fidelity": 4,
      "rung": "Shipped v2",
      "source": "52f8dda (i18n complete, before the problem-driven page)",
      "commit": "52f8dda",
      "path": "versions/v2-bilingual/",
      "shows": "The i18n architecture: one content source, two languages. Still navigable only by principle — the tree test's baseline.",
      "studies": ["tree-test"]
    },

    /* OPTIONAL / UNDECIDED (CONTENT-PLAN §6): this snapshot earns its place only
       if study 4 needs a live before/after that the current site cannot show. If
       we decide against it, retire this entry rather than renaming or reusing the
       slug, and point task-test at the live site with worked examples instead.
       Until then it stays "planned" and renders unlinked. */
    {
      "id": "v3-pre-softsearch",
      "title": "Problem page, strict search",
      "kind": "real",
      "status": "planned",
      "optional": true,
      "fidelity": 4.5,
      "rung": "Shipped v3 (optional)",
      "source": "snapshot at e2bf223 — problem-driven page present, immediately before the soft search added in d476c8c",
      "commit": "e2bf223",
      "path": "versions/v3-pre-softsearch/",
      "shows": "The problem page exists, but strict all-words matching returns nothing for a natural sentence. This is the failure study 4 watched five people hit.",
      "studies": ["task-test"]
    },

    {
      "id": "live",
      "title": "The live site (current)",
      "kind": "live",
      "status": "live",
      "fidelity": 5,
      "rung": "Current",
      "source": "the deployed site — never snapshotted, always actually current",
      "commit": null,
      "path": "../",
      "shows": "Problem-driven entry, soft search, and three equal home buttons — everything the arc argued for, in production.",
      "studies": ["card-sort", "tree-test", "task-test", "external-review"]
    }

  ]
};
