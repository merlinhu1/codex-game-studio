---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: senior-game-artist
linked-skills: [cgs-asset-audit, cgs-content-audit]
phase: review
risk: high
argument-hint: Provide an asset audit request with asset folders or specs, art direction, build evidence, production constraints, owner or handoff needs, and verification evidence.
source-reference: .codex/workflows/asset-audit.md
source-hash: 7777777777777777777777777777777777777777777777777777777777777777
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Asset Audit Workflow

## Purpose

Audit assets for completeness, style fit, technical constraints, naming, missing variants, and release-blocking production risks.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/asset-audit.md
- Asset specs, art bible, file tree, screenshots, import or build evidence

## Role

Senior Game Artist (senior-game-artist) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- asset audit
- content completeness review
CLI aliases:
- asset-audit

## Outputs

- Asset completeness report with blockers and warnings.
- Naming, style, import, and optimization findings.
- Owner-routed follow-ups and verification path.

## Validation

- Every finding names the affected asset or missing evidence.
- Style and technical concerns are separated.
- Release-blocking risks are explicit.

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
