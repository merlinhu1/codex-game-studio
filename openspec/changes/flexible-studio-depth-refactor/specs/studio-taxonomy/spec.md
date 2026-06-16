## ADDED Requirements

### Requirement: Built-in role taxonomy covers CCGS-level studio functions
The system SHALL define a built-in target taxonomy that covers direction/coordination, department leads, market/data/product intelligence, programming specialists, design/UX specialists, content/art/audio specialists, and engine specialists. Coordination roles are declarative Codex prompt/catalog roles, not autonomous DAG orchestration, daemons, or non-Codex runtimes.

#### Scenario: Current user-facing capabilities remain covered
- **WHEN** the built-in role registry is inspected
- **THEN** studio orchestration, market analysis, data/analytics, UI/UX, QA, release, and handoff are covered by canonical roles or workflows.

#### Scenario: Engine specialists are represented
- **WHEN** the built-in role registry is inspected
- **THEN** Godot, Unity, and Unreal specialist roles exist with engine-specific metadata.

### Requirement: Available, active, and materialized roles are separate
The system SHALL separate the full available built-in roster from mode/task-relevant active roles and generated materialized prompt files.

#### Scenario: Fast prototype materializes bounded roles
- **WHEN** a prototype project uses `fast-prototype`
- **THEN** the active/materialized role set remains small and does not load the whole taxonomy.

#### Scenario: Strict development activates deeper review coverage
- **WHEN** a development project uses `strict-studio`
- **THEN** active roles include deeper review, QA, release, and approval-aware roles as appropriate.

### Requirement: Role metadata drives prompt selection and validation
The system SHALL store role metadata for tier, department, default project stages, default studio modes, approval behavior, required context, forbidden globs, and engine overlays.

#### Scenario: Role metadata includes both axes
- **WHEN** role metadata is validated
- **THEN** it includes project-stage defaults separately from studio-mode defaults.

#### Scenario: Prompt generation uses selected roles only
- **WHEN** a project is generated
- **THEN** `.codex/prompts/*.md` is created only for selected materialized roles.

### Requirement: Canonical built-in role IDs are strict while extensions are explicit
The system SHALL enforce one canonical ID per built-in role without old-ID runtime aliases, while reserving an explicit custom-role extension lane.

#### Scenario: Built-in aliases are rejected
- **WHEN** a user invokes an old or unsupported built-in role alias
- **THEN** the CLI rejects it with a clear diagnostic rather than silently translating it.

#### Scenario: Custom roles are namespaced and validated
- **WHEN** a project declares `customRoles` or namespaced extension roles
- **THEN** validation accepts them only if schema, prompt, context, and materialization checks pass, and they remain local declarative prompt roles rather than executable plugins.
