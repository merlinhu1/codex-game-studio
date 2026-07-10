---
model: gpt-5.6-sol
model_reasoning_effort: high
primary-agent: senior-game-designer
linked-skills: [cgs-review-all-gdds, cgs-consistency-check]
phase: review
risk: high
argument-hint: Provide a review all gdds request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/review-all-gdds.md
source-hash: 8fe57db661019d9c5ed785ff572e4929356942dc3702a4462f6e694d8c655fc4
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Review All Gdds Workflow

## Purpose

Review all GDD and design artifacts for contradictions, missing systems, stale assumptions, and implementation blockers.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/review-all-gdds.md
- documentation/design/gdd.md

## Role

Senior Game Designer (senior-game-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- GDD review
- cross-document consistency

CLI aliases:
- review-all-gdds

## Outputs

- Systems design
- Progression model
- Acceptance criteria

## Validation

- Rules and loops are coherent
- Economy and progression risks are covered
- Specs are implementable

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
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
