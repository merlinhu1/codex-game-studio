---
name: cgs-standards-prototype
description: Use for standards prototype tasks that fast experiments with explicit hypotheses, throwaway boundaries, and graduation criteria; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Describe the standards-prototype objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-prototype/SKILL.md
source-hash: df7e20168b3e07e76f3236e73367ed33cb7fe71af34f0b6ed5d86c6fac0772a7
user-invocable: true
---

# Codex Game Studio Prototype Standards

Use this skill for prototype standards work in Template Game.

## Objective

fast experiments with explicit hypotheses, throwaway boundaries, and graduation criteria

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, or assets

## Procedure

1. Read the requested files and identify the prototype standards rule being applied.
2. Check fast experiments with explicit hypotheses, throwaway boundaries, and graduation criteria.
3. Report violations with file paths, impact, and the smallest safe fix.

## Output Contract

- Rule applied
- Files checked
- Violations
- Verification

## Quality Gates

- Hypothesis
- Throwaway Boundary
- Graduation
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
