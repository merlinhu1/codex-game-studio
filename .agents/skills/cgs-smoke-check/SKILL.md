---
name: cgs-smoke-check
description: Use for Codex Game Studio smoke check work: Run the fastest useful checks proving the project opens, builds, starts, and reaches a basic playable state.
---

# Codex Game Studio Smoke Check

Use this skill for smoke check work in Template Game.

## Objective

Run the fastest useful checks proving the project opens, builds, starts, and reaches a basic playable state.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Procedure

1. Clarify the requested run the fastest useful checks proving the project opens, builds, starts, and reaches a basic playable state. and identify the current project stage.
2. Collect evidence for Launch, Build, Basic Play.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Launch
- Build
- Basic Play
- Smoke Result
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Launch
- Build
- Basic Play
- Smoke Result
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
