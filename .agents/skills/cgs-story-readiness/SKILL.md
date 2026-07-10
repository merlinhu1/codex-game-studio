---
name: cgs-story-readiness
description: Use for story readiness tasks that check if a story is implementable with clear inputs, acceptance criteria, dependencies, and validation; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the story-readiness objective, target files/assets, constraints, and verification evidence.
primary-agent: gameplay-programmer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/story-readiness/SKILL.md
source-hash: f1fc25f80f811fd38c53144c305706488c031974a5f0925cdf18986467de90eb
user-invocable: true
---

# Codex Game Studio Story Readiness

Use this skill for story readiness work in Template Game.

## Objective

Check if a story is implementable with clear inputs, acceptance criteria, dependencies, and validation.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/story-readiness.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested check if a story is implementable with clear inputs, acceptance criteria, dependencies, and validation. and identify the current project stage.
2. Collect evidence for Ready, Missing Input, Dependency.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Ready
- Missing Input
- Dependency
- Acceptance Criteria
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Ready
- Missing Input
- Dependency
- Acceptance Criteria
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
