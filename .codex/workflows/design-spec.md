---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: senior-game-designer
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a design spec request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/design-spec.md
source-hash: 9261742b271ffafea2af4cdb3e05ca879a2b73d58309ef75ad6ddc13aea06497
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Design Spec Workflow

## Purpose

Create or review a feature/design spec with rules, edge cases, implementation slices, and acceptance criteria.

## Compact Context First

- `npm run ctx:workflow -- design-spec`
- `npm run ctx:role -- senior-game-designer`
- `npm run ctx:changed`

Use these before broad inspection; then read only surfaced files and explicit task targets.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/design-spec.md
- documentation/design/gdd.md

## Role

Senior Game Designer (senior-game-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- feature specification
- design acceptance criteria

CLI aliases:
- design-spec

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
