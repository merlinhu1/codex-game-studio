---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: qa-playtester
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: review
risk: high
argument-hint: Describe the review goal, target milestone/files, constraints, and required evidence.
source-reference: .codex/workflows/review.md
source-hash: 34723440e64f04b85aaac3355e08ac64bc58b31c7f5b68dc83351d651619b628
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Review Workflow

## Purpose

Review the current project state and report blockers, warnings, and verification gaps as JSON.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/review.md

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- general project review
- verification gap reporting

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
