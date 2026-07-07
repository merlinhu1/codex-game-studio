## ADDED Requirements

### Requirement: Remaining template parity

Codex Game Studio SHALL expose the remaining CCGS template gaps as package template definitions and files.

#### Scenario: Template rows are implemented

- **GIVEN** a CCGS inventory containing the remaining template ids
- **WHEN** the parity matrix is generated
- **THEN** every template row is marked `implemented`
- **AND** every template row targets `template:<source-id>`
- **AND** the remaining-gap report shows no template rows.

### Requirement: Rule parity as standards skills

Codex Game Studio SHALL adapt the remaining CCGS rule gaps into Codex-native standards skills rather than Claude rule files.

#### Scenario: Rule rows target standards skills

- **GIVEN** a CCGS inventory containing the remaining rule ids
- **WHEN** the parity matrix is generated
- **THEN** every rule row is marked `implemented`
- **AND** every rule row targets `skill:cgs-standards-<source-id>`
- **AND** the remaining-gap report shows no rule rows.

### Requirement: Zero remaining CCGS gaps

The generated CCGS gap report SHALL show zero remaining rows once role, workflow, template, rule, and skill parity closures have landed.

#### Scenario: Final scoreboard is empty

- **WHEN** the CCGS parity audit is regenerated from the reference repository
- **THEN** `references/ccgs-remaining-gap-tasks.md` reports zero remaining parity rows
- **AND** `references/ccgs-surface-parity-matrix.json` contains no `todo` or `deferred` rows.
