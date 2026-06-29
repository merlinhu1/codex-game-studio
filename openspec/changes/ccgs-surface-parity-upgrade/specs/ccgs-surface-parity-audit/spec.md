## ADDED Requirements

### Requirement: Complete CCGS surface inventory
The system SHALL inventory every CCGS agent file, skill package, and workflow-catalog step before marking a parity upgrade complete.

#### Scenario: CCGS reference is available
- **WHEN** the audit command is run with a valid CCGS reference root
- **THEN** the output includes rows for every `.claude/agents/*.md`, every `.claude/skills/*/SKILL.md`, and every step in `.claude/docs/workflow-catalog.yaml`

#### Scenario: CCGS reference is missing
- **WHEN** the audit command is run without an available CCGS reference root
- **THEN** the command fails with a diagnostic naming the missing reference path and does not write a partial completed matrix

### Requirement: One-by-one mapping decisions
The parity matrix SHALL assign exactly one decision to every CCGS source row: `adopt`, `adapt`, `merge`, `rename-alias`, `defer`, or `out-of-scope`.

#### Scenario: Surface has a direct CGS counterpart
- **WHEN** a CCGS surface has an equivalent CGS role, workflow, skill, template, or validation rule
- **THEN** the matrix records the CGS target path and a decision explaining whether to adopt, adapt, or leave unchanged

#### Scenario: Surface has no CGS counterpart
- **WHEN** a CCGS surface has no matching CGS target
- **THEN** the matrix records a decision of `adopt`, `adapt`, `merge`, `defer`, or `out-of-scope` with a rationale and follow-up task reference

### Requirement: Quality scoring rubric
The audit SHALL score each mapped surface against a documented quality rubric rather than using file count or length alone.

#### Scenario: Skill is a thin wrapper
- **WHEN** a CGS skill only tells the agent to read another workflow file and report changed files
- **THEN** the audit marks missing procedure depth, context contract, output contract, and testability against the comparable CCGS skill

#### Scenario: Claude-only behavior is present
- **WHEN** a CCGS source depends on Claude-specific hooks, tools, settings, or UI mechanics
- **THEN** the audit records the useful product intent separately from the rejected Claude-specific implementation format

### Requirement: Source traceability
Every parity row SHALL record source paths and source hashes for the CCGS source and CGS target used during comparison.

#### Scenario: Source content changes
- **WHEN** the CCGS source hash changes after a matrix row was accepted
- **THEN** validation reports that the row needs review before parity can be claimed

### Requirement: Reviewable reports
The audit SHALL produce both machine-readable and human-readable parity reports.

#### Scenario: Matrix generation completes
- **WHEN** the audit command succeeds
- **THEN** it writes `references/ccgs-surface-parity-matrix.json` and `references/ccgs-surface-parity-matrix.md` with matching row counts and decision summaries
