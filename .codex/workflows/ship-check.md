---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: release-manager
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: ship
risk: high
argument-hint: Provide a ship check request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/ship-check.md
source-hash: c0314e1b40f51a412fb34e841c4828b18841d12d524e73578609f2f8b946877d
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Ship Check Workflow

## Purpose

Assess milestone readiness, package risk, validation status, and release blockers.

## Compact Context First

- `npm run ctx:workflow -- ship-check`
- `npm run ctx:role -- release-manager`
- `npm run ctx:changed`

Use these before broad inspection; then read only surfaced files and explicit task targets.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/ship-check.md
- documentation/production/timeline.md

## Role

Release Manager (release-manager) owns this workflow.

## Taxonomy

Category: release-hotfix
CCGS adaptation coverage:
- ship readiness
- release blocker review

CLI aliases:
- none

## Outputs

- Ship checklist
- Release risks
- Validation summary

## Validation

- Blockers are separated from warnings
- Validation is current
- Packaging risks are explicit

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
