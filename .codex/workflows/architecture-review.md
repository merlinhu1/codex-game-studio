---
model: gpt-5.6-sol
model_reasoning_effort: xhigh
primary-agent: technical-director
linked-skills: [cgs-architecture-review, cgs-vertical-slice]
phase: review
risk: high
argument-hint: Provide a architecture review request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/architecture-review.md
source-hash: 42efb7eafaf3ed586f06ba5319e257913bf929929ebe5e930df283b63f761a9c
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Architecture Review Workflow

## Purpose

Review architecture, engine constraints, module boundaries, technical risks, and validation gaps for a proposed or existing feature.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/architecture-review.md

## Role

Technical Director (technical-director) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- architecture review
- technical risk review

CLI aliases:
- architecture-review

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
