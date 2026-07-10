---
model: gpt-5.6-terra
model_reasoning_effort: high
primary-agent: senior-game-artist
linked-skills: [cgs-asset-spec, cgs-art-bible]
phase: plan
risk: high
argument-hint: Provide an asset specification request with target asset set, references, constraints, source files, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/asset-spec.md
source-hash: bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Asset Spec Workflow

## Purpose

Create an implementation-ready asset specification with references, constraints, variants, file expectations, risks, and review criteria.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/asset-spec.md
- art bible, GDD, reference images, or target asset lists

## Role

Senior Game Artist (senior-game-artist) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- asset specification
- art production handoff
CLI aliases:
- asset-spec

## Outputs

- Asset list with dimensions, style constraints, variants, file naming, and dependencies.
- Acceptance criteria for visual quality and engine import readiness.
- Risks, open questions, and review owner.

## Validation

- Asset requirements are concrete enough for production.
- Technical constraints and file expectations are explicit.
- Unverified references or missing context are labeled.

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
