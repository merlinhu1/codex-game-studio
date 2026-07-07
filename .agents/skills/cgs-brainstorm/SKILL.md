---
name: cgs-brainstorm
description: Use for brainstorm tasks that explore the game idea with player fantasy, verbs, pillars, audience, constraints, and scope tiers; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the brainstorm objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/brainstorm/SKILL.md
source-hash: 3afbcc808948bd507486d2d84787236cbac516b67d207b6b4737ab0d7f2cd9ad
user-invocable: true
---

# Codex Game Studio Brainstorm

Use this skill for brainstorm work in Template Game.

## Objective

Explore the game idea with player fantasy, verbs, pillars, audience, constraints, and scope tiers.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md
- .codex/workflows/brainstorm.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested explore the game idea with player fantasy, verbs, pillars, audience, constraints, and scope tiers. and identify the current project stage.
2. Collect evidence for Core Fantasy, Player Verbs, Pillars.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Core Fantasy
- Player Verbs
- Pillars
- Scope Tiers
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Core Fantasy
- Player Verbs
- Pillars
- Scope Tiers
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
