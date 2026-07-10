---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: producer
linked-skills: [cgs-create-epics, cgs-create-stories]
phase: plan
risk: high
argument-hint: Provide a team feature request with feature goal, target files or scope constraints, design context, affected disciplines, dependencies, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/team-feature.md
source-hash: 4444444444444444444444444444444444444444444444444444444444444444
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Team Feature Workflow

## Purpose

Plan a cross-discipline feature with owner roles, artifacts, dependencies, risks, implementation slices, and verification gates.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/team-feature.md
- GDD, production timeline, feature spec, and discipline constraints

## Role

Producer (producer) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- team feature planning
- cross-discipline coordination
CLI aliases:
- team-feature

## Outputs

- Feature plan with epics, stories, owners, dependencies, and cutlines.
- Discipline handoffs for design, art, audio, engineering, UI, QA, and release.
- Verification gates and risk register entries.

## Validation

- Each slice has one owner and a clear acceptance signal.
- Dependencies and blockers are explicit.
- Plan avoids hidden parallel orchestration or unbounded scope.

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
