# Workflow And Skill Catalog Catch-Up Specification

## ADDED Requirements

### Requirement: Curated workflow taxonomy
The workflow registry SHALL group built-in workflows by game-development intent and SHALL document which CCGS-derived gaps each group covers.

#### Scenario: A user asks for release readiness
- **GIVEN** a user asks for release readiness
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Prompt-only default
New workflow shortcuts SHALL render bounded prompts by default and SHALL NOT create hidden lifecycle state unless explicitly routed through existing task or approval commands.

#### Scenario: A new workflow id is added
- **GIVEN** a new workflow id is added
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: CLI discoverability
The CLI SHALL make built-in workflows discoverable through help output and validation SHALL prove each registered workflow renders.

#### Scenario: A prototype project uses a workflow
- **GIVEN** a prototype project uses a workflow
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output

