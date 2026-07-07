---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: release-manager
linked-skills: [cgs-patch-notes, cgs-team-release]
phase: ship
risk: high
argument-hint: Provide a patch notes request with release scope, fixes, known issues, validation evidence, audience, owner or handoff needs, and approval constraints.
source-reference: .codex/workflows/patch-notes.md
source-hash: abababababababababababababababababababababababababababababababab
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Patch Notes Workflow

## Purpose

Draft patch notes with highlights, fixes, known issues, compatibility notes, validation evidence, and approval needs.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/patch-notes.md
- Release scope, changelog, bug fixes, known issues, and validation output

## Role

Release Manager (release-manager) owns this workflow.

## Taxonomy

Category: release-hotfix
CCGS adaptation coverage:
- patch notes
- player-facing release communication
CLI aliases:
- patch-notes

## Outputs

- Player-facing patch notes.
- Known issues and compatibility notes.
- Approval, localization, and publishing checklist.

## Validation

- Notes do not overclaim unverified fixes.
- Player-impact language is clear and accurate.
- Known issues and rollback risks are visible.

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, docs, release notes, or tests changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Context bootstrap: `npm run ctx:workflow -- patch-notes`, `npm run ctx:role -- release-manager`, and `npm run ctx:changed` before broad reads when available.
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
