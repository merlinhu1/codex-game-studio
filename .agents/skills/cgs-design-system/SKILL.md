---
name: cgs-design-system
description: Use for design system tasks that author a system GDD with rules, data, edge cases, progression, feedback, and implementation acceptance tests; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the design-system objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/design-system/SKILL.md
source-hash: eae2be7d9ae520112020420293d83fdeeebf52d3476ce5c8ffecf87aaec4e696
user-invocable: true
---

# Codex Game Studio Design System

Use this skill for design system work in Template Game.

## Objective

Author a system GDD with rules, data, edge cases, progression, feedback, and implementation acceptance tests.

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

1. Clarify the requested author a system gdd with rules, data, edge cases, progression, feedback, and implementation acceptance tests. and identify the current project stage.
2. Collect evidence for System Rules, Balance Levers, Edge Cases.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- System Rules
- Balance Levers
- Edge Cases
- Acceptance Tests
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- System Rules
- Balance Levers
- Edge Cases
- Acceptance Tests
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
