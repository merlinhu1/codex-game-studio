# Release Checklist Workflow

## Purpose

Create a release checklist with blockers, warnings, validation commands, packaging checks, rollback notes, and communication needs.

## Inputs

- AGENTS.md
- .codex/studio.json
- .codex/workflows/release-checklist.md
- documentation/production/timeline.md

## Role

Release Manager (release-manager) owns this workflow.

## Taxonomy

Category: release-hotfix
CCGS adaptation coverage:
- release checklist
- ship gate verification

CLI aliases:
- release-checklist

## Outputs

- Ship checklist
- Release risks
- Validation summary

## Validation

- Blockers are separated from warnings
- Validation is current
- Packaging risks are explicit
