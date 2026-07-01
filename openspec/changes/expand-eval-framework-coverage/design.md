## Context

The branch currently contains an eval framework modeled after CCGS and Truthmark, but it has only three performance scenarios. CCGS has one spec per cataloged skill/agent, and Truthmark uses realistic workflow scenarios with deterministic boundaries, semantic judging, human review, and token tracking. Open Game Studio should not attempt full parity in one pass, but it needs enough coverage to exercise the highest-risk surfaces.

## Goals / Non-Goals

**Goals:**
- Reach a first real coverage threshold of at least 30 performance scenarios.
- Cover at least 10 workflow prompts, 10 skills, and 6 role prompts.
- Preserve manual-only behavior and no default CI agent/judge calls.
- Validate behavior contracts: required reads, forbidden writes, required artifacts, verification evidence, report presence, semantic dimensions, and raw token accounting.
- Keep scenario files reviewable and easy to extend.

**Non-Goals:**
- Do not implement the real agent runner or LLM judge in this pass.
- Do not claim CCGS full parity.
- Do not add package/runtime requirements for downstream game projects.
- Do not evaluate success from skill-file existence or literal prompt presence alone.

## Decisions

1. Store scenarios as JSON plus prompt markdown under `eval-framework/scenarios/<target>/<case>/`.
   - Rationale: this matches the current implementation and keeps each scenario reviewable.
   - Alternative considered: a single generated mega-catalog. Rejected because it hides scenario intent.

2. Use catalog targets as the coverage unit and scenario files as the executable unit.
   - Rationale: targets map surfaces to rubrics; scenarios capture behavior expectations.
   - Alternative considered: direct filesystem inventory. Rejected because existence coverage is not useful.

3. Add a third rubric for role behavior instead of overloading skill/workflow rubrics.
   - Rationale: role prompts need domain-boundary and delegation dimensions that differ from skill-improvement workflows.

4. Enforce thresholds in tests and validation helpers.
   - Rationale: this prevents future regressions back to scaffold-only coverage.

## Risks / Trade-offs

- Risk: Scenario count grows but quality stays shallow. Mitigation: require semantic dimensions and concrete expected behavior for every scenario.
- Risk: JSON scenarios become repetitive. Mitigation: keep prompts concise and scenario-specific; defer runner implementation.
- Risk: Full test suite may delete untracked tests during template smoke. Mitigation: stage new test files before full-suite runs and verify no deleted tests remain.
- Risk: Coverage is still below CCGS parity. Mitigation: report this as first-pass coverage, not parity.

## Migration Plan

Add OpenSpec artifacts, write failing tests for coverage thresholds, generate scenario files, update validation helpers if needed, then run focused tests, typecheck, full test suite, `npm run validate`, OpenSpec validation, and Truthmark checks.
