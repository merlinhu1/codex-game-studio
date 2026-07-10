---
name: cgs-team-polish
description: Use for team polish tasks that coordinate final polish across game feel, UI, audio, art, bugs, performance, and accessibility; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the team-polish objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/team-polish/SKILL.md
source-hash: fb4d48c5bd8f2563d6f999bea940929a20b8c52ed797b306a999e2b4d5596d26
user-invocable: true
---

# Codex Game Studio Team Polish

Use this skill for team polish work in Template Game.

## Objective

Coordinate final polish across game feel, UI, audio, art, bugs, performance, and accessibility.

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

1. Clarify the requested coordinate final polish across game feel, ui, audio, art, bugs, performance, and accessibility. and identify the current project stage.
2. Collect evidence for Polish Target, Player Impact, Risk.
3. Coordinate handoffs between disciplines and name each owner, artifact, and validation need.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- design/

## Output Contract

- Summary
- Polish Target
- Player Impact
- Risk
- Verification
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Polish Target
- Player Impact
- Risk
- Verification
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
