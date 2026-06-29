---
name: cgs-standards-tests
description: Use for Codex Game Studio test standards: unit, integration, engine smoke, playtest, and regression coverage.
---

# Codex Game Studio Test Standards

Use this skill for test standards work in Template Game.

## Objective

unit, integration, engine smoke, playtest, and regression coverage

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, or assets

## Procedure

1. Read the requested files and identify the test standards rule being applied.
2. Check unit, integration, engine smoke, playtest, and regression coverage.
3. Report violations with file paths, impact, and the smallest safe fix.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Narrow Test
- Suite
- Evidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
