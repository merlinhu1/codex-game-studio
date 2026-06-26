# Known Upstream Differences

This TypeScript/Node port preserves upstream user-facing outcomes while intentionally avoiding legacy implementation details that caused fragile behavior.

Legacy engine-system checks only partially passed while still reporting success. This port uses hard-failing validation, where any failed check exits nonzero.

Legacy folder-structure checks and project-file path expectations differed from the desired `source/project-<slug>/` contract. This port uses `source/project-<slug>/` for Godot, Unity, and Unreal.

Legacy Unreal naming used multiple labels. This port normalizes `Unreal`, `Unreal Engine`, `unreal`, and `ue5` to canonical `unreal`, while keeping `Unreal Engine` as the display name.

Legacy validation depended on Python and shell assumptions. This port is TypeScript/Node only.

Role roster coverage is preserved through Codex-native IDs: `studio-orchestrator`, `market-analyst`, `data-scientist`, senior design/art roles, game-feel, UI/UX, QA, release, and implementation roles. Legacy underscore aliases such as `producer_agent`, `qa_agent`, and `master_orchestrator` are intentionally not valid role IDs.

Generated projects materialize project-specific `.codex/prompts/<role>.md` files for every role. `run <role>` inlines the current generated project role prompt instead of falling back to the package role prompt. `AGENTS.md` remains the primary generated Codex instruction surface and is owned by `src/agents.ts`.

Market and analytics are first-class renderable workflows owned by dedicated roles. Workflow prompts and normal role runs inline selected package template bodies instead of pointing Codex at project-relative template paths or loading every template.

Studio orchestration is provided through Codex-native roles, file-backed task state, explicit `task orchestrate` execution, selected workflow task recipes, and bounded workflow surfaces, not by a generated `project_orchestrator.md`.

Richer workflows exist for design specs, game-feel review, art direction, UI/UX review, production milestones, review, ship-check, playtest, bugfix, vertical slice, market, analytics, and handoff. Shortcut workflow commands render prompts. Supported workflow recipes such as `vertical-slice`, `bugfix`, `ui-ux-review`, and `release-checklist` can explicitly create `.codex/tasks.json` task graphs before `task orchestrate` runs them.

Intentional omissions for the first build: no interactive `menu`, no `startover`, no generated `project_orchestrator.md`, no exact `template_info.md`, no eager competitor reports during init, and no upstream license/authorship/citation parity documents.

Codex-native difference: `run <role>` invokes `codex exec` by default against the generated bounded prompt packet. `--dry-run` and `--print-prompt` are the non-executing inspection paths. `--allow-broad-context` performs bounded discovery of existing project artifacts rather than recursive ingestion, and `--fix` receives the same generated role prompt and selected templates as the primary implementation prompt.

Generated role prompts and workflow files include freshness metadata and rendered-body hashes for new projects. Validation reports legacy missing-metadata files as regeneration-needed skip diagnostics instead of treating them as fresh.

Future-only features still not implemented in this build include planner/`next`, telemetry, changed-file tracking, prompt-size metrics, hard output-ownership enforcement, hosted/background orchestration, unbounded parallelism, legacy `.gamestudio` compatibility, `CODEX.md`, and `project_orchestrator.md`. Explicit local task orchestration is implemented as foreground, bounded, file-backed CLI behavior.
