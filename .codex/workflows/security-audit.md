---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: security-engineer
linked-skills: [cgs-security-audit, cgs-vertical-slice]
phase: review
risk: high
argument-hint: Provide a security audit request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/security-audit.md
source-hash: 9c3da9ef0ffb2084e33e3f720e10457c7cbaf2609174e48540db7abaff197737
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Security Audit Workflow

## Purpose

Review security, secrets, dependencies, online surfaces, abuse cases, and mitigation priorities for the project or feature.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/security-audit.md

## Role

Security Engineer (security-engineer) owns this workflow.

## Taxonomy

Category: qa-testing
CCGS adaptation coverage:
- security review
- abuse-case inspection

CLI aliases:
- security-audit

## Outputs

- Security review
- Threat notes
- Mitigation checklist

## Validation

- Threats are tied to project surfaces
- Secrets and dependencies are considered
- Mitigations are actionable

## Phase Gates

- Confirm project state, owner role, write policy, and selected context.
- Name acceptance criteria before implementation or review work.
- Do not advance to handoff until evidence is recorded or a blocker is explicit.

## Required Artifacts

- Summary of the workflow result.
- Files, assets, tasks, or docs changed or proposed.
- Verification evidence and unresolved risks.

## Context Contract

- Load AGENTS.md, .codex/studio.json, this workflow, the primary agent, linked skills, and only task-relevant project files.
- Avoid broad context unless the user explicitly approves it.

## Output Contract

- Decision or change summary.
- Step-by-step work performed or planned.
- Evidence, blockers, warnings, and next owner.

## Stop Conditions

- Required project state, approval, target files, or verification path is missing.
- The task crosses into another role without an explicit handoff.
- The workflow would require generated prompt mirrors or hidden automation.

## Handoff

Report changed files, validation evidence, residual risks, and the next owner only when ownership changes.
