---
model: gpt-5.6-terra
model_reasoning_effort: medium
primary-agent: gameplay-programmer
linked-skills: [cgs-hotfix, cgs-bugfix]
phase: review
risk: medium
argument-hint: Provide a hotfix request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/hotfix.md
source-hash: 1612d613b8c4dad2302feb01e4d1cdbada5b6b71047df0f28cd903e5cd06d6dc
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Hotfix Workflow

## Purpose

Triage a hotfix by identifying the minimal repair, risk surface, verification commands, rollback plan, and release communication notes.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/hotfix.md

## Role

Gameplay Programmer (gameplay-programmer) owns this workflow.

## Taxonomy

Category: release-hotfix
CCGS adaptation coverage:
- hotfix triage
- safe repair planning

CLI aliases:
- hotfix

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
