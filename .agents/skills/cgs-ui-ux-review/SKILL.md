---
name: cgs-ui-ux-review
description: Use for Codex Game Studio ui ux review work: Review UI and UX implementation for clarity, accessibility, localization, controller support, and player comprehension.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the ui-ux-review objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-ui-ux-review/SKILL.md
source-hash: e24905e0e4f568351d7e4fd2698167a83acf2f6e681cbe15549d81527f2bec8b
user-invocable: true
---

# Codex Game Studio UI UX Review

Use this skill for ui ux review work in Template Game.

## Objective

Review UI and UX implementation for clarity, accessibility, localization, controller support, and player comprehension.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md
- .codex/workflows/ui-ux-review.md

## Procedure

1. Clarify the requested review ui and ux implementation for clarity, accessibility, localization, controller support, and player comprehension. and identify the current project stage.
2. Collect evidence for Friction, Comprehension, Accessibility.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Friction
- Comprehension
- Accessibility
- UX Verdict
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Friction
- Comprehension
- Accessibility
- UX Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.

## Purpose

Use this skill when the repository needs ui-ux-review work with Codex-native model routing, bounded context, and reviewable evidence.

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

This skill is adapted from .agents/skills/cgs-ui-ux-review/SKILL.md when available and translated into Codex-native model, tool-policy, sandbox, and handoff language. Claude-specific model/tool metadata is not used as runtime policy.
