# Design: Final template/rule parity closure

## Template adaptation

Each remaining CCGS template row becomes a package template entry in `src/templates.ts` and a corresponding file under `templates/`. The template ids intentionally keep the upstream hyphenated ids so the parity audit can match source rows directly.

The new template files use the existing package-template contract:

- `# Purpose`
- `# Inputs`
- `# Outputs`
- `# Validation`

This keeps them lightweight, Codex-native, and package-valid while preserving the CCGS artifact names as explicit selectable surfaces.

## Rule adaptation

CCGS rule files are not copied into a Claude-compatible rules directory. Each rule row maps to a `cgs-standards-<source-id>` repository skill in `.agents/skills/` and a corresponding `standards(...)` profile in `src/skills.ts`.

The parity audit marks a rule row implemented only when `templateSkillDefinitions()` exposes the expected standards skill. This keeps the generated report tied to an actual Codex surface instead of a hardcoded status override.

## Verification strategy

- RED tests in `tests/ccgs-parity-audit.test.ts` require all template rows to become implemented package templates and all rule rows to become implemented standards skills.
- Regenerate `references/ccgs-*` to confirm remaining rows reach zero.
- Regenerate prompt-surface references because the local skill count increases.
- Run focused tests, typecheck, full tests, repository validation, OpenSpec validation, and diff hygiene checks.
