## Context

The current remaining-gap report shows 99 remaining rows. The small, already-identified direct role-package gaps are the 20 rows whose source type is `agent`, decision is `adapt`, target kind is `role`, and owner is `src/roles.ts`.

These rows are small because the role ids and base role packages already exist. Closing them requires deeper contract fields, not new product surfaces. The major boundary starts after this batch: 12 engine sub-specialist decision rows plus workflow, template, and rule adoption work.

## Goals / Non-Goals

**Goals:**

- Close all remaining direct role-package depth gaps in one repeatable pass.
- Keep each contract compact, Codex-native, and role-specific.
- Add tests that prevent marking direct roles implemented without real contract structure.
- Regenerate the generated parity references and stop at the major categories.

**Non-Goals:**

- Do not add or remove role ids.
- Do not adopt engine sub-specialist rows.
- Do not add workflow aliases, templates, rules, skills, or CLI surfaces.
- Do not copy upstream Claude agent files verbatim.

## Decisions

1. Treat direct role depth as the final small-gap batch.
   - Rationale: these rows are structurally identical and live in one file.
   - Alternative rejected: close one role per commit. That would repeat the same low-risk contract shape twenty times and delay the clear stop point.

2. Stop after direct roles.
   - Rationale: the remaining categories require product-boundary decisions: whether to add engine sub-specialists, how to represent workflow phases, which templates deserve package assets, and where rule guidance belongs.

3. Require output schema and role-specific quality gates for every upgraded role.
   - Rationale: this prevents shallow prompt text from satisfying parity.

## Risks / Trade-offs

- Risk: role contracts become too verbose. Mitigation: use 3-4 responsibilities and compact schema/gate arrays per role.
- Risk: broad batch hides a bad role. Mitigation: tests require each direct role to expose output schema, responsibilities, quality gates, collaboration notes, stop conditions, and role-specific terms.
