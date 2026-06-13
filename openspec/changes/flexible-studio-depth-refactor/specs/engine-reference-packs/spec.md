## ADDED Requirements

### Requirement: Engine reference packs are registered package assets
The system SHALL ship a registry for Godot, Unity, and Unreal engine reference packs. Each registry entry SHALL define package source paths, generated project destination paths, required files, plugin/specialist files, prompt references, validation rules, and package smoke expectations.

#### Scenario: Registry lists package and project paths
- **WHEN** engine reference registry entries are inspected
- **THEN** each engine defines its package root and project materialization root
- **AND** each required file has a deterministic destination path under `docs/engine-reference/<engine>/`.

#### Scenario: Package includes engine references
- **WHEN** `npm pack` is inspected
- **THEN** representative files from `engine_reference/godot`, `engine_reference/unity`, and `engine_reference/unreal` are included.

### Requirement: Engine reference content has human-review metadata
The system SHALL require reviewer/date/source-link metadata on seed engine reference content before claiming engine richness or CCGS comparability.

#### Scenario: Missing review metadata blocks engine-richness claim
- **WHEN** a parity report or validation gate evaluates engine richness
- **THEN** packs lacking reviewer/date/source-link metadata cannot be counted as human-reviewed engine richness.

#### Scenario: Structural validation remains automatable
- **WHEN** `npm run validate` checks engine reference packs
- **THEN** it can validate required file presence, metadata shape, package inclusion, and generated project materialization without judging prose quality.

### Requirement: Engine references are selected by engine, role, and task
The system SHALL include only relevant engine reference files in prompts and manifests, based on project engine, selected role, and task context.

#### Scenario: Godot specialist receives Godot references
- **WHEN** a Godot project materializes `godot-specialist`
- **THEN** the generated role prompt references `docs/engine-reference/godot/VERSION.md` and relevant Godot modules.

#### Scenario: Unity project excludes Unreal-only docs by default
- **WHEN** a Unity project prepares a normal gameplay run
- **THEN** Unreal specialist docs are not selected unless explicitly relevant.

### Requirement: Engine reference validation covers generated projects
The system SHALL fail validation when selected prompts or manifests omit required engine reference sections for the active engine and role.

#### Scenario: Prompt omits required engine reference
- **WHEN** a materialized engine specialist prompt lacks required engine reference entries
- **THEN** project validation reports a failing diagnostic.
