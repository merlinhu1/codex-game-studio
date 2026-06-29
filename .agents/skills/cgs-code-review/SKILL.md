---
name: cgs-code-review
description: Use for Codex Game Studio code review work: Review changes for correctness, maintainability, security, tests, engine idioms, and scope control.
model: gpt-5.4
model_reasoning_effort: medium
argument-hint: Describe the code-review objective, target files/assets, constraints, and verification evidence.
primary-agent: gameplay-programmer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/code-review/SKILL.md
source-hash: e0abfa89a0a22bb3cfb9042941efc8f7ffb2a73b4f92884ef8eaba670366ca53
user-invocable: true
---

# Codex Game Studio Code Review

Use this skill for code review work in Template Game.

## Objective

Review changes for correctness, maintainability, security, tests, engine idioms, and scope control.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- design/gdd.md

## Procedure

1. Clarify the requested review changes for correctness, maintainability, security, tests, engine idioms, and scope control. and identify the current project stage.
2. Collect evidence for Correctness, Maintainability, Security.
3. Compare options, choose the smallest reversible technical path, and record consequences.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- docs/architecture/

## Output Contract

- Summary
- Correctness
- Maintainability
- Security
- Review Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Correctness
- Maintainability
- Security
- Review Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.

## Purpose

Use this skill when the repository needs code-review work with Codex-native model routing, bounded context, and reviewable evidence.

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

This skill is adapted from .claude/skills/code-review/SKILL.md when available and translated into Codex-native model, tool-policy, sandbox, and handoff language. Claude-specific model/tool metadata is not used as runtime policy.
