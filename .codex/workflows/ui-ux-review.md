---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: ui-ux-designer
linked-skills: [cgs-ui-ux-review, cgs-vertical-slice]
phase: review
risk: high
argument-hint: Provide a ui ux review request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/ui-ux-review.md
source-hash: 9f7f488ceea66c123f694460a42be633fe27e5e66291721a00e7acccef98c0e5
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Ui Ux Review Workflow

## Purpose

Review UI flows, HUD/menu clarity, usability, onboarding, accessibility, and interaction risks.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/ui-ux-review.md

## Role

UI UX Designer (ui-ux-designer) owns this workflow.

## Taxonomy

Category: localization-accessibility
CCGS adaptation coverage:
- UX review
- accessibility-aware UI inspection

CLI aliases:
- ui-review

## Outputs

- UI flow review
- HUD/menu recommendations
- Accessibility notes

## Validation

- Journey is testable
- UI states are complete
- Accessibility and implementation risks are clear

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
