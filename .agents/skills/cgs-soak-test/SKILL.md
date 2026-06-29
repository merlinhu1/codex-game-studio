---
name: cgs-soak-test
description: Use for Codex Game Studio soak test work: Plan longer stability checks for memory, performance drift, save/load, networking, and live-ops loops.
---

# Codex Game Studio Soak Test

Use this skill for soak test work in Template Game.

## Objective

Plan longer stability checks for memory, performance drift, save/load, networking, and live-ops loops.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested plan longer stability checks for memory, performance drift, save/load, networking, and live-ops loops. and identify the current project stage.
2. Collect evidence for Duration, Metric, Failure Threshold.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Duration
- Metric
- Failure Threshold
- Soak Result
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Duration
- Metric
- Failure Threshold
- Soak Result
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
