---
name: cgs-prototype
description: Use for prototype tasks that build or plan a throwaway concept prototype around a falsifiable design hypothesis and cleanup boundary; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: medium
argument-hint: Describe the prototype objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/prototype/SKILL.md
source-hash: d9475f988c6ec1bb676ab5d8149ef7b7321e63a6b4eb7f7194cfd598be1255de
user-invocable: true
---

# Codex Game Studio Prototype

Use this skill for prototype work in Template Game.

## Objective

Build or plan a throwaway concept prototype around a falsifiable design hypothesis and cleanup boundary.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/
- .codex/workflows/prototype.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested build or plan a throwaway concept prototype around a falsifiable design hypothesis and cleanup boundary. and identify the current project stage.
2. Collect evidence for Prototype Hypothesis, Throwaway Boundary, Success Signal.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Prototype Hypothesis
- Throwaway Boundary
- Success Signal
- Cleanup
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Prototype Hypothesis
- Throwaway Boundary
- Success Signal
- Cleanup
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
