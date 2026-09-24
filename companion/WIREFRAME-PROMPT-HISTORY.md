# Wireframe + tree-test instrumentation: the prompt history

*Research dump for a later session that will write a CS 356 tutorial: "How to prompt an AI agent (or a team of agents) to build an artifact like this." That session cannot read the transcripts, so this file quotes everything it needs verbatim.*

**What the artifact is.** `companion/prototypes/wireframe/` in the repo `teaching skills` (branch `companion`). There are two example "team turn-ins." **Team A** (`team-a/`) is the strong one: a 4-file hash-routed single-page app. `wireframe-data.js` holds 53 information blocks with `category` / `group` / `moment` attributes, and every page is a filter over that one file. It has two browse views, a persistent click log with JSON/CSV export, and the bonus "test mode" (10 randomized, timed scenarios with give-up, interrupted-run resume, and a results view with export). **Team B** (`team-b/`) is the deliberately weaker one: 34 hand-authored static pages, 21 blocks, a per-page click log that resets on every navigation, and no test mode. The tree test (`companion/studies/02-tree-test.html` plus `02-tree-test-data.py` and `02-tree-test-raw-team-a.csv`) ran on Team A's wireframe, using Team A's own test mode as the instrument.

**How to read this file**
- The human is **Mike** (the instructor). "Claude" or "coordinator" means the main session. "Builder" and "verifier" mean subagents (`companion-builder` and `companion-verifier`, both Opus). During the wireframe build the coordinator ran on `claude-fable-5` and every subagent on `claude-opus-5`. Mike switched the main session to Opus for Canvas/browser work and for some revision rounds (see the timeline).
- Timestamps are **UTC** as recorded. Mike works in Mountain time (UTC−6), so `2026-08-22T03:09Z` is **Aug 21, 9:09 pm MDT**. Git commit times are shown in MDT.
- All quoted prompts and packets were copied programmatically from the JSONL transcripts, so they are byte-exact (typos kept). `[…]` marks a deliberate trim.
- Session ids are the first 8 characters (for example `e5a84ce3` = `e5a84ce3-798b-416d-9d21-6588ed854e94`).

**Key sessions**
| Session | Dates (UTC) | Role in this story |
|---|---|---|
| `e126f94f` | 2026-06-02 → 08-18 | Original teaching site; 08-18: the companion-site architecture and the **delegation playbook + agent definitions** were created (commits `fae81be`, `3c38b14`) |
| `708b171c`, `a0f44e93` | 08-20 → 08-22 | Card-sort example; the **high/low "student work example" recipe** was settled here (the wireframe examples reuse it) |
| **`e5a84ce3`** | 08-22 03:09 → 21:03 | **Wireframe spec, prototype rubric, both wireframe builds, tree-test spec, tree-test data + report, revisions.** The core session. |
| `f93df4e9` | 08-22 19:33 | Hub page: "prototype 1 and study 2 are turned in together" |
| `571b8c72` | 08-22 20:58 → 22:51 | Verbose "as-tested" hierarchy outlines; diagram emphasis on the build/test pair |
| `93243556` | 08-22 23:58 → 08-23 | Prototype v1 spec + build (the next rung; its test-mode decision and the launch.json incident) |
| `1210b924` | 08-25 | Canvas sync: wireframe method page rewritten to match the settled spec |
| `6452ae72` | 09-01 | Restructure into six separate turn-ins; wireframe reports move to `companion/wireframe-report.html` |
| `e88b1e2a`, `2642ab9e` | 09-08 | "Single source, multiple views" tutorials (the concept behind the two categorizations) |
| `f32ff67b` | 09-24 | This request (the tutorial on prompting) |

---

## (A) Timeline

| When (UTC) | Session | Who → whom | Gist |
|---|---|---|---|
| 08-18 19:53 | e126f94f | Mike → Claude | Plan a companion site with fake-but-clearly-marked user studies; "Ask me some questions … then write some architecture documents … and make a list of tasks" |
| 08-18 20:08 | e126f94f | Mike → Claude | "can you spin up and run cheaper agents … to complete the tasks and check that the tasks were done correctly? … create files that suggest this approach" → `DELEGATION.md`, `.claude/agents/companion-builder.md`, `companion-verifier.md` |
| 08-18 20:13 | e126f94f | Mike → Claude | "ok run task 1 with the loop." First builder/verifier loop (shell) |
| 08-20 03:38 | 708b171c | Mike → Claude | Replace examples with a **high-scoring and a low-scoring** turn-in, scored after each section |
| 08-21 12:42 → 08-22 02:54 | a0f44e93 | Mike → Claude | Restart; card-sort redo; Word-PDF look; three voices; weak team gets 5 participants and real method errors; 3-sentence summary |
| **08-22 03:09** | e5a84ce3 | Mike → Claude (Fable) | **Wireframe assignment spec**: B&W, 2 categorizations, ≥2 levels, click recording, bonus test mode. "ask me some questions" |
| 03:12 | e5a84ce3 | Mike → Claude | "no ask me one at a time with muliple choice options." → 13 one-at-a-time multiple-choice questions |
| 03:32–03:33 | e5a84ce3 | Claude → Mike; Mike | Boiled-down spec shown; "ok remember that spec as the wireframe spec." |
| 03:47–03:58 | e5a84ce3 | Mike ↔ Claude | **Generic prototype rubric** (60 pts): 7 MC questions, two re-weightings, "lock in save to memory" |
| 04:00–04:04 | a0f44e93 | Mike ↔ Claude | Write the **student-work example recipe** memory; "prototypes are two real working examples" |
| **04:05** | e5a84ce3 | Mike → Claude | "**ok now for the big step.** Time to make two wireframe prototypes …" |
| 04:07–04:10 | e5a84ce3 | Claude → Mike | 4 scoping questions (scope, block count A=53/B=24, who builds test mode, paths) |
| 04:14 | e5a84ce3 | Coordinator → 2 builders | Task packets **W-A** and **W-B**, run in parallel; coordinator rewrites CONTENT-PLAN §4 and writes the chooser page |
| 04:20 → 04:25 | e5a84ce3 | Builder B → Coord → Verifier B | W-B built (34 pages) → verifier **PASS** (31 criteria) → commit `cde5ac7` (22:25 MDT) |
| 04:30 → 04:41 | e5a84ce3 | Builder A → Coord → Verifier A | W-A built (4 files; added a give-up button on its own) → verifier **PASS-WITH-NITS** (4 nits) |
| 04:41 → 04:59 | e5a84ce3 | Coord → Builder A → Verifier A | Fix packet ("freeze rule means these get fixed NOW") → builder fixes 4 + 1 more → targeted re-verify **PASS** → commits `4a10744`, `1efe807` |
| 10:41 | e5a84ce3 | Mike → Claude (Opus) | Enter the prototype rubric into Canvas (becomes rubric 198705) |
| 11:16–11:30 | e5a84ce3 | Mike → Claude | Tree-test references; "synthesize a 5 to 7 step guide" |
| **11:58** | e5a84ce3 | Mike → Claude (Fable) | **Tree-test "what to turn in" spec** → 8 MC questions → "yep save that to memory" |
| **12:08** | e5a84ce3 | Mike → Claude | Build two tree-test reports on the two wireframes; "Don't actually run each study, just synthesize the data." |
| 12:12 → 12:29 | e5a84ce3 | Coord → Builder (TT-1) | Data packet: invent both datasets **as data** in `02-tree-test-data.py`, emit the raw CSV in the **real export schema**, grow the roster |
| 12:31 → 12:52 | e5a84ce3 | Coord → Builder (TT-2) | Page packet: 1,612-line two-part graded report page |
| 12:52 → 13:04 | e5a84ce3 | Coord → Verifier | Verifier **FAIL**: 9 prose claims contradict the CSV/artifacts (tables were right) |
| 13:05 → 13:12 | e5a84ce3 | Coord → Builder → Verifier | Fix packet → re-derive → re-verify **PASS** → commits `91f1a95`, `ffa5508`, `b826222` (07:15 MDT); registry: wireframe → **frozen**; deploy |
| 19:31 | e5a84ce3 | Mike → Claude (Opus) | Twelve edit notes on Report A (shorter, bullets, short task names, no ids, a scannable results table); "don't make a big deal out of the fact that … the cards all appear in both ways" |
| 19:33 | e5a84ce3 | Coord → Builder (TT-3) | Revision packet; coordinator flags that the coverage note **contradicts the spec** |
| 19:33 | f93df4e9 | Mike → Claude | Hub: prototype 1 and study 2 "are actually turned in together" |
| 19:51 | e5a84ce3 | Mike → Claude | **Coverage-rule clarification**: every block reachable in one view or another, not every view |
| 19:55–20:09 | e5a84ce3 | Coord; Coord → Builder | Coordinator edits Report B's grader boxes itself; builder under-cut (11–25% vs 40%), so a second pass: "cut narration, not evidence" → deploy `cd1e488` |
| 20:19 → 20:33 | e5a84ce3 | Mike → Claude (Fable) → Builder | New required element: **marked-up revised hierarchy** (2 MC questions) → `796f508` |
| 20:55 → 21:03 | e5a84ce3 | Mike → Claude (Opus) | Put the outline requirement into the Canvas tree-test page (browser automation) |
| 20:58 → 22:49 | 571b8c72 | Mike → Claude | **Verbose full "as-tested" hierarchy** outlines in both reports (A generated from the data file; B hand-typed with errors) → `5d3b606` |
| 22:37 | 571b8c72 | Mike → Claude | Visually emphasize that the prototype is what the study runs on → `334ce1b` |
| 08-22 23:58 → 08-23 | 93243556 | Mike → Claude → builders | Prototype v1 (next rung). Test mode is bonus-only, and this time Team A doesn't implement it. **A builder truncated `.claude/launch.json`** |
| 08-25 | 1210b924 | Mike → Claude → Opus compare / Fable writer / Opus applier agents | Canvas "Low-fi Clickable Wireframes" page rewritten to the spec (two categorizations, ≥2 levels, exportable log, bonus) |
| 09-01 | 6452ae72 | Mike → Claude | Six separate turn-ins; rubric split; `companion/wireframe-report.html` created |
| 09-08 | e88b1e2a, 2642ab9e | Mike → Claude | "Single source multiple views" tutorials (PMEST, LATCH, the four systems) |
| 09-24 | f32ff67b | Mike → Claude | This request: write a tutorial on how to prompt agents to build the wireframe + instrumentation |

---

## (B) Mike's prompts, verbatim, in chronological order

Each item gives the session, the timestamp, the verbatim text, and one line on what it contributed. His answers to Claude's multiple-choice questions (the `AskUserQuestion` tool) are included because they are his spec decisions. **[picked]** means he chose a preset option; **[typed]** means he wrote his own answer (verbatim).

### B-0. Background prompts that set up the method (Aug 18–22)

**B-0.1** · `e126f94f` · 2026-08-18T19:53:52Z. The companion-site architecture request (the project frame).
~~~~text
ok here's what I need to do.   I need a companion site added to this repo that uses this site as a running example of several prototyping methods and user study methods.   for the user studies we are going to generate and use fake data and we are going to very very clearly mark it as fake data.   I'll also have some extensive content for the fictitous setting for the fake user study experiments.  Plan out an architecture for this.   All of this will be deployed using github pages as is the case with the current site. 
A few key requirements: 

* we'll probably need multiple verisons of the site that show differing levels of fidelity and different design decisions.  These will all need to be live in the sense that students can look at them as part of their learning. 
* user studies will go from an initial card sort to a "external reviewer" study of the site.  Details about user study methods and prototyping methods can be found at https://github.com/MikeJonesBYU/cs356-rebuild
* use https://github.com/MikeJonesBYU/cs356-rebuild descxripton of project 1 to decide which prototyping methods and user study methods to use.  The intent is for this to be a runnig example for student reference. 
* there wll be a "current live versoin" of the teaching methods site for students to explroe and play with.  
* there will need to be a site which is "fictitious user studies". that contains links to the study design, the user study method used, fictitious reseults, discussions of changes made based on results and links to versions of the site that highlight the key findings and design decisions associated with each site. 
* there will be a "meet the Timpanogos Shadows ward" which contains some fictitous background about the local unit on which this study is based and for which the site is designed.
* the prototyping methods and user studies included as examples are likely to change.  The design brief and source material church publication for the case study is not likely to change.     

Ask me some questions to help clarify what I mean then write some architecture documents that guide future buliding and make a list of tasks to perform.
~~~~
*Contributed:* fake-data-clearly-marked, multiple live versions, "Ask me some questions … then write some architecture documents … and make a list of tasks." This produced `companion/ARCHITECTURE.md` and `CONTENT-PLAN.md`.

His answers to Claude's architecture questions:
- *(19:56:53)* **Q:** cs356-rebuild already has two complete P1 worked examples (Team Juniper / Lakeridge 14th Ward, and a Spanish-ward variant) with fake studies for all 12 artifacts. How should this new companion relate to them?
  **A:** [picked] "Fresh Timpanogos example (Recommended)"
- *(19:56:53)* **Q:** What should the multiple live site versions represent?
  **A:** [picked] "Hybrid: real + constructed (Recommended)"
- *(19:56:53)* **Q:** Should the real teaching site (used by actual ward members) visibly link to the course companion?
  **A:** [picked] "Keep site clean (Recommended)"
- *(19:56:53)* **Q:** What narrative voice should the fictitious studies use?
  **A:** [picked] "Designer's notebook (Recommended)"

**B-0.2** · `e126f94f` · 2026-08-18T20:08:09Z. Asking for the multi-agent method.
~~~~text
if i have you (a fable agent) coordinate all the work can you spin up and run cheaper agents (let's say at the opus level) to compelte the tasks and check that the tasks were done correctly?  If so, how do I do that?  And create files that suggest this approach to copmleting work.
~~~~
*Contributed:* `companion/DELEGATION.md` plus the two agent definition files (commit `3c38b14`). This is the origin of the coordinator → builder → verifier loop used for the wireframe.

**B-0.3** · `e126f94f` · 2026-08-18T20:13:01Z
~~~~text
ok run task 1 with the loop.
~~~~

**B-0.4** · `708b171c` · 2026-08-20T03:38:30Z. The origin of "high and low example" turn-ins.
~~~~text
ok I want you to tear down the current card sorting example and replace it with a new approach to writing these examples.  Here's what I want.  I want to two versions of the card sort assignment turn-in (details below).  One version high scoring, one version low scoring.   Use the new rubric.   After each section of the turn-in report, score it and explain the score.   Keep things short and concise.  Heres' the assignment description:
What to turn in
A single PDF containing the following elements. 

1. The names of the people who were in your card sorting study. 
2. pictures of the resulting card sorts for each participant. 
3. One page or less of analysis in which you discuss trends you saw in the sorts and specific isolated incidents that you saw.  
4. One page or less describing the categories and labels you ended up with and a justification based on the results and analysis.  Don't overthink this.   
5. Half a page or less about what you saw in the results or analysis that you are going to ignore for now and maybe forever.   This is to get you thinking critically about the results of your study.
~~~~

**B-0.5** · `a0f44e93` · 2026-08-21T12:42:31Z → 13:06:46Z. The restart.
~~~~text
ok time for yet another restart on the companion project website.   You've got the new rubric right?
~~~~
Answers to the restart questions:
- *(12:43:19)* **Q:** How deep does this restart go?
  **A:** [picked] "Rebuild pages, keep the plan"
- *(12:43:19)* **Q:** What about the uncommitted card-sort rebuild in the working tree?
  **A:** [picked] "Commit it first as a checkpoint"
- *(12:44:42)* **Q:** What's driving this restart — what should come out different?
  **A:** [typed] "I worked out the rubric carefully and then I reworked the sequence of studies and projects to be more coherent and thought more carefully about what I want the students to do and learn."  
  *(options offered: Format: graded turn-ins everywhere / Too much frame, not enough content / Look and feel is wrong / Scope is too big to finish)*
- *(12:44:42)* **Q:** What gets deleted in the rebuild?
  **A:** [picked] "Keep ward.html + css/js (Recommended)"
- *(12:48:46)* **Q:** Is that the right reading of the new arc for the companion?
  **A:** [picked] "Let me correct the arc first"
- *(12:48:46)* **Q:** Every deliverable in the graded-turn-in format, or only the study ones?
  **A:** [picked] "Graded turn-in for all (Recommended)"
~~~~text
ok here's the new user study and project sequence in some detail. 
and here's a better formatted version of that.  
I don't need the companion examples to mirror the turn-in structure.  But I do need examples of each study and each prototype. 
Also, significantly, I don't need to mirror and build up to the structure of the existing site.   In fact, I now have clearance to rebuild the existing site based on the copanion studies and prototypes.   So in the end, the deployed teacher skills site will be different based on these fictitous studies done with these prototypes.   That's a significant change.   
Nothing in arc 2 about the companion site.  
First click testing doesn't survive at all.  mdj notes can die.  teardown and data scheme aren't needed for this ignore them. 
drop search spec for now.  we may add it later. 
don'tworry about add another rquirement after v1 right now. we'll come back to that.  
Set everything up and rethink it for at leasat the card sort and the first wireframe.   
Then stop and then we'll get the card sort study example done.
~~~~
*Contributed:* the new chain (card sort → wireframe + tree test → …). "I do need examples of each study and each prototype."

**B-0.6** · `a0f44e93` · 2026-08-21T13:39:11Z. The card-sort redo (trimmed; the rest is his card-sort method description and turn-in list).
~~~~text
ok, now let's redo the card sort study.   just go with like 20 to 25 cards.  And use the card face wording verbatim.  And don't forget this is an open sort.   Use about 9 participants.  Here's how I descrive the method: 
Questions it answers

* Schemes: What o […]
~~~~

**B-0.7** · `a0f44e93` · 2026-08-21T15:33:14Z. High/low examples graded against the rubric (sent twice; this is the second copy).
~~~~text
ok that's great. Now what I need is a low scoring example and a high scoring example following the rubric (url below) and the assignment description (what to turn, from below). Replace the contents of the card sort page with that pair of examples. But include a preface that describes the method. So i want two reports and the justification for the low and high grades in each report. Same basic study, just two different reports. rubric: https://byu.instructure.com/courses/36062/rubrics/198046 assignment: What to turn in A single PDF containing the following elements.

1. The names of the people who were in your card sorting study.
2. pictures of the resulting card sorts for each participant.
3. One page or less of analysis in which you discuss trends you saw in the sorts and specific isolated incidents that you saw.
4. One page or less describing the categories and labels you ended up with and a justification based on the results and analysis. Don't overthink this.
5. Half a page or less about what you saw in the results or analysis that you are going to ignore for now and maybe forever. This is to get you thinking critically about the results of your study.
~~~~

**B-0.8** · `a0f44e93` · 2026-08-21T17:20:57Z
~~~~text
in the example card sorting study reports.  I need it to be clearer what is and is not the actual report.   So make the reports look more like something that students would actually turn in in a pdf that they wrote in word.    Then add the grading related annotations after each section and make it clear that that's grading you can break the "looks like it was written in word" look for the grading sections.
~~~~

**B-0.9** · `a0f44e93` · 2026-08-21T19:39:31Z
~~~~text
ok the card sorting report and grading is good.  What I need now is for you to rewrite the high performing one in the voice of a strong undergraduate in CS and write the low performing one in the voice of a middle of the road undergraduate in CS.  And write the grading notes as an expert in HCI who loves teaching and giving clear feedback to students.
~~~~

**B-0.10** · `a0f44e93` · 2026-08-21T23:37:38Z
~~~~text
make the low scoring eaxmple have only 5 participants.  and make some other methodological errors.   take out that language that both are the same.
~~~~

**B-0.11** · `a0f44e93` · 2026-08-22T02:54:47Z
~~~~text
ok drop all the stuff before group A's report except for a 3 sentence summary of card sorting assignment.  republish.
~~~~
*Contributed (B-0.4 to B-0.11):* the "student-work example recipe" the wireframe pair follows: two independent teams, Word-PDF-looking reports, three voices, flaws engineered against rubric bands, and a 3-sentence assignment summary. Its full text is in Appendix 2.

### B-1. The wireframe assignment spec (session `e5a84ce3`, Aug 22 03:09Z = Aug 21 9:09 pm MDT, coordinator on Fable)

**B-1.1** · 2026-08-22T03:09:43Z. **The founding prompt for the wireframe and its instrumentation.**
~~~~text
ok now we need to work on the wireframe assignment description.  I'm going to give you a few things that i want to see then I want you to ask me some questions to get a better idea of what I'm looking for and then I want you to give me a bullet list of assignment requirements like "what to turn in" Then we are going to work on a generic rubric for prototypes.  That will involve some discussion but this is a start.   
Ok, here's what I want: 
a wireframe.  Which means no color, no serious typography, one font, literally black and white with generic boxes.   I want the wireframe to be strongly grounded in the categories and organization of the card sorting results.   I want the wireframe to have 2 categorizations of the information blocks grounded in the card sort.  This encourages single source multiple views and gets students thinking in PMEST terms.   And I want a very simple presentation of the information blocks, again this is a wireframe.     I'm trying to think of how facets might play in but nothing yet.   
I want at least 2 levels of heirarchy agein grounded in the card sorting . 
and for functionality users should be able to click through the hierarchy and select their information block.   The wireframe should record click sequences.  For bonus credit, the wireframe should have an interaction sequence that works like this:  present first scenario.  have an "ok" button.  then start a timer and record clicks.  When the user reaches the end of the hierarchy record where they ended up and pause and move on the to next task.   repeat for all tasks.  randomize the order.   make the whole thing so we can come back later and see the results.   
Ok ask me questions to elucidate the spec.   Then we will boil it down to what to turn in.
~~~~
*Contributed:* every core requirement: B&W fidelity ("literally black and white with generic boxes"), grounding in the card sort, **two categorizations** ("single source multiple views … PMEST terms"), ≥2 levels, click-through, **"record click sequences,"** and the **bonus interaction sequence** (scenario → OK → timer + click recording → record endpoint → pause → next → randomize → "come back later and see the results"). It also set the process: questions first, then a "what to turn in" bullet list, then a rubric.

**B-1.2** · 2026-08-22T03:12:30Z. A process correction after Claude posted a long numbered list of questions.
~~~~text
no ask me one at a time with muliple choice options.
~~~~
*Contributed:* the interview format used for the rest of the project: one question at a time, multiple choice, via `AskUserQuestion`.

**B-1.3** · 2026-08-22T03:12–03:30Z. Mike's answers to the 13 wireframe-spec questions (one is a re-ask after his "generic spec" correction) (question → answer). **Watch the [typed] answers: each one corrects an assumption the agent had made.**
- *(03:12:35)* **Q:** Whose card sort results must the wireframe be grounded in?
  **A:** [picked] "Their own prior analysis"
- *(03:12:50)* **Q:** What are the information blocks at the leaf level of the wireframe — and how much of the ward bible content must be present?
  **A:** [typed] "ah, you see the students will be doing a different set of informatoin blocks in an entirely different problem.  Right now we are working on a generic spec for wireframes, I should have made that clear."  
  *(options offered: All blocks, labels only / All blocks, real content / Defined subset, labels only / Defined subset, real content)*
- *(03:13:40)* **Q:** At the leaf level of the wireframe, what must an information block look like, and how many of the student's blocks must be included?
  **A:** [picked] "All blocks, placeholder leaves"
- *(03:14:25)* **Q:** Do students need to turn in an explicit written mapping showing how their categories trace back to their card sort results, or will you judge the grounding by inspection?
  **A:** [picked] "Brief rationale paragraph"
- *(03:14:43)* **Q:** How should the two categorizations of the information blocks coexist in the wireframe?
  **A:** [picked] "Student's choice of mechanism"
- *(03:26:47)* **Q:** How explicitly should PMEST facets appear in the assignment?
  **A:** [picked] "Mention as a lens"
- *(03:27:24)* **Q:** What must the wireframe be built with? (Click recording implies working code rather than Figma/paper.)
  **A:** [typed] "has to run in a browser, they need to be able to give me a url I can open and all AI use is encouraged and expected during the build."  
  *(options offered: Plain HTML/CSS/JS / Any web tech / Any tech that records clicks / AI-assisted expected)*
- *(03:28:15)* **Q:** For the base (non-bonus) requirement, what counts as "records click sequences"?
  **A:** [picked] "Exportable log"
- *(03:28:53)* **Q:** What should the user see when they reach the end of a path and select an information block?
  **A:** [picked] "Either is acceptable"
- *(03:29:14)* **Q:** Is this an individual or team assignment?
  **A:** [picked] "Teams"
- *(03:29:26)* **Q:** Will this wireframe be used by other students in the next assignment (tree test / task testing on each other's designs)?
  **A:** [picked] "No — team tests its own"
- *(03:29:44)* **Q:** For the bonus (scenario-driven test mode with timer, randomized task order, recorded endpoints): who writes the task scenarios, and how many?
  **A:** [typed] "team writes them, and they need to write 10"  
  *(options offered: Team writes them, you set a floor / Team writes them, any number / Instructor-provided pattern)*
- *(03:30:26)* **Q:** Besides the URL, what written material accompanies the submission?
  **A:** [typed] "we're going to want a url for the website that I can load.  A paragraph of rationale. for the design decisions they made and then the usual presentation of results for the tree test.   So it's a two part report.  We are working on the spec for the wireframe, we'll get to the tree test in a minute."  
  *(options offered: Single short doc / Rationale only / Doc + sample log)*
*Contributed:* generic spec (not tied to the worked example), placeholder leaves, a rationale paragraph (not a mapping table), UI mechanism left to the student, PMEST "as a lens," "has to run in a browser … all AI use is encouraged and expected," **"Exportable log"** as the base click-recording requirement, team assignment, the team tests its own wireframe, **"team writes them, and they need to write 10"** scenarios, and the two-part report.

Claude then posted the boiled-down spec (03:32:29Z). This is the text Mike approved; it is quoted here because the phrase "**both must reach every block**" is the one Mike later corrected (B-6.3):
> That's everything I need for the wireframe part. Here's the boiled-down spec — I've kept it generic (each team's own problem domain and their own card sort results).
> 
> ## Wireframe Assignment — Requirements
> 
> **The wireframe itself**
> 
> - A working website at a **URL the instructor can open** in a browser. Team assignment; all AI use during the build is encouraged and expected.
> - **True wireframe fidelity:** black and white only, one font, generic boxes. No color, no imagery, no typographic styling. The design thinking is what's graded, not the polish.
> - **Every information block** from your card sort study appears in the wireframe. Leaves are labeled placeholders — reaching a block must show a clear, identifiable end state naming which block was reached (a placeholder page or a "you selected X" state; your choice).
> - **Grounded in your card sort:** the categories and organization must derive from your team's own card sort analysis from the previous assignment.
> - **Two categorizations** of the same information blocks — two different organizations of one underlying set (single source, multiple views). The UI mechanism is your choice (view switcher, parallel menus, etc.), but both organizations must be present and both must reach every block. PMEST facets are a good lens for finding your second organization.
> - **At least two levels of hierarchy**, grounded in the card sort results.
> - **Click-through navigation:** a user can navigate down the hierarchy and select an information block.
> - **Click recording:** the wireframe records click sequences and can **export the log** (downloadable or copyable JSON/CSV).
> 
> **Bonus credit — test mode**
> 
> - A built-in test mode: presents a scenario → "OK" button starts a timer → records clicks → when the user reaches the end of the hierarchy, records where they ended up, pauses, and advances to the next task. Repeats for all tasks, in **randomized order**.
> - The team writes **10 task scenarios** for their own problem domain.
> - Results persist so they can be reviewed later.
> 
> **What to turn in**
> 
> - The URL of the working wireframe.
> - Part 1 of a two-part report: a **paragraph of rationale** explaining the design decisions — how the categories and hierarchy derive from your card sort results, and what your two categorizations are. (Part 2, the tree test results, gets specced next.)
> 
> Two loose ends I flagged but didn't ask about: the bonus **point value** (left as "bonus credit" for now), and whether a **sample exported log** needs to accompany the turn-in — though since Part 2 of the report will present tree-test results, the log gets exercised there anyway.
> 
> Ready to move to the tree test spec / the generic prototype rubric whenever you are.

**B-1.4** · 2026-08-22T03:33:56Z
~~~~text
ok remember that spec as the wireframe spec.
~~~~
*Contributed:* the spec became a persistent memory (`project_wireframe-assignment-spec.md`, full text in Appendix 1). Later sessions and task packets cite it by name.

### B-2. The generic prototype rubric (same session)

**B-2.1** · 2026-08-22T03:47:16Z
~~~~text
let's go with the generic prototype rubric.   AGain, here's what I want ask me questions and then we'll get serious about a rubric and have you enter it into canvas.  This has to work for the basic wireframe all the way up to the next to last functional prototype.  The final prototype will be graded differrently.      
category:  met the functional spec.  Did your prototype meet the functional expectations and standards?  Did it do what it was supposed to do?  As fidelity increases, the expectations get higher.   
category: met design spec:  Did your prototype contain the visual and information archiecture speifications?  Does the visual elements look like they were  designed and executed with intention and skill?  That means that color (if appropriate) is coherent and used to support the user experience.  and it means that layout also supports ux goals.   Does the info arhchitecture look like it was design and executed with intention and skill?   That means that there are multiple ways to find things and those ways are reasonable
category:  grounded in the results of the previous study.   Can you articulate how the results of the previosu study inform the design of this prototype?  This builds on the generic assertion that the info arch is reasonable by making the info arch both reasonable and grounded in the needs of your users.  And that my friends is the core of user centered ux design. 

ok ask me questions one at a time multiple choice.   
total points on this will be 60 when we get to that.   functional spec is worth 18 visual spec also 18 and then grounded in the ersults of the previous study gets the rest which is 24 I believe.   
make three levels for the rubric.
~~~~

**B-2.2** · Answers to the rubric questions (03:47–03:53Z):
- *(03:47:28)* **Q:** How should points be distributed across the three levels within each category?
  **A:** [picked] "Full / high partial / low"
- *(03:50:46)* **Q:** The rubric must stretch from a B&W wireframe to a near-final functional prototype. How should "expectations rise with fidelity" be encoded?
  **A:** [picked] "Generic text, spec does the work"
- *(03:51:05)* **Q:** For the wireframe stage, the design-spec category can't judge color (it's banned). Should the rubric's design-spec language handle that explicitly?
  **A:** [picked] "Split visual vs IA emphasis"
- *(03:51:33)* **Q:** For the "grounded in the previous study" category (24 pts), what evidence are you grading?
  **A:** [picked] "Rationale + visible in artifact"
- *(03:52:20)* **Q:** What should the three levels be called?
  **A:** [picked] "Skilled / Competent / Beginning"
- *(03:53:33)* **Q:** Should each category also include a zero rating below "Beginning" for absent/nonfunctional work?
  **A:** [picked] "Yes, add "Missing = 0""
- *(03:53:43)* **Q:** How should I get the rubric into Canvas?
  **A:** [picked] "Draft first, enter later"

**B-2.3** · 2026-08-22T03:56:40Z
~~~~text
actually split out the design spec to have one for visual design spec and one for information architeture design.  And split the points so each is worth at most 9 each.
~~~~

**B-2.4** · 2026-08-22T03:57:39Z
~~~~text
let's bump grounded in the previos study down to 16 then add 4 points to each of the design elements and adjust the bands.
~~~~

**B-2.5** · 2026-08-22T03:58:15Z
~~~~text
lock in save to memory and we'll add to canvas in a little bit.
~~~~
*Contributed:* the 60-point Prototype Rubric: Functional 18 / Visual 13 / IA 13 / Grounded 16, with levels Skilled / Competent / Beginning / Missing. It was entered in Canvas at 10:41Z as rubric 198705 (full text in Appendix 3). Both wireframes were engineered against its bands.

### B-3. The student-work recipe memory (session `a0f44e93`, interleaved)

**B-3.1** · 2026-08-22T04:00:36Z
~~~~text
ok good, write a memory that records how to make an example of student work.  Keep this pretty generic we'll use it for both user studies and prototypes.   Tell me what major eelments you want to include before you write the memory.   and ask any questions if you want.
~~~~

**B-3.2** · 2026-08-22T04:04:20Z
~~~~text
yes prototypes are two real working examples.  note that the what to turn is usually a link so turn in a student report with a link for high and low scoring.  
there's a new rubric for projects.  Taht's what to use.  Do you see it? 
scores are free to land where they land.
~~~~
*Contributed:* "prototypes are two real working examples": both wireframes had to be real, clickable artifacts linked from reports. It also fixed "scores are free to land where they land."

### B-4. The build prompt (session `e5a84ce3`)

**B-4.1** · 2026-08-22T04:05:34Z. **The actual "build it" prompt.** Note how short it is: it works because it points at four persistent documents.
~~~~text
ok now for the big step.  Time to make two wireframe prototypes following my spec for wireframes,  Read the file that describes how we delegate work to opus agents with a fable agent doing the management.   Read the file that describes how to write examples of student work.  Review the architeture file for the companion website.  This prototype is the wireframe prototype for the companion site.   The spec is the wireframe spec, the rubric is the generic project one we just made.  The card sorting study to use is the one that's part of the companion website.    read all those files, make a plan and get to work. ask me questions one at a time if you need to.
~~~~
*Contributed:* go. It names the inputs (delegation playbook, recipe, architecture file, wireframe spec, rubric, and the companion's card-sort study) and the process ("read all those files, make a plan and get to work. ask me questions one at a time if you need to").

**B-4.2** · Answers to the coordinator's four scoping questions (04:07–04:10Z):
- *(04:07:31)* **Q:** What's in scope for this step — just the two working wireframe artifacts, or also the companion assignment page (the two team reports with grading, card-sort-page style)?
  **A:** [picked] "Prototypes only (Recommended)"
- *(04:09:24)* **Q:** How many information blocks in each wireframe? The card sort deck was 24 cards sampled from the site's 53 skills; the registry's wireframe entry (written earlier) says 53 blocks with facets, but the wireframe spec says "every block from your card sort."
  **A:** [picked] "A: all 53, B: the 24 (Recommended)"
- *(04:09:55)* **Q:** Who builds the bonus test mode (10 scenarios, randomized order, timer, endpoint recording, persistent results)?
  **A:** [picked] "A yes, B no (Recommended)"
- *(04:10:28)* **Q:** How should the two wireframes live in the directory tree and the registry (slugs are stable once public)?
  **A:** [picked] "wireframe/a– + b– subfolders (Recommended)"
*Contributed:* build the prototypes only for now; Team A covers all 53 skills and Team B only its 24-card deck; **Team A builds the test mode, Team B doesn't** ("which conveniently becomes the instrument the tree test runs on next"); folder layout `prototypes/wireframe/team-a|team-b/`.

**B-4.3** · 2026-08-22T04:56:33Z
~~~~text
still going?
~~~~

(After the build, Claude's summary at 05:02Z asked Mike to bless two builder judgment calls: C02 "pictures & videos of Christ" filed under *Keeping their attention*, and that category holding only 4 of 53 skills. **Mike never replied to these.** They stood as deliberate tree-test probes and were frozen when the study ran.)

### B-5. The tree-test spec and the synthesized study (session `e5a84ce3`)

**B-5.1** · 2026-08-22T10:41:02Z (model switched to Opus for browser work)
~~~~text
ok i've got the rubric page on canvas open at https://byu.instructure.com/courses/36062/rubrics
go in and enter the rubric for a prototype that we made earlier.
~~~~

**B-5.2** · 2026-08-22T11:16:55Z / 11:30:18Z
~~~~text
hey here's my tree tst page.   I need a few references on how to learn more.  Go find some and tell me 
https://byu.instructure.com/courses/36062/pages/tree-test
~~~~
~~~~text
great now go synthesize a 5 to 7 step guide to tree testing.
~~~~
*Contributed:* Claude's 7-step guide (11:31Z) stressed "Give an explicit 'I'd give up' option." The Team A builder had already added one on its own initiative at 04:30Z.

**B-5.3** · 2026-08-22T11:58:28Z (switched back to Fable). **The tree-test turn-in spec.**
~~~~text
we need to spec out the tree test.   Here's my thoughts on what to turn in.  Ask me questions to clarify my thoughts then write a "what to turn in" spec for my use.    Here's the tree test method description for the class: https://byu.instructure.com/courses/36062/pages/tree-test
here's the what to turn in for tree tests: 

* your tasks. including the task text and the correct info block you want them to find and what you think they'll click first  and a brief rationale for why you picked these 10. 
* names of the people who participated in your study. 
* a table of results that shows each of your tasks, what the first click was (could be target + percent of people who clicked it), where the users ended (again info block + percent of people who got there), how much time it took on average. 
* half a page on what you learned from listening to users while they did the click test. 
* your analysis, see analysis tips on the tree test description page. 
* design decisions based on the analysis. 
* what you'll ignore 

note this follows a similar chain as the card sorting study.   
Ok ask me some questions one at a time.
~~~~

**B-5.4** · Answers to the tree-test questions (11:58–12:02Z):
- *(11:58:59)* **Q:** How does this tree-test turn-in relate to the wireframe assignment's two-part report (Part 1 = wireframe rationale, Part 2 = tree test results)?
  **A:** [picked] "Part 2 of that report"
- *(11:59:15)* **Q:** What instrument do the teams run the tree test on?
  **A:** [picked] "Their own wireframe"
- *(11:59:38)* **Q:** Your draft says 10 tasks, but the tree-test method page says "P1 week 5 (10+ participants, 4 tasks)." Which governs — and may teams reuse the 10 scenarios they wrote for the wireframe's bonus test mode?
  **A:** [typed] "10 tasks.  I need to fix the method page."  
  *(options offered: 10 tasks; reuse encouraged / 10 tasks; must be fresh / 4 tasks per method page)*
- *(12:00:13)* **Q:** May teams reuse the 10 scenarios they already wrote for the wireframe's bonus test mode, or must the tree-test tasks be new?
  **A:** [typed] "the ones built into the wireframe should be the ones they use for this test.  That's why they are in the wirframe."  
  *(options offered: Reuse and refine allowed / Must be new / Mix: at least half new)*
- *(12:01:06)* **Q:** Participants: how many, and who qualifies?
  **A:** [typed] "ideally 10+ from their user population but we won't be too picky on that."  
  *(options offered: 10+, from their user population / 10+, fresh people only / 5–8 is enough / 10+, anyone willing)*
- *(12:01:49)* **Q:** The card-sort chain leaned hard on raw-data capture (photos, verbatim labels). What's this study's equivalent — must the exported click logs from the wireframe be part of the turn-in?
  **A:** [typed] "a link to the logs, which could be in a google doc for exapmle."  
  *(options offered: Yes — logs as appendix / Logs on request / Table is enough)*
- *(12:02:30)* **Q:** How is Part 2 graded? (Part 1, the wireframe, uses the 60-pt Prototype Rubric.)
  **A:** [picked] "User Study Rubric (60)"
- *(12:02:49)* **Q:** Beyond your three result columns (first click + %, final destination + %, average time), should the table also surface failures explicitly?
  **A:** [picked] "Add success % + give-ups"
*Contributed:* **"the ones built into the wireframe should be the ones they use for this test. That's why they are in the wirframe."** This is the design intent behind the test mode: the wireframe carries its own study instrument. Also: 10 tasks, 10+ participants, a link to the logs, the User Study Rubric, and success % + give-ups columns.

**B-5.5** · 2026-08-22T12:04:03Z
~~~~text
yep save that to memory as the tree test spec.
~~~~

**B-5.6** · 2026-08-22T12:08:30Z. **The prompt that produced the data script, the raw CSV and the graded report page.**
~~~~text
now go review the relevant memories needed to build two tree test user study reports and score them aginst the user study rubric one high scoring one low scoring.   review the architecture document and review the delegation document.  Don't actually run each study, just synthesize the data.  The high scoreing should use the high scoring wireframe from group A, the low scoring should use the low scoring wireframe from group B.    These are for the companion website. 
Then, make two reports one report for each of group A and group B.  The reports should include the turn-ins for the wireframe prototype (graded with the prototype rubric) turn-in items and the tree test turn in items (graded with the study rubric).   So a single study report consists of the wireframe turn-ins and the tree test turn ins.  Both graded, both using the guidelines we developed for examples of student work.  
update the companion website and push to remote.
~~~~
*Contributed:* "Don't actually run each study, just synthesize the data." High example on Team A's wireframe, low example on Team B's. Two-part reports graded with two rubrics.

**B-5.7** · 2026-08-22T12:37:52Z; 13:30:03Z
~~~~text
how's it going?
~~~~
~~~~text
did you push to remote?  and give me the url.
~~~~

### B-6. Revisions after seeing the output (the most instructive part)

**B-6.1** · 2026-08-22T19:31:27Z (Opus). **Twelve concrete edit notes on Report A.**
~~~~text
a few notes on the wireframe plus tree test turn in. 
make the intro paragraph much much shorter.   for the high performing report, use bullet points in the analysis and be much more concise.  
make section 1.2 shorter by 40% 
maek the grading boxes bullet points too. 
in the report a part 2, every time you mention one of the 10 teasks anywhere also include a 3-4 short form so I can remember what the task is.  T02 doesn't mean much to me.  in the correct information block column, drop the 033.title_number1 stuff everywhere.   Not useful.  
don't make a big deal out of the fact that they used all the cards and that the cards all appear in both ways to organize the data.   Important that all the cards go seomewhere but also just fine if some cards don't fit in both places.  
In the results table in section 3, final destination most common drop the 015.title_number1 stuff not helpful Instead give the short form of the task, then the expected first click then the most common first click with the number who got that.  Then give the intended final destination title and the actual final destination title with the number ofpeople who got to it.  
If there's lots of spread in what got clicked mention that too.   
Making the table in 3 easier to tell if there was consencus and if it matched the expected results is ipmortant. 
make listening notes 1/2 as long and make it bullet points. also you forgot explicitely mark all fake quotes as fake.  
section 5 make it 40% shorter and make it bullet points.   and wheneer a task id is given include the 3-4 word version of the task.  These aren't useful "006.title_number1" 
section 6 40% shorter and bullet points.  
section 7 40% shorter and it's already bullet points so that's good.  
ok fix all that in the group a reports.
~~~~
*Contributed:* quantified edits ("40% shorter," "1/2 as long," "bullet points"), a human-readable naming rule ("T02 doesn't mean much to me" → a 3–4-word short form everywhere, no skill ids), a results table redesigned around **consensus vs. prediction**, "explicitly mark all fake quotes as fake," and the first sign of the coverage-rule issue ("just fine if some cards don't fit in both places").

**B-6.2** · `f93df4e9` · 2026-08-22T19:33:38Z (a parallel session)
~~~~text
ok check and read all your architecture and other docs first.   NExt, we need to fix up the companion site hub page.   see how prototype 1 and study 2 are seperate?  They are actually turned in together.  See diagram.  also redo the colors on this page so that the colors match the diagram I uploaded.  Make it clear what goes in each turn in in the progression flow on the companion hub.
~~~~

**B-6.3** · 2026-08-22T19:48:33Z → 19:51:03Z. **The coverage-rule clarification.** The coordinator had pointed out that the 19:31 note contradicted the approved spec's "both must reach every block" and asked whether to strip Team B's "doesn't reach every block" deduction.
~~~~text
what are you doing?
~~~~
~~~~text
my bad, that other process is done, so you have the files.  I'll restart that other one after this job is done.   
yes strip out the "doesn't reach every block" languuage but be careful.  Every block needs to be reachable in one organizational view of the blocks or another but not every block needs to be reachable in every organizational view.
~~~~
*Contributed:* the settled **coverage rule**: every block reachable in at least one view; dual reachability not required and not an achievement. The coordinator kept the deduction for C03/C18/C19 (missing from *every* view) and removed the one for C10/C22 (missing only from view 2). The memory, the Canvas page and later packets were all updated to match.

**B-6.4** · 2026-08-22T19:57:54Z
~~~~text
whatcha working on
~~~~

**B-6.5** · 2026-08-22T20:19:45Z (Fable). A new required element.
~~~~text
ok great.  that's much better.  Next change.  add a new requirement to the tree study project spec.  They should include at the end of "what we will change" section a new version of their information hierarchies with changes marked.   This is a new required element.  Update group A to reflect the changes they plan to make (no other changes to their report, this just makes it easier to the see the changes) and update group B as well.  Group A's should be clear what the changes are and Group B should have some errors on inconsistencies.  Add this to the grading as well.  This does not change the rubric .  ask me any questions if you need to.
~~~~
Answers:
- *(20:20:22)* **Q:** What form must the revised hierarchy take in the report?
  **A:** [picked] "Marked-up text outline (Recommended)"
- *(20:23:28)* **Q:** How much of the hierarchy must the outline show? (Team A has 5 categories × 15 groups × 53 leaves, times two views — a full tree is long.)
  **A:** [picked] "L1+L2 full; leaves only where changed (Recommended)"

**B-6.6** · 2026-08-22T20:53:01Z / 20:55:51Z (Opus)
~~~~text
ok do a commit and push to make sure everything is up to date with remote.
~~~~
~~~~text
ok that outline in the tree test study report was really useful.  Update the tree test assignment description and requirements to include the outline with changes marked.
~~~~
Answer:
- *(20:57:52)* **Q:** Where should the tree-test assignment description + requirements (now including the marked-up outline) live?
  **A:** [picked] "Add to the method page (Recommended)"

**B-6.7** · `571b8c72` · 2026-08-22T20:58:48Z. The verbose as-tested hierarchy.
~~~~text
ok after reading all your memory and context for this project,  I need you to make some changes to the report that describes the results of the wireframe study.   and to change the descriptoin of the study itself.  What I want is that after the design decisions section in the report, the report should present outlines of their information hierarchies.   This will let me see how they organized things.  These should be verbose even if they are big.    Add that to th "what to turn" part of the report specification.   Then update the grading to mention those hierarchies where needed.  And make some sloppy mistakes in the group b version.
~~~~
*Contributed:* element 7, "The full hierarchy, as tested." Report A's outline was **generated programmatically from `wireframe-data.js`** (53 leaves, with block ids). Report B's was "typed from memory" with four planted discrepancies against the artifact.

**B-6.8** · `571b8c72` · 2026-08-22T22:37:57Z
~~~~text
emphasize prototype 1 and study 2 and similar markers in the overview diagram.  
and visually emphasize that the prototype is what's used in the study.   
commit and push as per usual.
~~~~

### B-7. Later prompts that carried the wireframe forward

**B-7.1** · `93243556` · 2026-08-22T23:58:34Z. Prototype v1 spec (voice-dictated; trimmed; included for its single-source-multiple-views emphasis).
~~~~text
ok in this session we need to refine the first functional prototype spec and then build one. So the first functional prototype needs to add, um, layout and color and typography and shape. The principles that we're gonna teach them to apply in this are a monochromatic design with a contrasting color. The monochromatic design will monochromatic design will be based on a single hue, and then we want a tint and a shade of that hue. And then we want an accent color on the opposite side of the color wheel from that hue, and we want to use the accent color sparingly and only to guide their attention to where we want it. We're gonna use Gestalt based psychology principles to think about precognitive attention and steering precognitive attention so that people's attention is drawn to certain things on the site without them really being able to explain why. But we will be able to explain why becau […]
~~~~
[…] final paragraph, verbatim:
~~~~text
[…] d actually.   
https://byu.instructure.com/courses/36062/pages/coded-prototype There are two key innovations here. One is using, um, color formatting, font, typography, hue, all of those visual design elements to steer attention where we want it to go. And then the other one is implementing search functionality. So those are the two major innovations compared to the previous study. And the first functional prototype should be directly based on the hierarchy obtained from the tree test study. and emphasize that it's very important that you have single source multiple views because now we're adding search results, which means you're gonna have another different view of the same source data. Oh, and at this point, third significant addition is that information blocks should be presented in a coherent awesome way. Um, that's easy to change. Shouldn't be hard coded. But when we get down to an information block, uh, that should be presented using careful visual design and information design.
~~~~
Relevant answer: "Should v1 have a built-in task/test mode (like the wireframe's 10 scenarios) to serve as the task-test instrument?" = **[picked] "No, just always-on logging"**.

**B-7.2** · `93243556` · 2026-08-23T00:07:43Z
~~~~text
ok you've got it.   add a test mode as a bonus feature but don't implement it for group A this time they can still get a perfect score though.  
For the visual design errors:  use too much of the accent color in design B.  And use white space with no apparent reason but don't over do it.  
Ok that's that.  Go build both functional prototypes organize them according to the architecture document.  use the delegation plan.  Refer to the rubric for prototypes to get a high scoring and low scoring.  
Except this time have the high scoring group make some mistake that moves them off the perfect score for their prototype.  that will have good pedagogical value I think.
~~~~

**B-7.3** · `1210b924` · 2026-08-25T02:07:32Z. The Canvas sync that rewrote the wireframe method page.
~~~~text
ok great.  So what i need you to do is to go through everything we've created about project specs, user study descriptions and rubrics and make sure the relevant pages are up to date on canvas.  Pay attention to the "what to turn in" sections of assignment descriptions for both prototypes and studies,  pay attention to study methods and their alignment with the study methods pages.   if you need me to make a decision let me know,  Keep a list of changes you made.   spin up agents running in parallel as needed.  use opus agents to compare canvas pages with what we have here, chagne the canvas pages but fable agents to write the text for the pages.  Always prioritize what we've learned and remembered in this code base.  The canvas pages are out of date, the goal is to update them.
~~~~

**B-7.4** · `6452ae72` · 2026-09-01T20:41:36Z
~~~~text
ok so the project turn in structure has changed.    study the figure to see what the new turn-in structure is.   
then go through the website at https://mikejonesbyu.github.io/principlesOfTeaching-site/companion/index.html 
and redo the presentation of studies and prototypes to reflect that structure.  Then go through the study and prototype pages to reflect this.  Note that the rubric is now changes so that the rubric for the studies and the rubric for the prototypes are split out.  Same rubrics, but they aren't combined anymore.  Update the grading notes to reflect that change in structure.   Rubric link below for referecne.
https://byu.instructure.com/courses/36062/rubrics
~~~~

**B-7.5** · `e88b1e2a` · 2026-09-08T12:26 / 12:55 / 13:06, then the consolidated re-prompt in `2642ab9e` 15:46. A good example of Mike folding three rounds of corrections into one better prompt.
~~~~text
You are an expert in knowing how to teach software engineering to computer science undergraduates.   it's improtant for my students to know how to use a single source multiple views model.   Go through the code for this project and make a report in html that's tutorial in nature about what it would take to add a different organization scheme to this data.  Come up with a completely new organizing scheme to use as an example and describe what it would take to implement that.  Including code snippets is a great idea.   But tutorial but be brief in your english text.   Be visual as well.    Don't teach them how to write code, teach them how to organize things.   Make your report in html
~~~~
~~~~text
now we need to tie this back to principles from the class a little better.  
Think about the Polar Bear book and the 4 systems.  
Think about PMEST not as a specific organizing scheme but as the concept that you'll have multiple schemes by which the data are organized. 
Think about LATCH as a a way to start thinking about and then guiding organization of data.  
work in some ideas from those bodies of work in a coherent way into the single data multiple views write up . Don't over do it, but make the connection when it's there.
~~~~
~~~~text
oh, redo the anlaysis to focus on the most recent prototype in the companion website.  We'll ignore the actual site for a little longer.  but focus on what's in the companion site most recent prototype.  Your stages of the teacher's development bit is great, keep that.
~~~~
Consolidated version (`2642ab9e`, 2026-09-08T15:46:08Z):
~~~~text
You are an expert in knowing how to teach software engineering to computer science undergraduates.   it's improtant for my students to know how to use a single source multiple views model.   Go through the code for this project and make a report in html that's tutorial in nature about what it would take to add a different organization scheme to this data.  Come up with a completely new organizing scheme to use as an example and describe what it would take to implement that.  Including code snippets is a great idea.   But tutorial but be brief in your english text.   Be visual as well.    Don't teach them how to write code, teach them how to organize things.   Make your report in html
work only with the most recent version of the caompanion site functional prototype.   the actual principles of teaching website is irrelevant for this project.  
Think about the Polar Bear book and the 4 systems.  
Think about PMEST not as a specific organizing scheme but as the concept that you'll have multiple schemes by which the data are organized. 
Think about LATCH as a a way to start thinking about and then guiding organization of data.  
work in some ideas from those bodies of work in a coherent way into the single data multiple views write up . Don't over do it, but make the connection when it's there.
~~~~

**B-7.6** · `f32ff67b` · 2026-09-24T15:21:50Z. The current request.
~~~~text


<pasted_content id="41c4">
go study my wireframe prototype and artifact.  and remember any instructions I would have given you to build that including the tree test instrumentation.    Think about what prompt I would have given to generate that.  and what prompts would have been part of that.  What i need is a tutorial for my students about how to prompt an ai agent or agents to build such an artifact.  What do they need ot know? Waht should they say in their prompts?  What should they be thinking about.  These are CS students in a UX class. I was surprised at how litttle they seem to know about this kind of thing  and I want to help them get that down.  Write up your report as an html document.   Be visual and tutorial.   then add that html document to the wireframe step in the companion hub.   Run this in the cloud.
</pasted_content id="41c4">
~~~~

---

## (C) Agent-to-agent task packets

### C-0. The standing pattern (from `companion/DELEGATION.md` and `.claude/agents/`)

**The loop** (`DELEGATION.md`, 99 lines, written 08-18 in response to B-0.2):
- The **coordinator** (Fable, the main session) "plans · sequences · writes task packets · adjudicates reviews · owns git & deploys."
- The **builder** (`companion-builder`, `model: opus`) "builds ONE deliverable, reports."
- The **verifier** (`companion-verifier`, `model: opus`, fresh context) does an "adversarial check, fixes nothing, reports."
- Three principles, verbatim: "**Separation of duties.** The agent that built a thing never verifies it. Verifiers get a fresh context and are instructed to bias toward FAIL." · "**One task, one packet, one agent.** The coordinator writes a *task packet* (task id, deliverables, acceptance criteria, allowed files, don't-touch list) into each builder's prompt." · "**The coordinator owns state.** Only the coordinator commits, pushes, updates the task list, or edits shared files' merge points."
- Per-task loop, verbatim step 4: "**Adjudicate** — coordinator reads both reports. On FAIL: send findings back to the *same* builder (message the existing agent — it keeps its context) and re-verify. On PASS: coordinator spot-checks, commits with a descriptive message, marks the task complete."
- Parallelism rule, verbatim: "**Never two agents on one file.**"
- Model tiers: coordinator = Fable; builders and verifiers = Opus; "Mechanical gates (link checks, banner presence, registry validation, HTTP 200 sweeps) | Haiku/Sonnet, or a plain script."

**Builder definition** (`.claude/agents/companion-builder.md`, 58 lines). Key clauses:
- "Read first, every time": ARCHITECTURE.md, CONTENT-PLAN.md, and the task packet, including "the **files you may touch** (touch nothing else)."
- Hard rules: never modify the teaching site; the honest-fiction contract; "**No git commits, no pushes, no task-list changes.**"
- Report format, verbatim: "Return: (1) files created/modified, (2) acceptance criteria → met/not-met each, (3) deviations from the docs and why, (4) anything you noticed that's out of scope but wrong (do NOT fix it), (5) open questions for the coordinator."

**Verifier definition** (`.claude/agents/companion-verifier.md`, 46 lines). Key clauses:
- "**You never fix anything** — you find, you cite, you report. You did not build this work; assume nothing."
- "Read the actual files — do not trust the builder's summary."
- Checks, in severity order: teaching-site regression (blocker) → honest-fiction contract (blocker) → acceptance criteria → template & registry → craft.
- Report: "**VERDICT: PASS | FAIL | PASS-WITH-NITS**", blockers as file:line, criteria table, nits, fiction audit.
- "Bias toward FAIL when uncertain — a false pass ships fake data unmarked or breaks the real site; a false fail costs one review cycle."

**Quality gates** (`companion/ARCHITECTURE.md` §8, lines 308–319, verbatim):
~~~~text
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
~~~~
**Freeze rule** (ARCHITECTURE §6, verbatim): "the moment a study 'runs' against a prototype, that prototype freezes (`status: "frozen"`). The study page's citations must stay checkable forever; refinements land in the *next* prototype. After freezing, edits only repair a broken banner or asset."

**Packet anatomy used for every packet below:** `TASK PACKET <id> — <one-line goal>` · Working directory · **Read first** (numbered files, each with *why*) · **Fiction framing** (what this artifact is in the story and what depends on it downstream) · **The assignment spec the artifact must satisfy** · **Build requirements** (numbered, concrete: file names, data shapes, event schemas, flows) · **Allowed files** · **Self-check before reporting** (scripts to run, live checks) · **Report back** (a numbered list of what to return). Verifier packets instead carry: *What was built* · *Verify against this packet* (restating the acceptance criteria, including "Accepted deviations (do NOT flag these)") · *How to verify* (regression first, re-derive data independently, live-load, judgment checks) · *Report* format.

Before spawning, the coordinator itself (1) rewrote CONTENT-PLAN §4 to the settled spec, **explicitly superseding an old "No click logging at this rung" line**, and (2) wrote the chooser page `prototypes/wireframe/index.html`. That way both builders read consistent docs and neither had to touch a shared file.

### C-1. Packet W-A: build Team A's wireframe (coordinator → `companion-builder`, 2026-08-22T04:14:20Z). Full text.
~~~~text
TASK PACKET W-A — Build Team A's wireframe prototype (the strong team's turn-in).

Working directory: /Users/jones/Documents/Claude/Projects/teaching skills

## Read first
1. companion/ARCHITECTURE.md (esp. §2 honest-fiction, §6 prototypes, §8 quality gates)
2. companion/CONTENT-PLAN.md (§4 wireframe station brief — NOTE: its "no click logging at this rung" line is SUPERSEDED by this packet's spec, which requires click recording; §8 boilerplate for the prototype banner wording)
3. companion/studies/01-card-sort.html — Report A only: its analysis, the five-category decision table, the lesson-moment decision, and element 5 (what's ignored). Report A is binding on you.
4. companion/studies/01-card-sort-data.py — the CARDS dict maps card numbers C01–C24 to real skill ids; the pair/cluster stats.
5. assets/lang/eng/skills-data.js — the real 53-skill inventory (READ ONLY — never modify).

## Fiction framing
This artifact is Team A's wireframe turn-in in the companion's example chain — the team whose card sort scored 60/60 and whose decisions bind the redesign. It is a REAL, working artifact. The next study (tree test) will run against it, and its bonus test mode becomes that study's instrument.

## The assignment spec the artifact must satisfy (Team A hits every requirement, skillfully)
- Working website, no build step, self-contained under companion/prototypes/wireframe/team-a/ — deployable as static files.
- True wireframe fidelity: black/white/gray ONLY, ONE font (use a plain Helvetica/Arial system stack), generic boxes, no imagery, no color anywhere — style links black-underlined so browser default blue never appears.
- Every information block appears. Team A generalizes beyond their 24-card deck to the FULL 53-skill inventory (the ambitious move; the redesign needs every skill placed).
- Two categorizations of the same blocks — single source, multiple views. At least two levels of hierarchy. Click-through navigation to select a block; a clear end state naming the block reached.
- Click recording with an exportable log (JSON and CSV).
- Bonus test mode (Team A does the full bonus): 10 task scenarios, randomized order per run, per-task timer, endpoint recording, persistent results reviewable later.

## Build requirements
1. **Files**: index.html + wireframe-data.js + app.js + wireframe.css (a single-page app with hash routing is the recommended shape — it makes "renders by selecting on attributes" literal and makes logging/test mode clean). All paths relative; no external resources except absolute links OUT to the real manual pages.
2. **wireframe-data.js** — `window.WIREFRAME_DATA`, the single source: all 53 skills, each `{ id, name (verbatim from skills-data.js), url (real manual url), category, group, moment: [...] }`.
   - `category` is exactly one of the five from Report A's table: "Getting people to talk", "Knowing and loving the people you teach", "Teaching about Jesus Christ", "Getting ready before Sunday", "Keeping their attention". There is deliberately NO Spirit category (Report A's riskiest call; the tree test probes it — do not sneak one in).
   - `group` is an L2 subgroup label in harvested teacher language (invent 2–4 groups per category; plain words a Primary teacher would say, no manual jargon at L1/L2 — official skill names appear only at L3, per Report A's Cami decision).
   - `moment` ⊆ {opening, during, closing, after}, at least one per skill, assigned thoughtfully; all four moments must be non-empty.
   - Binding placements from the card sort (use CARDS in 01-card-sort-data.py to map): the discussion cluster C11/C12/C14/C21 stays together in one group under "Getting people to talk"; C01+C05 (8/8 pair) stay together under "Teaching about Jesus Christ"; C08+C10 stay together under "Knowing and loving…". The other 29 non-deck skills you file by judgment consistent with the scheme.
3. **Rendering rule (the exhibit)**: every page renders by selecting on attributes from WIREFRAME_DATA. No skill hand-placed in HTML anywhere.
4. **Two views from home**: (a) category view — L1: the five categories → L2: group pages → L3: skill page; (b) moment view — L1: the four lesson moments → L2: that moment's skills grouped under their category headings → L3: the same skill pages. Both views reach all 53 blocks. L3 skill page = verbatim skill name, its category/group/moment shown plainly, generic placeholder boxes standing in for content, an absolute link to the real manual page, and back navigation.
5. **Click recording**: every navigation click appends `{t, from, to, label}`; persists in localStorage across sessions; a log view (#log) lists entries with Export JSON, Export CSV (blob download), copy-to-clipboard fallback, and a clear-log control.
6. **Test mode** (#test): intro screen → 10 scenarios authored by you AS TEAM A — short, concrete teacher situations drawn from the card-sort material's world (Saturday-night prep panic, a class that won't talk, a student question you can't answer, keeping seven-year-olds engaged, following up on an invitation, etc.), each with a defined correct/expected endpoint skill recorded in the data. Flow per run: tasks shuffled → scenario shown → OK starts timer and click capture → participant navigates from home → reaching ANY L3 skill page ends the task, recording {taskId, endpointSkillId, expectedSkillId, seconds, path[]} → brief "recorded" interstitial → next task → summary at the end. Runs accumulate in localStorage under distinct run ids with timestamps; a #results view lists all stored runs (per-task endpoint vs expected, time, path length) and exports JSON/CSV. While a test run is active, suppress/segregate normal #log recording so the two instruments don't cross-contaminate.
7. **Prototype banner + noindex** on the page (CONTENT-PLAN §8 wording, title: 2–3 level wireframe — Team A): links "Live site →" and "Back to the companion →" must resolve from the deployed path /companion/prototypes/wireframe/team-a/ (verify the ../ depth yourself). Do NOT load companion.js or companion.css. The banner is companion chrome and may carry minimal styling but must stay grayscale.
8. **Voice**: the artifact itself is mostly UI; any explanatory text on the home screen is Team A's plain, confident student voice (one or two sentences, e.g. what the two views are). No instructor commentary — that belongs to the future assignment page, not this artifact.

## Allowed files
Create/modify ONLY within companion/prototypes/wireframe/team-a/. Touch nothing else — not the registry, not the studies pages, not CONTENT-PLAN, not the teaching site.

## Self-check before reporting (definition of done, in addition to your standing one)
- Write and run a quick node script (in the scratchpad, not the repo) validating wireframe-data.js: exactly 53 skills, ids match skills-data.js exactly, every category one of the five, every group non-empty, every skill ≥1 moment, all four moments non-empty, binding clusters co-grouped.
- node --check on all JS; open the page over a local static server from a /tmp copy if needed (servers cannot read ~/Documents) and confirm: no console errors, both views reach a sample of skills, log records and exports, a full test-mode task can be completed.
- Grayscale audit: grep your CSS/HTML for color values; nothing outside black/white/gray.

## Report back
(1) files created, (2) each acceptance criterion → met/not-met, (3) the 10 scenarios you wrote (list them — the coordinator needs them for the future tree test), (4) your category/group filing choices for the 29 non-deck skills in one compact table, (5) deviations, (6) anything out-of-scope you noticed but did not fix.
~~~~

### C-2. Packet W-B: build Team B's wireframe with engineered flaws (04:14:50Z, run in parallel). Full text.
~~~~text
TASK PACKET W-B — Build Team B's wireframe prototype (the middle-of-the-road team's turn-in, with engineered flaws).

Working directory: /Users/jones/Documents/Claude/Projects/teaching skills

## Read first
1. companion/ARCHITECTURE.md (esp. §2 honest-fiction, §6 prototypes, §8 quality gates)
2. companion/CONTENT-PLAN.md (§8 boilerplate for the prototype banner wording)
3. companion/studies/01-card-sort.html — Report B in full (their 5-participant primed study, their analysis, their seven categories) and the grader's comments on it. Team B's wireframe must be THE SAME TEAM's work: same voice, same habits, same blind spots.
4. companion/studies/01-card-sort-data.py — the CARDS dict (C01–C24 → real skill ids/names/short handles).

## Fiction framing
This artifact is Team B's wireframe turn-in in the companion's example chain — the earnest, middle-of-the-road team whose card sort scored 31/60. The artifact will later be graded against the course's prototype rubric on the assignment page; its flaws are ENGINEERED to land in specific rubric bands. Critical tone rule: earnest, NOT parody. This must look like a real student team's honest hand-made wireframe — competent-ish, cut corners, no deliberate uglification beyond the specified flaws.

## The assignment spec Team B is (imperfectly) meeting
- Working static website, self-contained under companion/prototypes/wireframe/team-b/.
- Wireframe fidelity: black and white, one font, generic boxes.
- Every information block from their card sort appears; leaves are labeled placeholders.
- Two categorizations of the same blocks; ≥2 levels of hierarchy; click-through to a clear end state.
- Click recording with an exportable log.
- (Bonus test mode: Team B did NOT attempt it. Omit entirely.)

## Build requirements — including the engineered flaws (implement these EXACTLY; they are the point)
1. **Shape**: hand-authored multi-page static HTML — the anti-pattern to single-source rendering. Home page + one page per category + one page per manual section + one bare page per block. You may generate the pages with a scratchpad script, but what lands in the repo is plain static files with the blocks hand-placed in the HTML (duplicated across views — that duplication is what causes their drift flaw). A shared basic style.css and a small clicklog.js are fine (a real team would).
2. **Blocks — FLAW 1**: their deck was 24 cards, but the team pulled C03, C18, and C19 after their first participant found them confusing, and those three never re-entered the team's materials — so the wireframe contains only 21 blocks. Nothing on the site acknowledges this. Use the card SHORT HANDLES (from CARDS) as block titles — they never surface the verbatim official names anywhere (they didn't internalize that decision). Each block page: title, a "content goes here"-style placeholder box, a back link. No links to the real manual (they didn't think of it).
3. **View 1 — their seven categories**: Teaching Fundamentals, Spiritual Teaching, Engagement, Questions, Preparation, Love, Misc (exactly the list from Report B element 4). File the 21 blocks plausibly but with the team's characteristic arbitrariness: "Questions" and "Preparation" (their priming echo) get generous membership; "Misc" is a dump of ≥3 leftovers that plainly belong somewhere; one or two placements are defensible-but-odd. Every block appears somewhere in view 1.
4. **View 2 — FLAW 2**: "Browse by manual section" — the five real manual section names (Focus on Jesus Christ / Love Those You Teach / Teach By the Spirit / Teach the Doctrine / Invite Diligent Learning), i.e. the existing organization their own study concluded "nobody really understands." Section pages list their blocks alphabetically. AND: two blocks that exist in view 1 (pick C10 and C22) are silently missing from view 2 — hand-duplication drift. So view 2 does not reach every block.
5. **Hierarchy**: exactly 2 levels (home → category/section page → block). Meets the spec's floor, no more.
6. **Visual flaws — FLAW 3** (subtle, Word-paste realism): headings render in Times/Georgia while body text is Arial (two fonts); links are left browser-default (blue/purple — color creeping into a "black and white" wireframe); box borders inconsistent between pages (some 1px solid, some 2px, one dotted); a couple of centered headings; uneven margins. Stop there — no comic sans, no garish anything.
7. **Click recording — FLAW 4**: clicklog.js on every page appends clicks to a per-page in-memory array with a small visible counter; an "Export log" control (home page) shows a textarea with the CURRENT page's clicks only. Nothing persists across page loads — every navigation wipes the log, so the exported "sequence" is a one-page fragment. The team never noticed. (Implement it working-as-described; the flaw is the design, not broken code.)
8. **Home page text**: one or two sentences in Team B's earnest, hedgy voice (see Report B: "basically", "we feel like") introducing the wireframe and the two ways to browse. No self-awareness about the flaws.
9. **Prototype banner + noindex on EVERY page** (this is companion chrome, required regardless of team fiction): CONTENT-PLAN §8 wording, title: 2–3 level wireframe — Team B, with "Live site →" and "Back to the companion →" links resolving from the deployed path /companion/prototypes/wireframe/team-b/<page>.html (verify ../ depth). Keep the banner itself clean and grayscale — the banner is ours, not theirs. Do NOT load companion.js/companion.css.

## Allowed files
Create/modify ONLY within companion/prototypes/wireframe/team-b/. Touch nothing else.

## Self-check before reporting
- Exactly 21 block pages; C03/C18/C19 absent everywhere; C10/C22 present in view 1, absent in view 2.
- Every page carries banner + noindex; all internal links resolve (except the two engineered view-2 omissions, which are ABSENT links, not broken links — nothing 404s).
- node --check clicklog.js; load pages over a local static server from a /tmp copy (servers cannot read ~/Documents): no console errors; counter and export behave as specified.
- The flaws read as earnest oversights, not jokes.

## Report back
(1) files created, (2) each acceptance criterion → met/not-met, (3) your view-1 filing of the 21 blocks (compact table, flagging the odd placements and the Misc dump), (4) deviations, (5) anything out-of-scope you noticed but did not fix.
~~~~

### C-3. Verify W-B (04:21:07Z). Full text.
~~~~text
VERIFY TASK W-B — adversarial check of Team B's wireframe prototype. Fresh eyes; fix nothing; report PASS / FAIL / PASS-WITH-NITS with cited findings.

Working directory: /Users/jones/Documents/Claude/Projects/teaching skills

## What was built
Team B's example wireframe turn-in at `companion/prototypes/wireframe/team-b/` (36 files: index.html, style.css, clicklog.js, 7 cat-*.html category pages, 5 sec-*.html manual-section pages, 21 block-c*.html pages). It is the WEAK team's artifact in the companion's graded-pair fiction: its flaws are deliberate and specified. Your job is to verify it matches the packet exactly — including that the flaws that should be there ARE there, that no UNINTENDED flaws crept in, and that the companion's non-negotiables hold.

## The original task packet (verify against this)
- Fiction: Team B from companion/studies/01-card-sort.html (Report B, 31/60) — earnest middle-of-the-road team, NOT parody. Voice on home page: hedgy ("basically", "we feel like").
- Hand-authored multi-page static HTML; blocks hand-placed and duplicated across views; shared style.css + clicklog.js allowed.
- ENGINEERED FLAW 1: exactly 21 block pages — deck cards C01–C24 minus C03, C18, C19 (pulled mid-study), absent everywhere with no acknowledgment. Block titles use the short handles from companion/studies/01-card-sort-data.py CARDS (never verbatim official names; no links to the real manual). Block page = title + placeholder box + back link.
- View 1: exactly the seven Report B categories (Teaching Fundamentals, Spiritual Teaching, Engagement, Questions, Preparation, Love, Misc); every one of the 21 blocks filed somewhere; Questions/Preparation generously populated; Misc a dump of ≥3 that plainly belong elsewhere.
- ENGINEERED FLAW 2: view 2 = the five real manual sections, listing blocks alphabetically; C10 and C22 present in view 1 but silently ABSENT (not broken links) from view 2.
- Exactly 2 levels of hierarchy (home → listing page → block).
- ENGINEERED FLAW 3 (subtle, earnest): Georgia/Times headings vs Arial body; content links left browser-default blue/purple; inconsistent box borders across pages; a couple of centered headings; uneven margins. NOTHING beyond that — no parody.
- ENGINEERED FLAW 4: clicklog.js keeps a per-page in-memory click array with a visible counter; export control on home shows a textarea with the current page's clicks ONLY; nothing persists across navigations. Code itself must work as described (the flaw is the design, not a bug).
- No bonus test mode.
- NON-NEGOTIABLES: prototype banner (CONTENT-PLAN §8 wording, title naming Team B) + <meta name="robots" content="noindex"> on EVERY page; banner links resolve from deployed path /companion/prototypes/wireframe/team-b/ ("Live site" → site root = ../../../../, "Back to the companion" → ../../../index.html); no companion.js/companion.css loaded; no files touched outside team-b/ by the builder; all internal links resolve (nothing 404s); no console errors.

## How to verify
1. Teaching-site regression FIRST: `git status` / `git diff --stat` — confirm the only working-tree changes are companion/prototypes/wireframe/** (team-b/ plus a coordinator-authored index.html chooser and a coordinator edit to companion/CONTENT-PLAN.md — those two are expected and NOT the builder's), and nothing under the repo root pages or assets/ outside companion/.
2. Script the mechanical checks (block inventory vs CARDS, C03/C18/C19 absence, C10/C22 view-2 absence, banner+noindex on all 34 pages, link resolution).
3. Live-load a copy: servers cannot read ~/Documents, so rsync the repo (or just companion/) to /tmp and serve statically; click through home → category → block, home → section → block; exercise the click counter and the export control; check the console.
4. Judgment checks: does the artifact read as an earnest real student team (not a joke)? Do the flaws match the packet exactly — no extra flaws (e.g. actual broken links, JS errors) and no accidental competence (e.g. persistent logging)? Is the fiction marking right for a prototype (banner, noindex, no fiction-badges needed inside prototypes)? Does anything leak instructor/grader voice into the artifact?

## Report
PASS / FAIL / PASS-WITH-NITS, with findings cited by file:line, each finding labeled blocker / nit. List any packet requirement you could not verify and why.
~~~~

### C-4. Verify W-A (04:31:23Z). Full text. Note the "Accepted deviations (do NOT flag these)" line: the coordinator pre-approved the builder's own additions.
~~~~text
VERIFY TASK W-A — adversarial check of Team A's wireframe prototype. Fresh eyes; fix nothing; report PASS / FAIL / PASS-WITH-NITS with cited findings.

Working directory: /Users/jones/Documents/Claude/Projects/teaching skills

## What was built
Team A's example wireframe turn-in at `companion/prototypes/wireframe/team-a/` (4 files: index.html, wireframe-data.js, app.js, wireframe.css). This is the STRONG team's artifact in the companion's graded-pair fiction — it must fully satisfy the assignment spec with skill, and it becomes the instrument the tree-test study runs on, so its data decisions are binding on the chain.

## Verify against this packet
- Fiction: Team A from companion/studies/01-card-sort.html (Report A, 60/60, binding). Their five decisions govern: five harvested categories, deliberately NO Spirit category, harvested teacher language at L1/L2 with verbatim official names only at L3, moment as a cross-cutting attribute, pair clusters intact.
- Self-contained static SPA, no build step, all relative paths; only outbound absolute links are real manual URLs.
- **wireframe-data.js**: all 53 skills from assets/lang/eng/skills-data.js (ids, names, urls verbatim); category exactly one of: "Getting people to talk" / "Knowing and loving the people you teach" / "Teaching about Jesus Christ" / "Getting ready before Sunday" / "Keeping their attention"; a harvested-language group per skill; moment ⊆ {opening,during,closing,after}, ≥1 per skill, all four non-empty. Binding co-groupings: C11/C12/C14/C21 together; C01+C05 together; C08+C10 together (card→skill map in companion/studies/01-card-sort-data.py).
- **Rendering rule**: every page renders by selecting on attributes — no skill hand-placed in HTML.
- **Two views** from home, both reaching all 53: category view (home → category → group → skill) and moment view (moment → skills grouped by category → skill). Skill page = clear end state naming the verbatim skill, placeholder boxes, absolute link to the real manual page, back navigation.
- **Wireframe fidelity**: grayscale only, one font (Helvetica/Arial stack), no default blue links.
- **Click recording**: {t, from, to, label}, persists in localStorage, #log view with Export JSON, Export CSV, copy, clear.
- **Test mode** (#test): 10 scenarios with expected endpoints; per-run shuffle; OK starts timer; reaching any skill page ends the task recording {taskId, endpointSkillId, expectedSkillId, seconds, path}; interstitial; summary; runs persist under distinct ids; #results lists runs and exports JSON/CSV; test clicks segregated from the normal #log.
- **Banner + noindex**: CONTENT-PLAN §8 prototype banner naming Team A; "Live site" and "Back to the companion" links resolving from deployed path /companion/prototypes/wireframe/team-a/; no companion.js/companion.css.
- **Accepted deviations (do NOT flag these)**: a "give up" control ending a task with endpointSkillId null; ~1.1s end-state display before the interstitial with the clock frozen at arrival; category view being home → category page → group page → skill (4 documents, 3 levels); #log and #/log both routing; validator run with jsc instead of node.

## How to verify
1. Teaching-site regression FIRST: git status/diff — builder's changes must be confined to team-a/. (Expected working-tree state from others: M companion/CONTENT-PLAN.md and ?? untracked chooser index.html — coordinator's; team-b/ is already committed. Nothing outside companion/ may be modified.)
2. Re-run the data validation YOURSELF (script in scratchpad, jsc or python over the JS): 53 ids/names/urls byte-match skills-data.js; category membership; moments; the three binding co-groupings; no Spirit category anywhere in labels.
3. Live-load from a /tmp copy (servers can't read ~/Documents): crawl both views for 53/53 reachability; click a skill from each view; verify end state + manual URL; exercise the click log (record, persist across reload, export JSON+CSV, clear); run at least 3 test-mode tasks including one give-up; reload mid-run to check persistence; check #results content and exports; confirm log/test segregation; console must stay clean.
4. Fidelity audit: grep CSS/HTML/JS for any non-grayscale color and any second font; check computed styles on links.
5. Judgment: L1/L2 labels genuinely harvested teacher language (no manual jargon); scenarios read like real teacher situations in Team A's plain voice; no instructor/grader voice inside the artifact; banner wording matches §8; data judgment calls (e.g. C02 pictures-of-Christ filed under Keeping their attention) are defensible against Report A rather than contradicting a binding decision.

## Report
PASS / FAIL / PASS-WITH-NITS with findings cited by file:line, each labeled blocker / nit; list anything unverifiable and why.
~~~~

### C-5. Fix packet back to the *same* Team A builder via SendMessage (04:41:51Z). Full text.
~~~~text
Verifier returned PASS-WITH-NITS on W-A. The freeze rule means these get fixed NOW, before the tree test cites the artifact. Fix all four in companion/prototypes/wireframe/team-a/ (touch nothing else), self-verify live, and report back:

1. BLOCKING-ish UX defect — dead links on the run-summary screen. While test.phase === "done", the router guard (app.js:663-666) bounces every non-test route back to #/test, yet the summary shows an "all stored runs →" link and paintTestbar() restores the util nav ("Click log", "Results") because phase !== "running" (app.js:631). All three visible links do nothing until "Close this run" is clicked. Fix so that in the "done" phase those links work (e.g. let the guard admit log/results routes once the run is finished, or close the run automatically when the summary renders — your call, keep it clean).

2. End-state clock shows the literal "0.0s" during the ~1.1s arrival beat (paintTestbar writes 0.0s and render() clears the interval before its first tick — app.js:637-648 vs 684-692). Make the clock actually display the frozen elapsed time at arrival (recorded seconds are already correct; this is display only).

3. app.js:549 "1 seconds" — use your own plural() helper.

4. Mid-run reload: completed results persist (good) but the in-memory run is never rehydrated, so the participant silently lands back in normal browsing and their subsequent clicks leak into the normal click log. Since this artifact becomes the tree-test instrument, add graceful interruption handling: on boot, if a stored run is unfinished, show an explicit "your run was interrupted" state offering Resume (continue at the next task) or End run (mark it finished-incomplete). Either path must keep the log/test segregation guarantee intact.

Self-check: re-run your live pass on a /tmp copy — complete a run including a reload mid-run and a give-up, exercise all summary links in the done state, confirm console stays clean and everything still meets the original packet. Report files changed + what you verified.
~~~~

### C-6. Targeted re-verification via SendMessage to the *same* verifier (04:52:02Z). Full text.
~~~~text
The builder has applied fixes for your four nits in companion/prototypes/wireframe/team-a/ (app.js, one id in index.html, one .is-inert rule in wireframe.css; wireframe-data.js untouched). Do a TARGETED re-verification — fix nothing, report PASS/FAIL for each item plus any regression you spot:

1. Summary dead links: in the done phase, util nav ("Click log", "Results"), "all stored runs →", and a new "← Home" must all actually navigate, each exit closing the run cleanly. Builder also claims the same defect is now closed during brief/recorded/interrupted cards: on those cards the util nav is hidden and the title link inert, while during "running" the title stays a live path-recorded target. Verify both states.
2. End-state clock now shows the frozen elapsed time at arrival (not "0.0s"), matching the recorded seconds.
3. Plural fix ("1 second") in the summary AND in viewRecorded.
4. Interrupted-run handling: mid-run reload → explicit "interrupted" card owning the screen (no click-log leak — verify the log count stays flat while the card is up and that #/log bounces); Resume continues at the next situation; End-this-run files it as ended-early and restores normal browsing + logging. #/results distinguishes completed / ended early / still open.

Also spot-check no regressions: a normal full run still records correctly, both views still reach 53/53, console stays clean, grayscale/one-font audit unchanged, no files touched outside team-a/. Live-check from a /tmp copy (servers can't read ~/Documents). Report concisely.
~~~~

### C-7. Packet TT-1: synthesize the tree-test data as code (12:12:14Z). Full text.
~~~~text
TASK PACKET TT-1 — Invent the tree-test datasets for both example teams, AS DATA, plus the roster growth the study needs.

Working directory: /Users/jones/Documents/Claude/Projects/teaching skills

## Read first
1. companion/ARCHITECTURE.md §2 (honest fiction), companion/CONTENT-PLAN.md §5-6, §8.
2. companion/studies/01-card-sort-data.py — the reference for data discipline: invent the data as data, COMPUTE every aggregate, validate internally, so prose can never drift.
3. companion/prototypes/wireframe/team-a/wireframe-data.js — Team A's real tree (53 skills; category → group → skill; moment attributes) AND its 10 built-in task scenarios T01–T10 with expected endpoints. Your Team A data must be legal walks of THIS tree toward THESE endpoints.
4. companion/prototypes/wireframe/team-b/ — Team B's real structure: index.html + cat-*.html (their 7 categories) + sec-*.html (manual sections; missing C10/C22) + 21 block pages (C03/C18/C19 absent). Team B's data must be consistent with THIS artifact.
5. companion/ward.html — the roster (P01–P16) and the ID rules ("if a study needs someone new, the roster grows past P16; nothing above it moves"; light entries allowed).
6. companion/studies/01-card-sort.html — who the sorters were (Report A used P01, P02, P04, P05, P06, P07, P08, P13, P15; Report B used Margie, Curtis, Kade, Rylee, Cami by first name).

## Fiction context
The class assignment: a two-part report — Part 1 the wireframe turn-in, Part 2 a moderated think-aloud tree test run ON the team's own wireframe using its 10 built-in scenarios, 10+ participants, randomized task order, results table (first click + %, final destination + %, success %, give-ups, avg time), exportable raw logs. Team A = the strong team (their card sort was 60/60 and binding). Team B = the earnest weak team (31/60 card sort; their wireframe has engineered flaws: only 21 of 24 blocks — they pulled C03/C18/C19 mid-card-sort and never noticed the wireframe lacks them; second view missing C10/C22; per-page click log that resets on navigation; NO test mode).

## Deliverable 1: companion/studies/02-tree-test-data.py
One committed Python script (fixed random seed; runnable with python3; stdlib only) that DEFINES both datasets and COMPUTES/prints every number the report page will use. Structure it like 01-card-sort-data.py: data literals up top, validation asserts, computed aggregates printed clearly.

**Team A dataset** — 11 participants, all fresh (no sorter overlap): P03, P09, P10, P11, P12, P14, P16 plus FOUR new roster members P17–P20 (you invent them; see Deliverable 3). Per participant per task (10 tasks × 11 runs): the shuffled task order, full click path (a legal walk of team A's tree: home → category/moment L1 → group/moment page → skill), first click, endpoint skill id, seconds (one decimal; plausible: ~8–45s successes, longer on struggles), gave_up flag. Engineer these findings and let every aggregate fall out of the per-participant data:
- **T09 (the Spirit probe) fails hard**: participants hunt for a Spirit-like branch that deliberately doesn't exist. First clicks scatter (mostly "Teaching about Jesus Christ", some "Knowing and loving…"), success ≈ 3–4 of 11, 2–3 give-ups, longest times. This is the finding that conditionally reopens Report A's riskiest call.
- **T04 (sensory-objects filed under "Keeping their attention")**: splits by entry view — moment-view users succeed, topical browsers first-click "Teaching about Jesus Christ" and some recover. Success ≈ 7 of 11. Validates the moment attribute; suggests cross-listing.
- **One prep-category task (T01)**: high success but first clicks split between the two prep groups ("Getting yourself ready" vs "Planning the lesson") — subcategory labels not distinct enough; several backtracks, still found.
- The other 7 tasks: strong (8–11 of 11), individual wobbles, one or two mild surprises of your own design (e.g., one participant consistently uses the moment view for everything). Overall success lands ≈ 75–80%; total give-ups ≈ 3–4, concentrated on T09.
- Compute per task: first-click mode + %, destination mode + %, success %, give-ups, mean time; plus overall success, and A's predicted-first-click hit rate (the team predicted first clicks; make predictions right on ~7 of 10 — wrong on T09, T04, and the prep split, which is exactly where the learning is).

**Team B dataset** — 6 participants by first name, THREE of whom were their own card-sort participants (Margie, Cami, Kade — primed people, a method error) plus three new first-names consistent with ward canon (invent light ones). Their protocol errors, baked into the data's SHAPE:
- They wrote their 10 tasks the week of the test (no test mode existed). THREE tasks quote their own category labels nearly verbatim (label-echo; those tasks "succeed" trivially). ONE task's correct answer is C18 — a block their wireframe doesn't contain; all six participants fail or wander, and the data can't say why (the team never realizes).
- No give-up option: participants clicked until they landed somewhere, so every task "ends" somewhere and long wander times masquerade as completions.
- Hand-recorded: first clicks missing for the first two participants ("forgot to write it down"); times are rough ("~30", "45ish") — represent as strings/None where missing so the aggregates are honestly holey.
- Success overall ≈ 40–45% against their own answer key (which itself mis-keys one task). Wrong first clicks concentrate on "Misc" and "Questions".
- Compute the same table columns where computable; print gaps as gaps.

**Validation asserts**: every A path is a legal edge-walk of A's tree; every A endpoint exists in wireframe-data.js; A task ids/expected endpoints match the wireframe's TASKS; B references only blocks that exist in team-b's 21 (except the C18 answer-key entry, asserted ABSENT); participant sets match the roster rules above.

## Deliverable 2: companion/studies/02-tree-test-raw-team-a.csv
Team A's "exported raw log," emitted by the script — EXACTLY the wireframe test-mode export schema: header `runId,startedAt,finishedAt,taskId,scenario,expectedSkillId,endpointSkillId,asFiled,seconds,clicks,path` — one row per task per run, 110 rows, path serialized as `a > b > c`. startedAt/finishedAt: invented ISO timestamps across 2–3 November 2026 evenings (the ward fiction is set Nov 2026). Give-ups: blank endpointSkillId. This file is what the report links as "the raw logs." (Team B has no such file — their raw data is a messy typed fragment; just PRINT a short plausible version of it from the script for the page builder to paste.)

## Deliverable 3: roster growth in companion/ward.html
Add P17–P20 as LIGHT roster entries in ward.html, following the page's existing entry format and canon exactly: one calling each, nothing in Primary changes, no number pinned to Primary's old class length, set Nov 2026, consistent tone. They are tree-test participants: pick callings/personas plausible for "teachers or future teachers in the corps of 26" not already represented. Match the existing light-entry markup precisely; do not renumber or edit P01–P16; do not touch anything else on the page.

## Allowed files
companion/studies/02-tree-test-data.py, companion/studies/02-tree-test-raw-team-a.csv, and the roster additions in companion/ward.html. Nothing else. Do not touch the wireframes (they are about to freeze), the registry, or 01-card-sort files.

## Self-check
Run the script; all asserts pass; CSV parses (csv module) with 110 data rows; every printed aggregate matches a hand-spot-check; ward.html still valid HTML with P17–P20 rendering like their neighbors.

## Report back
(1) files created/modified; (2) the full printed aggregate tables for BOTH teams (the page builder consumes these verbatim); (3) the four new roster members (id, name, calling, one-line persona); (4) Team B's printed messy-raw-data fragment; (5) the engineered findings list with the numbers that landed (T09/T04/T01 etc.); (6) deviations; (7) anything out-of-scope you noticed.
~~~~

### C-8. Packet TT-2: author the combined report page (12:31:29Z). Structure plus key excerpts.
Sections: `## Read first` (7 files, including "RUN IT … EVERY number in your prose and tables must come from that output; invent no numbers") · `## The assignment being modeled` · `## THE PROTOTYPE RUBRIC` (all band text inlined verbatim, so the builder quotes it exactly) · `## Page structure` · `## Report A content directives` · `## Report B content directives` · `## Grading directives` (score anchors: A 60+60, B 34+31) · `## Marking + mechanics` · `## Allowed files` (`companion/studies/02-tree-test.html ONLY`) · `## Report back`.
~~~~text
TASK PACKET TT-2 — Author companion/studies/02-tree-test.html: the combined "wireframe + tree test" example page — two complete two-part team reports, both graded.

Working directory: /Users/jones/Documents/Claude/Projects/teaching skills

## Read first
1. companion/ARCHITECTURE.md (§2 fiction marking, §7 voice) and companion/CONTENT-PLAN.md (§4 updated wireframe brief, §6 study-page template, §8 boilerplate).
2. companion/studies/01-card-sort.html — THE reference implementation. Copy its conventions exactly: overall skeleton, companion.css classes (.docpage/.docpage--a/.docpage--b, .grader, .scorecard, .study-table, .fiction-badge, .inline-quote, .section-note), the "white pages are the report / red is the grader" convention stated out loud, docpage typography (A = Calibri-look with blue Word headings; B = Times New Roman with bold-underline headings), scope note, and the closing "what separates the scores" synthesis. Note the page loads companion.js/css and gets the banner injected — yours must too.
3. companion/studies/02-tree-test-data.py — RUN IT (`python3 companion/studies/02-tree-test-data.py`) and consume its printed output. EVERY number in your prose and tables must come from that output; invent no numbers. Read its header comments too.
4. companion/studies/02-tree-test-raw-team-a.csv — Team A's raw log (110 rows, real test-mode export schema). The page links it as Report A's raw-data appendix.
5. companion/prototypes/wireframe/team-a/ and team-b/ — the two real artifacts the reports describe and link to. Also read team-a/wireframe-data.js for the 10 task texts + expected endpoints (Report A's task table quotes them verbatim).
6. user-study-rubric.md at the repo root — the Part 2 grading instrument; grader boxes quote its band language VERBATIM.
7. companion/ward.html — participant canon (P03/P09/P10/P11/P12/P14/P16 + new P17–P20 for Team A; personas matter: P11 Nathan Kim the all-moment navigator, P09 Wes Purdy the convert who struggled, P16 Garrett Nakamura fast-and-wrong).
~~~~
[…]
~~~~text
## Page structure (follow the card-sort v5 lesson: NOTHING before Report A except a scope note + a 3-sentence assignment summary)
1. Scope note (what's real: the two wireframes, this page's design decisions, the chain; what's invented: every participant, session, quote, number).
2. Assignment summary in EXACTLY 3 sentences (the two-part report, what's turned in, how it's graded: Prototype Rubric 60 + User Study Rubric 60 = 120).
3. **Report A** — Team A's turn-in on .docpage--a sheets, "FROM THE TURNED-IN REPORT" tags: Part 1 (link to ../prototypes/wireframe/team-a/ + rationale paragraph citing their card sort: five harvested categories, no Spirit, moment attribute, clusters intact, verbatim names at L3, all 53 blocks) with grader boxes per prototype-rubric criterion + Part 1 scorecard; then Part 2's eight elements with grader boxes per user-study-rubric criterion (grouped as the card-sort page does) + Part 2 scorecard.
4. **Report B** — same shape on .docpage--b sheets: Part 1 (link to ../prototypes/wireframe/team-b/ + hedgy rationale: "we feel like our seven categories cover everything and match the manual while still being about problems") + grading; Part 2 elements + grading.
5. **What separates the scores** — synthesis.
6. Shared appendix only if needed (the raw CSV link lives in Report A itself).

## Report A content directives (strong-team voice: plain, numbers-forward, owns deviations)
- Task table: all 10 verbatim scenarios + expected endpoints from wireframe-data.js, plus predicted first clicks and per-set rationale (2 per category; T09 deliberately probes the missing Spirit category; T04 probes the attention filing).
- Participants: the 11 (P-ids + names + callings), recruitment sentence, explicit "none of our card-sort participants" line.
- Results table exactly per spec columns; **T09's destination row shows both numbers plainly: "3 reached the right block / 3 gave up — no modal destination"** (no silent tie-breaking).
- Prediction exercise: **lead with "our three misses are exactly the three findings"** (T01, T04, T09).
- Listening notes: half a page — what think-aloud caught that the log can't: e.g., what people SAID while hunting for a Spirit branch (invent 2–3 INVENTED QUOTE-badged lines consistent with personas), Wes Purdy hearing the vocabulary for the first time, Garrett fast-and-wrong never doubting.
- Analysis: first-click diagnosis per the method page — T09 (scatter + give-ups + 88.8s + 19 backtracks → the structure lacks a home people look for), T04 (splits by entry view; moment users 2 clicks), T01 (second-click split between prep groups, 20.1s vs 47.9s, all four crossed over), moment-vs-category aggregate stated WITH its calibration caveat (22 vs 88 runs — "we are not claiming significance"), most-seductive-wrong-branch named per failed task.
- Decisions: cited "Because…we will…" — e.g., conditionally reopen the Spirit question for v1 (the condition Report A set has been met); cross-list/relabel the T04 skill; make the two prep group labels distinct; KEEP the five categories and the moment attribute (evidence-backed keeps); hand open items to prototype v1.
- What we're ignoring: e.g., the moment-view superiority signal (n too small; watch in v1's logs), Wes's vocabulary struggles beyond what Cami already taught them, etc.
- Raw logs: real link to 02-tree-test-raw-team-a.csv, with a one-line schema note; state the table is derivable from it. Also note the UTC timestamps honestly (the export stamps UTC; sessions were Mountain-time evenings Nov 2–3, 2026).
- One sentence somewhere noting A's endpoints are manual skill ids while B's are card numbers — different decks, not an error (place where a reader would naturally wonder, or in the synthesis).
~~~~
[…]
~~~~text
## Grading directives (grader voice: warm HCI teacher, second person, names the strength before the deduction, quotes band language VERBATIM, ends deductions with the concrete fix; notes Team B's growth since the card sort where honest)
Scores free-land per the constructed record; use these anchors unless the evidence you've assembled honestly demands otherwise:
- **A Part 1: 18/13/13/16 = 60** (+ a grader line crediting the bonus test mode, which became this very study's instrument). Cite artifact specifics (53/53 in both views, attribute-driven rendering, exports, give-up option, interrupted-run handling).
- **A Part 2: 15/20/25 = 60.** Methods full (11 recruited, fresh, clean protocol, randomized, give-up option). R&A full — highlight the calibration exhibits (the tie reported as a tie; the moment-view claim explicitly not oversold; raw CSV the table derives from). DD full — the conditional reopen of the Spirit call is the chain working exactly as designed ("Report A named the condition; the tree test met it; the decision reopens").
- **B Part 1: 9/10/7/8 = 34.** Functional Beginning 9 (three blocks absent, second view missing two more, click log resets every page — spec behaviors missing; cite specifics incl. the block pages' single back-link dead-ending section-view users). Visual Competent 10 (two fonts, default blue links, inconsistent borders — "choices made without full intention" at a fidelity that banned color). IA Beginning 7 (Misc dump, arbitrary filings, alternate path their own data rejected AND that fails to reach every block). Grounded Beginning 8 (categories are the priming echo; rationale claims manual-alignment their own card-sort analysis contradicted).
- **B Part 2: Methods 10, R&A 13, DD 8 = 31.** Methods Developing near the floor (6 of 10+ = "more than half…but not all"; primed re-used participants; no give-up; fixed order; tasks written test-week with label echoes; grader also names what the team can't see: two tasks the key itself breaks, one keyed to a block their wireframe doesn't contain). R&A Developing with the over-claiming cap quoted; holey capture (first clicks 40/60); raw data present but "incomplete or hard to connect." DD Beginning 8 ("decisions ignore or contradict the data" — feeling good about categories at 41.7%); grader names the one decision that ALMOST works and shows the "Because…we will…" repair, and credits genuine growth since the card sort (they captured times, they typed up notes, they disclosed honestly).
- Scorecards: Part 1 + Part 2 + a combined 120-pt line per team (A 120/120, B 65/120).
- **The bridge is the synthesis centerpiece**: both teams put the same situation to participants (A's T09, B's B10). A measured 3/11 with 3 give-ups and reopened a design decision; B keyed it wrong, marked all six failures, and blamed the wording. Same moment, opposite epistemics — that's what separates the scores.

## Marking + mechanics
- Page loads ../assets/companion.css and ../assets/companion.js exactly as 01-card-sort.html does (banner + arc nav render from the registry — do NOT hand-build prev/next).
- .fiction-badge on every invented table/number-block; INVENTED QUOTE variant on quotes; the scope note up top. Participant names/ids consistent with ward.html.
- Word-PDF sheet conventions per the card-sort page, including the stated "white pages are the report; red is the grader" convention line.
- Links that must resolve: both wireframes (../prototypes/wireframe/team-a/, ../prototypes/wireframe/team-b/), the raw CSV (02-tree-test-raw-team-a.csv), the live site (../../), fiction.html where the scope note points. NO dead links, NO fake external links (no pretend Google Docs URLs).
- A brief line in each report (or the summary) that the wireframes are now FROZEN — the test has run; refinements land in prototype v1.
- You may draft with a scratchpad generation script, but commit only the static HTML. Page will be long (the card-sort page is ~1140 lines); that's expected. Valid HTML, no console errors, verify over a local server from a /tmp copy (servers cannot read ~/Documents).

## Allowed files
companion/studies/02-tree-test.html ONLY (plus scratchpad). Do not touch the data script, the CSV, ward.html, the wireframes, the registry, or CONTENT-PLAN (coordinator owns those).
~~~~

### C-9. Verify TT-1 + TT-2 (12:52:54Z). Key excerpt: the checks list.
~~~~text
## Checks
1. **Teaching-site regression FIRST**: git status/diff — expected working-tree changes are ONLY: new studies/02-tree-test-data.py, studies/02-tree-test-raw-team-a.csv, studies/02-tree-test.html; modified companion/ward.html. Root site untouched, zero companion links from it.
2. **Data reproducibility**: run the script twice; asserts pass; stdout and CSV byte-identical across runs; CSV parses, 110 rows.
3. **Numbers audit (the core check)**: every number on the page — task tables, results tables, percentages, times, scorecard totals, prose claims (e.g., T09 3/11 + 3 give-ups + 88.8s + 19 backtracks; 77.3% overall; 7/10 predictions; prep split 5/4 with 20.1s vs 47.9s; moment 95.5%/27.9s vs category 72.7%/33.4s; B's 41.7%, 18/18 label-echo, 0/12 broken keys, first clicks recorded 40/60) — must trace to the script's printed output or be arithmetic on it. Also independently confirm a sample of ~10 aggregates directly from the CSV. Flag ANY number with no source.
4. **Cross-artifact consistency**: A's task ids/scenarios/expected endpoints match team-a/wireframe-data.js verbatim; every A path in the CSV is a legal walk of A's tree; B's report references only blocks that exist in team-b/ (except B07's key C18, which the page's GRADER — not the team — must identify as absent from the wireframe); participants match ward.html (P-ids, names, callings; P17–P20 present; no overlap with Report A's card-sort participants P01/P02/P04/P05/P06/P07/P08/P13/P15; Team B's Margie/Cami/Kade overlap is the INTENDED error and must be caught by the grader, not silently normalized).
5. **Rubric integrity**: band language quoted verbatim from user-study-rubric.md; prototype-rubric quotes match the bands given above; scores sum correctly (A 18+13+13+16=60, 15+20+25=60, 120; B 9+10+7+8=34, 10+13+8=31, 65); every deduction's cited band actually fits the constructed evidence; the over-claiming cap applied to B's R&A.
6. **Fiction audit**: banner loads via companion.js; .fiction-badge / INVENTED QUOTE stamps on every invented dataset/quote; scope note accurate (real: wireframes, decisions; invented: participants, sessions, numbers); Report A's element-1 badge correctly qualified (scenarios/blocks real, predictions invented); ward.html count-sentence edits internally consistent; no invented material presented as real anywhere.
7. **Live checks** (rsync to /tmp, serve statically — servers can't read ~/Documents): page 200s, console clean, banner + arcnav render (arcnav will show tree-test per current registry status "draft" — note what renders), all internal links 200 (both wireframes, raw CSV, ward, fiction, hub, live site), no horizontal overflow at 375px, docpage--a vs --b typography differs as specified.
8. **Voice + recipe judgment**: A plain/numbers-forward; B earnest-hedgy, errors disclosed innocently, NOT parody, B never self-diagnoses B07/B10 (only the grader does); grader warm, strength-before-deduction, concrete fixes, credits B's growth since the card sort; the T09-vs-B10 bridge lands in the synthesis; the freeze is stated; the skill-id-vs-card-number sentence present; 3-sentence summary is exactly 3 sentences; nothing before Report A except scope note + summary.

## Report
Verdict + criteria table + blockers/nits with file:line + the fiction audit tally + anything unverifiable and why. Do not fix anything.
~~~~

### C-10. Fix packet after the verifier FAIL (13:05:20Z, SendMessage to the same page builder). Full text.
~~~~text
Verifier returned FAIL on 02-tree-test.html — nine prose claims contradict the artifacts, all in Report A's prose/grader boxes plus one Report B grader claim. Your structure, tables, rubric arithmetic, fiction marking, and links all PASSED; every fix below is a sentence-level correction against 02-tree-test-data.py's existing output and the CSV. Fix all blockers + the listed nits in companion/studies/02-tree-test.html ONLY, re-derive each corrected number yourself from the script/CSV before writing it, and report back with the exact before/after for each.

BLOCKERS (line numbers from the verifier's read; re-locate as needed):
1. :404 and :914 — "five different blocks"/"five distinct wrong endpoints" for T09's misses. There are FOUR distinct wrong endpoints (021.title_number2 twice — P12 and P20 — plus 009.title_number2, 008.title_number1, 024.title_number1). :914 is worse: the grader claims to have re-derived it. Correct both; the grader's re-derivation must actually hold.
2. :466 — Garrett is the SECOND fastest (20.1s); Bryce Tuckett P14 averages 18.1s. Fix the superlative.
3. :471 — "never backed out of a group" is false: Garrett's T01 path backs out of "Planning the lesson", and :615 counts him among the four who crossed over. Reconcile (drop or rewrite the claim).
4. :433–435 — Marlo Wheeler's wander is reversed: the log shows TWO groups under Christ, then ONE under "Knowing and loving…". Fix the narrative to match the path.
5. :774–776 — "8 of 10 tasks had the intended category as their most common first click" — it's 9 of 10 (only T04 fails). This is the cited evidence for Decision 4, so the citation must be right.
6. :824 — "What the prophets say" was visited TWICE in 110 runs (Reed Mangum lost on T09; Aubrey Delgado on T03, who then succeeded). Rewrite the inference so it survives the second visit or qualify it.
7. :625 — "T01, T02 and T05 each lost exactly one run… in every case to a neighbour in the correct group": T02's miss (Garrett → 029.title_number1) landed in "Not answering it yourself", NOT the correct group. Fix (and it must stay consistent with the listening note at :469).
8. :1056 — Report B grader's real-artifact claim "centered on the home page and left-aligned everywhere else" is false: h1.ctr also appears on cat-preparation.html and cat-questions.html. Narrow to "the home page and two of your seven category pages" (verify yourself) or drop.
9. :1297/:1348 — B's "Engagement only got one first click the whole study" is wrong per B's own notes (two: Shauna on B02 and B08). B's uncorrected error may STAND in the white pages (that's their character), but the GRADER quoting it must correct the count before making the n-point — the reader who checks the appendix must find the student wrong, not the page.

NITS to fix while in there:
- :625/:469 — "took the first block in it": 029.title_number1 is the fourth of five blocks in that group; drop the ordinal.
- :1394 — make the DD band quote verbatim: "decisions ignore/contradict the data".
- :1310 — grader's "six people spent an average of a minute and a half" on B07: the 97.5s mean is over 4 of 6 timed cells; qualify it the way B's own table discloses.
- Add the missing badges so A and B are symmetric: Report B elements 2.6/2.7 need the same .fiction-badge treatment as A's 6 and 7.

Do NOT touch the data script, CSV, ward.html, wireframes, or registry. After fixing: re-run your link/console check quickly, confirm no other sentence in the affected paragraphs depends on the old numbers, and report (1) before/after per finding, (2) any knock-on sentences you had to adjust, (3) confirmation the page still renders clean.
~~~~

### C-11. Packet TT-3: revise Report A per Mike's notes (19:33:39Z). Excerpts.
~~~~text
TASK PACKET TT-3 — Revise **Report A only** in companion/studies/02-tree-test.html per the instructor's editing notes. Tighten, bulletize, and make the results table scannable.

Working directory: /Users/jones/Documents/Claude/Projects/teaching skills

## Read first
- companion/studies/02-tree-test.html (the file you are editing; you wrote it)
- companion/studies/02-tree-test-data.py — run it; ALL numbers must still come from its output. You are re-presenting existing numbers, not recomputing new findings. No number may change.
- companion/prototypes/wireframe/team-a/wireframe-data.js — the real task texts and skill names.

## THE SHORT FORMS (use these exact strings, everywhere a task is named, in every section, table, grader box, and prose sentence — always as `T0n · Short form`)
- T01 · Saturday-night prep
- T02 · Nobody answers
- T03 · A question you can't answer
- T04 · Losing the seven-year-olds
- T05 · Following up an invitation
- T06 · The boy who never talks
- T07 · Noticed something good
- T08 · Making it about Christ
- T09 · Is it the Spirit?
- T10 · The first two minutes

Rule: a bare "T09" never appears again in Report A. Neither does a bare skill id.

## KILL ALL SKILL IDS IN REPORT A
Remove every `<code>NNN.title_numberN</code>` / `006.title_number1`-style id from Report A's prose, tables, and grader boxes. Replace with a human title. Where the block must be named, use a **short title** (see mapping below); the full verbatim skill names stay only in element 1's table. Exception: element 8 (raw log) may keep ONE id inside its schema example, since it documents the file's actual columns — keep that, drop the rest.
~~~~
[…]
~~~~text
**B. Part 1.2 — Design rationale (~line 92).** Cut **40%** of its length. Preserve every card-sort citation and every decision it names; cut elaboration, hedging, and restatement. ALSO: **de-emphasize the coverage claim.** The instructor's position: it matters that every block is filed *somewhere*; it does NOT matter that every block is reachable from *both* views, and the report should not treat dual-reachability as an achievement. So: state plainly that all 53 skills are filed, drop any boasting about "all 53 reachable from both views" / "53/53 in both" framing, and do not present dual coverage as a design goal met.
~~~~
[…]
~~~~text
**E. Element 3 — REBUILD the results table.** This is the important one: the instructor must be able to see at a glance **whether there was consensus** and **whether it matched prediction.** New columns, in this order:

| Task | Expected first click | Actual first click | Intended destination | Where they ended | Success | Gave up | Avg |

- **Task** = `T01 · Saturday-night prep`
- **Expected first click** = the team's prediction (from element 1)
- **Actual first click** = modal branch + count, then a match marker. If it matches the prediction, append `<strong>— as predicted</strong>`. If not, append `<strong>— predicted X</strong>`. If the clicks were spread (no majority, or 3+ distinct branches), add a short spread note, e.g. `spread over 3 branches`. Use these real distributions: T01 Prep 9 / After 2 · T02 Talk 10 / During 1 · T03 Talk 7 / Christ 2 / During 2 · T04 Christ 5 / During 4 / Attention 2 · T05 Prep 8 / After 2 / Opening 1 · T06 Love 9 / Talk 1 / During 1 · T07 Love 10 / After 1 · T08 Christ 9 / During 2 · T09 Christ 6 / Love 3 / During 2 · T10 Attention 6 / Opening 4 / Prep 1. Flag as spread: T03, T04, T09, T10 (top branch under two-thirds). Prediction misses: T01, T04, T09 (verify against element 1's predictions).
- **Intended destination** = short title from the mapping above
- **Where they ended** = modal destination as a short title + count, and say plainly whether it is the intended one, e.g. `Same — 10/11`. For T09 keep the honest tie: `No agreement — 3 reached it, 3 gave up, 5 ended on four different wrong blocks.`
- Success / Gave up / Avg = unchanged numbers.
Keep the intro sentence above the table short, and keep the closing "Overall" line (85/110, 77.3%, 4 give-ups, 32.3s, 3.4 clicks) plus the one-sentence defense of reporting T09's tie as a tie.

**F. Element 4 — Listening notes.** Cut to **HALF** its current length and convert to bullets. **Every invented quote must carry its own `<span class="fiction-badge">INVENTED QUOTE</span>` stamp** — the current section-level badge is not enough; match 01-card-sort.html's per-quote convention. Keep the strongest observations (what think-aloud caught that the log can't: the Spirit-branch hunting, the participant hearing the vocabulary for the first time, the fast-and-wrong participant never doubting). Name tasks with short forms.
~~~~
[…]
~~~~text
## Constraints
- **No number changes anywhere.** Scores stay 18/13/13/16 = 60 and 15/20/25 = 60, combined 120/120.
- Do not touch Report B, the shared header's scope note, the "what separates" synthesis, or any other file.
- Keep all existing classes/markup conventions (.docpage--a, .grader, .table-scroll, .fiction-badge, doc-stamp). Wide tables stay inside .table-scroll.
- Keep the raw-log link and its schema note working.

## Self-check
Run the data script and diff every surviving number against its output. Grep Report A for `title_number` (should hit only element 8's schema example) and for bare `T0` not followed by the short form. Serve from a /tmp copy: page 200s, console clean, no horizontal overflow at 375px, all links still resolve. Report back: (1) before/after word counts per edited section with % cut, (2) the new results table as rendered text, (3) confirmation no number changed, (4) per-quote badge count in element 4, (5) deviations.
~~~~

### C-12. Second-pass instruction when the builder under-cut (19:57:32Z, SendMessage). Full text. This is a model for "revise harder without losing evidence."
~~~~text
Good pass — Report B, the scope note and the synthesis are untouched as required, and the numbers audit is clean. Answering your open questions, then one more round.

Answers: (1) **Hit the targets — but not by dropping citations.** Preserving evidence was the right instinct; the problem is that you cut elaboration where you should have cut *narration*. (2) Leave the `.grader ul` `<style>` in the page head for now; the other agent's work has landed and I'll consolidate later. (3) Keep the one id you added in element 8's schema note — documenting the file's real columns is exactly the right place for it.

**Second pass — get elements 1.2, 5, 6 and 7 to their targets.** Measure against the ORIGINAL pre-TT-3 word counts: 1.2 was 470 (target ≈282), el5 1449 (≈870), el6 712 (≈427), el7 363 (≈218). You are currently at 361 / 1089 / 637 / 281.

Cut these, aggressively:
- **Narration of their own process.** Sentences about how the team felt, deliberated, argued, or decided to look at something. The finding survives; the story of arriving at it does not.
- **Transitions and framing.** "It is worth saying that…", "What this tells us is…", "The interesting thing here is…" — in a bulleted list these are pure overhead. A bullet can open with its claim.
- **Restatement.** Anything that repeats a number or finding already stated in element 3's table or an earlier bullet. Cross-reference instead of re-explaining.
- **Hedging and self-justification.** Keep the one genuine calibration caveat (moment-vs-category, 22 vs 88 runs, not claiming significance) — that one is load-bearing. Cut the rest.
- **Second halves of sentences** that gloss what the first half already said.

Do NOT cut: any cited number, any "Because [result], we will [decision]" clause, any of the six decisions, any finding, the calibration caveat, or the short-form task names.

Target shape for el5/el6: each bullet = a bolded claim, then its evidence in one or two tight sentences. If a bullet needs three sentences, it is probably two bullets or has narration left in it.

If a specific bullet genuinely cannot reach the target without losing a citation, leave it and name it in your report — but I expect most of the gap is narration, not evidence.

Report back: before/after/target word counts per section with % cut, confirmation that the count of cited numbers and decisions is unchanged (list them), and confirmation that no number changed. Do not touch anything outside Report A elements 1.2, 5, 6, 7 — I have edited Report B and the element 3 table since your last pass, so leave both alone.
~~~~

### C-13. Marked-up revised hierarchy packet (20:24:50Z, SendMessage to the same builder). Excerpts.
~~~~text
NEW TASK on companion/studies/02-tree-test.html — the instructor added a required element to the tree-test spec, and both reports must model it. You wrote both reports, so you have the context.

## The new requirement (now part of the assignment spec)
At the END of the "what we will change" / design-decisions section, each team must include a **marked-up text outline of their revised hierarchy**: an indented outline of the new IA with every change tagged inline (NEW / RENAMED from X / MOVED from Y / REMOVED); **L1+L2 shown in full, leaves listed only where a change touches them**; both organizational views included if changes touch both; every mark must trace to a decision. Graded within the existing Design Decisions criterion — **no rubric change, no score changes anywhere**.

## Edits

**1. The page lead (3-sentence summary).** Work the new element into the existing element list with minimal added words (e.g. "design decisions in the form "Because [result], we will [decision]" ending in a marked-up outline of the revised hierarchy"). The lead must stay exactly 3 sentences.

**2. Report A — end of element 6.** Add the outline on the same docpage sheet, after the six decisions, introduced by ONE short sentence in Team A's voice. Build it strictly from D1–D6 as they now read on the page — every mark must trace to one of the six decisions, and any branch with no mark is untouched:
- All 5 categories at L1 + all 15 groups at L2 (their real names from wireframe-data.js), unchanged parts unmarked.
- D1: the trial sixth L1 branch, tagged NEW — TRIAL, with its to-be-tested label exactly as D1 states it, and the T09 target skill ("Statements that help them recognize the Holy Ghost") listed under it as a leaf with a mark showing it is cross-listed, not moved (it stays in "Teaching about Jesus Christ › Bearing witness in class").
- D2: the sensory-objects block listed under BOTH of the two category›group paths D2 names, each occurrence tagged to show the cross-listing (e.g. "ALSO FILED under …"), consistent with D2's exact wording.
- D3: the two prep groups tagged RENAMED from "Getting yourself ready" / "Planning the lesson" to the new names D3 commits to (if D3 doesn't state the new labels, use the harvested-language names implied by its because-clause and keep them consistent with D3's text — adjust D3 minimally ONLY if it currently promises names it doesn't give, and report any such touch).
- D4: the leaves of "Asking so you get a real answer" listed with RENAMED marks per D4.
- D5/D6 (the KEEPs): reflected by absence of marks; end the outline with one line noting the lesson-moment view is unchanged (D6), so the "both views if changes touch both" rule is visibly satisfied.
- Wireframe fidelity: plain text outline (a <pre> or indented list consistent with the docpage look), FICTITIOUS DATA doc-stamp if the sheet's existing stamp doesn't already cover it.
~~~~
[…]
~~~~text
**4. Report B — end of Part 2.6.** Their outline, in their voice and formatting habits (Times-y sheet, slightly off), with FOUR engineered inconsistencies the team does not notice:
   a. Misc is tagged removed per their dissolve-Misc decision, C02 and C22 are shown refiled — but **C13 appears nowhere**: not refiled, not listed, silently gone (the same block-that-exists-in-no-view mistake that broke their task B07, now made a second time in the plan itself).
   b. One category renamed with a mark but **no decision supports it** (e.g. "Questions" tagged renamed to something catchier) — a change with no because.
   c. One label silently changed with **no mark at all** (e.g. "Engagement" appears under a new name as if it had always been called that).
   d. A "Search" entry added to the outline as if search were a category/branch — their "maybe add a search bar" decision leaking into the IA as a box.
   Only their category view appears; no note about the manual-sections view. Keep it SHORT and earnest — a real team's hurried outline, not a parody.

**5. Report B — Design Decisions grader box.** Extend the existing box (keep its current content and the 8/25 — no score change): the grader welcomes that the outline is there, then catches, concretely: C13 now exists in no view ("the mistake that broke B07, made again in the plan"); the marked rename with no because; the silent rename with no mark; search-as-a-box. Close with the teaching line that the outline is where vague decisions get found out — quote no new band language, the band already applied.
~~~~

### C-14. Canvas sync (`1210b924`, 08-25): the wireframe method page, three agent roles. Excerpts.
Opus "compare" agent, the wireframe page (02:17:07Z):
~~~~text
You are a compare agent for a Canvas-content sync. Do NOT edit anything on Canvas or in the repo; your only output is a report file.

CONTEXT: CS 356's IA project chain is settled locally as: card sort → wireframe + tree test (turn-in 2, 120 pts) → prototype v1 + task test → final. The wireframe assignment spec was settled with the instructor 2026-08-21/22. Local repo is truth; Canvas trails it. Authority order on conflict: companion/assets/studies-data.js > companion/CONTENT-PLAN.md > companion HTML pages > memory files.

YOUR TARGET: the Canvas "Low-fi Clickable Wireframes" prototyping-method page.
- Canvas dump: /private/tmp/claude-502/-Users-jones-Documents-Claude-Projects-teaching-skills/1210b924-ff81-4128-b921-c1d63937b178/scratchpad/canvas-dumps/low-fi-clickable-wireframes.txt
- Truth sources to read: "/Users/jones/Documents/Claude/Projects/teaching skills/companion/CONTENT-PLAN.md" (§4 wireframe spec), "/Users/jones/.claude/projects/-Users-jones-Documents-Claude-Projects-teaching-skills/memory/project_wireframe-assignment-spec.md" (includes the 2026-08-22 coverage-rule clarification: every block reachable in ONE view or another, NOT every block in every view), "/Users/jones/Documents/Claude/Projects/teaching skills/companion/prototypes/wireframe/index.html" (chooser page restating required features).

KNOWN CONTRADICTIONS (verify + detail): the Canvas page says "Pick and commit to an organization… for project 1 in this class, commit to one" — the settled spec REQUIRES two categorizations of the same blocks (single source, multiple views; PMEST offered as a lens for the second, not required to name facets). Page says "one or two levels of hierarchy" — spec requires AT LEAST two levels. Page references dead course structure ("P1 week 5 · P2 week 8", "Three candidate IAs in week 8 of P2", "P1's 'ward teacher prepping on a phone' brief"). Check also: B&W/one-font/generic-boxes fidelity language, every-block-present with labeled placeholder leaves and clear end state, click-through navigation, exportable click log (JSON/CSV), 10-scenario randomized timed persistent bonus test mode, coverage rule, grading (generic Prototype Rubric 18/13/13/16 = 60). Distinguish what belongs on this METHOD page vs what belongs in the assignment description (the assignment description will be written separately) — the method page must at minimum stop contradicting the spec; recommend how much assignment detail it should carry vs link out.
~~~~
Fable "writer" agent, the wireframe page ops (02:59:49Z):
~~~~text
You are a writer agent for a CS 356 Canvas-content sync. You write text; you do NOT touch Canvas or the repo. Scratchpad base: /private/tmp/claude-502/-Users-jones-Documents-Claude-Projects-teaching-skills/1210b924-ff81-4128-b921-c1d63937b178/scratchpad

READ FIRST: {base}/DECISIONS.md, {base}/compare/wireframe-page.md (change spec), {base}/imscc/wiki_content/low-fi-clickable-wireframes.html (live body HTML — FIND source). For settled wording read "/Users/jones/.claude/projects/-Users-jones-Documents-Claude-Projects-teaching-skills/memory/project_wireframe-assignment-spec.md" and CONTENT-PLAN §4 in "/Users/jones/Documents/Claude/Projects/teaching skills/companion/CONTENT-PLAN.md".

TASK: Ops file for the Low-fi Clickable Wireframes page. This page currently CONTRADICTS the settled spec; your rewrite of its "How to use it" section must land: TWO categorizations of the same blocks (single source, multiple views; PMEST offered as a lens for the second, naming facets not required) replacing "pick and commit to one"; at least two levels of hierarchy (count levels the way the Tree Test page does: category labels, then subcategory labels, then information blocks); every block from the team's card sort present, leaves as labeled placeholders with a clear end state; coverage rule = every block reachable in at least ONE view, not every view — dual reachability is not an achievement; B&W only, one font, generic boxes; click-through navigation; exportable click log (JSON or CSV) built in — this rung now records; bonus credit: the 10-scenario randomized, timed, persistent test mode (no point value — say "bonus credit"); this wireframe is Part 1 of the Wireframe + Tree Test Report (link https://byu.instructure.com/courses/36062/assignments/1439047), graded on the Prototype Rubric (Functional 18 / Visual 13 / IA 13 / Grounded 16 = 60). Remove all dead structure ("P1 week 5 · P2 week 8", "Three candidate IAs in week 8 of P2", the "P1 'ward teacher prepping on a phone' brief" claim — mobile-first stays as advice only, not a brief). Publish dateless — no scheduling text. Keep the conceptual half ("What it means", "Where it sits on the axis", the interactive, the links) unless a line contains dead structure. Follow the compare report's KEEP AS-IS list.
~~~~
[…] (then an Opus "applier" agent pushed FIND/REPLACE ops through the Canvas REST API from an authenticated browser tab, with MUST CONTAIN / MUST NOT CONTAIN verification.)

---

## (D) Verifier findings and how they were fixed

### D-1. Team B wireframe (W-B): **PASS**, 31/31 criteria, first try (04:25Z)
- Every engineered flaw was confirmed present and nothing unintended crept in, using leak scans for "rubric|grade|instructor|TODO|lorem|Team A|flaw" (zero hits). Absence of competence was also checked: "Zero `localStorage`/`sessionStorage`/`cookie`/`fetch`," "Zero `Math.random`, `setTimeout` … timer, or scenario code."
- Non-blocking observations: every block page has a single back link to its *category*, so users who arrived from the section view dead-end. It was left in as realistic hand-authoring drift and later cited in Report B's grading. `clicklog.js` reads `href` off `e.target` only.
- Builder deviation: `node --check` was not run because there was no node on the machine; it was verified live in the browser instead.

### D-2. Team A wireframe (W-A): **PASS-WITH-NITS**, no blockers, 4 nits (04:41Z)
| # | Finding (verifier, verbatim gist) | Fix (builder, 04:51Z) | Re-verify (04:59Z) |
|---|---|---|---|
| 1 | "Dead links on the run-summary screen": while `test.phase === "done"` the router guard bounces non-test routes back to `#/test`, yet "all stored runs →", "Click log" and "Results" are visible and do nothing (`app.js:663-666`, `:631`) | `inRun()` now excludes `done`; leaving the summary calls `closeRun()`; added `← Home`. **The builder also found the same defect one phase earlier** (brief/recorded cards) and fixed it with `paintChrome()`: util nav hidden, title inert | PASS, all four exits navigate and close the run; modal cards are inert, including to the keyboard |
| 2 | End-state clock showed the literal "0.0s" during the ~1.1s arrival beat | Arrival detection moved *before* paint; a single `elapsedSeconds()` backs the display, the tick and the record | PASS: display equals recorded seconds |
| 3 | "1 seconds" plural bug; the `plural()` helper went unused | Fixed in both the summary and `viewRecorded` | PASS |
| 4 | "A mid-run reload abandons the run": results persisted, but the run wasn't rehydrated and later clicks **leaked into the normal click log**. "since this becomes the tree-test instrument" | `persistRun` now stores `order`. On boot, `findUnfinishedRun()` → an `interrupted` phase with **Resume** / **End this run**; `#/results` shows completed / ended early / still open | PASS: log count stayed flat, resume preserved the shuffle order, no duplicate run |

Also from the first pass: the builder-added **give-up** control (`endpointSkillId: null`) and the 1.1 s end-state display had been pre-accepted by the coordinator. The verifier independently judged the C02 filing "defensible, not contradictory." The coordinator's reason for fixing nits right away, verbatim from C-5: "The freeze rule means these get fixed NOW, before the tree test cites the artifact."

### D-3. Tree-test station (TT-1 + TT-2): **FAIL** (13:04Z) → fixed → **PASS** (13:12Z)
The verifier's headline, verbatim: "The infrastructure is excellent — the data layer is genuinely reproducible, scope is clean, and I independently re-derived every results-table number from the CSV without using the script. But the prose contains **nine claims that contradict the artifacts the page insists are checkable**, and two of them sit inside grader boxes that explicitly claim to have re-derived the number."

| # | False claim in the prose | Truth (from the CSV / artifact) |
|---|---|---|
| 1 | T09 misses landed on "five different blocks" (also in a grader box that "re-derived" it) | **Four** distinct wrong endpoints (`021.title_number2` twice) |
| 2 | Garrett "the fastest participant" | Second fastest; Bryce (P14) 18.1s, 10/10 |
| 3 | Garrett "never backed out of a group" | He backs out once, on T01, and is counted among the four who crossed over |
| 4 | Marlo opened "two groups under 'Knowing and loving…'" | Two groups under *Christ*, then one under Love |
| 5 | "8 of 10 tasks had the intended category as their most common first click" (the evidence cited for Decision 4) | **9 of 10** (only T04 fails) |
| 6 | "What the prophets say" visited "exactly once" | Twice (Aubrey on T03, Reed on T09), so the inference had to be rewritten |
| 7 | T01/T02/T05 each lost one run "to a neighbour in the correct group" | T02's miss was one group *over* |
| 8 | Grader: Team B's h1 is "centered on the home page and left-aligned everywhere else" | Also centered on 2 category pages |
| 9 | Grader quotes B's "Engagement only got one first click" without correcting it | Two (Shauna, on B02 and B08); the student's error may stand, but the grader must correct it |

Nits: a non-verbatim rubric band quote; a B07 timing average that needed qualifying; badge asymmetry between A and B. The fix packet (C-10) demanded "re-derive each corrected number yourself from the script/CSV before writing it" and "report back with the exact before/after for each." During the fix the builder **self-caught a new error** ("nine of ten" → "ten of ten") by re-checking the CSV. The targeted re-verify passed all 9 plus the nits and ran "Old phrasings: all 11 return zero hits."

The TT-1 builder's own notable deviations, which the coordinator accepted: the T01 "prep split" is a **second-click** finding (the home page only offers categories and moments). Predicted first clicks were set so exactly T01/T04/T09 miss. Timestamps are left "honestly UTC" because the prototype uses `toISOString()`. Give-up is *derived* (a path not ending on `/s/`) rather than stored as a token, and a later page-builder initially misread that.

### D-4. Report A revision (TT-3): under-delivered, then a second pass
- Pass 1 (19:54Z) met every structural edit but reached only 23% / 25% / 11% / 23% cuts where Mike had asked for 40%. The builder stated this openly ("**Partly met**"). The coordinator's diagnosis, verbatim: "the problem is that you cut elaboration where you should have cut *narration*."
- Pass 2 (20:06Z) reached 38% / 39% / 30% / 35%. Element 6 was deliberately held at 30%: "every remaining word is a citation or a decision clause". The coordinator accepted that and told Mike why.
- The coordinator itself made the precision edits to Report B's coverage language (B-6.3), because "the builder currently holds `02-tree-test.html` … and two writers on one file is how work gets clobbered." It also changed the results-table markers to **MATCH/MISS** after judging "— predicted After class and during the week" ambiguous.

### D-5. Incidents outside the verifier loop
- **`launch.json` truncation** (`93243556`, the v1 build, 2026-08-23): with two builders running in parallel, "a malformed shell command truncated `.claude/launch.json` to zero bytes." The file was gitignored and unrecoverable. The builder disclosed it, the harness raised a security warning ("[Irreversible Local Destruction]"), and the coordinator restored the file from memory notes. The builders then fought over the file: "launch.json is being actively contended between agents." Lesson: shared local config belongs on the "never two agents on one file" list.
- **Concurrent human sessions**: during TT-3 another session (`f93df4e9`) was editing `companion.css`, `companion.js`, `studies-data.js` and more. The coordinator noticed ("the repo shifted under me"), kept its builder confined to one file, verified its page rendered with or without the other session's changes, and did not commit someone else's work until asked.
- **Commit message shell-evaluated**: a backtick in a commit message was expanded by the shell. The coordinator declined to force-push published history to fix one word.
- **Canvas rich-text editor** discarded a raw-HTML edit, and the Save button sat off-screen. It was solved by using the editor's API and later by switching to the REST API (Appendix 4 memory).

---

## (E) The instrumentation as built (file:line references)

All paths are relative to the repo root. Line numbers are from the working tree on 2026-09-24.

### E-1. Files
| File | Lines | Role |
|---|---|---|
| `companion/prototypes/wireframe/team-a/index.html` | 48 | Shell: prototype banner + `noindex`, top bar with util nav (`#/log`, `#/test`, `#/results`), `#testbar`, `#app`, loads `wireframe-data.js` then `app.js` |
| `…/team-a/wireframe-data.js` | 406 | `window.WIREFRAME_DATA`, **the single source** |
| `…/team-a/app.js` | 870 | Hash router, both views, click log, test mode, exports |
| `…/team-a/wireframe.css` | 205 | "Deliberately unstyled: one font, black on white, gray boxes. No color." Links forced `color:#000` + underline (lines 18–21) |
| `…/team-b/*` | 36 files | 34 static HTML pages + `style.css` + `clicklog.js` |
| `companion/studies/02-tree-test-data.py` | 1060 | Invented datasets as code; parses the real wireframes; asserts; emits the CSV |
| `companion/studies/02-tree-test-raw-team-a.csv` | 111 | 110 data rows in the test mode's export schema |
| `companion/studies/02-tree-test.html` | 1776 | Tree-test reports (links the CSV at :1066; schema note at :1071) |
| `companion/wireframe-report.html` | 536 | Since 09-01: wireframe turn-in reports (A 60/60, B 34/60), separate from the tree test |

### E-2. The data contract (`wireframe-data.js`)
~~~~text
window.WIREFRAME_DATA = {
  builtFor, source,
  categories: [ {slug, name} ×5 ],                     // lines 14–20; L1 of view 1; "no Spirit category"
  groups:     [ {slug, category, name} ×15 ],          // lines 23–39; L2, harvested teacher language
  moments:    [ {key, name, blurb} ×4 ],               // lines 42–47; view 2 is an ATTRIBUTE, "Not a sixth category"
  skills:     [ {id, name, url, category, group, moment:[...]} ×53 ],  // lines 50–369; name+url verbatim from the live site
  tasks:      [ {id:"T01".."T10", scenario, expect} ]  // lines 373–404; expect = the skill id "we filed the answer under"
}
~~~~
- Each skill has exactly one `category` + `group` (a single filing) and **one or more** `moment`s (a cross-cutting tag). The home page says so: "each one is filed under a single problem and tagged with every moment it fits, so nothing has to be put in two places" (`app.js:381-389`).
- The rendering rule is carried out by filter helpers `skillsIn/skillsInGroup/skillsAt/groupsIn` (`app.js:43-54`). No skill string appears in HTML or `app.js`; the verifier checked this with a grep count of `title_number|intro2|churchofjesuschrist` = 0.

| Task | Short form (used in reports) | Scenario (verbatim, trimmed) | Expected block | Why it's there |
|---|---|---|---|---|
| T01 | Saturday-night prep | "It is Saturday night and you have not opened the manual yet…" | 017.title_number2 | Prep; surfaced a second-click split between two prep groups |
| T02 | Nobody answers | "You ask the class a question. Nobody answers…" | 023.title_number1 | |
| T03 | A question you can't answer | "A teenager asks you a question about the temple…" | 026.title_number3 | |
| T04 | Losing the seven-year-olds | "You teach seven-year-olds and you are losing them…" | 006.title_number2 | **Probe** of the builder's tie-break filing under *Keeping their attention* |
| T05 | Following up an invitation | "Last week you invited your class to try something at home…" | 033.title_number1 | |
| T06 | The boy who never talks | "One boy sits at the back and never says a word…" | 014.title_number3 | |
| T07 | Noticed something good | "You noticed something good about a girl in your class…" | 015.title_number1 | |
| T08 | Making it about Christ | "Your lesson on honesty is turning into a school lesson…" | 004.title_number1 | |
| T09 | Is it the Spirit? | "A woman in your class says she can never tell whether a feeling is the Spirit…" | 020.title_number3 | **The Spirit probe**: tests Report A's riskiest call (no Spirit category). It failed as designed (3/11, 3 give-ups, 88.8 s) and reopened the decision for v1 |
| T10 | The first two minutes | "You want the first two minutes of your lesson to actually land…" | 027.title_number2 | |

The Team A builder wrote the scenarios as asked: "10 scenarios authored by you AS TEAM A … each with a defined correct/expected endpoint skill recorded in the data". Two per category. The T09/T04 probe design came from the builder, and the coordinator adopted it.

### E-3. Routes (`app.js` `render()`, lines 772–817)
`#/` home (two tile lists: "Start with the problem you are having" / "Start with where you are in the lesson") · `#/c/<cat>` category → groups · `#/g/<cat>/<group>` group → skills · `#/m/<moment>` moment → skills grouped under category headings · `#/s/<skillId>` **L3 end state** ("You reached this skill" + verbatim name, filed-under table, moment links, block id, 4 gray placeholder blocks, outbound manual link, 3-level back nav; `viewSkill` lines 451–501) · `#/log` · `#/test` · `#/results`.

### E-4. Click log (always on, outside test runs)
- Storage: `localStorage["wf.teama.log.v1"]`, capped at 3000 entries (`app.js:10-12`). `store()`/`save()` wrap localStorage in try/catch (`app.js:27-37`).
- **Event schema** `{ t, from, to, label }` (`logNav`, `app.js:89-94`). `t` is ISO-8601 UTC (`new Date().toISOString()`); `from` and `to` are hash routes such as `/c/talk`; `label` is the link's `data-label` or its text.
- Capture: one document-level click listener on `<a href="#…">` only. Outbound manual links are "not navigation" and are not logged. **While a test run is `running`, clicks go to the run's `path` instead; in other in-run phases they are dropped** (`app.js:269-287`). This is the "segregation" requirement.
- `#/log` view (`viewLog`, `app.js:517-549`) has Export JSON (`teama-clicklog-<stamp>.json`), **Export CSV** (header `n,t,from,to,label`, `logCsv` `app.js:551-555`, CRLF), a copy-to-clipboard fallback textarea (`offerCopy` `app.js:315-335`), and Clear (with a confirm). Downloads go through Blob + object URL (`download`, `app.js:290-300`).

### E-5. Test mode (the bonus, which became the tree-test instrument)
- Storage: `localStorage["wf.teama.runs.v1"]`. **Run record** `{ runId, startedAt, finishedAt|null, taskCount, order[], results[] }` (`persistRun`, `app.js:135-151`), written after every task so a crash loses at most the current task. `runId = "run-" + ISO-with-dashes + "-" + 5 random base36 chars` (`startRun`, `app.js:162-172`).
- **Result record** `{ taskId, scenario, expectedSkillId, endpointSkillId|null, correct, seconds, path:[{t,to,label}] }` (`finishTask`, `app.js:182-196`). `seconds` has 0.1 s precision from `elapsedSeconds()` (`app.js:129-131`), "One definition of elapsed time, so the clock on screen and the number we record can never disagree."
- Randomization: per-run Fisher–Yates shuffle of task ids (`shuffled`, `app.js:153-160`).
- **State machine** (`test.phase`, commented at `app.js:97-117`):
~~~~text
idle ──[Start a run]──► brief (scenario card, "OK — start"; timer not started)
brief ──[OK]──► running (sent to #/ home; testbar shows task, live clock, "I would give up")
running ──[reach any #/s/<skill>]──► clock frozen at arrival; 1.1 s beat showing the end state ──► recorded
running ──[I would give up]──► recorded (endpointSkillId = null)
recorded ──[Next situation]──► brief … (after the last task) ──► done (summary; run persisted with finishedAt)
done ──[any link out]──► closeRun() ──► idle      (summary exits must work — verifier nit #1)
boot: unfinished stored run (no finishedAt, has order) ──► interrupted
interrupted ──[Resume]──► brief at index = results.length (same runId, same order)
interrupted ──[End this run]──► finishedAt set ("ended early — N of 10") ──► idle
~~~~
- `inRun()` = interrupted | brief | running | recorded (`app.js:122-125`). While in a run but not `running`, the router forces `#/test` (`app.js:780-786`). `paintChrome()` hides the util nav for the whole run and makes the title link inert on modal cards (`app.js:727-738`). The testbar and clock are in `paintTestbar()` (`app.js:740-763`). Arrival detection sets `stopAt` **before** painting (`app.js:788-792`), and `finishTask` fires after 1100 ms (`app.js:811-815`). The boot hook is at `app.js:856-866`.
- Intro copy is calibrated for participants: "There is no wrong answer we are grading; we are testing our organization, not you. If you would give up in real life, press 'I would give up' — that is a result too." (`viewTestIntro`, `app.js:586-601`).
- `#/results` (`viewResults`, `app.js:656-703`) lists runs newest first, with per-task endpoint vs. expected, time and path length. Status is completed / ended early / still open. Export JSON/CSV plus copy and clear.
- **Runs CSV schema** (`runsCsv`, `app.js:705-720`), one row per task per run:
~~~~text
runId,startedAt,finishedAt,taskId,scenario,expectedSkillId,endpointSkillId,asFiled,seconds,clicks,path
~~~~
`asFiled` = `hit|miss`; `endpointSkillId` is blank on a give-up; `clicks` = path length; `path` = the `to` routes joined with `" > "`. A real row from the synthesized raw log:
~~~~text
run-2026-11-03T01-06-30-171Z-lxekp,2026-11-03T01:06:30.171Z,2026-11-03T01:19:31.503Z,T10,You want the first two minutes of your lesson to actually land instead of being announcements. Find something to open with.,027.title_number2,027.title_number2,hit,24.2,3,/c/attention > /g/attention/do-not-watch > /s/027.title_number2
~~~~

### E-6. Team B's instrumentation (the deliberate contrast)
`team-b/clicklog.js` keeps a per-page in-memory `clickLog` array of `{n, time: toLocaleTimeString(), page: document.title, text, href}`, a visible counter, and a TSV textarea export on the home page only. **It resets on every navigation**, so an exported "sequence" is a one-page fragment. There is no persistence (zero storage APIs) and no test mode. Also engineered in: two fonts (`style.css:4` Arial, `:11` Georgia), default blue links, three border styles (`:24/29/34`), uneven margins (`:66-69`), 21 of 24 blocks (C03/C18/C19 missing everywhere), and a second view missing C10/C22. Under the later coverage rule only the first omission counts against the team.

### E-7. The study data layer (`companion/studies/02-tree-test-data.py`)
- Header docstring (lines 1–26): "the *data* is invented, once, up top; every number the report page prints is COMPUTED from it here, so the prose can never drift from the appendix."
- **Parses the real artifact** instead of copying it. It regex-reads `wireframe-data.js` into categories, groups, moments, skills and tasks (lines 60–95) and asserts 5/15/4/53/10 (97–101). It reads the Team B directory listing and pages (105–130) and asserts 21 blocks, C18 absent, and C10/C22 missing from the section view (132–136). The TT-1 builder, verbatim: "if a wireframe ever moved, the script would fail loudly rather than drift."
- **Legal-walk validation**: `edges_from(route)` re-implements "Every hash a participant can click FROM this page, per app.js's views" (366–389). Every invented path is asserted to be a legal edge walk that ends at the first skill page (391–421).
- `SEED = 356` (line 41). Per-participant shuffled orders are asserted distinct (424–433).
- Emits the CSV in exactly the `runsCsv` schema, CRLF, with asserts of 110 rows and 11 runs (637–703). There is an honest UTC note: "a 6:05 p.m. MST start is written 2026-11-03T01:05Z. That offset is real and is left in rather than tidied away." (640–643).
- Team B's data carries its protocol errors in its *shape*: flags `echo` / `absent` / `miskey` (709–713), `None` for unrecorded first clicks, string times like "~30" and "45ish", and no give-up. Asserts at 831–858 include "the keyed answers: nine exist, one does not."
- Engineered outcomes that landed (Team A): overall 85/110 = 77.3%, 4 give-ups. T09 3/11 with 3 give-ups and 88.8 s. T04 7/11, split by entry view. T01 prep split 5 vs 4 (20.1 s vs 47.9 s). Predicted first clicks 7/10, missing exactly on T01/T04/T09 ("our three misses are exactly the three findings"). Team B: 25/60 = 41.7% against its own mis-keyed answer sheet.

---

## (F) Lessons and friction points (tutorial material)

1. **Interview before you build, and constrain the interview format.** Mike's first spec prompt ended with "ask me questions." Claude replied with a dense numbered list. Mike redirected: "no ask me one at a time with muliple choice options." The 13 answers that followed produced the spec. Three of his *typed* answers corrected assumptions the model had baked into its options: the spec is generic, not about this worked example; "has to run in a browser … all AI use is encouraged and expected"; "team writes them, and they need to write 10." *Student takeaway:* make the agent ask, make it ask one thing at a time, and don't just click the recommended option. Type your real answer when none of the options fits.

2. **Freeze the spec as a named document, then point at it.** "ok remember that spec as the wireframe spec." The build prompt (B-4.1) is five sentences because it names five persistent documents (delegation playbook, example recipe, architecture file, wireframe spec, rubric) plus the card-sort study. *Takeaway:* long context goes in files; prompts should reference them by name.

3. **Design the artifact for the next step in the chain.** The test mode isn't decoration. "the ones built into the wireframe should be the ones they use for this test. That's why they are in the wirframe." The packet says it up front: "The next study (tree test) will run against it, and its bonus test mode becomes that study's instrument." The export schema later became the study's raw-data format, byte for byte. *Takeaway:* tell the agent who or what consumes the output.

4. **State the data contract, not just the feature.** W-A didn't say "add logging." It said: "every navigation click appends `{t, from, to, label}`; persists in localStorage … Export JSON, Export CSV (blob download), copy-to-clipboard fallback, and a clear-log control." For test mode it named the recorded fields `{taskId, endpointSkillId, expectedSkillId, seconds, path[]}`. It also asked for **segregation**: "While a test run is active, suppress/segregate normal #log recording so the two instruments don't cross-contaminate." *Takeaway:* name the fields, the storage, the export format and the isolation rules.

5. **Single source, multiple views has to be *specified*, and it has to be *checkable*.** The requirement "every page renders by selecting on attributes … No skill hand-placed in HTML anywhere" came with a check: the verifier grepped `app.js`/`index.html` for skill ids and found 0. Team B's hand-authored duplication is the counter-example, and its view-2 drift shows why the rule matters. *Takeaway:* write the architectural rule as a testable acceptance criterion.

6. **Quantifiers in a spec summary deserve a second read.** Claude's spec summary said "both must reach every block." Mike approved it without noticing. He only noticed when Report A *boasted* about "53/53 in both views" ("don't make a big deal out of the fact that … the cards all appear in both ways"). The coordinator caught the conflict with the approved spec and asked, and Mike then gave the precise rule: "Every block needs to be reachable in one organizational view of the blocks or another but not every block needs to be reachable in every organizational view." *Takeaway:* when the agent summarizes your requirements back to you, check every "all / every / both / must."

7. **Instrument state machines fail at the edges; a verifier that uses the thing finds them.** The first build met every listed criterion. The verifier still found dead links on the summary screen, a clock showing 0.0s, a plural bug, and a mid-run reload that silently leaked test clicks into the normal log. It found them by *exercising* the app: reloading mid-run, clicking every link in every phase. *Takeaway:* ask for "reload mid-run," "give up," and "exercise every link in every state" in the self-check, and have someone other than the builder do it.

8. **Separate builder and verifier, and bias the verifier toward FAIL.** The tree-test page's tables were all correct, but nine prose sentences contradicted the data, two of them inside grader boxes that claimed to have re-derived the number. The builder's self-report claimed no invented numbers. Only a fresh-context verifier that re-derived from the CSV caught the errors. *Takeaway:* "Read the actual files — do not trust the builder's summary."

9. **Generate numbers from code; never let prose invent them.** "EVERY number in your prose and tables must come from that output; invent no numbers." The data script parses the real artifact and asserts legal walks, so fiction can't drift from the artifact. Even so, prose paraphrase introduced errors (lesson 8). Mike's later request for outlines "verbose even if they are big" was met by *generating* Team A's outline from the data file. *Takeaway:* anything countable should come from a script, and the page should link the raw data so anyone can check it.

10. **Engineered flaws must be explicit, bounded and tonally controlled.** W-B: "implement these EXACTLY; they are the point" … "earnest, NOT parody … no deliberate uglification beyond the specified flaws." The verifier checked that the flaws were present *and* that no extra ones or accidental competence had crept in. *Takeaway:* when you want something imperfect, say exactly which imperfections you want and forbid the rest.

11. **Pre-clear good deviations.** The builder added a give-up button that wasn't in the spec, arguing that "A tree test without a give-up produces false hits". It also added a 1.1 s end-state beat. The coordinator listed both under "Accepted deviations (do NOT flag these)" in the verifier packet. *Takeaway:* ask builders to report deviations with reasons; decide on them before verification so the verifier doesn't flag them.

12. **Order matters: fix before freezing.** "The freeze rule means these get fixed NOW, before the tree test cites the artifact." *Takeaway:* know which outputs become inputs to something else, and settle them first.

13. **Revision prompts work best when they are quantified and itemized.** Mike's 12-note message used "40% shorter," "1/2 as long," "bullet points," explicit column orders, and "drop the 033.title_number1 stuff." Even so, the first pass under-cut (11–25%). The fix was diagnostic, not "try harder": "you cut elaboration where you should have cut *narration*," followed by a list of what to cut (process narration, transitions, restatement, hedging, second halves of sentences) and what not to cut. *Takeaway:* when output misses, name *why* and *what kind* of change you want.

14. **Write for the human reader.** "T02 doesn't mean much to me" became short task names everywhere and no internal ids. "Making the table in 3 easier to tell if there was consencus and if it matched the expected results is ipmortant" became a MATCH/MISS column. *Takeaway:* agents default to their own identifiers. Tell them who reads the output.

15. **Parallel agents and shared files.** "Never two agents on one file." In practice, a v1 builder truncated the gitignored `.claude/launch.json`, and two builders then contended for it. A second human-driven session also edited shared CSS/JS mid-task. The coordinator's defenses: an allowed-files list per packet, the coordinator owning shared files, and verifying that its own page rendered with or without the other session's changes. *Takeaway:* give each agent a fenced set of files, and treat local config as shared.

16. **Model tiering.** Fable coordinated (planning, packets, adjudication, git). Opus built and verified. Mike switched the main session to Opus for browser/Canvas work and some revision rounds. Later Canvas work used Opus "compare" agents, Fable "writer" agents and Opus "applier" agents. *Takeaway:* match the model to the kind of judgment each role needs.

17. **Environment constraints show up in verification.** Local servers couldn't read `~/Documents`, so agents rsync'd the repo to `/tmp`. There was no `node`, so JavaScriptCore's `jsc` stood in. The preview sandbox blocked downloads, so the verifier intercepted `URL.createObjectURL` to read the export bytes. *Takeaway:* tell agents how to verify in *your* environment, or expect workarounds, and ask them to report the workarounds.

18. **Honest timestamps and honest labels.** The export uses `toISOString()`, which is UTC. The data builder kept UTC and added a note instead of faking local times. Every invented dataset carries a FICTITIOUS DATA badge. *Takeaway:* instrument output is evidence, so don't "tidy" it.

---

## (G) Reconstructed prompts: "if you had to say it in one prompt"

> **RECONSTRUCTED, not something Mike typed.** It condenses B-1.1 + B-1.3 answers + B-4.1/B-4.2 answers + B-5.4 + B-6.3 and the W-A packet into one request. Use it in the tutorial as a model, not as history.

### G-1. One prompt for the Team A wireframe with its instrumentation
~~~~text
Build a clickable WIREFRAME of our information architecture, plus the instrumentation we'll use to tree-test it.

Context files (read first): our card-sort analysis (categories, labels, strong pairs, splitters), our content inventory
(the N information blocks, verbatim titles + URLs), and this spec. Ask me clarifying questions ONE AT A TIME, multiple
choice, before you write code. Then summarize the spec back to me in bullets and wait for my OK.

Fidelity: black/white/gray only, one system font, generic gray boxes, no images; links black and underlined (no
default blue). This is about structure, not looks.

Architecture — single source, multiple views:
- One data file (e.g. wireframe-data.js) holding EVERY information block as a record:
  { id, name (verbatim), url, category, group, moment: [...] }  plus categories[], groups[], facet values[], tasks[].
- Every page is rendered by FILTERING that data on its attributes. No block is hand-placed in HTML anywhere.
- Two categorizations of the same blocks, both grounded in our card sort (e.g. by problem, and by lesson moment —
  PMEST/LATCH as the lens). ≥2 levels of hierarchy in the primary view. Every block must be reachable in at least ONE
  view; it does NOT have to appear in every view.
- Leaf = a clear end state that names the block reached, with placeholder boxes and a link to the real page.
- Static files only, relative paths, no build step, runs from a URL.

Click log (always on):
- Every in-app navigation click appends { t (ISO UTC), from, to, label } to localStorage.
- A #log view: Export JSON, Export CSV (header n,t,from,to,label), copy-to-clipboard fallback, clear (with confirm).

Test mode (the tree-test instrument):
- Our 10 task scenarios live in the data file, each with the expected block id. Write them as short situations in our
  users' words — never quoting a category label. Include at least one task that probes our riskiest IA decision.
- Flow: shuffle order per run → scenario card → OK starts the timer → participant navigates from Home → reaching ANY
  leaf ends the task (freeze the clock at arrival) or "I would give up" ends it with endpoint = null → "recorded"
  interstitial → next → summary.
- Record per task { taskId, scenario, expectedSkillId, endpointSkillId, correct, seconds, path[] }; persist each run
  { runId, startedAt, finishedAt, order, results } in localStorage after EVERY task.
- A #results view listing all runs; Export JSON + CSV with header
  runId,startedAt,finishedAt,taskId,scenario,expectedSkillId,endpointSkillId,asFiled,seconds,clicks,path
  (asFiled = hit|miss, path joined with " > ").
- While a run is active, test clicks go ONLY to the run (never to the normal click log).
- If the page reloads mid-run, show a "run interrupted" screen with Resume / End run. No link may look clickable while
  it isn't.

Self-check before you report: a script that validates the data file (every block present exactly once, every block
has a category/group and ≥1 facet value, every task's expected id exists); crawl both views and list any unreachable
blocks; complete a full 10-task run including one give-up and one mid-run reload; confirm the exports parse; grep the
CSS for any non-gray color or second font; no console errors.

Report back: files created, each requirement → met/not met with evidence, the 10 tasks with expected blocks, any
judgment calls you made (e.g. where an ambiguous block got filed and why), and any deviations from this spec.
Do not commit; I'll review first.
~~~~

### G-2. The same thing as a coordinator → builder → verifier plan (for students using multiple agents)
~~~~text
You are the coordinator. Don't build it yourself. (1) Turn the spec above into a TASK PACKET: read-first files, what
this artifact is for downstream, requirements, data contract, allowed files, self-check, report format. (2) Spawn a
builder with the packet. (3) When it reports, spawn a SEPARATE verifier with fresh context: give it the packet plus
the builder's claimed file list, tell it to fix nothing, re-derive every number itself, exercise every state (reload
mid-run, give up, click every link in every phase), and return PASS / FAIL / PASS-WITH-NITS with file:line evidence.
List any builder deviations you accept so the verifier doesn't flag them. (4) Send failures back to the SAME builder,
then have the verifier re-check only what changed. (5) Only you commit. Never let two agents edit the same file.
~~~~

### G-3. The one-paragraph version a student could actually type first (reconstructed)
~~~~text
I'm building a black-and-white clickable wireframe for my IA project from my card-sort results. Before writing any
code, interview me one question at a time with multiple-choice options until you can write a bullet-list spec; then
wait for my OK. Non-negotiables: one data file holds every information block with its attributes and every page is
generated from it (single source, multiple views); two different categorizations grounded in my card sort; at least
two levels; a persistent click log I can export as CSV; and a test mode that runs my 10 tree-test scenarios in random
order with a timer, a give-up button, and exportable per-task results. Tell me how you'll verify each of those before
you say you're done.
~~~~

---

## Appendix 1. The settled wireframe spec (memory `project_wireframe-assignment-spec.md`, verbatim)
~~~~text
---
name: wireframe-assignment-spec
description: "CS 356 generic wireframe assignment spec — requirements, bonus test mode, and turn-in list (settled 2026-08-21)"
metadata: 
  node_type: memory
  type: project
  originSessionId: e5a84ce3-798b-416d-9d21-6588ed854e94
  modified: 2026-08-22T03:34:07.132Z
---

Generic wireframe assignment spec for CS 356 (part of the chain in [[project_teaching-skills-companion]]: card sort → wireframe → tree test → v1 → task test → final). Generic = each **team** applies it to their own problem domain and their own card sort results, not the ward-bible worked example.

**Wireframe requirements**
- Working website at a URL the instructor can open. Team assignment. AI use during the build encouraged and expected.
- True wireframe fidelity: black & white only, one font, generic boxes — no color/imagery/typographic styling.
- Every information block from the team's card sort appears; leaves are labeled placeholders with a clear end state naming the block reached (placeholder page or "you selected X" — student's choice).
- Categories/organization must derive from the team's own card sort analysis (previous assignment).
- Two categorizations of the same blocks (single source, multiple views); UI mechanism is student's choice. **Coverage rule (2026-08-22 clarification): every block must be reachable in ONE organizational view or another; NOT every block must be reachable in EVERY view** — some blocks legitimately don't fit both organizations, and dual reachability is not an achievement to boast about. PMEST offered as a lens for the second organization (not required to name facets).
- At least two levels of hierarchy, grounded in the card sort.
- Click-through navigation down the hierarchy to select a block.
- Click recording with an **exportable log** (downloadable/copyable JSON or CSV).

**Bonus credit — test mode**
- Scenario → OK button → timer starts → record clicks → on reaching hierarchy end, record endpoint, pause, next task. All tasks, randomized order.
- Team writes **10 task scenarios** for their domain. Results persist for later review.

**Turn-in**
- The URL.
- Part 1 of a two-part report: a paragraph of rationale (how categories/hierarchy derive from card sort; what the two categorizations are). Part 2 = tree-test results per [[tree-test-spec]].

**Open items**: bonus point value not set; sample exported log not required at turn-in (log gets exercised in Part 2 anyway). Tree test spec ([[tree-test-spec]]) and rubric ([[generic-prototype-rubric]]) are both settled.
~~~~

## Appendix 2. The student-work example recipe (memory `feedback_student-work-example-recipe.md`, verbatim)
~~~~text
---
name: student-work-example-recipe
description: "Mike's settled recipe for authoring example student work (user studies AND prototypes): two independent examples per assignment, high + low scoring, artifact-authentic presentation, three voices, rubric-band-engineered flaws, grader boxes in a distinct frame"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a0f44e93-fa9b-4ae5-89e4-03ff7c5ad3a6
  modified: 2026-08-22T04:05:02.723Z
---

Settled with Mike 2026-08-22 after five iterations on the card-sort example
([[project-teaching-skills-companion]]). This is the generic recipe for every
example of student work in the CS 356 companion — user studies and prototypes
alike. Reference implementation: `companion/studies/01-card-sort.html`.

**1. Two independent examples per assignment.** A high-scoring example and a
low-scoring example, presented as two separate teams' work. NEVER frame them
as "the same study/project written up twice" — Mike explicitly removed that.
Each is complete and self-contained.

**2. Page skeleton.** A **3-sentence** assignment summary (what the
method/deliverable is, what you turn in, how it's graded) → Example A →
Example B → short "what separates the scores" synthesis → shared appendices
only if needed. No method preface, no assignment element list, no rubric
table — the grading notes carry the rubric where it's applied.

**3. The work looks like the artifact it claims to be.** Student work renders
in an authentic-artifact frame, visually distinct from the page: written work
on white "Word PDF" sheets (`.docpage` in companion.css — strong team uses
Word's Heading styles/Calibri; weaker team is Times New Roman with
bold-underline headings: the formatting itself characterizes the author),
each sheet tagged "FROM THE TURNED-IN REPORT". Everything meta — grader
boxes, scorecards, commentary — stays in companion chrome BETWEEN the
sheets, and the page says the convention out loud ("the white pages are the
report; everything in red is the grader").

**4. What gets turned in is usually a link.** So an example = a student
REPORT (on the Word-PDF sheets) containing the link to the artifact — for
both the high and the low example. **Prototype examples are two real,
working prototypes**, actually built and clickable, each linked from its
team's report. (Companion prototypes live under `companion/prototypes/`,
self-contained, own banner + noindex.)

**5. Three voices.** High example: strong CS undergrad — plain, clear,
numbers-forward, owns its deviations explicitly ("we're saying so rather
than hoping nobody notices"). Low example: middle-of-the-road undergrad —
earnest, casual, hedgy ("basically", "we feel like"), NOT a parody; its
errors are disclosed innocently in the work itself, because that's how real
teams reveal them. Grader: a warm HCI expert who loves teaching — second
person, names the strength before the deduction, quotes the rubric's band
language verbatim, and ends every deduction with the concrete fix
("Because [result], we will [decision] — for every single row").

**6. Engineer the low example's flaws against rubric bands.** Choose errors
real teams actually make, pinned to specific band language — best when the
band applies literally (5 of 8–10 recruited = "more than half but not
all"). Include at least one flaw that pays off later in the piece (starter
categories echoing back as "findings"). Weight the loss toward judgment
over procedure, matching the rubrics' escalation. **Scores are free to land
wherever the constructed errors honestly put them** — no fixed targets.

**7. Grading instruments.** Studies: the user-study rubric
([[user-study-rubric]] — Methods 15 / R&A 20 / Design Decisions 25).
Prototypes: the generic prototype rubric ([[generic-prototype-rubric]] —
Functional 18 / Visual 13 / IA 13 / Grounded-in-previous-study 16;
Skilled/Competent/Beginning/Missing). Grader box after every element/
criterion + a scorecard per example.

**8. Data discipline.** Invent the underlying data AS DATA first (a
committed script, e.g. `01-card-sort-data.py`) and compute every number in
the prose from it, so analysis can never drift from the appendix. The low
example's data stays appropriately thin — that's part of its realism. All
honest-fiction marking applies (badges as stamps on the documents; roster
participants with stable IDs; CONSTRUCTED variant for real-content
instruments).

**Why:** the examples teach by contrast — students recognize both teams —
and the high example does double duty: in the companion's forward-running
fiction its decisions are binding on the chain (the next prototype really
implements them).

**How to apply:** for each new study or prototype assignment, start from the
card-sort page's structure and this recipe; write the assignment summary in
exactly 3 sentences; build the artifacts/data before the prose; then the two
reports; then the grading.
~~~~

## Appendix 3. The tree-test spec (memory `project_tree-test-spec.md`, verbatim) and the prototype rubric bands
~~~~text
---
name: tree-test-spec
description: "CS 356 tree test assignment spec (settled 2026-08-22) — Part 2 of the wireframe report; moderated think-aloud on the team's own wireframe using its 10 built-in scenarios; 9-element turn-in; graded on the User Study Rubric"
metadata: 
  node_type: memory
  type: project
  originSessionId: 571b8c72-2871-4b32-8d1e-104a565ecbe8
  modified: 2026-08-25T03:13:38.600Z
---

Settled 2026-08-22. Part 2 of the two-part wireframe report from [[wireframe-assignment-spec]] (Part 1 = wireframe URL + rationale, graded on [[generic-prototype-rubric]]). Part 2 is graded on the **User Study Rubric** (Canvas 198046: Methods 15 / R&A 20 / Design Decisions 25 = 60), so the combined report spans 120 pts across two rubrics.

**The study**: moderated think-aloud tree test run on the team's OWN wireframe, using the **10 scenarios built into its test mode** — that's why the wireframe spec put them there. **10+ participants**, ideally from the team's user population ("we won't be too picky"). Task order randomized per participant (the test mode does this).

**Turn-in (9 elements)**:
1. **Tasks** — all 10: verbatim task text, correct info block (expected endpoint), **predicted first click**, brief rationale for the set (coverage + where the vocabulary came from).
2. **Participants** — names + a sentence on recruitment / relation to user population.
3. **Results table** — one row per task: first click (target + %), final destination (block + %), success % (reached correct block), give-up count, average time.
4. **Listening notes** — half a page on what they learned listening to users think aloud (what the log can't record).
5. **Analysis** — per the method page's analysis tips; past the pass rate to first-click diagnosis: most seductive wrong branch per failed task, what it says about labels.
6. **Design decisions** — cited, "Because [result], we will [decision]", including evidence-backed KEEPs. **Ends with a REQUIRED marked-up text outline of the revised hierarchy (added 2026-08-22)**: an indented outline of the new IA with every change tagged inline (NEW / RENAMED from X / MOVED from Y / REMOVED); L1+L2 shown in full, leaves listed only where a change touches them; both organizational views included if changes touch both; every mark must trace to a decision. Graded within the existing Design Decisions criterion (no rubric change).
7. **Full hierarchy outline, as tested (added 2026-08-22)** — immediately after design decisions: a complete outline of the information hierarchy as it was tested — every level, every block, every view, **verbose on purpose** (Mike wants to see how each team organized things without opening the artifact). Distinct from element 6's marked-up *revised* outline: this is the unmarked as-is baseline those marks were made against. Best practice modeled by Report A: generate it from the artifact's data source with the raw-log block ids attached; Report B's version is hand-typed from memory with four engineered discrepancies vs. the artifact (dupe block, phantom card id, dropped block, phantom filing in view 2) that the grader catches. Graded within existing criteria (no rubric change).
8. **What you'll ignore** — for now, maybe forever; what would reopen it.
9. **Link to raw logs** — exported click/test-mode data (e.g., in a Google Doc); the results table must be derivable from them.

**Canvas synced 2026-08-24**: the Canvas tree-test page now carries all nine elements (the as-tested full-hierarchy element was added), the 120-pt two-part framing (Prototype 60 + User Study 60), randomization, the wireframe-as-instrument rule (Treejack advice removed), and the freeze rule. The old "still says 4 tasks" note was stale — the page already said 10 before this sync. Turn-in lives at Canvas assignment 1439047 "Wireframe + Tree Test Report" (120 pts, combined rubric 199270). Freeze rule: once a team runs this study, their wireframe freezes; refinements land in prototype v1. Companion example: studies/02-tree-test.html (built + deployed 2026-08-22).
~~~~

Prototype Rubric (Canvas 198705), band text as inlined in packet TT-2:
~~~~text
## THE PROTOTYPE RUBRIC (Part 1 instrument — quote band language verbatim in grader boxes)
**1. Met the functional spec — 18** · Skilled 18: "The prototype meets every functional requirement in the assignment spec, and the functionality works reliably: a user can exercise each required behavior without workarounds, errors, or coaching." · Competent 14: "The prototype meets the functional requirements with minor gaps or rough edges: a required behavior is incomplete, unreliable, or needs explanation to use, but the core functionality is present and working." · Beginning 9: "Significant required functionality is missing or does not work; the prototype demonstrates the idea but cannot deliver the behaviors the spec requires." · Missing 0: "No working prototype was submitted, or it cannot be loaded or run as required."
**2. Met the visual design spec — 13** · Skilled 13: "Visual execution is skilled at this assignment's fidelity level: at wireframe fidelity, layout and visual hierarchy do the work and clearly support the user's goals; at higher fidelity, color is coherent and both color and layout actively support the user experience." · Competent 10: "Visual execution is adequate but shows choices made without full intention: inconsistent layout, visual hierarchy that muddles priority, or (at higher fidelity) color that decorates rather than supports the experience." · Beginning 7: "Visual choices impede the user experience: layout fights the content, hierarchy is unreadable, or (at higher fidelity) color is incoherent." · Missing 0: "The required visual elements are absent, or the submission ignores the assignment's fidelity constraints."
**3. Met the information architecture design spec — 13** · Skilled 13: "There are multiple reasonable ways to find things, and each way makes sense for the content and the users. Categories hold together; the hierarchy reflects deliberate design decisions." · Competent 10: "The information architecture is present and mostly reasonable, but shows gaps in intention: a categorization that is arbitrary in places, or an alternate path that exists but does not genuinely help users find things." · Beginning 7: "The information architecture looks improvised rather than designed: a single path to content, or categories that do not hold together." · Missing 0: "The required information architecture elements are absent."
**4. Grounded in the results of the previous study — 16** · Skilled 16: "The rationale cites specific findings from the previous study and connects each to a concrete design decision, and those decisions are visible in the prototype itself - the words and the artifact agree. The information architecture is not just reasonable; it is demonstrably grounded in the needs of your users." · Competent 13: "The rationale connects the previous study to the design, but the connections are partly generic, or some claimed decisions are not actually visible in the prototype. The grounding is real but thin in places." · Beginning 8: "The rationale gestures at the previous study without specific findings, or the prototype's design shows no visible relationship to what the study found. The design may be reasonable, but it is not grounded." · Missing 0: "No rationale connecting the design to the previous study was submitted."
~~~~

## Appendix 4. Where to look in the repo
- `companion/DELEGATION.md` (the loop), `.claude/agents/companion-builder.md`, `.claude/agents/companion-verifier.md`
- `companion/ARCHITECTURE.md` §2 (honest fiction), §5 (registry = single source for the hub), §6 (prototypes + freeze rule), §8 (quality gates)
- `companion/CONTENT-PLAN.md` §4 (wireframe station brief, rewritten by the coordinator 08-22 04:15Z to supersede "no click logging at this rung")
- `companion/prototypes/wireframe/{index.html,team-a/,team-b/}`, `companion/wireframe-report.html`, `companion/studies/02-tree-test{.html,-data.py,-raw-team-a.csv}`
- Commits: `cde5ac7` (Team B), `4a10744` (Team A), `1efe807` (integration), `91f1a95` / `ffa5508` / `b826222` (tree test), `cd1e488` (Report A revision), `796f508` (marked-up hierarchy), `5d3b606` (as-tested hierarchy), `334ce1b` (diagram pairing), `dae4c4f` (six turn-ins; wireframe-report.html)
