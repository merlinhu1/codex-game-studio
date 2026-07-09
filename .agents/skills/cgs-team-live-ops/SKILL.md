---
name: cgs-team-live-ops
description: Use for team live ops tasks that coordinate events, telemetry, economy, content cadence, support, and incident readiness; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the team-live-ops objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/team-live-ops/SKILL.md
source-hash: 214cc07ec8e83074d9ca16236ab867cd552e2de481aca7d225c06013b057dd90
user-invocable: true
---

# Codex Game Studio Team Live Ops

Use this skill for team live ops work in Template Game.

## Objective

Coordinate events, telemetry, economy, content cadence, support, and incident readiness.

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

1. Clarify the requested coordinate events, telemetry, economy, content cadence, support, and incident readiness. and identify the current project stage.
2. Collect evidence for Live Event, Telemetry, Support.
3. Coordinate handoffs between disciplines and name each owner, artifact, and validation need.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- design/

## Output Contract

- Summary
- Live Event
- Telemetry
- Support
- Incident Plan
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Live Event
- Telemetry
- Support
- Incident Plan
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
