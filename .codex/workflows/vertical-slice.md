---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: producer
linked-skills: [cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a vertical slice request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/vertical-slice.md
source-hash: 07715b9011de759afcb6b4586a11efcb7b6389dd7c60703a25063473b618af7f
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Vertical Slice Workflow

## Purpose

Create a bounded vertical-slice plan with tasks, risks, and verification gates.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/vertical-slice.md
- documentation/design/gdd.md

## Role

Producer (producer) owns this workflow.

## Taxonomy

Category: implementation-planning
CCGS adaptation coverage:
- vertical-slice planning
- milestone decomposition

CLI aliases:
- none

## Outputs

- Production plan
- Milestone tasks
- Risk register

## Validation

- Tasks are bounded
- Risks and gates are named
- Owners and verification are clear

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, or docs changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Context bootstrap: `npm run ctx:workflow -- vertical-slice`, `npm run ctx:role -- producer`, and `npm run ctx:changed` before broad reads when available.
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
