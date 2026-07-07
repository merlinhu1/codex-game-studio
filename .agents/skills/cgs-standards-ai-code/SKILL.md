---
name: cgs-standards-ai-code
description: Use for ai code standards: review target files, apply Codex-native boundaries, produce violations, fixes, verification evidence, and handoff notes.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Provide the standards objective, target files/assets/docs, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-ai-code/SKILL.md
source-hash: 6bc0977b87a34d4141265fb6739c91b03fa19146d4314f27e9ad47039a42f0eb
user-invocable: true
---

# Codex Game Studio AI Code Standards

Use this skill for ai code standards work in Template Game.

## Objective

agent and NPC behavior code with deterministic decisions, bounded state, test seams, and debugging evidence

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, assets, or data files

## Procedure

1. Read the requested files and identify the ai code standards rule being applied.
2. Check agent and NPC behavior code with deterministic decisions, bounded state, test seams, and debugging evidence.
3. Report violations with file paths, impact, smallest safe fix, and verification evidence.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Decision Boundary
- State Guard
- Behavior Evidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
