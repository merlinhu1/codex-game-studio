---
model: gpt-5.6-terra
model_reasoning_effort: medium
primary-agent: accessibility-specialist
linked-skills: [cgs-standards-ui, cgs-ux-design]
phase: plan
risk: high
argument-hint: Provide a accessibility doc request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/accessibility-doc.md
source-hash: 960dee6ad18b6e9774ebb1ac66f38643516c472ce711bfa9ed20f157bdfd193c
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Accessibility Doc Workflow

## Purpose

Document accessibility requirements across visual, audio, motor, cognitive, input, difficulty, and verification concerns.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/accessibility-doc.md

## Role

Accessibility Specialist (accessibility-specialist) owns this workflow.

## Taxonomy

Category: localization-accessibility
CCGS adaptation coverage:
- accessibility documentation
- accommodation requirements

CLI aliases:
- accessibility-doc

## Outputs

- Accessibility review
- Accommodation checklist
- Inclusive design risks

## Validation

- WCAG criterion or game-specific accessibility standard is cited when applicable
- Visual, audio, motor, cognitive, and input risks were considered for the feature under review
- Recommendations are actionable, testable, and assigned to the right owner

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
