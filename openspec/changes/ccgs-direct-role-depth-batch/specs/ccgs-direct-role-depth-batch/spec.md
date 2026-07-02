## ADDED Requirements

### Requirement: Direct role depth contracts

Every remaining direct CCGS role gap SHALL have an upgraded Codex role package with role-specific responsibilities, output schema, quality gates, collaboration notes, stop conditions, and handoff guidance.

#### Scenario: Direct role packages are upgraded

- **WHEN** the direct role package ids from the generated gap report are inspected
- **THEN** each package has at least three responsibilities
- **AND** each package has an output schema
- **AND** each package has at least three quality gates
- **AND** each package has collaboration notes and stop conditions

### Requirement: Direct role parity closure

The CCGS parity audit SHALL no longer report direct `adapt` role rows as remaining small gaps after the batch closes.

#### Scenario: No direct role gaps remain

- **WHEN** parity reports are generated from the CCGS reference repository
- **THEN** no remaining row has `sourceType: agent`, `decision: adapt`, and target kind `role`
- **AND** the remaining role rows are only major decision rows for engine sub-specialists or other non-direct-role surfaces

### Requirement: Major category stop point

The batch SHALL stop before changing engine sub-specialist decisions, workflow steps, templates, or rules.

#### Scenario: Remaining report stops at major categories

- **WHEN** the remaining-gap report is regenerated
- **THEN** it still lists engine sub-specialist decision rows, workflow-step rows, template rows, and rule rows as remaining
- **AND** it does not claim full CCGS parity completion
