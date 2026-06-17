# Production Template Depth Catch-Up Specification

## ADDED Requirements

### Requirement: Template registry metadata
Every built-in template SHALL have id, category, path, description, and selected-use hints for workflows and roles.

#### Scenario: The installed package runs from a temp directory
- **GIVEN** the installed package runs from a temp directory
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Package-shipped templates
All built-in templates SHALL be included in package files and verified by pack/install smoke tests.

#### Scenario: A ui review workflow is rendered
- **GIVEN** a UI review workflow is rendered
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Bounded template selection
Prompt rendering SHALL include only selected templates relevant to the current role or workflow.

#### Scenario: A template file is missing from package files
- **GIVEN** a template file is missing from package files
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output

