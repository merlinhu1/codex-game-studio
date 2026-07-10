---
model: gpt-5.6-luna
model_reasoning_effort: low
primary-agent: technical-director
linked-skills: [cgs-setup-engine, cgs-standards-gameplay]
phase: plan
risk: high
argument-hint: Provide a engine setup request with target project state, existing files or artifacts, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/engine-setup.md
source-hash: 71e3df707f8adea79ba852cec75870bcee0f245cc1ba984da80f69752ec93eec
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Engine Setup Workflow

## Purpose

Confirm the selected engine, version, repository structure, run commands, and first validation path before design or implementation work proceeds.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/engine-setup.md

## Role

Technical Director (technical-director) owns this workflow.

## Taxonomy

Category: onboarding-discovery
CCGS adaptation coverage:
- engine setup
- project configuration

CLI aliases:
- engine-setup

## Outputs

- Technical direction
- Architecture tradeoffs
- Risk and gate summary

## Validation

- Trade-offs are explicit
- Validation gate is named
- Architecture decision is bounded

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name required artifacts and acceptance criteria before implementation or review work.
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
