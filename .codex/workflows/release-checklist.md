---
model: gpt-5.6-sol
model_reasoning_effort: high
primary-agent: release-manager
linked-skills: [cgs-release-checklist, cgs-vertical-slice]
phase: ship
risk: high
argument-hint: Provide a release checklist request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/release-checklist.md
source-hash: 323ba87fd53d96504b2795e4a68eb382c9b047672df9138bf5c6047169acf878
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Release Checklist Workflow

## Purpose

Create a release checklist with blockers, warnings, validation commands, packaging checks, rollback notes, and communication needs.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/release-checklist.md
- production/timeline.md

## Role

Release Manager (release-manager) owns this workflow.

## Taxonomy

Category: release-hotfix
CCGS adaptation coverage:
- release checklist
- ship gate verification

CLI aliases:
- release-checklist

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
