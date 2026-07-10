---
name: cgs-create-architecture
description: Use for create architecture tasks that design the technical architecture, layers, data ownership, engine boundaries, and control manifest; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-sol
model_reasoning_effort: xhigh
argument-hint: Describe the create-architecture objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/create-architecture/SKILL.md
source-hash: 8a6320b33b3132e7f98e634156c5017a8406303b0eccbaa973cdb4d9ee10e1af
user-invocable: true
---

# Codex Game Studio Create Architecture

Use this skill for create architecture work in Template Game.

## Objective

Design the technical architecture, layers, data ownership, engine boundaries, and control manifest.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- design/gdd.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested design the technical architecture, layers, data ownership, engine boundaries, and control manifest. and identify the current project stage.
2. Collect evidence for Architecture Layers, Data Ownership, Engine Boundary.
3. Compare options, choose the smallest reversible technical path, and record consequences.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- docs/architecture/

## Output Contract

- Summary
- Architecture Layers
- Data Ownership
- Engine Boundary
- Control Manifest
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Architecture Layers
- Data Ownership
- Engine Boundary
- Control Manifest
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
