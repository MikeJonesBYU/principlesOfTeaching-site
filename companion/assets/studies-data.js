/* ============================================================================
   studies-data.js — THE REGISTRY. Single source for the companion's design
   cycle (ARCHITECTURE §5). Every view of the chain — the hub, prev/next arc
   navigation, cross-links — renders from this file via companion.js.

   The arc is ONE CHAIN, in order: each build is tested by the next study, and
   each study feeds the next build (CONTENT-PLAN §1).

   kind: "study"     status: draft | published | retired
   kind: "prototype" status: planned | built | frozen | shipped
   Only published studies and built/frozen/shipped prototypes render as links
   (the no-dead-links rule); everything else shows as labeled "in progress".

   Slugs are stable once public — students bookmark them. Never rename.
   ========================================================================== */
window.CS356_COMPANION = {
  version: "2026-08-22a",
  arc: [
    {
      id: "card-sort",
      kind: "study",
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
      title: "First functional prototype",
      fidelity: "functional",
      status: "planned",
      path: "prototypes/v1/",
      testedBy: "task-test",
      shows: "Visual design and color used to direct precognitive attention, with a stated story for every choice — and click + prompt logging built in."
    },
    {
      id: "task-test",
      kind: "study",
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
      title: "Final functional prototype",
      fidelity: "final",
      status: "planned",
      path: "prototypes/final/",
      testedBy: null,
      shows: "Everything brought together on single source, multiple views, grounded in all three studies. This prototype graduates to become the next deployed Principles of Teaching site."
    }
  ]
};
