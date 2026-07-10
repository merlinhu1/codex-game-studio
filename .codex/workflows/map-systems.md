---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: systems-designer
linked-skills: [cgs-map-systems, cgs-design-system]
phase: plan
risk: high
argument-hint: Provide a map systems request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/map-systems.md
source-hash: 807f1f366b5a5e7ef7c09aecd74fe8ab1724a70bde734bf0dfc539e43a4de1b1
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Map Systems Workflow

## Purpose

Map core gameplay, economy, progression, content, UI, and technical systems with dependencies, owners, and validation signals.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/map-systems.md
- documentation/design/gdd.md

## Role

Systems Designer (systems-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- systems map
- system dependency mapping

CLI aliases:
- map-systems

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
