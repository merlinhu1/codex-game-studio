---
name: cgs-content-audit
description: Use for content audit tasks that audit content coverage, duplication, tone consistency, localization needs, and production completeness; produce verification evidence, changed or proposed files, and handoff boundaries.
model_tier: terra
model: gpt-5.6-terra
model_reasoning_effort: high
argument-hint: Describe the content-audit objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/content-audit/SKILL.md
source-hash: 6e17272fe8854e93936f55076d88435f3af2226d4e05d0b8b5f987296f00d8ab
user-invocable: true
---

# Codex Game Studio Content Audit

Use this skill for content audit work in Template Game.

## Objective

Audit content coverage, duplication, tone consistency, localization needs, and production completeness.

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

1. Clarify the requested audit content coverage, duplication, tone consistency, localization needs, and production completeness. and identify the current project stage.
2. Collect evidence for Content Inventory, Tone Drift, Localization Need.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Content Inventory
- Tone Drift
- Localization Need
- Gap List
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Content Inventory
- Tone Drift
- Localization Need
- Gap List
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
