---
name: cgs-standards-tests
description: Use for Codex Game Studio test standards: unit, integration, engine smoke, playtest, and regression coverage.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Describe the standards-tests objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-standards-tests/SKILL.md
source-hash: 42ad0b14f40ad3641eed60f302aa4229e4c4a107d6a1eb23c533ffe1c08fdf20
user-invocable: true
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

## Purpose

Use this skill when the repository needs standards-tests work with Codex-native model routing, bounded context, and reviewable evidence.

## Prerequisites

- AGENTS.md and .codex/studio.json are available or the absence is reported as a blocker.
- The task names the target feature, asset, workflow, or verification boundary.
- Write scope and sandbox policy are known before editing files.

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Phased Procedure

1. Classify the task and confirm this skill is the right owner.
2. Inspect only the selected workflow, agent metadata, project state, and task-relevant files.
3. Create or update the smallest useful artifact while preserving template-repository surfaces.
4. Run the cheapest meaningful verification first, then stronger checks when risk warrants it.
5. Prepare a handoff with changed files, evidence, risks, and next owner.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Failure Modes

- Missing project state, engine context, or target files.
- Unbounded scope that would require speculative multi-role work.
- Verification cannot run and no manual inspection alternative is available.

## Verification

- Run the requested command, relevant tests, validation, or playtest inspection.
- If execution is impossible, state the blocker and provide a concrete verification plan.
- Keep evidence tied to paths and commands, not broad claims.

## Adaptation Rationale

This skill is adapted from .agents/skills/cgs-standards-tests/SKILL.md when available and translated into Codex-native model, tool-policy, sandbox, and handoff language. Claude-specific model/tool metadata is not used as runtime policy.
