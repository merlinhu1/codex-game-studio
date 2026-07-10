---
model: gpt-5.6-sol
model_reasoning_effort: high
primary-agent: technical-director
linked-skills: [cgs-create-architecture, cgs-architecture-review]
phase: plan
risk: high
argument-hint: Provide a create architecture request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/create-architecture.md
source-hash: 9281c55c01d56a9895d51ac295d0f06ba4716473c93ab3aaed1cfeb68d2b3b6d
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Create Architecture Workflow

## Purpose

Create technical architecture with engine modules, data flow, integration points, risk areas, and verification strategy.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/create-architecture.md
- design/gdd.md

## Role

Technical Director (technical-director) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- architecture creation
- technical boundaries

CLI aliases:
- create-architecture

## Outputs

- Technical direction
- Architecture tradeoffs
- Risk and gate summary

## Validation

- Trade-offs are explicit
- Validation gate is named
- Architecture decision is bounded

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
