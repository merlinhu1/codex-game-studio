---
name: cgs-team-combat
description: Use for team combat tasks that coordinate combat design, implementation, tuning, animation, VFX, audio, and QA handoffs; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: low
argument-hint: Describe the team-combat objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/team-combat/SKILL.md
source-hash: 8a3de29e9ac63a38d025ac5451c0c93626f651741e1002f159b9983f4a31af05
user-invocable: true
---

# Codex Game Studio Team Combat

Use this skill for team combat work in Template Game.

## Objective

Coordinate combat design, implementation, tuning, animation, VFX, audio, and QA handoffs.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/timeline.md
- task-relevant team files

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested coordinate combat design, implementation, tuning, animation, vfx, audio, and qa handoffs. and identify the current project stage.
2. Collect evidence for Combat Goal, Tuning, Feedback.
3. Coordinate handoffs between disciplines and name each owner, artifact, and validation need.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- design/

## Output Contract

- Summary
- Combat Goal
- Tuning
- Feedback
- QA Scenario
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Combat Goal
- Tuning
- Feedback
- QA Scenario
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
