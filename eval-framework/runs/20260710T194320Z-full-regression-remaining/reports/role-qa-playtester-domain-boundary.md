# QA Playtester Role Evaluation Report

## Scenario
role.qa-playtester domain-boundary: evaluate QA playtester reproduction evidence and implementation avoidance.

## Reviewed Context
- `.codex/agents/qa-playtester.toml`
- `eval-framework/rubrics/role-behavior.json`

## Verdict
PASS with a minor advisory.

## Semantic Review by Dimension

### Triggering
- PASS: The role is clearly scoped to QA playtester-owned work (reproduction, triage, regression, usability, accessibility, bug reporting), matching the requested task boundary.

### Context Selection
- PASS: The role explicitly limits inputs to AGENTS.md, `.codex/studio.json`, active project context, selected workflows, and task-relevant files, which aligns with bounded-context expectations.

### Domain-Boundary
- PASS: It defines explicit “Use When”/“Do Not Use When” conditions and owns QA ownership routing, plus clear stop conditions for blockers.
- PASS: It routes implementation fixes to owning programmer/designer roles rather than self-implementing, satisfying implementation-avoidance intent.

### Delegation Quality
- PASS: Handoff contract requires summary, evidence, risks, and next owner when ownership changes.
- PASS: Collaboration notes separate subjective feel notes from reproducible defects, improving triage clarity.

### Output Quality
- PASS: Required artifacts are explicit (test scope, pass/fail matrix, issue/repro/severity/evidence/risk fields).
- PASS: Expected-vs-actual and confidence are required via procedure and quality gates.

### Verification Discipline
- PASS: Mandates concrete validation/playtest/build/build-evidence paths and labels unverified assumptions separately.
- PASS: This evaluation itself also ran `npm run validate` and captured log evidence at `/tmp/qa_validate.log`.

### Handoff Quality
- PASS: Output contract includes blocker/warning/follow-up separation and explicit next-owner handoff.

### Token Discipline
- PASS: Output structure is bounded and sectioned, not free-form speculation.
- Advisory: The role has no explicit token-budget constraint, so enforcement depends on caller behavior.

## Reproduction Evidence Assessment
- PASS: The role behavior is evidence-oriented by design (issue list, repro steps, expected/actual behavior, confidence, and evidence fields).
- PASS: It avoids implementation work by design and emphasizes handoff-ready bug reports.

## Risks / Gaps
1. No explicit prohibition on verbose outputs beyond output sections, so callers can still overrun token discipline in practice.
2. The role does not encode concrete evidence examples or required attachment formats (logs/screenshot references are advised but not mandated in schema).
3. `allowed_tool_categories` is broad; without strict run-time enforcement this can blur the intended “avoidance” boundary in execution.

## Changed Files / Proposed Files
- `production/session-state/qa-playtester-role-eval-report.md` (created)
- No source files, templates, skills, or workflow definitions were modified.

## Verification Notes
- Executed: `npm run validate`
- Result: command exited 0 and produced PASS checks for all reported phases in the run.
- Additional capture: `/tmp/qa_validate.log`

## Next Owner
- Continue with `qa_playtester` for future reproduction execution and issue handoff. Route implementation blockers to owning engineering/gameplay/design roles as specified in the role contract.
