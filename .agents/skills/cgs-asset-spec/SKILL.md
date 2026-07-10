---
name: cgs-asset-spec
description: Use for asset spec tasks that specify an individual asset with purpose, constraints, references, dimensions, states, and acceptance criteria; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the asset-spec objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/asset-spec/SKILL.md
source-hash: 3a53c309c5e8abff8d8ab73c1217aa8fab47274abfa66836e401de83847f04e4
user-invocable: true
---

# Codex Game Studio Asset Spec

Use this skill for asset spec work in Template Game.

## Objective

Specify an individual asset with purpose, constraints, references, dimensions, states, and acceptance criteria.

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

1. Clarify the requested specify an individual asset with purpose, constraints, references, dimensions, states, and acceptance criteria. and identify the current project stage.
2. Collect evidence for Asset Purpose, States, Technical Constraints.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Asset Purpose
- States
- Technical Constraints
- Acceptance Criteria
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Asset Purpose
- States
- Technical Constraints
- Acceptance Criteria
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
