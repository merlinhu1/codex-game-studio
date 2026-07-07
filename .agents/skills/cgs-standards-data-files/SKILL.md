---
name: cgs-standards-data-files
description: Use for data file standards: review target files, apply Codex-native boundaries, produce violations, fixes, verification evidence, and handoff notes.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Provide the standards objective, target files/assets/docs, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-data-files/SKILL.md
source-hash: 2dfeabcbf725d39253e68fb898f20fec46af01b2c4afd96468ed441182d770a6
user-invocable: true
---

# Codex Game Studio Data File Standards

Use this skill for data file standards work in Template Game.

## Objective

JSON, YAML, CSV, and engine data assets with schemas, stable identifiers, validation, and migration notes

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, assets, or data files

## Procedure

1. Read the requested files and identify the data file standards rule being applied.
2. Check JSON, YAML, CSV, and engine data assets with schemas, stable identifiers, validation, and migration notes.
3. Report violations with file paths, impact, smallest safe fix, and verification evidence.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Schema
- Stable ID
- Migration Note
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
