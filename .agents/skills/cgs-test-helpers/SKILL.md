---
name: cgs-test-helpers
description: Use for Codex Game Studio test helpers work: Design reusable test helpers without hiding assertions, over-mocking, or coupling tests to implementation details.
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
