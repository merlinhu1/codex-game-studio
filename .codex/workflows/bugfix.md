---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: gameplay-programmer
linked-skills: [cgs-bugfix]
phase: implement
risk: medium
argument-hint: Provide a bugfix request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/bugfix.md
source-hash: e4f3ff1a7569114e173de2be80c20cbc1d914d920c4970092667161683380aaa
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Bugfix Workflow

## Purpose

Reproduce, fix, verify, and document a defect with bounded scope.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/bugfix.md

## Role

Gameplay Programmer (gameplay-programmer) owns this workflow.

## Taxonomy

Category: release-hotfix
CCGS adaptation coverage:
- defect triage
- bounded implementation repair

CLI aliases:
- none

## Outputs

- Code changes
- Verification results
- Implementation notes

## Validation

- Gameplay behavior matches acceptance criteria
- Engine conventions are followed
- Verification evidence is included

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, or docs changed or proposed.
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

## Documentation Impact

- After functional source, engine, or asset changes, update the owning game document or record a fresh `## Documentation Impact` decision in `production/session-state/active.md`.
- Run `./codex-game-studio docs-impact --base <review-base>` before handoff.
- A `no-update` decision must state why no player, architecture, production, or release document changed.
