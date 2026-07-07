---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: senior-game-designer
linked-skills: [cgs-design-review, cgs-review-all-gdds]
phase: review
risk: high
argument-hint: Provide a design review request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/design-review.md
source-hash: 1bba3bd25cc28c3c0b6a8ac22862e17b6e218d0768fe69254713e2eae4223009
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Design Review Workflow

## Purpose

Review design docs for player promise, systemic consistency, production scope, edge cases, and handoff readiness.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/design-review.md
- documentation/design/gdd.md

## Role

Senior Game Designer (senior-game-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- design review
- scope and consistency review

CLI aliases:
- design-review

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
