## ADDED Requirements

### Requirement: Validation is strict for target generated surfaces
The system SHALL treat missing, stale, malformed, unsafe, or contradictory target generated surfaces as validation failures. Optional unselected catalog entries MAY be reported as skips with explicit reasons.

#### Scenario: Missing target surface fails
- **WHEN** a required target generated surface is missing from a generated project
- **THEN** validation exits nonzero and reports a failing diagnostic.

#### Scenario: Optional unselected surface skips
- **WHEN** a catalog feature is not selected for the current project stage or studio mode
- **THEN** validation may report `skip` with an explicit reason and zero exit behavior.

### Requirement: Generated JSON uses sidecar freshness metadata
The system SHALL keep generated JSON files valid JSON and store freshness metadata in `.meta.json` sidecars unless a specific surface already has a validated metadata pattern.

#### Scenario: JSON body remains parseable
- **WHEN** `.codex/context-manifest.json` or another generated JSON file is read
- **THEN** it parses as JSON without stripping comments or metadata markers.

#### Scenario: Sidecar detects stale content
- **WHEN** generated JSON content no longer matches its canonical source input or rendered body hash
- **THEN** validation reports a stale-surface failure.

### Requirement: Package and installed-bin smoke tests cover runtime assets
The system SHALL verify that `package.json.files` and `npm pack` include all runtime assets needed outside the repository cwd.

#### Scenario: Installed bin reads package assets
- **WHEN** the packed package is installed in a temporary cwd
- **THEN** `templates list`, `validate`, and engine-reference validation can read package assets from package root.

#### Scenario: Runtime assets are included in npm pack
- **WHEN** `npm pack --json` output is inspected
- **THEN** `engine_reference/**`, `rules/**`, `templates/**`, `engine_configs/**`, and selected runtime docs are present.

### Requirement: Verification uses repo-native commands
The system SHALL use repo-native npm commands for focused and full verification.

#### Scenario: Focused task verification uses npm scripts
- **WHEN** an implementation task verifies focused tests
- **THEN** it runs `npm test -- <focused test files>` and `npm run typecheck` rather than `npx vitest run`.

#### Scenario: Readiness verification uses validation and full tests
- **WHEN** a parity or readiness claim is made
- **THEN** `npm run validate` and `npm test -- --run` pass.

### Requirement: Repository documentation closeout follows behavior changes
Repository implementation slices SHALL update README/docs/Truthmark-backed truth claims after behavior-bearing changes and run the repository truth workflow before claiming a slice complete. This is a repository-maintenance guardrail, not a generated-project surface or Open Game Studio runtime feature.

#### Scenario: Behavior change closes with truth sync
- **WHEN** a slice changes functional behavior and Truthmark routes/docs are present
- **THEN** relevant tests run first, then the repository Truthmark sync/check workflow runs before reporting completion.

### Requirement: Parity claims require documented rubric evidence
The system SHALL not claim CCGS comparability or richness until role/workflow/engine/context/approval coverage passes a documented rubric and verification succeeds.

#### Scenario: Parity report cites evidence
- **WHEN** the final parity report claims CCGS-level coverage
- **THEN** it cites registry tests, generated-surface validation, human-reviewed engine references, installed-bin smoke checks, and `npm run validate` results.
