---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: studio-orchestrator
linked-skills: [cgs-onboard, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a onboard request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/onboard.md
source-hash: 117428e18b2f889ef195acbeba3619f1c5daaa8b54045f14a0271870e531980c
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Onboard Workflow

## Purpose

Orient a contributor to the project goal, current stage, key files, active roles, and safest first actions.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/onboard.md
- documentation/design/gdd.md
- documentation/production/timeline.md

## Role

Studio Orchestrator (studio-orchestrator) owns this workflow.

## Taxonomy

Category: onboarding-discovery
CCGS adaptation coverage:
- project onboarding
- repository orientation

CLI aliases:
- start
- onboard

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
