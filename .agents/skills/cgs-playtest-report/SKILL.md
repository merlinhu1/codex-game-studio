---
name: cgs-playtest-report
description: Use for playtest report tasks that capture player observations, comprehension, friction, loop completion, bugs, quotes, and design implications; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the playtest-report objective, target files/assets, constraints, and verification evidence.
primary-agent: qa-playtester
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/playtest-report/SKILL.md
source-hash: 708a99ffe0990079bfe7b34c49a641e6131c32173c966f7c51e588def5e75548
user-invocable: true
---

# Codex Game Studio Playtest Report

Use this skill for playtest report work in Template Game.

## Objective

Capture player observations, comprehension, friction, loop completion, bugs, quotes, and design implications.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested capture player observations, comprehension, friction, loop completion, bugs, quotes, and design implications. and identify the current project stage.
2. Collect evidence for Loop Completion, Friction, Observation.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Loop Completion
- Friction
- Observation
- Design Implication
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Loop Completion
- Friction
- Observation
- Design Implication
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
