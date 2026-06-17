# Role Prompt Sophistication Catch-Up Specification

## ADDED Requirements

### Requirement: Structured role contracts
Built-in role prompts SHALL expose responsibilities, expected inputs, expected outputs, quality gates, and stop conditions in a consistent compact shape.

#### Scenario: A release-manager role run is rendered
- **GIVEN** a release-manager role run is rendered
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Shared fragments
Repeated guidance SHALL be shared through renderer fragments instead of copy-pasted across role definitions.

#### Scenario: Shared write-policy wording changes
- **GIVEN** shared write-policy wording changes
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Prompt budget guard
Role rendering tests SHALL enforce that a single role prompt does not include unrelated role bodies, all templates, or all engine references.

#### Scenario: A role prompt grows beyond the configured budget
- **GIVEN** a role prompt grows beyond the configured budget
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output

