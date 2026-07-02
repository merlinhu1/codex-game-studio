## Context

Codex Game Studio currently has three parent engine roles: `godot-specialist`, `unity-specialist`, and `unreal-specialist`. `projectRoleIdsForEngine()` filters those parent roles so generated project state lists only the selected engine specialist, and `runner.ts` rejects wrong-engine parent specialists before prompt generation.

CCGS uses a deeper engine role model: each parent engine specialist owns broad engine architecture and delegates subsystem-specific work to narrower sub-specialists. The current parity report treats the 12 CCGS sub-specialists as unresolved role-package rows because CGS has no matching role ids.

The product boundary permits role registry expansion when generated prompts remain bounded, context is selected by relevance, and runtime remains Codex-native and reviewable.

## Goals / Non-Goals

**Goals:**

- Add first-class Codex-native role packages for the 12 engine sub-specialists.
- Keep sub-specialists engine-scoped: selected-engine projects can run matching sub-specialists and reject wrong-engine sub-specialists.
- Keep all engine agent TOML surfaces clone-visible in the template while generated project state lists only the selected engine set.
- Select relevant engine references for each sub-specialist instead of broad-loading all references.
- Regenerate CCGS parity references and prove the role-package gap count drops by 12.

**Non-Goals:**

- Do not copy CCGS Claude prompts verbatim.
- Do not add hidden Task-tool delegation, automatic parent-to-child orchestration, or unbounded parallelism.
- Do not change workflow-step, template, or rule gap status in this change.
- Do not add new CLI commands beyond existing `run <role>` behavior.
- Do not require sub-specialists for lightweight prototype projects beyond making them available as explicit roles.

## Decisions

1. Add sub-specialists as real `StudioRoleId` values.
   - Rationale: parity rows are role-package gaps, and users should be able to run `./codex-game-studio run godot-gdscript-specialist ...` directly.
   - Alternative rejected: keep them as engine-reference keyword context only. That hides ownership and leaves no explicit handoff target.

2. Introduce `engineRoleSets` as the source of truth for engine-scoped roles.
   - Rationale: parent-only helpers cannot express same-engine sub-specialists or wrong-engine rejection consistently.
   - Alternative rejected: add ad hoc string checks in `runner.ts`. That would drift from project state and validation.

3. Keep template TOML files for every engine role, but project state lists only matching engine roles.
   - Rationale: tracked clone-visible surfaces should be complete, while generated project state should stay bounded to the selected engine.
   - Alternative rejected: copy only selected engine TOML files during init. That would make template validation and role discovery less transparent.

4. Parent specialists coordinate and hand off; they do not auto-spawn sub-specialists.
   - Rationale: CGS runtime is explicit `codex-game-studio run <role>` and should not import Claude Task-tool behavior in this change.

5. Engine-reference selection becomes role-aware for sub-specialists.
   - Rationale: sub-specialists need focused context such as GAS, Addressables, UI, rendering, networking, or Godot plugin/GDExtension references without loading unrelated modules.

## Risks / Trade-offs

- Risk: the studio role list gets longer. Mitigation: selected project state includes only one engine set, and prompts still load one role at a time.
- Risk: sub-specialist contracts become too shallow. Mitigation: tests assert each sub-specialist has role-specific responsibilities, output schema, quality gates, stop conditions, and handoff guidance.
- Risk: wrong-engine roles become accidentally runnable. Mitigation: `engineForRole`/`isRoleAvailableForEngine` style checks gate runner behavior and validation.
- Risk: parity closes without real product behavior. Mitigation: add both product-contract tests and parity-status tests before implementation.

## Migration Plan

Existing projects remain compatible because existing parent roles keep their ids and behavior. Regenerating or refreshing a project updates `.codex/studio.json` role lists and context manifests to include matching sub-specialists. No archived project migration or compatibility shim is added.
