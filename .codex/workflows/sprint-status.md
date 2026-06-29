# Sprint Status Workflow

## Purpose

Summarize sprint status, completed work, blockers, risks, next owners, and verification evidence without mutating task state.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/sprint-status.md
- documentation/production/timeline.md

## Role

Studio Orchestrator (studio-orchestrator) owns this workflow.

## Taxonomy

Category: team-coordination
CCGS adaptation coverage:
- sprint status
- blocker visibility

CLI aliases:
- sprint-status

## Outputs

- Studio handoff
- Next-role routing
- Blocker summary

## Validation

- Next role and reason are explicit
- Scope and blockers are separated
- No hidden planner or parallel execution is implied
