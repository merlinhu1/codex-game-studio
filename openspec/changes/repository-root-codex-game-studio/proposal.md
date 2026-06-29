## Why

Codex Game Studio currently behaves like a package source checkout that creates nested `projects/<slug>` workspaces. CCGS demonstrates a better install strategy for game development: clone the repository as the game root so the first agent session sees game instructions, game roles, and game workflows immediately.

The current root `src/`, `docs/`, `AGENTS.md`, and `.codex/agents/**` also contain package-maintainer material that can derail a game-development Codex session. The repository-root template must separate game-facing surfaces from Codex Game Studio implementation and maintenance surfaces.

## What Changes

- **BREAKING**: The primary install path changes to `git clone <repo> my-game`; the cloned repository is the game root.
- **BREAKING**: Default `init` configures the current repository root instead of creating `projects/<slug>`.
- **BREAKING**: Root `src/` and `docs/` become game-facing paths. Package implementation source, maintainer docs, implementation plans, and Truthmark maintenance docs move to an isolated maintenance location or out of the distributed template.
- Generate Codex-native project custom agents as `.codex/agents/*.toml` with `name`, `description`, and `developer_instructions`.
- Generate Codex-native workflow and standards skills as `.agents/skills/<name>/SKILL.md`.
- Keep `.codex/prompts/**` and `.codex/workflows/**` as CGS runtime artifacts during migration.
- Keep `.codex/rules/*.rules` reserved for Codex sandbox command permission rules, not coding standards.
- Do not generate Codex hooks by default.
- Preserve legacy nested project support only behind an explicit migration option if needed.

## Capabilities

### New Capabilities

- `repository-root-template`: The cloned repository is a game root and default initialization configures the current root.
- `codex-native-game-surfaces`: The game root exposes Codex-native custom agents, skills, instructions, and runtime prompt mirrors.
- `game-facing-repository-boundary`: Game-facing paths remain free of package-maintainer source, plans, Truthmark maintenance docs, and maintenance agents.

### Modified Capabilities

None. This repository did not have existing OpenSpec specs before this change.

## Impact

- CLI behavior: `init`, `run`, `status`, validation, dry-run, and legacy `--project` handling.
- Source layout: package implementation may need to move under `tooling/codex-game-studio/**` or to a separate maintainer repository.
- Generated surfaces: root `AGENTS.md`, `.codex/agents/*.toml`, `.agents/skills/**`, `.codex/prompts/**`, `.codex/workflows/**`, `.codex/studio.json`, and `.codex/context-manifest.json`.
- Documentation layout: root `docs/` changes from package docs to game docs only.
- Tests: template-root smoke tests, validation tests, agent/skill rendering tests, runner tests, and optional Codex debug probe.
- Migration: existing nested `projects/<slug>` users need an explicit compatibility path during the transition.
