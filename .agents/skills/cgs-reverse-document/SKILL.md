---
name: cgs-reverse-document
description: Use for reverse document tasks that create design or technical documentation from existing implementation without inventing unverified behavior; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the reverse-document objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/reverse-document/SKILL.md
source-hash: 71d5beda61de4815f52bb63b38780f55f890db6dd8c5d22842b1b179fb393876
user-invocable: true
---

# Codex Game Studio Reverse Document

Use this skill for reverse document work in Template Game.

## Objective

Create design or technical documentation from existing implementation without inventing unverified behavior.

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

1. Clarify the requested create design or technical documentation from existing implementation without inventing unverified behavior. and identify the current project stage.
2. Collect evidence for Observed Behavior, Evidence Path, Unknowns.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Observed Behavior
- Evidence Path
- Unknowns
- Documentation Draft
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Observed Behavior
- Evidence Path
- Unknowns
- Documentation Draft
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
