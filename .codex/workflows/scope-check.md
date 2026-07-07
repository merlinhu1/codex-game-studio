---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: producer
linked-skills: [cgs-scope-check, cgs-gate-check]
phase: review
risk: high
argument-hint: Provide a scope check request with milestone goals, current work, risks, constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/scope-check.md
source-hash: 5555555555555555555555555555555555555555555555555555555555555555
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Scope Check Workflow

## Purpose

Review production scope, identify cuts or deferrals, name owner decisions, and preserve the smallest shippable milestone.

## Compact Context First

- `npm run ctx:workflow -- scope-check`
- `npm run ctx:role -- producer`
- `npm run ctx:changed`

Use these before broad inspection; then read only surfaced files and explicit task targets.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/scope-check.md
- Production timeline, feature list, risks, and validation evidence

## Role

Producer (producer) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- scope check
- production cutline review
CLI aliases:
- scope-check

## Outputs

- Keep, cut, defer, and unknown lists.
- Owner decisions and required approvals.
- Impact on milestone, validation, and player promise.

## Validation

- Scope decisions are traceable to risk or player value.
- Deferred items have owner and revisit condition.
- Ship-critical work remains bounded and testable.

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
