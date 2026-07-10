---
model: gpt-5.6-luna
model_reasoning_effort: medium
primary-agent: systems-designer
linked-skills: [cgs-map-systems, cgs-design-system]
phase: plan
risk: high
argument-hint: Provide an entity inventory request with project state, relevant design files, entity scope, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/entity-inventory.md
source-hash: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Entity Inventory Workflow

## Purpose

Create or update an entity inventory covering gameplay objects, actors, content items, dependencies, ownership, and verification signals.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/entity-inventory.md
- design/gdd.md or the relevant system design files

## Role

Systems Designer (systems-designer) owns this workflow.

## Taxonomy

Category: design-architecture
CCGS adaptation coverage:
- entity inventory
- content entity taxonomy
CLI aliases:
- entity-inventory

## Outputs

- Entity table with identifiers, purpose, owner, lifecycle, dependencies, and validation signal.
- Gaps, duplicates, naming conflicts, and follow-up owner routing.
- Scope decision for which entities are in, cut, deferred, or unknown.

## Validation

- Each entity has a player-facing reason or production reason.
- Dependencies and owner roles are named.
- Missing evidence is labeled as a blocker or assumption.

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
