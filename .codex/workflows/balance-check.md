---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: economy-designer
linked-skills: [cgs-balance-check, cgs-map-systems]
phase: review
risk: high
argument-hint: Provide a balance check request with systems or economy context, target values, player goals, telemetry or evidence, owner or handoff needs, and verification evidence.
source-reference: .codex/workflows/balance-check.md
source-hash: 6666666666666666666666666666666666666666666666666666666666666666
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Balance Check Workflow

## Purpose

Review balance, resources, progression, difficulty, exploit risks, and tuning hooks against player goals and telemetry signals.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/balance-check.md
- Economy model, difficulty notes, telemetry, playtest findings, and GDD context

## Role

Economy Designer (economy-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- balance check
- economy and progression risk review
CLI aliases:
- balance-check

## Outputs

- Balance findings with severity, evidence, and tuning recommendation.
- Exploit, fairness, pacing, and progression risks.
- Validation plan for changed values or systems.

## Validation

- Recommendations are tied to player behavior or telemetry.
- Sources, sinks, rewards, and difficulty assumptions are explicit.
- Follow-up verification can be executed by the right owner.

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
