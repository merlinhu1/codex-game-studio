---
name: cgs-team-narrative
description: Use for team narrative tasks that coordinate narrative content, dialogue, localization, implementation hooks, and consistency review; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the team-narrative objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/team-narrative/SKILL.md
source-hash: 9959626482ed8607f8a93a7fcf2c3d03546621592784d56a22b70cfe387ca0d4
user-invocable: true
---

# Codex Game Studio Team Narrative

Use this skill for team narrative work in Template Game.

## Objective

Coordinate narrative content, dialogue, localization, implementation hooks, and consistency review.

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

1. Clarify the requested coordinate narrative content, dialogue, localization, implementation hooks, and consistency review. and identify the current project stage.
2. Collect evidence for Narrative Goal, Content, Localization.
3. Coordinate handoffs between disciplines and name each owner, artifact, and validation need.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- design/

## Output Contract

- Summary
- Narrative Goal
- Content
- Localization
- Consistency
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Narrative Goal
- Content
- Localization
- Consistency
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
