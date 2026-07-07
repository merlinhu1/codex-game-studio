---
name: cgs-launch-checklist
description: Use for launch checklist tasks that coordinate day-of-launch readiness, monitoring, community, support, rollback, and hotfix paths; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the launch-checklist objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/launch-checklist/SKILL.md
source-hash: 867e94f20e9b5da3855a37b032bd01801cdceed899eb95ecea7588abed5b188c
user-invocable: true
---

# Codex Game Studio Launch Checklist

Use this skill for launch checklist work in Template Game.

## Objective

Coordinate day-of-launch readiness, monitoring, community, support, rollback, and hotfix paths.

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

1. Clarify the requested coordinate day-of-launch readiness, monitoring, community, support, rollback, and hotfix paths. and identify the current project stage.
2. Collect evidence for Launch Readiness, Monitoring, Support.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Launch Readiness
- Monitoring
- Support
- Rollback
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Launch Readiness
- Monitoring
- Support
- Rollback
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
