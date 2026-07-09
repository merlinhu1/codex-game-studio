---
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: qa-playtester
linked-skills: [cgs-standards-gameplay, cgs-bugfix]
phase: review
risk: medium
argument-hint: Provide a playtest request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/playtest.md
source-hash: c7f6e1c9ca0d6e6406d5b43aef9c0d5dfe9522087b2ac43c6212e3b8d49b4b23
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Playtest Workflow

## Purpose

Inspect the current build, report reproducible playtest issues, and separate blockers from warnings.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/playtest.md

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- playtest reporting
- reproducible issue capture

CLI aliases:
- none

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
