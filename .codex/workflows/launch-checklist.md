---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: release-manager
linked-skills: [cgs-launch-checklist, cgs-release-checklist]
phase: ship
risk: high
argument-hint: Provide a launch checklist request with release target, build/store/comms/support state, rollback needs, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/launch-checklist.md
source-hash: efefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefef
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Launch Checklist Workflow

## Purpose

Prepare launch-day readiness checks across build, store, comms, rollback, support, monitoring, and final go/no-go decisions.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/launch-checklist.md
- Release checklist, validation output, store requirements, support plan, and rollback notes

## Role

Release Manager (release-manager) owns this workflow.

## Taxonomy

Category: release-hotfix
CCGS adaptation coverage:
- launch checklist
- launch readiness coordination
CLI aliases:
- launch-checklist

## Outputs

- Launch readiness checklist with go/no-go status.
- Owners for build, store, comms, support, monitoring, and rollback.
- Blockers, warnings, approvals, and final evidence.

## Validation

- Every launch-critical area has status and owner.
- Rollback and support paths are named.
- No go/no-go claim appears without evidence.

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
