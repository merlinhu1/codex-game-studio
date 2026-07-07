---
name: cgs-localize
description: Use for localize tasks that plan localization keys, context, screenshots, pluralization, text expansion, and review workflow; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4
model_reasoning_effort: medium
argument-hint: Describe the localize objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/localize/SKILL.md
source-hash: 781f60f1c4259cfb3ceac0316a792a6d55659aaf20981f1c6e6a3d1dfacae83c
user-invocable: true
---

# Codex Game Studio Localize

Use this skill for localize work in Template Game.

## Objective

Plan localization keys, context, screenshots, pluralization, text expansion, and review workflow.

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

1. Clarify the requested plan localization keys, context, screenshots, pluralization, text expansion, and review workflow. and identify the current project stage.
2. Collect evidence for String Context, Text Expansion, Locale Risk.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- String Context
- Text Expansion
- Locale Risk
- Review
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- String Context
- Text Expansion
- Locale Risk
- Review
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
