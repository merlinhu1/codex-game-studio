---
name: cgs-standards-prototype-code
description: Use for prototype code standards: review target files, apply Codex-native boundaries, produce violations, fixes, verification evidence, and handoff notes.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Provide the standards objective, target files/assets/docs, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-prototype-code/SKILL.md
source-hash: c25078ee3d920223c4f2f3fe50e2ec5c92dacbc0f1f02e8f9ab6a7eebe8fe33d
user-invocable: true
---

# Codex Game Studio Prototype Code Standards

Use this skill for prototype code standards work in Template Game.

## Objective

prototype code with explicit hypothesis, throwaway boundaries, minimal safety, and graduation criteria

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant source, tests, docs, assets, or data files

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Read the requested files and identify the prototype code standards rule being applied.
2. Check prototype code with explicit hypothesis, throwaway boundaries, minimal safety, and graduation criteria.
3. Report violations with file paths, impact, smallest safe fix, and verification evidence.

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

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
