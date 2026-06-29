---
name: cgs-test-setup
description: Use for Codex Game Studio test setup work: Configure test harnesses, fixtures, commands, and documentation so validation is repeatable.
---

# Codex Game Studio Test Setup

Use this skill for test setup work in Template Game.

## Objective

Configure test harnesses, fixtures, commands, and documentation so validation is repeatable.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested configure test harnesses, fixtures, commands, and documentation so validation is repeatable. and identify the current project stage.
2. Collect evidence for Test Command, Fixture, Harness.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Test Command
- Fixture
- Harness
- Repeatability
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Test Command
- Fixture
- Harness
- Repeatability
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
