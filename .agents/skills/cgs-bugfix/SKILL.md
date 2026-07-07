---
name: cgs-bugfix
description: Use for bugfix tasks that fix a bounded bug with reproduction evidence, minimal change, regression coverage, and handoff notes; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.4
model_reasoning_effort: medium
argument-hint: Describe the bugfix objective, target files/assets, constraints, and verification evidence.
primary-agent: gameplay-programmer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .agents/skills/cgs-bugfix/SKILL.md
source-hash: 9c9909acf4428d5e650fdb74bb56791d8217c791294077b2cdf78c80446dafdd
user-invocable: true
---

# Codex Game Studio Bugfix

Use this skill for bugfix work in Template Game.

## Objective

Fix a bounded bug with reproduction evidence, minimal change, regression coverage, and handoff notes.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- production/session-state/active.md
- tests/
- .codex/workflows/bugfix.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested fix a bounded bug with reproduction evidence, minimal change, regression coverage, and handoff notes. and identify the current project stage.
2. Collect evidence for Reproduction, Minimal Fix, Regression Test.
3. Run or define the focused validation loop before reporting conclusions.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- tests/
- production/session-state/
- prototypes/

## Output Contract

- Summary
- Reproduction
- Minimal Fix
- Regression Test
- Evidence
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Reproduction
- Minimal Fix
- Regression Test
- Evidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
