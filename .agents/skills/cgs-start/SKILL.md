---
name: cgs-start
description: Use for start tasks that clarify the game concept, engine, production mode, first milestone, and next required artifact; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the start objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/start/SKILL.md
source-hash: 31e7a2cee0568de6e443fd3428fea36f6583478f6db25cac3fa18604c510af9f
user-invocable: true
---

# Codex Game Studio Start

Use this skill for start work in Template Game.

## Objective

Clarify the game concept, engine, production mode, first milestone, and next required artifact.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- production/timeline.md

## Procedure

1. Clarify the requested clarify the game concept, engine, production mode, first milestone, and next required artifact. and identify the current project stage.
2. Collect evidence for Project Stage, Engine Choice, First Milestone.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Project Stage
- Engine Choice
- First Milestone
- Validation Gate
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Project Stage
- Engine Choice
- First Milestone
- Validation Gate
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
