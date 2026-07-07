## ADDED Requirements

### Requirement: Remaining workflow registry parity

Codex Game Studio SHALL expose the remaining 18 CCGS workflow-step gaps as first-class Codex workflow registry entries.

#### Scenario: Remaining workflow ids exist

- **WHEN** the built-in workflow registry is inspected
- **THEN** it includes `entity-inventory`, `asset-spec`, `ux-design`, `ux-review`, `test-setup`, `implement`, `code-review`, `bug-report`, `retrospective`, `team-feature`, `scope-check`, `balance-check`, `asset-audit`, `playtest-polish`, `team-polish`, `patch-notes`, `changelog`, and `launch-checklist`
- **AND** each workflow has an owner role, Codex phase, objective, category, context files, and tracked `.codex/workflows/<id>.md` prompt surface

### Requirement: Remaining workflow catalog id alignment

Codex Game Studio SHALL align the phase catalog with the remaining workflow-step ids.

#### Scenario: Pre-production, production, and release phases use adopted ids

- **WHEN** the workflow catalog is inspected
- **THEN** it includes the remaining ids with artifact checks, required flags, and repeatability where the CCGS workflow catalog expects production artifacts
- **AND** workflow commands reference Codex-native workflow ids rather than Claude slash commands

### Requirement: CCGS workflow-step parity count movement

The CCGS parity audit SHALL mark all workflow-step rows implemented after the registry, catalog, and prompt surfaces are added.

#### Scenario: Remaining workflow-step gaps close

- **WHEN** parity reports are regenerated from the CCGS reference repository
- **THEN** no remaining workflow-step row is listed
- **AND** implemented rows increase by 18
- **AND** template and rule gap counts remain as the remaining gap classes
