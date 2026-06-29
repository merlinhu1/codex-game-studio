## ADDED Requirements

### Requirement: Codex-native upgrade targets
Surface upgrades SHALL be implemented through CGS Codex-native registries and renderers, not by copying `.claude/**` runtime files.

#### Scenario: Agent surface is upgraded
- **WHEN** a CCGS agent row is accepted for upgrade
- **THEN** the implementation updates CGS role package content and generated `.codex/agents/<role>.toml` developer instructions without generating `.claude/agents/**`

#### Scenario: Skill surface is upgraded
- **WHEN** a CCGS skill row is accepted for upgrade
- **THEN** the implementation updates generated `.agents/skills/<name>/SKILL.md` content with Codex-native metadata and procedures without generating `.claude/skills/**`

#### Scenario: Workflow surface is upgraded
- **WHEN** a CCGS workflow-catalog row is accepted for upgrade
- **THEN** the implementation updates CGS workflow definitions, recipes, templates, context selection, or validation rather than adding hidden hooks

### Requirement: Content-depth acceptance criteria
An upgraded surface SHALL include enough adapted content to match the accepted CCGS intent for domain responsibilities, context inputs, procedure, outputs, and escalation or gate behavior.

#### Scenario: Upgraded vertical-slice skill
- **WHEN** the vertical-slice skill is regenerated after upgrade
- **THEN** the generated skill includes validation question framing, scope discipline, recovery checkpoint, playtest/debrief procedure, verdict options, and report expectations

#### Scenario: Upgraded producer agent
- **WHEN** the producer custom agent is regenerated after upgrade
- **THEN** the generated TOML developer instructions include sprint planning, milestone management, risk management, scope negotiation, coordination boundaries, and status-report output expectations

### Requirement: Alias and merge decisions
The system SHALL preserve migration clarity when CCGS surfaces are renamed, merged, or split in CGS.

#### Scenario: CCGS role is merged into a CGS role
- **WHEN** a CCGS role such as `qa-lead` maps to a CGS role such as `qa-playtester`
- **THEN** the matrix records the merge decision and tests verify the generated CGS role covers the accepted lead responsibilities

#### Scenario: CCGS command name becomes an alias
- **WHEN** a CCGS skill or workflow name is accepted as a compatibility alias
- **THEN** CLI/help/rendering tests verify both the canonical CGS name and alias resolve to the same adapted surface

### Requirement: Generated-surface validation
Validation SHALL fail for missing, stale, malformed, or content-thin generated surfaces after a surface has been accepted for upgrade.

#### Scenario: Upgraded skill loses required sections
- **WHEN** a generated upgraded skill is missing a required adapted section
- **THEN** project validation fails with a diagnostic naming the skill and missing section

#### Scenario: Wrong engine specialist appears
- **WHEN** a generated project includes CCGS-derived engine specialists for an inactive engine
- **THEN** project validation fails and names the wrong-engine agent or skill

### Requirement: Behavioral evaluation separation
The implementation SHALL distinguish deterministic generated-surface validation from real agent behavior evaluation.

#### Scenario: Deterministic validation passes
- **WHEN** generated files include expected metadata and content sections
- **THEN** the test result may claim generated-surface freshness and content coverage but MUST NOT claim that agents behave correctly in real tasks

#### Scenario: Manual agent probe is enabled
- **WHEN** a manual behavioral-eval command is explicitly run
- **THEN** it records scenario, trace, diff or artifact output, final report, and reviewer verdict separately from default CI tests

### Requirement: Product-boundary preservation
Upgrades SHALL preserve the CGS product boundary and SHALL NOT import hidden Claude lifecycle behavior as default generated behavior.

#### Scenario: CCGS source uses hooks
- **WHEN** a CCGS workflow depends on `.claude/hooks/**`
- **THEN** the CGS upgrade captures explicit validation or workflow intent and does not generate `.codex/hooks.json` by default

#### Scenario: CCGS source uses coding rules
- **WHEN** a CCGS rule describes coding standards under `.claude/rules/**`
- **THEN** the CGS upgrade maps accepted standards to skills, AGENTS guidance, or selected context and does not write coding standards to `.codex/rules/*.rules`
