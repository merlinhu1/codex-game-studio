# Customization Ergonomics Catch-Up Specification

## ADDED Requirements

### Requirement: Project-local packs
OGS SHALL support project-local role, workflow, and template pack metadata stored in reviewable repository files.

#### Scenario: A project defines a custom role pack with a safe prompt file
- **GIVEN** a project defines a custom role pack with a safe prompt file
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Safe merge semantics
Custom packs SHALL be schema-validated, path-contained, and merged with built-ins using explicit conflict diagnostics.

#### Scenario: A custom template points outside the project root
- **GIVEN** a custom template points outside the project root
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: No plugin-platform drift
Customization SHALL NOT introduce hosted plugins, arbitrary code execution, background hooks, or non-Codex runtime replacement behavior.

#### Scenario: A custom role duplicates a built-in id without explicit override policy
- **GIVEN** a custom role duplicates a built-in id without explicit override policy
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output

