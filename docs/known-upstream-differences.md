# Known Upstream Differences

This TypeScript/Node port preserves upstream user-facing outcomes while intentionally avoiding legacy implementation details that caused fragile behavior.

Legacy engine-system checks only partially passed while still reporting success. This port uses hard-failing validation, where any failed check exits nonzero.

Legacy folder-structure checks and project-file path expectations differed from the desired `source/project-<slug>/` contract. This port uses `source/project-<slug>/` for Godot, Unity, and Unreal.

Legacy Unreal naming used multiple labels. This port normalizes `Unreal`, `Unreal Engine`, `unreal`, and `ue5` to canonical `unreal`, while keeping `Unreal Engine` as the display name.

Legacy validation depended on Python and shell assumptions. This port is TypeScript/Node only.

Intentional omissions for the first build: no interactive `menu`, no `startover`, no generated `project_orchestrator.md`, no exact `template_info.md`, no eager competitor reports during init, and no upstream license/authorship/citation parity documents.

Codex-native difference: `run --exec` invokes `codex exec` directly against the generated bounded prompt packet instead of requiring a separate manual command.

Future-only features are not implemented in this build: planner/`next`, telemetry, parallel orchestration, changed-file tracking, prompt-size metrics, and hard output-ownership enforcement.
