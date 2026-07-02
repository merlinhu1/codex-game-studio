## ADDED Requirements

### Requirement: First-batch workflow registry parity

Codex Game Studio SHALL expose the first 12 CCGS workflow-step gaps as first-class Codex workflow registry entries.

#### Scenario: First-batch workflow ids exist

- **WHEN** the built-in workflow registry is inspected
- **THEN** it includes `engine-setup`, `game-concept`, `design-review-concept`, `art-bible`, `map-systems`, `design-system`, `design-review`, `review-all-gdds`, `consistency-check`, `create-architecture`, `control-manifest`, and `accessibility-doc`
- **AND** each workflow has an owner role, Codex phase, objective, category, context files, and generated `.codex/workflows/<id>.md` prompt surface

### Requirement: Workflow catalog id alignment

Codex Game Studio SHALL align the phase catalog ids with the first-batch workflow registry ids.

#### Scenario: Concept and systems-design phases use adopted ids

- **WHEN** the workflow catalog is inspected
- **THEN** concept and systems-design phases include the first-batch ids with required or repeatable artifact checks where the CCGS catalog expects production artifacts
- **AND** the old `setup-engine` alias is not the canonical catalog id for engine setup

### Requirement: CCGS workflow parity count movement

The CCGS parity audit SHALL mark the first-batch workflow-step rows implemented after the registry and catalog surfaces are added.

#### Scenario: First-batch workflow-step gaps close

- **WHEN** parity reports are regenerated from the CCGS reference repository
- **THEN** no remaining workflow-step row lists the first 12 ids
- **AND** remaining workflow-step rows drop from 30 to 18
- **AND** template and rule gap counts are unchanged
