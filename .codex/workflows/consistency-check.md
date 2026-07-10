---
model: gpt-5.6-luna
model_reasoning_effort: low
primary-agent: studio-orchestrator
linked-skills: [cgs-consistency-check, cgs-propagate-design-change]
phase: review
risk: high
argument-hint: Provide a consistency check request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/consistency-check.md
source-hash: a42d0f34c8152fde912bec0b77167ac0ee8aa654095e3e4cc57555c28aba25e4
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Consistency Check Workflow

## Purpose

Check design, production, architecture, UI, and validation surfaces for contradictions, missing owners, and stale assumptions.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/consistency-check.md
- documentation/design/gdd.md
- documentation/production/timeline.md

## Role

Studio Orchestrator (studio-orchestrator) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- consistency check
- cross-surface contradiction review

CLI aliases:
- consistency-check

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
