---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: localization-lead
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a localization plan request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/localization-plan.md
source-hash: 3c051923076c7bd045bdb8c2b96b17564e42da45664371dfd23339ea01f87603
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Localization Plan Workflow

## Purpose

Create a localization plan with string scope, culturalization risks, asset dependencies, text expansion, subtitles, and verification checks.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/localization-plan.md
- documentation/design/gdd.md

## Role

Localization Lead (localization-lead) owns this workflow.

## Taxonomy

Category: localization-accessibility
CCGS adaptation coverage:
- localization planning
- culturalization readiness

CLI aliases:
- localization-plan

## Outputs

- Localization plan
- String and asset risks
- Culturalization notes

## Validation

- Localization scope is explicit
- Text and asset dependencies are named
- Cultural risks are handled respectfully

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
