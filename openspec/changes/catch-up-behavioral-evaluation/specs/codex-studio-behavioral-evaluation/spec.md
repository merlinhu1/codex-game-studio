# Behavioral Evaluation Catch-Up Specification

## ADDED Requirements

### Requirement: Local deterministic evals
Behavioral evaluations SHALL run locally without hosted services, telemetry, hidden memory, or LLM calls by default.

#### Scenario: A ship-check workflow scenario runs
- **GIVEN** a ship-check workflow scenario runs
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Scenario fixtures
Each behavioral scenario SHALL name a role or workflow, inputs, required prompt obligations, forbidden prompt drift, and expected selected context categories.

#### Scenario: A role prompt starts loading all templates
- **GIVEN** a role prompt starts loading all templates
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Validation integration
The repository gate SHALL include a bounded behavioral-evaluation command or validation subcheck that fails on missing contracts for built-in roles/workflows.

#### Scenario: A new workflow is added without a behavioral scenario
- **GIVEN** a new workflow is added without a behavioral scenario
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output

