---
model: gpt-5.6-terra
model_reasoning_effort: medium
primary-agent: producer
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a production milestone request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/production-milestone.md
source-hash: 24e88c28bdbf98c567fdb005aa895812e926398817f47e58e8bb6f343fb7dbc2
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Production Milestone Workflow

## Purpose

Convert current project state into milestone goals, task slices, risks, owners, and verification gates.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/production-milestone.md
- production/timeline.md

## Role

Producer (producer) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- milestone planning
- production risk tracking

CLI aliases:
- milestone

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
