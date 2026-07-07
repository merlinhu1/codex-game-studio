---
name: cgs-perf-profile
description: Use for perf profile tasks that profile frame time, memory, loading, assets, rendering, scripting, and platform constraints; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4
model_reasoning_effort: medium
argument-hint: Describe the perf-profile objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/perf-profile/SKILL.md
source-hash: 376f4f24dff70ec9e4a4883ec3352e0008c6c10c3f3660e0a4946b4b48ef7aa7
user-invocable: true
---

# Codex Game Studio Performance Profile

Use this skill for performance profile work in Template Game.

## Objective

Profile frame time, memory, loading, assets, rendering, scripting, and platform constraints.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/
- .codex/workflows/perf-profile.md

## Procedure

1. Clarify the requested profile frame time, memory, loading, assets, rendering, scripting, and platform constraints. and identify the current project stage.
2. Collect evidence for Metric, Budget, Bottleneck.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Metric
- Budget
- Bottleneck
- Optimization
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Metric
- Budget
- Bottleneck
- Optimization
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
