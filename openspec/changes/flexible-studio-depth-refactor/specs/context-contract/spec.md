## ADDED Requirements

### Requirement: Generated projects include structured context manifests
The system SHALL generate `.codex/context-manifest.json` and `.codex/context-manifest.meta.json` for new projects. The manifest SHALL describe selected context entries with source path, reason, required flag, budget metadata, and safety classification.

#### Scenario: Init writes context manifest files
- **WHEN** a project is initialized
- **THEN** `.codex/context-manifest.json` and `.codex/context-manifest.meta.json` exist
- **AND** validation checks their schema and freshness metadata.

#### Scenario: Manifest uses sidecar metadata
- **WHEN** manifest freshness is computed
- **THEN** the JSON body remains valid JSON
- **AND** freshness metadata is stored in `.codex/context-manifest.meta.json`.

### Requirement: Context selection is path-safe and budgeted
The system SHALL select context through a path-safe selector that rejects traversal, symlink escapes, control characters, secret-like paths, oversized entries, and irrelevant files.

#### Scenario: Required context is selected
- **WHEN** a role or workflow declares required context that exists in the project
- **THEN** the selector includes it and records why it was selected.

#### Scenario: Unsafe paths are rejected
- **WHEN** context selection encounters absolute paths, `..`, symlink escapes, or secret-like paths
- **THEN** the selector rejects those paths and validation reports the unsafe entry.

#### Scenario: Budgets limit context scope
- **WHEN** available context exceeds the configured max file count or character budget
- **THEN** optional entries are pruned before required entries
- **AND** the prompt records what was omitted and why.

### Requirement: Run, review, fix, and workflow prompts share one context contract
The system SHALL render context information through a shared prompt-context builder used by run, review, fix, and workflow prompt paths.

#### Scenario: Review prompt preserves context contract
- **WHEN** a review prompt is prepared after an implementation run
- **THEN** it contains the same selected role/workflow/context references plus read-only review instructions.

#### Scenario: Fix prompt preserves context contract
- **WHEN** a fix prompt is prepared after review blockers
- **THEN** it contains the same context contract plus the bounded blocker list.

### Requirement: Path-scoped rules are generated and task-relevant
The system SHALL generate path-scoped rules for gameplay, core engine, AI, networking, UI, tests, prototypes, assets, design docs, and production docs, and include only relevant rules in prompts.

#### Scenario: Relevant path rules are included
- **WHEN** a run targets files covered by path-scoped rules
- **THEN** the prompt includes the matching rules and write-scope guidance.

#### Scenario: Cross-domain edits surface policy
- **WHEN** a run proposes edits outside the active role or approved domain
- **THEN** strict mode requires approval scope, guided mode requires explicit override, and fast-prototype mode emits an advisory warning.

### Requirement: Session state supports recovery without forced ceremony
The system SHALL generate `production/session-state/active.md` and MAY append `.codex/session-events.jsonl` events. Session state SHALL be included as context only when relevant.

#### Scenario: Session state is suggested in read-only mode
- **WHEN** a read-only proposal or review identifies state updates
- **THEN** the prompt/result suggests updates without mutating session state automatically.

#### Scenario: Session state follows write policy
- **WHEN** a write-allowed run updates session state
- **THEN** the update follows the active write policy and is recorded in run metadata.
