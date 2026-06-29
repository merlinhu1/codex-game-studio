---
name: cgs-story-done
description: Use for Codex Game Studio story done work: Check if a story is complete with changed files, tests, acceptance evidence, and handoff notes.
---

# Codex Game Studio Story Done

Use this skill for story done work in Template Game.

## Objective

Check if a story is complete with changed files, tests, acceptance evidence, and handoff notes.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/story-done.md

## Procedure

1. Clarify the requested check if a story is complete with changed files, tests, acceptance evidence, and handoff notes. and identify the current project stage.
2. Collect evidence for Done Verdict, Changed Files, Evidence.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Done Verdict
- Changed Files
- Evidence
- Follow-up
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Done Verdict
- Changed Files
- Evidence
- Follow-up
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
