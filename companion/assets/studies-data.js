/* ============================================================================
   studies-data.js — THE REGISTRY. Single source for the companion's design
   cycle (ARCHITECTURE §5). Every view of the chain — the hub's flow diagram,
   the hub's turn-in panels, prev/next arc navigation, cross-links — renders
   from this file via companion.js.

   The arc is ONE CHAIN, in order: each build is tested by the next study, and
   each study informs the next build (CONTENT-PLAN §1).

   SIX STATIONS, SIX TURN-INS (restructured 2026-09-01, after the course's
   Project 1 assignments were split). Every station is handed in and graded on
   its own: studies on the Study Report Rubric (60), prototypes on the
   Prototype Rubric (60), the final prototype on its own rubric. The old
   two-part bundles (wireframe + tree test, prototype v1 + task test) are gone.

     arc[]      the six stations in chain order (what happens, in sequence)
     turnins[]  the six things a team hands in, one per station (what is
                graded) — the same six things, as packaging rather than
                sequence; kept separate so the hub can print the assignment's
                own words without the station cards repeating them

   Stations point at their turn-in with `turnin`; companion.js walks arc[] in
   order and cuts a new group wherever `turnin` changes, so the arc stays the
   single ordering source and turnins[] carries only the metadata.

   kind: "study"     status: draft | published | retired
   kind: "prototype" status: planned | built | frozen | shipped
   Only published studies and built/frozen/shipped prototypes render as links
   (the no-dead-links rule); everything else shows as labeled "in progress".
   A prototype station may also carry `report` (the page where that turn-in's
   example reports are graded) with `reportStatus: "draft"` until it exists.

   Slugs are stable once public — students bookmark them. Never rename.
   ========================================================================== */
window.CS356_COMPANION = {
  version: "2026-09-01",

  /* The through-line, printed under the chain. Verbatim course doctrine. */
  throughLine: "Every prototype must be grounded in the studies before it — facets and attributes stay decoupled from display, so each cycle is a richer view of the same single source.",

  /* --------------------------------------------------------------- turn-ins
     One per station, in the order of the Project 1 flow diagram. `kind`
     drives the color band (green for user studies, rust for builds — the
     diagram's two rows). `blurb` is the diagram's own one-liner. `handIn` is
     what leaves your hands; `graded` is the instrument; `produces` is what
     the next turn-in is allowed to build on (studies), and for a build the
     hub says instead which turn-in tests it. */
  turnins: [
    {
      n: 1,
      kind: "study",
      title: "Card sort",
      blurb: "How do people group and label the info blocks?",
      handIn: "One user-study report on the card sort: your participants, a picture of every finished sort, a page of analysis separating trends from isolated incidents, a page of categories and labels justified from the results, and half a page on what you are choosing to ignore.",
      graded: "Study Report Rubric — 60 pts",
      produces: "categories, groups & labels"
    },
    {
      n: 2,
      kind: "prototype",
      title: "2–3 level wireframe",
      blurb: "PMEST & LATCH; facets + values, decoupled from display.",
      handIn: "The clickable 2–3 level grayscale wireframe you built, with its design rationale: how the card sort's categories, groups, and labels became a data scheme, and how each view is rendered from it.",
      graded: "Prototype Rubric — 60 pts",
      produces: null
    },
    {
      n: 3,
      kind: "study",
      title: "Tree test",
      blurb: "Where do organization and labeling break?",
      handIn: "One user-study report on the moderated think-aloud tree test you ran on your own wireframe, using its ten built-in scenarios with ten or more participants: tasks and predicted first clicks, participants, results, listening notes, analysis, design decisions with a marked-up revised hierarchy, the full hierarchy as tested, what you are ignoring, and the raw log.",
      graded: "Study Report Rubric — 60 pts",
      produces: "refined groups & labels"
    },
    {
      n: 4,
      kind: "prototype",
      title: "First functional prototype",
      blurb: "Visual design and color for precognitive attention; log every click.",
      handIn: "The first functional prototype with its design rationale: the visual system stated in exact values, the search defended term by term, a complete outline of the hierarchy as built, and every click and search query logged for the study that comes next.",
      graded: "Prototype Rubric — 60 pts",
      produces: null
    },
    {
      n: 5,
      kind: "study",
      title: "5-task talk-aloud",
      blurb: "Does the visual design work? Where does navigation break?",
      handIn: "One user-study report on the five-user talk-aloud task test you ran on your prototype: the tasks, the participants, what each one did and said, the navigation paths from your own logs, analysis, and the refinements the final prototype will make.",
      graded: "Study Report Rubric — 60 pts",
      produces: "final refinements"
    },
    {
      n: 6,
      kind: "prototype",
      title: "Final functional prototype",
      blurb: "Bring it together: single source, multiple views — grounded in all three studies.",
      handIn: "The final functional prototype on its own: one source, multiple views, an information architecture grounded in all three studies, and a stated story for every visual choice.",
      graded: "Final prototype rubric — 120 pts",
      produces: "the next deployed version of the site"
    }
  ],

  /* ------------------------------------------------------------------- arc */
  arc: [
    {
      id: "card-sort",
      kind: "study",
      turnin: 1,
      title: "Open card sort",
      method: "Open card sorting",
      status: "published",
      page: "studies/01-card-sort.html",
      question: "How do teachers naturally group and label the 53 skills — and where do their groupings disagree?",
      feeds: "wireframe",
      shows: "Categories, groups, and labels in teacher language — and systematic disagreement between sorters read as evidence for multiple facets per skill, not as noise."
    },
    {
      id: "wireframe",
      kind: "prototype",
      turnin: 2,
      title: "2–3 level wireframe",
      fidelity: "wireframe",
      status: "frozen",
      path: "prototypes/wireframe/",
      report: "wireframe-report.html",
      reportLabel: "Both teams' reports, graded",
      testedBy: "tree-test",
      shows: "Two example turn-ins for the same assignment. Team A: one data file of 53 skill blocks with facets, every page rendered by selecting on attributes — no skill hand-placed anywhere — plus the bonus test mode. Team B: a hand-built wireframe worth studying closely."
    },
    {
      id: "tree-test",
      kind: "study",
      turnin: 3,
      title: "Tree test",
      method: "Tree testing, run as a moderated think-aloud on the wireframe",
      status: "published",
      page: "studies/02-tree-test.html",
      question: "Working from real teacher situations, can people find the right skill in the new structure — and where do the organization and the labels break?",
      feeds: "prototype-v1",
      shows: "Two complete tree-test reports, one per team, each run on that team's own frozen wireframe and graded on the study rubric — with per-task first-click tables, wrong-turn analysis, and the decisions that bind prototype v1."
    },
    {
      id: "prototype-v1",
      kind: "prototype",
      turnin: 4,
      title: "First functional prototype",
      fidelity: "functional",
      status: "built",
      path: "prototypes/v1/",
      /* The two teams' Turn-in 4 reports are not written yet: they will be
         graded on their own page, on the Prototype Rubric, before the task
         test runs. Until then the link renders as a pending pill. */
      report: "v1-report.html",
      reportStatus: "draft",
      reportLabel: "Both teams' reports, graded",
      testedBy: "task-test",
      /* The instructor's revision line: builds outside the graded chain that
         revise Team A's prototype one bet at a time, in order. Rendered as
         one row per entry so the hub shows the prototype EVOLVING. Shape:
         alts: [{ title, path, report?, note? }, …] (a legacy singular `alt`
         is still understood by companion.js). */
      alts: [
        {
          title: "v2 — semantic search",
          path: "prototypes/v1/semantic/",
          report: "semantic-build-report.html",
          reportLabel: "Graded report",
          note: "Team A's build with the search grown into a precomputed meaning index, reported to the Turn-in 4 spec and graded on the Prototype Rubric (57/60)"
        },
        {
          title: "v3 — skill cards",
          path: "prototypes/v1/cards/",
          report: "cards-build-notes.html",
          reportLabel: "Revision notes",
          note: "the semantic build with every listing redesigned into an informative skill card — situation, manual sentence, first move, prep — on a simpler shell; each change traced to the studies and the ward in the revision notes"
        }
      ],
      shows: "Two example turn-ins again. Both teams add color, layout, and a search feature invented from study vocabulary — one steers attention with a single sparing accent, one doesn't. Every click and every search query is logged for the task test. Then the prototype keeps evolving: two instructor revisions of Team A's build, each one bet at a time — v2 grows the search into a precomputed meaning index (no server, no AI call at lookup time); v3 redesigns every listing into a skill card and pares the shell down."
    },
    {
      id: "task-test",
      kind: "study",
      turnin: 5,
      title: "Five-user task test",
      method: "Five-user task test (talk-aloud), on participants' own phones",
      status: "draft",
      page: "studies/03-task-test.html",
      question: "Does the visual design work in real use — and where does navigation break?",
      feeds: "prototype-final",
      shows: "Task success, real navigation paths from the logs, and the final refinement list."
    },
    {
      id: "prototype-final",
      kind: "prototype",
      turnin: 6,
      title: "Final functional prototype",
      fidelity: "final",
      status: "planned",
      path: "prototypes/final/",
      testedBy: null,
      shows: "Everything brought together on single source, multiple views, grounded in all three studies. This prototype graduates to become the next deployed Principles of Teaching site."
    }
  ]
};
