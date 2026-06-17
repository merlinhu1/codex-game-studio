# Domain Role Coverage Catch-Up Specification

## ADDED Requirements

### Requirement: Specialist role clusters
The role registry SHALL expose specialist roles in bounded domain clusters that cover CCGS-derived gaps without requiring prompt-time loading of unrelated roles.

#### Scenario: A project initialized by the cli
- **GIVEN** a project initialized by the CLI
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Role package renderability
Every built-in role SHALL render a package with system prompt, expected outputs, context strategy, and review checklist.

#### Scenario: A user runs a single specialist role
- **GIVEN** a user runs a single specialist role
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output


### Requirement: Generated project freshness
Project initialization SHALL materialize prompt files for all built-in roles and validation SHALL fail when generated role surfaces are stale.

#### Scenario: A role is added to the registry
- **GIVEN** a role is added to the registry
- **WHEN** the relevant CLI, renderer, validation, or test path is exercised
- **THEN** the expected behavior is observable through local files or deterministic output

