---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: senior-game-artist
linked-skills: [cgs-art-bible, cgs-standards-gameplay]
phase: plan
risk: high
argument-hint: Provide a art bible request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/art-bible.md
source-hash: adfe667cfb42f7aaba7744b20b9b1ef65a2826dcb18b59ecf2363b7e96e23b00
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Art Bible Workflow

## Purpose

Define the art bible with visual pillars, references, asset constraints, style rules, production risks, and review criteria.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/art-bible.md

## Role

Senior Game Artist (senior-game-artist) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- art bible
- visual production constraints

CLI aliases:
- art-bible

## Outputs

- Art direction
- Asset list
- Visual quality bar

## Validation

- Visual direction is shippable
- Asset handoff is clear
- Pipeline risks are named

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, or docs changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Context bootstrap: `npm run ctx:workflow -- art-bible`, `npm run ctx:role -- senior-game-artist`, and `npm run ctx:changed` before broad reads when available.
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
