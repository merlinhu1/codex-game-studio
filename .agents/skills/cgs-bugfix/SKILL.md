---
name: cgs-bugfix
description: Use for Codex Game Studio bugfix work: Fix a bounded bug with reproduction evidence, minimal change, regression coverage, and handoff notes.
---

# Codex Game Studio Bugfix

Use this skill for bugfix work in Template Game.

## Objective

Fix a bounded bug with reproduction evidence, minimal change, regression coverage, and handoff notes.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/
- .codex/workflows/bugfix.md

## Procedure

1. Clarify the requested fix a bounded bug with reproduction evidence, minimal change, regression coverage, and handoff notes. and identify the current project stage.
2. Collect evidence for Reproduction, Minimal Fix, Regression Test.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Reproduction
- Minimal Fix
- Regression Test
- Evidence
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Reproduction
- Minimal Fix
- Regression Test
- Evidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
