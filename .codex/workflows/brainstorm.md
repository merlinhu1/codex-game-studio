---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: creative-director
linked-skills: [cgs-brainstorm, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a brainstorm request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/brainstorm.md
source-hash: 089f684096f5d974b08282b12052d231462da5324c914fcfa832bb2a2737f975
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Brainstorm Workflow

## Purpose

Generate bounded game ideas, feature variations, player fantasies, and tradeoff notes from the current project constraints.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/brainstorm.md
- documentation/design/gdd.md

## Role

Creative Director (creative-director) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- concept ideation
- creative option generation

CLI aliases:
- brainstorm

## Outputs

- Creative direction
- Scope decisions
- Experience pillars

## Validation

- Creative pillars are concrete
- Discipline guidance is aligned
- Scope trade-offs are named

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, or docs changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Context bootstrap: `npm run ctx:workflow -- brainstorm`, `npm run ctx:role -- creative-director`, and `npm run ctx:changed` before broad reads when available.
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
