## ADDED Requirements

### Requirement: Accessibility role depth contract

The `accessibility-specialist` role package SHALL include CCGS-depth accessibility responsibilities, inputs, outputs, quality gates, collaboration notes, stop conditions, and handoff guidance.

#### Scenario: Role contract covers concrete accessibility domains

- **WHEN** the `accessibility-specialist` role package is inspected
- **THEN** its contract covers WCAG-oriented standards, text readability, contrast, colorblind safety, subtitles or audio alternatives, input remapping, motor accommodations, cognitive load, and structured findings
- **AND** it names cross-role handoffs for UI, audio, QA, localization, art, producer, or implementation owners

### Requirement: Accessibility parity row implemented

The CCGS parity audit SHALL mark the upstream `accessibility-specialist` direct role row implemented after the local role package reaches CCGS-depth coverage.

#### Scenario: Generated parity row is implemented

- **WHEN** parity reports are generated from the CCGS reference repository
- **THEN** the row with `sourceType: agent` and `sourceId: accessibility-specialist` has status `implemented`
- **AND** the generated remaining-gap report does not list `accessibility-specialist` under role package gaps

### Requirement: Remaining gap count decreases

The generated remaining-gap report SHALL reflect that closing the accessibility role gap reduces direct role remaining work.

#### Scenario: Report reflects one closed role gap

- **WHEN** parity reports are regenerated after the accessibility role upgrade
- **THEN** implemented parity rows increase by one
- **AND** remaining parity rows decrease by one
- **AND** remaining role rows decrease by one
