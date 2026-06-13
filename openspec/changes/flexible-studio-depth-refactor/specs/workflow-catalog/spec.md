## ADDED Requirements

### Requirement: Workflow breadth is registry-first
The system SHALL add broad game-development workflow coverage as registry data before exposing CLI command aliases. Workflow definitions SHALL include family, owner role, exposure, approval behavior, input schema, expected artifacts, and write scope.

#### Scenario: Catalog workflow is not automatically a CLI command
- **WHEN** a workflow definition has `exposure=catalog`
- **THEN** it appears in catalog/help surfaces but does not create a top-level CLI alias.

#### Scenario: CLI workflow is intentionally exposed
- **WHEN** a workflow definition has `exposure=cli`
- **THEN** a tested CLI alias exists and renders the expected prompt or performs the documented behavior.

### Requirement: Initial high-value CLI aliases are limited
The system SHALL expose only stable high-value workflow aliases in the first pass, such as `start`, `brainstorm`, `setup-engine`, `architecture-decision`, `design-review`, `qa-plan`, `gate-check`, and `story-readiness`.

#### Scenario: Non-exposed workflows remain catalog-only
- **WHEN** a workflow exists in the registry but is not selected for CLI exposure
- **THEN** CLI help does not list it as a top-level command.

### Requirement: Workflow prompts preserve Codex-native boundaries
The system SHALL keep workflow prompts Codex-native and shall not expose planner/next, parallel orchestration, telemetry, or hard output-ownership enforcement unless those surfaces are implemented and tested.

#### Scenario: Future-only surfaces remain absent
- **WHEN** CLI help is rendered
- **THEN** it does not expose future-only planner/next, parallel, telemetry, or ownership-enforcement commands.

### Requirement: Workflows declare approval behavior and write scope
The system SHALL associate each workflow with an approval behavior and write scope that feeds the shared eligibility function and prompt-context builder.

#### Scenario: Read-only workflow does not request write eligibility
- **WHEN** a read-only workflow prompt is rendered
- **THEN** the prompt and metadata show read-only policy and no mutating Codex spawn is required.

#### Scenario: Write-capable workflow uses shared eligibility
- **WHEN** a workflow can mutate project files
- **THEN** it uses the same eligibility result shape as `run <role>` and `task run`.
