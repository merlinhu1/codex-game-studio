---
name: cgs-release-checklist
description: Use for release checklist tasks that check build, packaging, store, QA, localization, accessibility, rollback, and ship/no-ship readiness; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-sol
model_reasoning_effort: high
argument-hint: Describe the release-checklist objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/release-checklist/SKILL.md
source-hash: a4c4294234e7ba6ba51718ba6a0996c68dd1e4f9cefc30286936878a827bc86a
user-invocable: true
---

# Codex Game Studio Release Checklist

Use this skill for release checklist work in Template Game.

## Objective

Check build, packaging, store, QA, localization, accessibility, rollback, and ship/no-ship readiness.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/
- .codex/workflows/release-checklist.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested check build, packaging, store, qa, localization, accessibility, rollback, and ship/no-ship readiness. and identify the current project stage.
2. Collect evidence for Build Evidence, Blocking Issues, Rollback.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Build Evidence
- Blocking Issues
- Rollback
- Ship Verdict
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Build Evidence
- Blocking Issues
- Rollback
- Ship Verdict
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
