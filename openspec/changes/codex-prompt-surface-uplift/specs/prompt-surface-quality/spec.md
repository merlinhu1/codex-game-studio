# prompt-surface-quality Specification

## ADDED Requirements

### Requirement: Prompt surfaces have Codex-native metadata

Each tracked prompt surface SHALL include metadata for invocation, source traceability, links, tool policy, model policy, and output expectations.

#### Scenario: Agent metadata is complete

- **WHEN** validation inspects `.codex/agents/*.toml`
- **THEN** each agent includes exact model policy, reasoning effort, display name, description, linked skills, tool policy, source reference, source hash, invocation guidance, and stop conditions.

#### Scenario: Skill metadata is complete

- **WHEN** validation inspects `.agents/skills/*/SKILL.md`
- **THEN** each skill frontmatter includes exact model policy, reasoning effort, argument hint when user-invocable, primary agent or routing agent, tool policy, isolation, source reference, and source hash.

#### Scenario: Workflow metadata is complete

- **WHEN** validation inspects `.codex/workflows/*.md`
- **THEN** each workflow includes exact model policy, primary agent, linked skills, phase, risk, argument hint, source reference, and output artifact contract.

### Requirement: Prompt bodies contain procedure depth

Prompt bodies SHALL include enough task procedure to be directly useful after `git clone`.

#### Scenario: CCGS-derived large skill is not a thin wrapper

- **GIVEN** a local skill has an upstream CCGS source over 200 lines
- **WHEN** validation scores the local skill
- **THEN** the local skill includes purpose, prerequisites, arguments, phased procedure, decision gates, output contract, quality gates, failure modes, verification, and handoff
- **AND** validation fails if the local skill is only a short summary without an explicit adaptation rationale.

#### Scenario: Pilot prompt surfaces meet depth threshold

- **WHEN** validation checks `cgs-prototype`, `cgs-design-system`, `cgs-vertical-slice`, `.codex/agents/game-designer.toml`, and `.codex/workflows/vertical-slice.md`
- **THEN** each pilot surface includes the required metadata and at least the required body sections for its surface type
- **AND** each pilot surface has source traceability to the CCGS reference material.

### Requirement: CCGS content is adapted into Codex-native contracts

The system SHALL adapt useful CCGS properties into Codex-native metadata and prose.

#### Scenario: Claude tool names are translated

- **WHEN** a CCGS source declares Claude tools such as `Read`, `Write`, `Edit`, `Bash`, `Task`, or `AskUserQuestion`
- **THEN** the local Codex surface uses Codex-native tool categories and sandbox/write policy language
- **AND** active runtime metadata does not contain the Claude tool names.

#### Scenario: Agent and skill links resolve

- **WHEN** validation inspects a skill, agent, or workflow link
- **THEN** referenced local agents, skills, workflows, templates, and artifacts exist or are marked as intentionally external with rationale.

### Requirement: Runtime prompts carry selected surface context

Runtime prompts SHALL expose the selected agent, skill, workflow, model policy, context contract, output contract, verification requirements, and stop conditions.

#### Scenario: Runtime prompt includes model and output contract

- **WHEN** a role or workflow prompt is rendered
- **THEN** the prompt includes the resolved model, reasoning effort, selected surface IDs, output schema, verification evidence requirements, and handoff owner rule.

### Requirement: Template repository behavior is preserved

Prompt-surface uplift SHALL NOT reintroduce init-generated prompt bodies.

#### Scenario: Init preserves tracked surfaces

- **WHEN** `codex-game-studio init` runs in a cloned template repository
- **THEN** it does not synthesize, overwrite, or copy `.codex/agents/*.toml`, `.codex/workflows/*.md`, or `.agents/skills/*/SKILL.md`
- **AND** validation treats those files as tracked template inputs.
