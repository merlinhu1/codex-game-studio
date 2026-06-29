---
name: cgs-patch-notes
description: Use for Codex Game Studio patch notes work: Write player-facing patch notes with fixes, known issues, balance changes, and verification caveats.
---

# Codex Game Studio Patch Notes

Use this skill for patch notes work in Template Game.

## Objective

Write player-facing patch notes with fixes, known issues, balance changes, and verification caveats.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/

## Procedure

1. Clarify the requested write player-facing patch notes with fixes, known issues, balance changes, and verification caveats. and identify the current project stage.
2. Collect evidence for Player Summary, Fix List, Known Issues.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Player Summary
- Fix List
- Known Issues
- Version
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Player Summary
- Fix List
- Known Issues
- Version
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
