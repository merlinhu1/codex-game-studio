---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: gameplay-programmer
linked-skills: [cgs-dev-story, cgs-standards-gameplay]
phase: implement
risk: high
argument-hint: Provide an implementation request with accepted design context, exact target files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/implement.md
source-hash: ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Implement Workflow

## Purpose

Implement a bounded feature slice from accepted design context with changed files, validation evidence, risks, and handoff notes.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/implement.md
- Accepted feature spec, GDD context, target source files, and test commands

## Role

Gameplay Programmer (gameplay-programmer) owns this workflow.

## Taxonomy

Category: implementation-planning
CCGS adaptation coverage:
- implementation execution
- bounded feature delivery
CLI aliases:
- implement

## Outputs

- Minimal source, test, or asset changes needed for the requested slice.
- Verification command output and changed-file summary.
- Risks, follow-up tasks, and handoff notes.

## Validation

- Implementation remains within the accepted scope.
- Tests or manual verification prove the changed behavior.
- Engine conventions and rollback risks are addressed.

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, docs, release notes, or tests changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Context bootstrap: `npm run ctx:workflow -- implement`, `npm run ctx:role -- gameplay-programmer`, and `npm run ctx:changed` before broad reads when available.
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
