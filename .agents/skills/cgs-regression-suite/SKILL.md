---
name: cgs-regression-suite
description: Use for Codex Game Studio regression suite work: Define or run regression coverage for changed systems, prior bugs, critical paths, and release blockers.
---

# Codex Game Studio Regression Suite

Use this skill for regression suite work in Template Game.

## Objective

Define or run regression coverage for changed systems, prior bugs, critical paths, and release blockers.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/
- .codex/workflows/regression-suite.md

## Procedure

1. Clarify the requested define or run regression coverage for changed systems, prior bugs, critical paths, and release blockers. and identify the current project stage.
2. Collect evidence for Critical Path, Prior Bug, Regression Case.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Critical Path
- Prior Bug
- Regression Case
- Result
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Critical Path
- Prior Bug
- Regression Case
- Result
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
