---
name: cgs-retrospective
description: Use for retrospective tasks that facilitate a retrospective with what worked, what failed, root causes, actions, and owner follow-up; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: low
argument-hint: Describe the retrospective objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/retrospective/SKILL.md
source-hash: 60f9525887c94e4cf8239de3a2078389e6d6b19dd9f10705772490650c11ffda
user-invocable: true
---

# Codex Game Studio Retrospective

Use this skill for retrospective work in Template Game.

## Objective

Facilitate a retrospective with what worked, what failed, root causes, actions, and owner follow-up.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested facilitate a retrospective with what worked, what failed, root causes, actions, and owner follow-up. and identify the current project stage.
2. Collect evidence for Went Well, Did Not Work, Root Cause.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Went Well
- Did Not Work
- Root Cause
- Action Item
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Went Well
- Did Not Work
- Root Cause
- Action Item
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
