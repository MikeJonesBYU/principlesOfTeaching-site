/* ============================================================================
   studies-data.js — THE REGISTRY. Single source for the companion's design
   cycle (ARCHITECTURE §5). Every view of the chain — the hub, prev/next arc
   navigation, cross-links — renders from this file via companion.js.

   The arc is ONE CHAIN, in order: each build is tested by the next study, and
   each study feeds the next build (CONTENT-PLAN §1).

   TWO GROUPINGS OF THE SAME STATIONS (single source, multiple views — the
   course doctrine this companion is about, practiced on itself):

     arc[]      the six stations in chain order (what happens, in sequence)
     turnins[]  the four things a team actually hands in (what is graded)

   A turn-in owns one or two consecutive stations. Turn-ins 2 and 3 each own a
   prototype AND the study that tests it, because those are submitted together
   as one two-part report. Stations point at their turn-in with `turnin`;
   companion.js groups the chain by walking arc[] in order — the arc stays the
   single ordering source, turnins[] carries only the metadata.

   kind: "study"     status: draft | published | retired
   kind: "prototype" status: planned | built | frozen | shipped
   Only published studies and built/frozen/shipped prototypes render as links
   (the no-dead-links rule); everything else shows as labeled "in progress".

   Slugs are stable once public — students bookmark them. Never rename.
   ========================================================================== */
window.CS356_COMPANION = {
  version: "2026-08-22c",

  /* The through-line, printed under the chain. Verbatim course doctrine. */
  throughLine: "Every prototype must be grounded in the studies before it — facets and attributes stay decoupled from display, so each cycle is a richer view of the same single source.",

  /* --------------------------------------------------------------- turn-ins
     `n` drives the color band (turnin--1 … turnin--4), matching the Project 1
     flow diagram. `handIn` is what leaves your hands; `graded` is the
     instrument; `produces` is what the next turn-in is allowed to build on. */
  turnins: [
    {
      n: 1,
      title: "Card sort report",
      handIn: "One user-study report on the card sort: your participants, a picture of every finished sort, a page of analysis separating trends from isolated incidents, a page of categories and labels justified from the results, and half a page on what you are choosing to ignore.",
      graded: "User Study Rubric — 60 pts",
      produces: "categories, groups & labels"
    },
    {
      n: 2,
      title: "Wireframe + tree test",
      handIn: "One report in two parts, submitted together. Part 1: the clickable 2–3 level wireframe you built, plus its design rationale. Part 2: the moderated think-aloud tree test you ran on that same wireframe, with ten or more participants.",
      graded: "Prototype Rubric 60 + User Study Rubric 60 = 120 pts",
      produces: "refined groups & labels"
    },
    {
      n: 3,
      title: "Prototype v1 + task test",
      handIn: "One report in two parts, submitted together. Part 1: the first functional prototype — visual design and color doing real work, every click and its prompt logged. Part 2: the five-user talk-aloud task test you ran on it.",
      graded: "Prototype Rubric 60 + User Study Rubric 60 = 120 pts",
      produces: "final refinements"
    },
    {
      n: 4,
      title: "Final prototype",
      handIn: "The final functional prototype on its own: one source, multiple views, an information architecture grounded in all three studies, and a stated story for every visual choice.",
      graded: "Final prototype rubric",
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
      testedBy: "tree-test",
      shows: "Two example turn-ins for the same assignment. Team A: one data file of 53 skill blocks with facets, every page rendered by selecting on attributes — no skill hand-placed anywhere — plus the bonus test mode. Team B: a hand-built wireframe worth studying closely."
    },
    {
      id: "tree-test",
      kind: "study",
      turnin: 2,
      title: "Tree test",
      method: "Tree testing, run as a moderated think-aloud on the wireframe",
      status: "published",
      page: "studies/02-tree-test.html",
      question: "Working from real teacher situations, can people find the right skill in the new structure — and where do the organization and the labels break?",
      feeds: "prototype-v1",
      shows: "Two complete two-part reports — each team's wireframe turn-in graded on the prototype rubric and its tree test graded on the study rubric — with per-task first-click tables, wrong-turn analysis, and the decisions that bind prototype v1."
    },
    {
      id: "prototype-v1",
      kind: "prototype",
      turnin: 3,
      title: "First functional prototype",
      fidelity: "functional",
      status: "built",
      path: "prototypes/v1/",
      testedBy: "task-test",
      shows: "Two example turn-ins again. Both teams add color, layout, and a search feature invented from study vocabulary — one steers attention with a single sparing accent, one doesn't. Every click and every search query is logged for the task test."
    },
    {
      id: "task-test",
      kind: "study",
      turnin: 3,
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
      turnin: 4,
      title: "Final functional prototype",
      fidelity: "final",
      status: "planned",
      path: "prototypes/final/",
      testedBy: null,
      shows: "Everything brought together on single source, multiple views, grounded in all three studies. This prototype graduates to become the next deployed Principles of Teaching site."
    }
  ]
};
