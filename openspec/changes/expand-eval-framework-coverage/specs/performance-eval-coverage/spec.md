## ADDED Requirements

### Requirement: First-pass performance eval coverage
The eval framework SHALL provide a first-pass set of behavior scenarios across workflow prompts, skills, and role prompts.

#### Scenario: Coverage threshold is met
- **WHEN** the eval framework catalog is loaded
- **THEN** it contains at least 30 performance evaluation scenarios
- **THEN** it covers at least 10 workflow targets
- **THEN** it covers at least 10 skill targets
- **THEN** it covers at least 6 role targets

### Requirement: Behavior scenarios do not use existence-only success criteria
Each performance scenario SHALL define expected behavior evidence rather than passing because a skill, prompt, or file exists.

#### Scenario: Scenario expectations are behavioral
- **WHEN** a scenario is validated
- **THEN** it includes at least one required read, write boundary, required artifact, verification expectation, report expectation, or semantic dimension
- **THEN** no deterministic gate uses skill-exists, file-exists, presence-only, or equivalent success criteria

### Requirement: Manual-only eval execution
The eval framework SHALL remain maintainer-only and SHALL NOT run real agents or LLM judges during default validation or CI test commands.

#### Scenario: Default validation is safe
- **WHEN** `npm run validate` runs
- **THEN** it validates catalog, rubric, and scenario contracts
- **THEN** it does not launch a real agent runner or LLM judge

### Requirement: Token-aware quality comparison
The eval framework SHALL preserve raw token usage as comparable run metadata without enforcing budget or cost gates.

#### Scenario: Usage is recorded with a scenario result
- **WHEN** a scenario observation includes token usage
- **THEN** the grader returns the usage with the result
- **THEN** the result status is based on deterministic and semantic evaluation inputs, not budget thresholds
