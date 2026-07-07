---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: qa-playtester
linked-skills: [cgs-bug-report, cgs-bug-triage]
phase: review
risk: high
argument-hint: Provide a bug report request with observed behavior, expected behavior, repro context, environment, evidence files, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/bug-report.md
source-hash: 2222222222222222222222222222222222222222222222222222222222222222
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Bug Report Workflow

## Purpose

Capture a reproducible bug report with expected versus actual behavior, environment, repro steps, evidence, severity, and owner routing.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/bug-report.md
- Build state, repro notes, screenshots, logs, or acceptance criteria

## Role

QA Playtester (qa-playtester) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- bug reporting
- reproducible defect capture
CLI aliases:
- bug-report

## Outputs

- Repro steps, expected result, actual result, severity, and environment.
- Evidence links or missing-evidence blockers.
- Owner routing and verification recommendation.

## Validation

- A second person can attempt the repro from the report.
- Severity and player impact are justified.
- Missing information is explicit, not hidden.

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
