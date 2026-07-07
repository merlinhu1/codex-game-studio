---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: studio-orchestrator
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a handoff request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/handoff.md
source-hash: e307052ed5c98b2c7db097b17c27cb580f9d1253884e3d9154650cece91cca91
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Handoff Workflow

## Purpose

Summarize current state, route next work to the right role, identify blockers, and produce a concise handoff.

## Compact Context First

- `npm run ctx:workflow -- handoff`
- `npm run ctx:role -- studio-orchestrator`
- `npm run ctx:changed`

Use these before broad inspection; then read only surfaced files and explicit task targets.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/handoff.md

## Role

Studio Orchestrator (studio-orchestrator) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- role handoff
- next-action routing

CLI aliases:
- handoff

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
