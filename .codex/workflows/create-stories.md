---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: producer
linked-skills: [cgs-create-stories, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a create stories request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/create-stories.md
source-hash: 0d440e64d98ad037ca0a1eb0ae7524d0194761d21b5a50eb751aac37b90200d0
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Create Stories Workflow

## Purpose

Break an epic or feature into implementation-ready stories with role owner, files or artifacts to inspect, acceptance criteria, and verification gates.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/create-stories.md
- documentation/production/timeline.md

## Role

Producer (producer) owns this workflow.

## Taxonomy

Category: implementation-planning
CCGS adaptation coverage:
- story breakdown
- implementation-ready task slicing

CLI aliases:
- create-stories

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
