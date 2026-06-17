---
status: active
doc_type: workflow
last_reviewed: 2026-05-28
source_of_truth:
  - ../../AGENTS.md
---

# Repository Rules

## Purpose

This file mirrors the repository-specific agent rules from `AGENTS.md` in the configured Truthmark authority tree so structure and sync workflows can find them through the documented authority roots.

## Rules

- Use `npm run validate` before any parity claim.
- This project uses `"type": "module"`, `module: "NodeNext"`, and `moduleResolution: "NodeNext"`; relative TypeScript imports must use emitted `.js` specifiers.
- For local development before install/link, use npm scripts that build first and exercise `node dist/cli.js`.
- Keep generated game projects under `projects/<slug>/`.
- Do not load all agents or all templates for a single role task.
- `src/agents.ts` is the single owner for generated project `AGENTS.md`.
- Direct Codex execution is the default path via `opengamestudio run <role>`.
- `--dry-run` and `--print-prompt` are inspection-only paths.
- Telemetry, planner/next, ownership enforcement, and parallel orchestration are future-only.
- Read `docs/architecture/product-boundary.md` before creating or revising designs, implementation plans, OpenSpec changes, generated project surfaces, role/workflow expansions, approval/write-policy behavior, or runtime execution behavior.

## Truthmark Notes

Keep the Truthmark-managed block in `AGENTS.md` intact. If these rules change in `AGENTS.md`, update this file in the same pass.
