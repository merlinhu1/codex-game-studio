## ADDED Requirements

### Requirement: Generated remaining-gap report

The parity audit SHALL generate `references/ccgs-remaining-gap-tasks.md` from the same `ParityMatrix` used for `ccgs-surface-parity-matrix.json` and `ccgs-surface-parity-matrix.md`.

#### Scenario: Report is written with parity reports

- **WHEN** `writeParityReports(matrix, outDir)` is called with a valid matrix
- **THEN** the output directory contains `ccgs-remaining-gap-tasks.md`
- **AND** the report contains source evidence pointing to the generated parity matrix

### Requirement: Remaining status semantics

The remaining-gap report SHALL count only rows whose status is `todo` or `deferred` as remaining work.

#### Scenario: Implemented rows do not appear as remaining work

- **WHEN** a matrix contains rows with `implemented`, `todo`, `deferred`, and `out-of-scope` statuses
- **THEN** the remaining count includes only `todo` and `deferred` rows
- **AND** implemented rows are not listed in the category sections
- **AND** out-of-scope rows are not listed in the category sections

### Requirement: Actionable category grouping

The remaining-gap report SHALL group remaining rows by CCGS source type and include each row's source id, decision, target, owner path, and test path.

#### Scenario: Report groups rows by source type

- **WHEN** remaining rows include agents, workflow steps, templates, and rules
- **THEN** the report contains separate sections for role gaps, workflow-step gaps, template gaps, and rule gaps
- **AND** each listed row includes enough owner and test information for the next implementation pass

### Requirement: Prompt-surface versus product-parity distinction

The generated report SHALL state that prompt-surface metadata completion is not the same as full CCGS parity completion.

#### Scenario: Report explains the distinction

- **WHEN** the report is rendered
- **THEN** it includes a note distinguishing prompt-surface metadata/depth audits from broader product parity rows
