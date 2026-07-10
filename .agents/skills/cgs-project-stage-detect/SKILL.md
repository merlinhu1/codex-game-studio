---
name: cgs-project-stage-detect
description: Use for project stage detect tasks that detect whether the project is in concept, design, technical setup, pre-production, production, polish, or release; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-luna
model_reasoning_effort: medium
argument-hint: Describe the project-stage-detect objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/project-stage-detect/SKILL.md
source-hash: dffa5112b8d3c4ef53bc3ee6bede90d0f3f4b938ad3a00238f1209f0fa0e7e19
user-invocable: true
---

# Codex Game Studio Project Stage Detect

Use this skill for project stage detect work in Template Game.

## Objective

Detect whether the project is in concept, design, technical setup, pre-production, production, polish, or release.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- docs/architecture/README.md
- production/timeline.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested detect whether the project is in concept, design, technical setup, pre-production, production, polish, or release. and identify the current project stage.
2. Collect evidence for Stage Evidence, Missing Required Artifact, Recommended Phase.
3. Apply the standard and report concrete violations.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- AGENTS.md
- .codex/studio.json
- production/timeline.md

## Output Contract

- Summary
- Stage Evidence
- Missing Required Artifact
- Recommended Phase
- Confidence
- Risks
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Stage Evidence
- Missing Required Artifact
- Recommended Phase
- Confidence
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
