---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: ui-ux-designer
linked-skills: [cgs-ux-design, cgs-team-ui]
phase: plan
risk: high
argument-hint: Provide a UX design request with player journey, screens or flows, accessibility constraints, relevant files, owner or handoff needs, and verification evidence.
source-reference: .codex/workflows/ux-design.md
source-hash: cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# UX Design Workflow

## Purpose

Design player journeys, HUD, menus, interaction states, onboarding, accessibility hooks, and implementation-ready UX artifacts.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/ux-design.md
- GDD, UX notes, control manifest, accessibility notes, or screenshots

## Role

UI UX Designer (ui-ux-designer) owns this workflow.

## Taxonomy

Category: localization-accessibility
CCGS adaptation coverage:
- UX design
- player journey and interface specification
CLI aliases:
- ux-design

## Outputs

- UX flows, screen states, interaction states, and edge cases.
- Accessibility and localization considerations.
- Implementation handoff with required UI artifacts and verification checks.

## Validation

- Player goals and friction points are explicit.
- Accessibility and input constraints are included.
- Implementation-ready states and acceptance criteria are named.

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, docs, release notes, or tests changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Context bootstrap: `npm run ctx:workflow -- ux-design`, `npm run ctx:role -- ui-ux-designer`, and `npm run ctx:changed` before broad reads when available.
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
