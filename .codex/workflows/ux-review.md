---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: ui-ux-designer
linked-skills: [cgs-ux-review, cgs-ui-ux-review]
phase: review
risk: high
argument-hint: Provide a UX review request with target screens or flows, player goals, evidence, relevant files, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/ux-review.md
source-hash: dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# UX Review Workflow

## Purpose

Review UX flows, HUD, menus, onboarding, interaction states, accessibility risks, and handoff readiness with concrete findings.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/ux-review.md
- UX spec, screenshots, GDD, build notes, or accessibility requirements

## Role

UI UX Designer (ui-ux-designer) owns this workflow.

## Taxonomy

Category: localization-accessibility
CCGS adaptation coverage:
- UX review
- usability risk inspection
CLI aliases:
- ux-review

## Outputs

- Findings grouped by blocker, important issue, and polish.
- Evidence tied to flows, screens, controls, or player goals.
- Handoff recommendations with owner and verification path.

## Validation

- Findings are actionable and tied to player impact.
- Accessibility and localization risks are checked.
- Unverified assumptions are separated from observed evidence.

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, docs, release notes, or tests changed or proposed.
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
