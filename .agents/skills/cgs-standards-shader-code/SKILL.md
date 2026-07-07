---
name: cgs-standards-shader-code
description: Use for shader code standards: review target files, apply Codex-native boundaries, produce violations, fixes, verification evidence, and handoff notes.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Provide the standards objective, target files/assets/docs, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-shader-code/SKILL.md
source-hash: 71f8ad00932b36958c91ac99ef95b0941ec0c55f3dba5007df727e9557da4b42
user-invocable: true
---

# Codex Game Studio Shader Code Standards

Use this skill for shader code standards work in Template Game.

## Objective

shader and material code with naming, variant control, platform budgets, and visual verification

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, assets, or data files

## Procedure

1. Read the requested files and identify the shader code standards rule being applied.
2. Check shader and material code with naming, variant control, platform budgets, and visual verification.
3. Report violations with file paths, impact, smallest safe fix, and verification evidence.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Naming
- Variant Control
- Visual Evidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
