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

## Purpose

Use this skill when the repository needs design-docs standard review with Codex-native model routing, bounded context, and reviewable evidence.

## Prerequisites

- AGENTS.md and .codex/studio.json are available or the absence is reported as a blocker.
- The task names the target feature, asset, workflow, file, or verification boundary.
- Write scope and sandbox policy are known before editing files.

## Arguments

- Objective or user request.
- Target files, scenes, assets, docs, or data sources.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Phased Procedure

1. Classify the task and confirm this skill is the right standards owner.
2. Inspect only the selected workflow, agent metadata, project state, and task-relevant files.
3. Apply the standard as a checklist against concrete paths; avoid broad, speculative rewrites.
4. Create or update the smallest useful artifact while preserving template-repository surfaces.
5. Run the cheapest meaningful verification first, then stronger checks when risk warrants it.
6. Prepare a handoff with changed files, evidence, risks, and next owner.

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

This skill adapts the CCGS `.claude/rules/design-docs.md` intent into a Codex-native standards skill. Claude-specific rule-file routing is not used as runtime policy.
