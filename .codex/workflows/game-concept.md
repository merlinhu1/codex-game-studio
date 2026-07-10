---
model: gpt-5.6-sol
model_reasoning_effort: high
primary-agent: creative-director
linked-skills: [cgs-brainstorm, cgs-quick-design]
phase: plan
risk: high
argument-hint: Provide a game concept request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/game-concept.md
source-hash: 64fe13f7300544dc522fa7c01d202bad79f44791bbf57b903beb1dea09bb8dc3
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Game Concept Workflow

## Purpose

Turn the game idea into a concise concept with player fantasy, pillars, target audience, scope tier, and initial risks.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/game-concept.md

## Role

Creative Director (creative-director) owns this workflow.

## Taxonomy

Category: onboarding-discovery
CCGS adaptation coverage:
- game concept
- core pillars

CLI aliases:
- game-concept

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
