# Companion Build — Delegation Playbook

*How to run the companion build (tasks #1–#11) with a coordinator agent directing
cheaper executor and verifier agents. Written for the instructor and for the
coordinating agent; the agent definitions live in `.claude/agents/` (versioned).*

## The pattern

```
        ┌─────────────────────────────────────────────┐
        │  COORDINATOR — Fable (the main session)     │
        │  plans · sequences · writes task packets ·  │
        │  adjudicates reviews · owns git & deploys   │
        └──────┬──────────────────────────┬───────────┘
        spawns │ per task          spawns │ per finished task
               ▼                          ▼
   ┌───────────────────────┐   ┌─────────────────────────┐
   │ companion-builder     │   │ companion-verifier      │
   │ (Opus) builds ONE     │   │ (Opus, fresh context)   │
   │ deliverable, reports  │   │ adversarial check,      │
   │                       │   │ fixes nothing, reports  │
   └───────────────────────┘   └─────────────────────────┘
```

Three principles:

1. **Separation of duties.** The agent that built a thing never verifies it.
   Verifiers get a fresh context and are instructed to bias toward FAIL.
2. **One task, one packet, one agent.** The coordinator writes a *task packet*
   (task id, deliverables, acceptance criteria, allowed files, don't-touch list)
   into each builder's prompt. Small contexts stay sharp and cheap.
3. **The coordinator owns state.** Only the coordinator commits, pushes, updates
   the task list, or edits shared files' merge points. Builders leave changes in
   the working tree; verifiers read only.

## The per-task loop

1. Coordinator marks the task in-progress and writes the packet.
2. **Build** — spawn `companion-builder` (Opus) with the packet. Builder
   self-checks against its definition-of-done and reports.
3. **Verify** — spawn `companion-verifier` (Opus) with the packet + the builder's
   claimed file list. Verifier returns PASS / FAIL / PASS-WITH-NITS with cited
   findings (including the fiction-marking audit and teaching-site regression).
4. **Adjudicate** — coordinator reads both reports. On FAIL: send findings back
   to the *same* builder (message the existing agent — it keeps its context)
   and re-verify. On PASS: coordinator spot-checks, commits with a descriptive
   message, marks the task complete.
5. Deployment happens only at milestone boundaries (coordinator merges
   `companion` → `master`, pushes `origin` + `site`, verifies live URLs).

## Parallelism rules (learned the hard way elsewhere; follow them)

- Tasks whose files don't overlap may run as **parallel background builders**
  (e.g., studies 1–5 are separate pages once #1 scaffold + #2 versions exist).
- **Never two agents on one file.** The shared file here is
  `assets/studies-data.js`: either the scaffold task pre-creates all registry
  entries (builders then edit only their own entry's fields), or builders report
  desired entries and the coordinator merges them.
- For genuinely overlapping work, use worktree isolation (`isolation:
  "worktree"`) so each agent edits its own checkout and the coordinator merges.
- Sequencing per the task list's dependencies: #1 → #2/#3/#4 → studies (#5,
  #6, #8, #9, #10 parallel; #7 after #2+#3) → #11.

## Model tiers (match cost to judgment required)

| Role | Model | Why |
|---|---|---|
| Coordinator | Fable (main session) | Cross-task judgment, integration, git/deploy, the expensive context |
| Builders — long-form authoring (studies, ward, versions) | **Opus** | Sustained writing quality + fiction-consistency judgment |
| Verifiers | **Opus** | The check is judgment-heavy (fiction marking, realistic data, voice) |
| Mechanical gates (link checks, banner presence, registry validation, HTTP 200 sweeps) | Haiku/Sonnet, or a plain script | No judgment needed — cheapest thing that runs |

## How to invoke it (instructor's cheat-sheet)

Say any of these to the coordinating session:

- **"Run task #5 with the builder/verifier loop"** — one task, full loop.
- **"Coordinate tasks #5–#10 with opus agents, parallel where safe"** — the
  coordinator fans out background builders per the parallelism rules and runs
  verifiers as builds finish.
- **"Use a workflow for the companion build"** — opts into the heavier
  deterministic pipeline (the Workflow tool): a script that runs
  build → verify → fix stages per task with `model: "opus"` agents and
  structured outputs. Best when running many tasks unattended; the explicit
  phrase is required — the coordinator won't reach for it uninvited.

The agent definitions are auto-discovered from `.claude/agents/` — nothing to
install. To change the executor tier later, edit one `model:` line in the agent
file (e.g., `opus` → `sonnet`) or override per-spawn.

## Guardrails (non-negotiable, enforced at every step)

- Builders and verifiers **never** touch the live teaching site's files; the
  verifier's first check is a teaching-site regression diff.
- Nothing merges to `master` without a verifier PASS **and** coordinator review.
- The honest-fiction contract (ARCHITECTURE.md §2) is checked twice per task —
  by the builder's definition-of-done and the verifier's fiction audit.
- Verifier FAILs go back to the builder; a task is never marked complete with
  open blockers.
