---
name: cgs-onboard
description: Use for onboard tasks that orient a new contributor or agent to project state, file layout, stage, risks, and next work; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the onboard objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/onboard/SKILL.md
source-hash: fbf7f691226e4c5fccbfa40423d61d123f3e0088d36b719663cca40e96a5d6d7
user-invocable: true
---

# Codex Game Studio Onboard

Use this skill for onboard work in Template Game.

## Objective

Orient a new contributor or agent to project state, file layout, stage, risks, and next work.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- production/timeline.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested orient a new contributor or agent to project state, file layout, stage, risks, and next work. and identify the current project stage.
2. Collect evidence for Project Map, Current Stage, Open Risks.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Project Map
- Current Stage
- Open Risks
- Next Owner
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Project Map
- Current Stage
- Open Risks
- Next Owner
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
