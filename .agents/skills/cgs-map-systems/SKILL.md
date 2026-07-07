---
name: cgs-map-systems
description: Use for map systems tasks that decompose the concept into game systems with dependency order, priority tiers, and validation needs; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the map-systems objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/map-systems/SKILL.md
source-hash: a46393797f5227603d87722d8c546d61c8944182db28e00207dc5ad318aa577e
user-invocable: true
---

# Codex Game Studio Map Systems

Use this skill for map systems work in Template Game.

## Objective

Decompose the concept into game systems with dependency order, priority tiers, and validation needs.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested decompose the concept into game systems with dependency order, priority tiers, and validation needs. and identify the current project stage.
2. Collect evidence for Systems Map, Dependency Order, Priority Tier.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Systems Map
- Dependency Order
- Priority Tier
- Validation Need
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Systems Map
- Dependency Order
- Priority Tier
- Validation Need
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
