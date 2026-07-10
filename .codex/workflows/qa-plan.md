---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: qa-playtester
linked-skills: [cgs-qa-plan, cgs-bugfix]
phase: plan
risk: medium
argument-hint: Provide a qa plan request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/qa-plan.md
source-hash: 3adbf7f46c8318d14386d739b4411e65dd87bab644cc7cd5cd5da3c298f567df
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Qa Plan Workflow

## Purpose

Create a QA plan with target scenarios, risk areas, test data, manual checks, automated checks, and exit criteria.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/qa-plan.md
- documentation/design/gdd.md

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- test planning
- QA strategy

CLI aliases:
- qa-plan

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
