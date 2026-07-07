---
name: cgs-standards-design-docs
description: Use for design document standards: review target files, apply Codex-native boundaries, produce violations, fixes, verification evidence, and handoff notes.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Provide the standards objective, target files/assets/docs, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-design-docs/SKILL.md
source-hash: 644cd9a915f1823e11f6d95e8803c62053d69b7135ba99b47cd7017ae29b5c2a
user-invocable: true
---

# Codex Game Studio Design Document Standards

Use this skill for design document standards work in Template Game.

## Objective

design documents with player-facing intent, canonical source links, open questions, and acceptance checks

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, assets, or data files

## Procedure

1. Read the requested files and identify the design document standards rule being applied.
2. Check design documents with player-facing intent, canonical source links, open questions, and acceptance checks.
3. Report violations with file paths, impact, smallest safe fix, and verification evidence.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Player Intent
- Canonical Source
- Acceptance Check
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
