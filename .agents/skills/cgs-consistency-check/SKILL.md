---
name: cgs-consistency-check
description: Use for consistency check tasks that find contradictions across design, narrative, systems, UI, content, and implementation artifacts; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: medium
argument-hint: Describe the consistency-check objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/consistency-check/SKILL.md
source-hash: a6a87d4512c9bc3c0dd03b5551f438770259345c8802ec6247f7455e85a20e77
user-invocable: true
---

# Codex Game Studio Consistency Check

Use this skill for consistency check work in Template Game.

## Objective

Find contradictions across design, narrative, systems, UI, content, and implementation artifacts.

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

1. Clarify the requested find contradictions across design, narrative, systems, ui, content, and implementation artifacts. and identify the current project stage.
2. Collect evidence for Contradiction, Canonical Source, Affected Files.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Contradiction
- Canonical Source
- Affected Files
- Resolution
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Contradiction
- Canonical Source
- Affected Files
- Resolution
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
