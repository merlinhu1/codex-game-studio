---
model: gpt-5.6-terra
model_reasoning_effort: medium
primary-agent: qa-playtester
linked-skills: [cgs-regression-suite, cgs-bugfix]
phase: review
risk: medium
argument-hint: Provide a regression suite request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/regression-suite.md
source-hash: 8d0248078a4d567474766257fccf6a31a790b14152643806c608f2dbe726478e
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Regression Suite Workflow

## Purpose

Design or review a regression suite for changed gameplay, UI, engine, content, and release-critical behavior.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/regression-suite.md

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- regression suite planning
- test coverage review

CLI aliases:
- regression-suite

## Outputs

- Issue list
- Repro steps
- Severity notes

## Validation

- Repro steps are actionable
- Evidence is attached or described
- Blocking issues are separated from polish

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
