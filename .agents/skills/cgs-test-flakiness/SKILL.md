---
name: cgs-test-flakiness
description: Use for Codex Game Studio test flakiness work: Diagnose flaky tests by isolating timing, randomness, ordering, environment, and cleanup causes.
---

# Codex Game Studio Test Flakiness

Use this skill for test flakiness work in Template Game.

## Objective

Diagnose flaky tests by isolating timing, randomness, ordering, environment, and cleanup causes.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested diagnose flaky tests by isolating timing, randomness, ordering, environment, and cleanup causes. and identify the current project stage.
2. Collect evidence for Failure Pattern, Isolation, Root Cause.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Failure Pattern
- Isolation
- Root Cause
- Stabilization
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Failure Pattern
- Isolation
- Root Cause
- Stabilization
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
