## ADDED Requirements

### Requirement: Root source path is game source
Root `src/` SHALL be reserved for game source code in the distributed game template.

#### Scenario: Template root src is not package implementation
- **WHEN** the distributed template root is inspected
- **THEN** root `src/` does not contain Codex Game Studio TypeScript CLI implementation files

#### Scenario: Package source is isolated
- **WHEN** Codex Game Studio package implementation source remains in the same repository
- **THEN** it lives under an isolated maintenance path such as `tooling/codex-game-studio/src/**`

### Requirement: Root docs are game-facing
Root `docs/` SHALL contain game-facing documentation only.

#### Scenario: Maintainer plans are absent from root docs
- **WHEN** root `docs/` is validated
- **THEN** `docs/plans/**` implementation plans for Codex Game Studio are absent

#### Scenario: Truthmark maintenance docs are absent from root docs
- **WHEN** root `docs/` is validated
- **THEN** `docs/truthmark/**` repository-truth workflow docs are absent

#### Scenario: Game docs are allowed
- **WHEN** root `docs/engine-reference/**` or `docs/architecture/**` contains game-facing documentation
- **THEN** validation accepts those docs

### Requirement: Root instructions are game-facing
Root `AGENTS.md` SHALL guide game development rather than package maintenance.

#### Scenario: Root AGENTS omits package rules
- **WHEN** root `AGENTS.md` is validated
- **THEN** it does not include package-maintainer rules such as NodeNext import policy, package release rules, or Truthmark workflow instructions

#### Scenario: Maintainer instructions are isolated
- **WHEN** package-maintainer instructions are needed
- **THEN** they live under an isolated maintenance path such as `tooling/codex-game-studio/AGENTS.md`

### Requirement: Maintenance agents are not game agents
Root `.codex/agents/**` SHALL contain game-development custom agents, not repository-maintenance agents.

#### Scenario: Truth maintenance agents are absent
- **WHEN** the game template `.codex/agents/` directory is validated
- **THEN** files such as `truth-claim-verifier.toml`, `truth-doc-reviewer.toml`, `truth-doc-writer.toml`, and `truth-route-auditor.toml` are absent

### Requirement: Validation enforces the boundary
The validation command SHALL fail when package-maintainer material appears in game-facing root paths.

#### Scenario: Forbidden maintainer doc appears
- **WHEN** a Codex Game Studio implementation plan appears under root `docs/`
- **THEN** validation fails with a diagnostic that says root `docs/` is game-facing

#### Scenario: Forbidden maintainer source appears
- **WHEN** Codex Game Studio package implementation files appear under root `src/`
- **THEN** validation fails with a diagnostic that says root `src/` is game source
