---
name: cgs-security-audit
description: Use for security audit tasks that audit secrets, network surfaces, auth, saves, platform APIs, dependencies, and exploit risks; produce verification evidence, changed or proposed files, and handoff boundaries.
model: gpt-5.6-sol
model_reasoning_effort: xhigh
argument-hint: Describe the security-audit objective, target files/assets, constraints, and verification evidence.
primary-agent: producer
tool-policy: read/edit/shell/tests/git as needed within the repository write policy
isolation: repository-root; no init-time generated prompt bodies
source-reference: .claude/skills/security-audit/SKILL.md
source-hash: b3d04c89f1841ef93bedce57a8bb43d858ca96a92aac8b8182e9d54fe1d319f4
user-invocable: true
---

# Codex Game Studio Security Audit

Use this skill for security audit work in Template Game.

## Objective

Audit secrets, network surfaces, auth, saves, platform APIs, dependencies, and exploit risks.

## Inputs

- AGENTS.md
- .codex/studio.json
- task-relevant files named by the user or task record
- production/timeline.md
- docs/market-overview.md
- tests/
- .codex/workflows/security-audit.md

## Arguments

- Objective or user request.
- Target files, scenes, assets, or docs.
- Constraints, deadlines, acceptance criteria, and verification command when known.

## Procedure

1. Clarify the requested audit secrets, network surfaces, auth, saves, platform apis, dependencies, and exploit risks. and identify the current project stage.
2. Collect evidence for Secret, Attack Surface, Exploit Risk.
3. Separate blockers from warnings and include rollback or deferral options.
4. Produce the requested artifact or review with clear file paths and verification evidence.

## Write Targets

- production/
- docs/

## Output Contract

- Summary
- Secret
- Attack Surface
- Exploit Risk
- Mitigation
- Blocking issues
- Changed files or proposed files
- Verification evidence
- Next owner or decision

## Quality Gates

- Secret
- Attack Surface
- Exploit Risk
- Mitigation
- Scope remains bounded to the current task and project stage.
- Report labels unverified assumptions separately from evidence.

## Decision Gates

- Continue only when the expected output can be verified or clearly labeled as a plan.
- Escalate to producer or qa-playtester when scope, ownership, or acceptance evidence is ambiguous.
- Stop before broad rewrites, generated prompt mirrors, or hidden lifecycle behavior.

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
