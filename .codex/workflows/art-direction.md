---
model: gpt-5.6-terra
model_reasoning_effort: medium
primary-agent: senior-game-artist
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a art direction request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/art-direction.md
source-hash: bb63d35ee4c93bc78cdb69865b93a8451772f1947457e7a4cb0de10a50261857
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Art Direction Workflow

## Purpose

Define art direction, visual constraints, asset list, production risks, and review criteria.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/art-direction.md

## Role

Senior Game Artist (senior-game-artist) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- art direction
- asset production planning

CLI aliases:
- art-direction

## Outputs

- Art direction
- Asset list
- Visual quality bar

## Validation

- Visual direction is shippable
- Asset handoff is clear
- Pipeline risks are named

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
