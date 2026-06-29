# prompt-surface-model-routing Specification

## ADDED Requirements

### Requirement: Exact Codex model policy

Every game-facing prompt surface SHALL declare an exact Codex model policy using `gpt-5.5`, `gpt-5.4`, or `gpt-5.4-mini`.

#### Scenario: Complex design surface uses GPT 5.5

- **WHEN** validation inspects a complex design, architecture, production-gate, or release-gate surface
- **THEN** the surface declares `model: gpt-5.5` or `model = "gpt-5.5"`
- **AND** the surface declares `model_reasoning_effort` as `high` or an explicitly justified `xhigh`.

#### Scenario: Moderate implementation surface uses GPT 5.4

- **WHEN** validation inspects a moderate implementation, QA planning, technical documentation, or bounded workflow surface
- **THEN** the surface declares `model: gpt-5.4` or `model = "gpt-5.4"`
- **AND** the surface declares `model_reasoning_effort: medium` or equivalent TOML metadata.

#### Scenario: Simple operation surface uses GPT 5.4 Mini

- **WHEN** validation inspects simple status, help, classification, changelog, or checklist surfaces
- **THEN** the surface declares `model: gpt-5.4-mini` or `model = "gpt-5.4-mini"`
- **AND** the surface declares `model_reasoning_effort` as `low` or `minimal`.

### Requirement: Claude model names are invalid

Game-facing prompt surfaces SHALL NOT use Claude model names or abstract tier names as active runtime model policy.

#### Scenario: Claude model names fail validation

- **WHEN** a game-facing agent, skill, workflow, or runtime policy declares `sonnet`, `haiku`, `opus`, `claude-*`, `complex`, `moderate`, or `simple` as the active model
- **THEN** validation fails with a stable diagnostic naming the file and invalid value.

### Requirement: Runtime execution uses resolved model

The runner SHALL pass the resolved exact model to Codex execution.

#### Scenario: Workflow run resolves model from workflow policy

- **WHEN** a user runs a workflow-backed task such as `vertical-slice`
- **THEN** the runtime resolves model policy from explicit override, workflow, skill, agent, then repository default in that order
- **AND** the Codex command includes the resolved exact model.

#### Scenario: Invalid model fails without silent fallback

- **WHEN** Codex rejects a configured model name
- **THEN** the runner reports the rejected model and source surface
- **AND** the runner does not silently retry with another model.

### Requirement: Model policy is visible in dry runs and metadata

Model policy SHALL be inspectable before execution.

#### Scenario: Dry run reports selected model

- **WHEN** a role, task, or workflow is run in dry-run or prompt-printing mode
- **THEN** output includes selected model, reasoning effort, source surface, and escalation reason when applicable.
