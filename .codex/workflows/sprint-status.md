---
model: gpt-5.4-mini
model_reasoning_effort: low
primary-agent: studio-orchestrator
linked-skills: [cgs-sprint-status, cgs-vertical-slice]
phase: review
risk: low
argument-hint: Provide a sprint status request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/sprint-status.md
source-hash: 93da26e1a257325a8fb7d88e420d069c695cfcf80085beb0c849197140205946
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Sprint Status Workflow

## Purpose

Summarize sprint status, completed work, blockers, risks, next owners, and verification evidence without mutating task state.

## Compact Context First

- `npm run ctx:workflow -- sprint-status`
- `npm run ctx:role -- studio-orchestrator`
- `npm run ctx:changed`

Use these before broad inspection; then read only surfaced files and explicit task targets.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/sprint-status.md
- documentation/production/timeline.md

## Role

Studio Orchestrator (studio-orchestrator) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- sprint status
- blocker visibility

CLI aliases:
- sprint-status

## Outputs

- Studio handoff
- Next-role routing
- Blocker summary

## Validation

- Next role and reason are explicit
- Scope and blockers are separated
- No hidden planner or parallel execution is implied

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
