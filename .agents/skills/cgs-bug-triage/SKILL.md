---
name: cgs-bug-triage
description: Use for Codex Game Studio bug triage work: Classify bugs by severity, priority, reproduction confidence, owner role, risk, and release impact.
---

# Codex Game Studio Bug Triage

Use this skill for bug triage work in Template Game.

## Objective

Classify bugs by severity, priority, reproduction confidence, owner role, risk, and release impact.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested classify bugs by severity, priority, reproduction confidence, owner role, risk, and release impact. and identify the current project stage.
2. Collect evidence for Severity, Priority, Owner.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Severity
- Priority
- Owner
- Release Impact
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Severity
- Priority
- Owner
- Release Impact
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
