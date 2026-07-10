---
model: gpt-5.6-luna
model_reasoning_effort: low
primary-agent: producer
linked-skills: [cgs-retrospective, cgs-sprint-status]
phase: review
risk: high
argument-hint: Provide a retrospective request with milestone or sprint context, outcomes, evidence, team risks, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/retrospective.md
source-hash: 3333333333333333333333333333333333333333333333333333333333333333
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Retrospective Workflow

## Purpose

Run a milestone or sprint retrospective that records outcomes, misses, risks, follow-ups, and concrete process changes.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/retrospective.md
- Timeline, sprint status, validation evidence, and incident notes

## Role

Producer (producer) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- retrospective
- learning capture
CLI aliases:
- retrospective

## Outputs

- What worked, what failed, and why.
- Follow-up actions with owner, priority, and verification signal.
- Process changes and risks for the next iteration.

## Validation

- Claims are grounded in evidence or labeled as perception.
- Follow-ups are concrete and owner-routed.
- Blame-free language preserves actionable learning.

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
