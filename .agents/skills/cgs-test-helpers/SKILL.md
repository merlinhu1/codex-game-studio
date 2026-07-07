---
name: cgs-test-helpers
description: Use for test helpers tasks that design reusable test helpers without hiding assertions, over-mocking, or coupling tests to implementation details; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Describe the test-helpers objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/test-helpers/SKILL.md
source-hash: 98494481c7fe0b69611243f9174a1a860622e2b5488499c953a2e539001e3438
user-invocable: true
---

# Codex Game Studio Test Helpers

Use this skill for test helpers work in Template Game.

## Objective

Design reusable test helpers without hiding assertions, over-mocking, or coupling tests to implementation details.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested design reusable test helpers without hiding assertions, over-mocking, or coupling tests to implementation details. and identify the current project stage.
2. Collect evidence for Helper Purpose, Assertion Boundary, Fixture Shape.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Helper Purpose
- Assertion Boundary
- Fixture Shape
- Misuse Guard
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Helper Purpose
- Assertion Boundary
- Fixture Shape
- Misuse Guard
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
