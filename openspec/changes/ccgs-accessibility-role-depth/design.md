## Context

The generated report shows 100 remaining CCGS parity rows and identifies 33 role rows. Of those, 21 are direct role-package adaptations whose local role exists but lacks explicit CCGS-depth contract coverage. `accessibility-specialist` is the first direct role gap.

The upstream CCGS accessibility agent covers WCAG-oriented UI/gameplay auditing, text and contrast requirements, colorblind safety, subtitles and audio alternatives, input remapping, motor/cognitive accommodations, assistive feature recommendations, structured findings, and handoffs to UX, UI programmer, audio, QA, localization, art, and producer roles.

## Goals / Non-Goals

**Goals:**

- Add a CCGS-depth role contract for `accessibility-specialist` in `src/roles.ts`.
- Keep the contract Codex-native: bounded context, explicit evidence, owner handoffs, and no copied Claude collaboration rules.
- Prove the role row moves from remaining to implemented in generated parity reports.

**Non-Goals:**

- Do not add a new role id.
- Do not copy upstream `.claude/agents/accessibility-specialist.md` verbatim.
- Do not change all remaining role gaps in this pass.
- Do not add new workflow, template, or rule surfaces.

## Decisions

1. Extend `ccgsParityRoleDetails` and `ccgsParityUpgradedRoleIds`.
   - Rationale: existing parity logic already treats those role ids as implemented and keeps rich role details separate from the compact base role declaration.
   - Alternative rejected: change row status with a special-case parity override. That would decouple status from actual role package depth.

2. Test role package behavior and parity report behavior.
   - Rationale: role tests prove the contract content, while parity tests prove the generated gap report changes.
   - Alternative rejected: only inspect the generated Markdown. That would miss a shallow role contract marked implemented by accident.

## Risks / Trade-offs

- Risk: the role contract becomes a generic accessibility essay. Mitigation: tests require concrete concepts such as WCAG, contrast, remapping, subtitles, severity, and owner handoffs.
- Risk: parity count changes could drift from report expectations. Mitigation: regenerate parity references from `scripts/audit-ccgs-surfaces.ts` and inspect the diff.
