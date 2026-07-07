---
model: gpt-5.5
model_reasoning_effort: high
primary-agent: market-analyst
linked-skills: [cgs-standards-gameplay, cgs-vertical-slice]
phase: plan
risk: high
argument-hint: Provide a market analysis request with the objective or decision, target files/assets/milestone, scope constraints, owner or handoff needs, and required verification evidence.
source-reference: .codex/workflows/market-analysis.md
source-hash: 79df4ced2d1e89e860f5d1e4560fb17e57a31b713b64a76f8c0f4e9b2f2e7853
output-artifacts: [plan, changed-files, verification-evidence, handoff]
---

# Market Analysis Workflow

## Purpose

Analyze audience, competitors, positioning, pricing, and market risks for the current project.


## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/market-analysis.md
- resources/market-research/market-overview.md

## Role

Market Analyst (market-analyst) owns this workflow.

## Taxonomy

Category: onboarding-discovery
CCGS adaptation coverage:
- market discovery
- competitor positioning

CLI aliases:
- market

## Outputs

- Market analysis
- Competitor positioning
- Audience risks

## Validation

- Assumptions are explicit
- Competitors are tied to project constraints
- Recommendations are actionable

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
