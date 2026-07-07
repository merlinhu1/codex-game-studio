---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: game-feel-designer
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: review
risk: high
argument-hint: Provide a game feel tuning request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/game-feel-tuning.md
source-hash: 8d1c4b6a894d8b08fa5890a7a0db85c47c0b906667b0dbc8677c4b0159e1bec0
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Game Feel Tuning Workflow

## Purpose

Review moment-to-moment feel, controls, feedback, pacing, and tuning risks with actionable changes.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/game-feel-tuning.md

## Role

Game Feel Designer (game-feel-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- game-feel review
- tuning recommendations

CLI aliases:
- feel-review

## Outputs

- Feel review
- Tuning recommendations
- Feedback checklist

## Validation

- Controls are responsive
- Feedback supports player intent
- Tuning changes are actionable

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
