---
model: gpt-5.6-luna
model_reasoning_effort: low
primary-agent: qa-playtester
linked-skills: [cgs-test-setup, cgs-qa-plan]
phase: plan
risk: high
argument-hint: Provide a test setup request with feature scope, target engine/build state, test data, relevant files, owner or handoff needs, and verification evidence.
source-reference: .codex/workflows/test-setup.md
source-hash: eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Test Setup Workflow

## Purpose

Define the test setup for the current feature or milestone, including scenarios, data, environment assumptions, automation hooks, and exit criteria.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/test-setup.md
- Feature specs, acceptance criteria, build/run commands, and current QA notes

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- test setup
- QA environment readiness
CLI aliases:
- test-setup

## Outputs

- Test setup checklist with environment, data, scenarios, and pass/fail criteria.
- Automation and manual test split.
- Risks, blockers, and evidence capture plan.

## Validation

- Every target behavior has a clear validation route.
- Environment assumptions and missing tools are explicit.
- Exit criteria are measurable.

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
