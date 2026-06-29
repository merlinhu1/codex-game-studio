# CCGS Surface Parity Upgrade

This OpenSpec change is the canonical plan for comparing Codex Game Studio against Claude Code Game Studios one surface at a time and upgrading CGS where it falls behind.

## Canonical Artifacts

- `proposal.md`: why the parity audit and upgrade work is needed.
- `design.md`: audit model, quality rubric, Codex-native adaptation decisions, risks, and rollout.
- `specs/ccgs-surface-parity-audit/spec.md`: requirements for one-by-one inventory, mapping, scoring, and reports.
- `specs/codex-surface-quality-upgrades/spec.md`: requirements for upgrading agents, skills, workflows, templates, validation, and behavioral evals.
- `tasks.md`: ordered implementation checklist.

## Reference Baseline

Preliminary local inventory:

- CGS current: 38 roles, 31 workflows, 11 generated skills.
- CCGS reference: 49 `.claude/agents/*.md`, 73 `.claude/skills/*/SKILL.md`, and a 395-line `.claude/docs/workflow-catalog.yaml`.

The implementation must generate a full parity matrix before claiming upgrade coverage.
