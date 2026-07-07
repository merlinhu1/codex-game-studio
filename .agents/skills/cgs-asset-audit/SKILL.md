---
name: cgs-asset-audit
description: Use for asset audit tasks that audit game assets for completeness, naming, import settings, ownership, licensing, and production risk; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the asset-audit objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/asset-audit/SKILL.md
source-hash: d499694d99c8b9341c1ca7a5f6bcc50fefebd8b6cbec7f132ec2f4fd678c1725
user-invocable: true
---

# Codex Game Studio Asset Audit

Use this skill for asset audit work in Template Game.

## Objective

Audit game assets for completeness, naming, import settings, ownership, licensing, and production risk.

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

1. Clarify the requested audit game assets for completeness, naming, import settings, ownership, licensing, and production risk. and identify the current project stage.
2. Collect evidence for Asset Inventory, Import Risk, Missing Asset.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Asset Inventory
- Import Risk
- Missing Asset
- Licensing Note
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Asset Inventory
- Import Risk
- Missing Asset
- Licensing Note
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
