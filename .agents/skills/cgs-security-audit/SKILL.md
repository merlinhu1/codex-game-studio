---
name: cgs-security-audit
description: Use for Codex Game Studio security audit work: Audit secrets, network surfaces, auth, saves, platform APIs, dependencies, and exploit risks.
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

## Handoff

Report changed files, verification evidence, remaining risks, and the next owner or decision. Do not imply hidden hooks or autonomous background work.
