---
name: cgs-bug-report
description: Use for Codex Game Studio bug report work: Capture a reproducible bug with environment, steps, expected/actual behavior, severity, evidence, and owner.
---

# Codex Game Studio Bug Report

Use this skill for bug report work in Template Game.

## Objective

Capture a reproducible bug with environment, steps, expected/actual behavior, severity, evidence, and owner.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Capture environment, build/version, branch, and affected feature.
2. Write Reproduction Steps that a different agent can follow without extra context.
3. Record Expected vs Actual behavior and player impact.
4. Attach Evidence such as logs, screenshots, recordings, failing tests, or engine output.
5. Assign severity, likely owner role, regression risk, and verification path.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Reproduction Steps
- Expected vs Actual
- Evidence
- Severity
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Reproduction Steps
- Expected vs Actual
- Evidence
- Severity
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
