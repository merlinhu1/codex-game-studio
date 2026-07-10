---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: qa-playtester
linked-skills: [cgs-playtest-report, cgs-smoke-check]
phase: review
risk: high
argument-hint: Provide a playtest polish request with playtest findings, current build state, player goals, affected files or assets, owner or handoff needs, and verification evidence.
source-reference: .codex/workflows/playtest-polish.md
source-hash: 8888888888888888888888888888888888888888888888888888888888888888
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Playtest Polish Workflow

## Purpose

Review playtest feedback and current build evidence to prioritize polish fixes, blockers, warnings, and follow-up validation.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/playtest-polish.md
- Playtest report, bug list, build notes, and acceptance criteria

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- playtest polish
- player experience triage
CLI aliases:
- playtest-polish

## Outputs

- Prioritized polish findings with player impact.
- Fix, defer, cut, and retest recommendations.
- Evidence and next-owner routing.

## Validation

- Player-facing impact is clear for each priority.
- Reproducible issues include evidence or blocker labels.
- Recommendations fit milestone scope.

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, docs, release notes, or tests changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Load AGENTS.md, .codex/studio.json, this workflow, the primary agent, linked skills, and only task-relevant project files.
- Avoid broad context unless the user explicitly approves it.

## Output Contract

- Decision or change summary.
- Step-by-step work performed or planned.
- Evidence, blockers, warnings, and next owner.

## Stop Conditions

- Required project state, approval, target files, or verification path is missing.
- The task crosses into another role without an explicit handoff.
- The workflow would require generated prompt mirrors or hidden automation.

## Handoff

Report changed files, validation evidence, residual risks, and the next owner only when ownership changes.
