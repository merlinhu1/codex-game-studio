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
- For source-checkout usage, run `npm install && npm run build` first, then use `./codex-game-studio ...`; generated bundled CLI artifacts are not committed.
- Keep tracked game-template surfaces in the repository root.
- Do not load all agents or all templates for a single role task.
- Root `AGENTS.md` is a tracked game-template file, not an init-generated file.
- Direct Codex execution is the default path via `codex-game-studio run <role>`.
- `--dry-run` and `--print-prompt` are inspection-only paths.
- Explicit, file-backed task orchestration is now inside the product boundary; telemetry, planner/next, ownership enforcement, hosted orchestration, background loops, and unbounded parallelism remain future-only.
- Read `docs/architecture/product-boundary.md` before creating or revising designs, implementation plans, OpenSpec changes, template/project surfaces, role/workflow expansions, approval/write-policy behavior, or runtime execution behavior.

## Truthmark Notes

Keep the Truthmark-managed block in `AGENTS.md` intact. If these rules change in `AGENTS.md`, update this file in the same pass.
