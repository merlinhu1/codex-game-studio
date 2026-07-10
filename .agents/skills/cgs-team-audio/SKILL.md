---
name: cgs-team-audio
description: Use for team audio tasks that coordinate audio design, implementation, asset readiness, mix targets, and QA for audio work; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: low
argument-hint: Describe the team-audio objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/team-audio/SKILL.md
source-hash: 6dd03358962dbef74b6c67e7d34383e0721571a534b75f1ba562f39e92287416
user-invocable: true
---

# Codex Game Studio Team Audio

Use this skill for team audio work in Template Game.

## Objective

Coordinate audio design, implementation, asset readiness, mix targets, and QA for audio work.

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

1. Clarify the requested coordinate audio design, implementation, asset readiness, mix targets, and qa for audio work. and identify the current project stage.
2. Collect evidence for Audio Goal, Asset Need, Mix Target.
3. Coordinate handoffs between disciplines and name each owner, artifact, and validation need.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- design/

## Output Contract

- Summary
- Audio Goal
- Asset Need
- Mix Target
- QA Note
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Audio Goal
- Asset Need
- Mix Target
- QA Note
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
