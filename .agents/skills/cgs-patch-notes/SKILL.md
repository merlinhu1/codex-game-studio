---
name: cgs-patch-notes
description: Use for patch notes tasks that write player-facing patch notes with fixes, known issues, balance changes, and verification caveats; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4-mini
model_reasoning_effort: low
argument-hint: Describe the patch-notes objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/patch-notes/SKILL.md
source-hash: ffb34d12e0d3fe21d31e6406a77b6db77b16a8185358ee8183b08de584498d30
user-invocable: true
---

# Codex Game Studio Patch Notes

Use this skill for patch notes work in Template Game.

## Objective

Write player-facing patch notes with fixes, known issues, balance changes, and verification caveats.

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

1. Clarify the requested write player-facing patch notes with fixes, known issues, balance changes, and verification caveats. and identify the current project stage.
2. Collect evidence for Player Summary, Fix List, Known Issues.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Player Summary
- Fix List
- Known Issues
- Version
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Player Summary
- Fix List
- Known Issues
- Version
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
