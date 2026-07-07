---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: ui-ux-designer
linked-skills: [cgs-create-control-manifest, cgs-standards-ui]
phase: plan
risk: high
argument-hint: Provide a control manifest request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/control-manifest.md
source-hash: 2997914073ae51e2f1a6479775190e062a16e7bebc6f4a123a81edd9bdea2f0c
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Control Manifest Workflow

## Purpose

Document controls, input devices, remapping requirements, UI prompts, accessibility constraints, and verification paths.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/control-manifest.md

## Role

UI UX Designer (ui-ux-designer) owns this workflow.

## Taxonomy

Category: localization-accessibility
CCGS adaptation coverage:
- control manifest
- input mapping documentation

CLI aliases:
- control-manifest

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
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, or docs changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Context bootstrap: `npm run ctx:workflow -- control-manifest`, `npm run ctx:role -- ui-ux-designer`, and `npm run ctx:changed` before broad reads when available.
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
