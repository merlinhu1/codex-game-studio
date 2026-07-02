## Design

### Scope

This change adopts the first 12 workflow-step rows from `references/ccgs-remaining-gap-tasks.md`:

- `engine-setup`
- `game-concept`
- `design-review-concept`
- `art-bible`
- `map-systems`
- `design-system`
- `design-review`
- `review-all-gdds`
- `consistency-check`
- `create-architecture`
- `control-manifest`
- `accessibility-doc`

### Registry and catalog

`src/ccgs-parity.ts` marks a workflow-step row implemented when its id is present in `workflowRegistry`. Therefore each adopted id must become a real `WorkflowId` with role owner, phase, category, objective, context files, and optional templates/aliases.

`src/workflow-catalog.ts` remains the phase/status surface. It must use the same ids for concept/design/architecture prerequisites so status output does not drift from parity closure.

### Generated workflow surfaces

Each new registry id needs a tracked `.codex/workflows/<id>.md` file. Generate these from the existing `workflowBody()` renderer after registry updates so metadata, hash, model policy, role, linked skills, and prompt body follow the same contract as existing workflows.

### Out of scope

- No local task orchestration.
- No adoption of the remaining production/polish/release workflow rows.
- No template or rule adoption.
- No hidden Claude-style Task-tool delegation.
