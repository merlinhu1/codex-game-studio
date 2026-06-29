## ADDED Requirements

### Requirement: Clone root is the game root
The system SHALL treat the repository root as the primary game project root after a plain clone.

#### Scenario: Fresh clone opens as a game workspace
- **WHEN** a user clones the repository into `my-game` and opens Codex from `my-game`
- **THEN** root `AGENTS.md`, `.codex/agents/*.toml`, and `.agents/skills/*/SKILL.md` describe game development rather than Codex Game Studio package maintenance

#### Scenario: Root game paths are present
- **WHEN** the template root is inspected
- **THEN** root `src/`, `assets/`, `design/`, `docs/`, `tests/`, `tools/`, and `production/` exist as game project paths

### Requirement: Default init configures current root
The `init` command SHALL configure the current working directory as the game project root by default.

#### Scenario: Root init writes root state
- **WHEN** `codex-game-studio init --non-interactive --name "My Game" --engine godot --mode prototype` runs from a fresh clone root
- **THEN** the command writes `.codex/studio.json` under the current directory
- **AND** it does not create `projects/my-game/.codex/studio.json`

#### Scenario: Existing root project is protected
- **WHEN** `init` runs in a directory with an existing `.codex/studio.json` for a different project
- **THEN** the command fails unless an explicit force-refresh option is provided

### Requirement: Legacy nested mode is explicit
The system SHALL keep nested `projects/<slug>` generation only behind an explicit legacy or sandbox option if nested generation remains supported.

#### Scenario: Nested mode is requested
- **WHEN** the user runs `init` with the explicit nested option
- **THEN** the command creates `projects/<slug>/` using the legacy layout

#### Scenario: Nested mode is not requested
- **WHEN** the user runs default `init`
- **THEN** no `projects/<slug>/` directory is created

### Requirement: Runtime commands default to root mode
Runtime commands SHALL resolve the current directory as the project root when `.codex/studio.json` exists there.

#### Scenario: Run command uses current root
- **WHEN** `codex-game-studio run gameplay-programmer --dry-run` runs from a root-mode project
- **THEN** dry-run output uses the current directory as the project root

#### Scenario: Legacy project option still works during migration
- **WHEN** `codex-game-studio run gameplay-programmer --project projects/legacy --dry-run` is provided during the compatibility window
- **THEN** the command resolves the explicit legacy project path
