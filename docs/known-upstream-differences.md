# Known Upstream Differences

This TypeScript/Node port preserves upstream user-facing outcomes while intentionally avoiding legacy implementation details that caused fragile behavior.

Legacy engine-system checks only partially passed while still reporting success. This port uses hard-failing validation, where any failed check exits nonzero.

Legacy folder-structure checks and project-file path expectations differed from the desired `source/project-<slug>/` contract. This port uses `source/project-<slug>/` for Godot, Unity, and Unreal.

Legacy Unreal naming used multiple labels. This port normalizes `Unreal`, `Unreal Engine`, `unreal`, and `ue5` to canonical `unreal`, while keeping `Unreal Engine` as the display name.

Legacy validation depended on Python and shell assumptions. This port is TypeScript/Node only.

Role roster coverage is preserved through Codex-native IDs: `studio-orchestrator`, `market-analyst`, `data-scientist`, senior design/art roles, game-feel, UI/UX, QA, release, and implementation roles. Legacy underscore aliases such as `producer_agent`, `qa_agent`, and `master_orchestrator` are intentionally not valid role IDs.

Generated projects materialize project-specific `.codex/prompts/<role>.md` files for every role. `AGENTS.md` remains the primary generated Codex instruction surface and is owned by `src/agents.ts`.

Market and analytics are first-class renderable workflows owned by dedicated roles. Their prompts inline the selected package template bodies instead of pointing Codex at project-relative template paths.

Studio orchestration is provided by the `studio-orchestrator` role and the render-only `handoff` workflow shortcut, not by a generated `project_orchestrator.md`.

Richer workflows exist for design specs, game-feel review, art direction, UI/UX review, production milestones, review, ship-check, playtest, bugfix, vertical slice, market, analytics, and handoff. Shortcut workflow commands render prompts only; executable workflow lifecycle support remains future-only.

Intentional omissions for the first build: no interactive `menu`, no `startover`, no generated `project_orchestrator.md`, no exact `template_info.md`, no eager competitor reports during init, and no upstream license/authorship/citation parity documents.

Codex-native difference: `run <role>` invokes `codex exec` by default against the generated bounded prompt packet. `--dry-run` and `--print-prompt` are the non-executing inspection paths.

Future-only features are not implemented in this build: planner/`next`, telemetry, parallel orchestration, changed-file tracking, prompt-size metrics, and hard output-ownership enforcement.
