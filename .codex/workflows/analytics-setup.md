---
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: data-scientist
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a analytics setup request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/analytics-setup.md
source-hash: 19e2ccd6cba68c2a546ab3ab762de06f4d071923c07df1134f9860459a8ea5f9
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Analytics Setup Workflow

## Purpose

Define analytics events, success metrics, experiment plans, and evidence loops for the current project.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/analytics-setup.md

## Role

Data Scientist (data-scientist) owns this workflow.

## Taxonomy

Category: onboarding-discovery
CCGS adaptation coverage:
- analytics onboarding
- success metric planning

CLI aliases:
- analytics

## Outputs

- Analytics plan
- Event taxonomy
- Experiment outline

## Validation

- Analytics plan is actionable
- Event schema is inspectable
- Decision loop is clear

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
