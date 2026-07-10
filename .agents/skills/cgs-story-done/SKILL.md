---
name: cgs-story-done
description: Use for story done tasks that check if a story is complete with changed files, tests, acceptance evidence, and handoff notes; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: medium
argument-hint: Describe the story-done objective, target files/assets, constraints, and verification evidence.
primary-agent: gameplay-programmer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/story-done/SKILL.md
source-hash: a9215959142b6417223ff818f99f2f33b10d401bb9ff446f622ec8573433b261
user-invocable: true
---

# Codex Game Studio Story Done

Use this skill for story done work in Template Game.

## Objective

Check if a story is complete with changed files, tests, acceptance evidence, and handoff notes.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- production/session-state/active.md
- .codex/workflows/story-done.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested check if a story is complete with changed files, tests, acceptance evidence, and handoff notes. and identify the current project stage.
2. Collect evidence for Done Verdict, Changed Files, Evidence.
3. Break the work into owner-sized tasks with dependencies, risks, and acceptance checks.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/

## Output Contract

- Summary
- Done Verdict
- Changed Files
- Evidence
- Follow-up
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Done Verdict
- Changed Files
- Evidence
- Follow-up
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
