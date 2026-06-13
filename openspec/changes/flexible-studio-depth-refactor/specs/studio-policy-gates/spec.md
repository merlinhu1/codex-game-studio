## ADDED Requirements

### Requirement: Project stage and studio mode are separate axes
The system SHALL keep project lifecycle stage distinct from studio policy mode. Project stage SHALL represent `design`, `prototype`, or `development`; studio mode SHALL represent `fast-prototype`, `guided-studio`, or `strict-studio`.

#### Scenario: Init accepts both axes
- **WHEN** a user initializes a project with `--mode prototype --studio-mode guided-studio`
- **THEN** generated project state records project stage as `prototype` and studio mode as `guided-studio`
- **AND** the generated prompts expose both values distinctly.

#### Scenario: Existing project stage semantics are preserved
- **WHEN** active-role defaults are computed for a project
- **THEN** lifecycle behavior still considers `design`, `prototype`, and `development`
- **AND** studio policy behavior is layered separately from lifecycle stage.

### Requirement: Studio modes define approval policy defaults
The system SHALL map `fast-prototype` to advisory policy, `guided-studio` to approval-or-override policy, and `strict-studio` to approval-required policy.

#### Scenario: Fast prototype allows advisory implementation
- **WHEN** a mutating `run <role>` is prepared for a `fast-prototype` project
- **THEN** the eligibility result allows the run with advisory provenance metadata.

#### Scenario: Guided studio permits explicit local override
- **WHEN** a mutating run in `guided-studio` lacks a matching approval but includes `--approved-by-user`
- **THEN** the eligibility result allows the run and records override metadata visible in dry-run output.

#### Scenario: Strict studio blocks unapproved mutation
- **WHEN** a mutating `run <role>` or `task run` in `strict-studio` lacks a matching approval
- **THEN** the command fails before Codex spawn, run metadata writes, or task-state mutation.

### Requirement: All mutating execution paths share one eligibility function
The system SHALL route both `opengamestudio run <role>` and `opengamestudio task run` through one eligibility function immediately before any side effect.

#### Scenario: Run and task run share policy decisions
- **WHEN** `run <role>` and `task run` evaluate the same role, objective, project, scope, and approval state
- **THEN** both commands receive equivalent eligibility results for `allowed`, `writePolicy`, `allowFileEdits`, `codexSandbox`, `reason`, and approval metadata.

#### Scenario: Review remains read-only
- **WHEN** a review or plan phase is prepared in any studio mode
- **THEN** the eligibility result uses `writePolicy=read-only`, `allowFileEdits=false`, and `codexSandbox=read-only`.

### Requirement: Mutating Codex runs default to practical full-access sandbox
The system SHALL default mutating implementation and fix paths to Codex `danger-full-access`, while preserving `workspace-write` only as an explicit constrained-sandbox override for environments where it works reliably.

#### Scenario: Approved implementation uses danger-full-access
- **WHEN** an implementation run is approved or otherwise allowed to write
- **THEN** the default Codex sandbox is `danger-full-access`
- **AND** the prompt/run metadata records the active write policy and sandbox.

#### Scenario: Constrained sandbox requires explicit override
- **WHEN** a caller requests `workspace-write`
- **THEN** the run uses `workspace-write` only if the CLI/config exposes an explicit constrained-sandbox override
- **AND** the default mutating sandbox remains `danger-full-access`.

### Requirement: Approval records preserve lifecycle and matching provenance
The system SHALL store approval records with full lifecycle stages, normalized objective hashes, scoped file/glob authorization, revocation/expiry state, and baseline metadata.

#### Scenario: Approval stages include draft workflow states
- **WHEN** approval records are validated
- **THEN** stages `question`, `options`, `decision`, `draft`, `approved`, `implemented`, `reviewed`, and `blocked` are accepted.

#### Scenario: Approval matching is transparent
- **WHEN** a run has no matching approval in guided or strict mode
- **THEN** dry-run output explains whether role, normalized objective, scope, project stage, studio mode, expiry, or revocation caused the mismatch.

#### Scenario: Unsafe approval scopes are rejected
- **WHEN** an approval grant uses absolute paths, `..`, control characters, symlink escapes, or secret-like paths
- **THEN** the approval command rejects the scope and leaves approval history unchanged.

### Requirement: Approval commands manage auditable approvals
The system SHALL provide approval grant, list, and revoke commands that create scoped records, show current state, and preserve history.

#### Scenario: Grant creates scoped record
- **WHEN** a user runs `opengamestudio approval grant --project <path> --role <role> --task <id|hash> --scope <glob>`
- **THEN** a scoped approval record is appended with normalized role, objective hash, scope, and baseline metadata.

#### Scenario: Revoke preserves history
- **WHEN** a user revokes an approval
- **THEN** the record remains in `.codex/approvals.json` with `revokedAt`
- **AND** it no longer authorizes future runs.
