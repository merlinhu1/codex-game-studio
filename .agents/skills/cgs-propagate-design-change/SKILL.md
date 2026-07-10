---
name: cgs-propagate-design-change
description: Use for propagate design change tasks that trace a design change through systems, docs, tasks, tests, content, and release risk; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the propagate-design-change objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/propagate-design-change/SKILL.md
source-hash: eba7901d3875f81946ab8803f458d142427102c438296fae83e3f4c4101115ed
user-invocable: true
---

# Codex Game Studio Propagate Design Change

Use this skill for propagate design change work in Template Game.

## Objective

Trace a design change through systems, docs, tasks, tests, content, and release risk.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested trace a design change through systems, docs, tasks, tests, content, and release risk. and identify the current project stage.
2. Collect evidence for Change Summary, Affected Systems, Required Updates.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Change Summary
- Affected Systems
- Required Updates
- Regression Risk
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Change Summary
- Affected Systems
- Required Updates
- Regression Risk
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
