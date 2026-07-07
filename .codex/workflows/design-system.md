---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: systems-designer
linked-skills: [cgs-design-system, cgs-standards-gameplay]
phase: plan
risk: high
argument-hint: Provide a design system request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/design-system.md
source-hash: dfd4a6edd300f25e5ec8f32e8766f9b3ecda41047ee3a6d589c3ddda27cdc08b
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Design System Workflow

## Purpose

Author or update a system design with player-facing rules, data model, edge cases, dependencies, tuning hooks, and acceptance criteria.

## Compact Context First

- `npm run ctx:workflow -- design-system`
- `npm run ctx:role -- systems-designer`
- `npm run ctx:changed`

Use these before broad inspection; then read only surfaced files and explicit task targets.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/design-system.md
- documentation/design/gdd.md

## Role

Systems Designer (systems-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- system design
- per-system GDD

CLI aliases:
- design-system

## Outputs

- Systems spec
- Balance levers
- Edge-case notes

## Validation

- System dependencies are mapped
- Tuning values are inspectable
- Validation plan exists

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
