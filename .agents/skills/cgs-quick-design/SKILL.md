---
name: cgs-quick-design
description: Use for quick design tasks that draft a constrained design slice fast while preserving pillars, assumptions, and open questions; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.5
model_reasoning_effort: high
argument-hint: Describe the quick-design objective, target files/assets, constraints, and verification evidence.
primary-agent: game-designer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/quick-design/SKILL.md
source-hash: e1274daaef2d2f925bc98944013e9ec31c25e4ad0906345fda744a7a59271d7a
user-invocable: true
---

# Codex Game Studio Quick Design

Use this skill for quick design work in Template Game.

## Objective

Draft a constrained design slice fast while preserving pillars, assumptions, and open questions.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- design/gdd.md
- docs/market-overview.md

## Procedure

1. Clarify the requested draft a constrained design slice fast while preserving pillars, assumptions, and open questions. and identify the current project stage.
2. Collect evidence for Design Hypothesis, Constraints, Acceptance Criteria.
3. Draft or review the artifact in small sections, keeping player experience and scope visible.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- design/

## Output Contract

- Summary
- Design Hypothesis
- Constraints
- Acceptance Criteria
- Open Questions
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Design Hypothesis
- Constraints
- Acceptance Criteria
- Open Questions
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
