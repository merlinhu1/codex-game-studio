## ADDED Requirements

### Requirement: Engine sub-specialist role packages

Codex Game Studio SHALL expose the 12 CCGS engine sub-specialists as first-class Codex-native role packages with role-specific contracts.

#### Scenario: Sub-specialist role packages exist

- **WHEN** the canonical studio role registry is inspected
- **THEN** it includes `godot-gdscript-specialist`, `godot-csharp-specialist`, `godot-shader-specialist`, `godot-gdextension-specialist`, `unity-dots-specialist`, `unity-shader-specialist`, `unity-addressables-specialist`, `unity-ui-specialist`, `ue-gas-specialist`, `ue-blueprint-specialist`, `ue-replication-specialist`, and `ue-umg-specialist`
- **AND** each role has responsibilities, output schema, quality gates, collaboration notes, stop conditions, and handoff guidance

### Requirement: Engine-scoped role sets

Codex Game Studio SHALL compute available project roles from an explicit engine role set containing the selected engine parent specialist and its matching sub-specialists.

#### Scenario: Godot project role set is bounded

- **WHEN** a Godot project is initialized
- **THEN** `.codex/studio.json` lists Godot parent and sub-specialist roles
- **AND** it does not list Unity or Unreal engine roles

#### Scenario: Unity project role set is bounded

- **WHEN** a Unity project is initialized
- **THEN** `.codex/studio.json` lists Unity parent and sub-specialist roles
- **AND** it does not list Godot or Unreal engine roles

#### Scenario: Unreal project role set is bounded

- **WHEN** an Unreal project is initialized
- **THEN** `.codex/studio.json` lists Unreal parent and sub-specialist roles
- **AND** it does not list Godot or Unity engine roles

### Requirement: Wrong-engine run rejection

Codex Game Studio SHALL reject wrong-engine parent and sub-specialist role runs before producing a prompt.

#### Scenario: Wrong-engine sub-specialist is blocked

- **WHEN** a Godot project runs `unity-dots-specialist`
- **THEN** the runner fails before prompt generation with a message naming the project engine and matching engine role set

#### Scenario: Matching sub-specialist can run

- **WHEN** a Godot project runs `godot-gdscript-specialist` in prompt-inspection mode
- **THEN** the prompt includes runtime role context for `godot-gdscript-specialist`
- **AND** selected context includes relevant Godot engine-reference files

### Requirement: Focused sub-specialist context selection

Engine sub-specialist prompts SHALL select relevant engine-reference files based on the sub-specialist role instead of loading every engine reference.

#### Scenario: Unreal GAS specialist receives GAS context

- **WHEN** an Unreal project runs `ue-gas-specialist` in prompt-inspection mode
- **THEN** selected engine references include `docs/engine-reference/unreal/plugins/gas.md`
- **AND** unrelated engine role sets remain unavailable

### Requirement: CCGS role parity closure

The CCGS parity audit SHALL mark the 12 engine sub-specialist role rows implemented after Codex-native role packages and engine-scoped routing are added.

#### Scenario: Engine sub-specialist role gaps close

- **WHEN** parity reports are regenerated from the CCGS reference repository
- **THEN** no remaining role-package row lists the 12 engine sub-specialists
- **AND** workflow-step, template, and rule gaps remain governed by their existing separate categories
