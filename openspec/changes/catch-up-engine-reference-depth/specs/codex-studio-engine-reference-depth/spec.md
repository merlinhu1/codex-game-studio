# Engine Reference Depth Catch-Up Specification

## ADDED Requirements

### Requirement: Engine reference taxonomy
Each supported engine SHALL have version, best-practice, deprecated API, breaking-change, module, and plugin reference categories.

#### Scenario: A godot networking task is rendered
- **GIVEN** a Godot networking task is rendered
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Reference metadata
Every engine-reference file SHALL include review metadata sufficient for validation and future refresh work.

#### Scenario: A new engine reference lacks metadata
- **GIVEN** a new engine reference lacks metadata
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Selected-context loading
Role and workflow prompts SHALL select engine-reference files by engine and task relevance instead of loading all engine references.

#### Scenario: Package smoke validation runs
- **GIVEN** package smoke validation runs
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output

