---
model: gpt-5.4
model_reasoning_effort: medium
primary-agent: producer
linked-skills: [cgs-story-readiness, cgs-bugfix]
phase: review
risk: medium
argument-hint: Provide a story readiness request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/story-readiness.md
source-hash: e815391ac44b0b2265edabadc1287d1e558c7ab63ab01dfecd8f48fbe316b764
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Story Readiness Workflow

## Purpose

Review whether a story is ready for implementation by checking scope, owner role, context files, acceptance criteria, risks, and verification commands.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/story-readiness.md

## Role

Producer (producer) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- story readiness
- definition-of-ready review

CLI aliases:
- story-readiness

## Outputs

- Production plan
- Milestone tasks
- Risk register

## Validation

- Tasks are bounded
- Risks and gates are named
- Owners and verification are clear

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name acceptance criteria before implementation or review work.
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
