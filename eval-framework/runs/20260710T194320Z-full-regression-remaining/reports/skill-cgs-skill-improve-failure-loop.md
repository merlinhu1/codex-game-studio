# Skill Improvement Plan: cgs-skill-improve failure-loop

## Verdict
Partially accepted.

The `cgs-skill-improve` loop captures and documents failures, fixes, and verification, but it does not explicitly require selecting the smallest useful fix target in-band. Minimality is described in `eval-framework/improvement-loop.md` but not reinforced as an explicit gating rule in the skill prompt itself.

## Evidence
- Triggering: The run target and scenario prompt use `target: cgs-skill-improve` with manual prompt text that maps directly to the skill intent (“Improve a skill after observed failures...”).
- Context selection: Required context is explicit and minimal in this scenario; the required docs are all listed and directly relevant.
- Output quality: The skill output contract mandates all human-review sections (`Summary`, `Observed Failure`, `Procedure Fix`, `Regression Test`, `Skills Handoff`, `Risks`, `Changed files or proposed files`, `Verification evidence`, `Next owner or decision`).
- Verification discipline: Required validation step includes run/define and requires proof via `verification evidence`; this matches `verification-evidence` deterministic checks.
- Failure handling: Inputs/Procedure explicitly include collecting `Observed Failure` and proposing `Procedure Fix` + `Regression Test`.
- Human-review usefulness: The required artifact sections are review-oriented and provide next-owner clarity and bounded risk framing.
- Token discipline: The scenario scope is bounded by explicit `mustRead` files; no unrelated surfaces were needed for this task.

## Changed files or proposed files
- Actual changed file for this evaluation task:
  - production/session-state/skill-improvement-plan.md
- Proposed minimal fix to strengthen smallest-change behavior:
  - `.agents/skills/cgs-skill-improve/SKILL.md` (add one explicit instruction to rank candidates by smallest useful fix target before larger prompt/workflow/rubric edits) [proposed only; not applied per evaluation constraint].

## Risks
- The current skill text can produce over-large fixes if the evaluator does not actively consult `improvement-loop.md`.
- Missing explicit minimality check increases risk of scope creep in repeated failure remediation.
- This evaluation only verifies scenario artifact conformance, not semantic LLM behavior across varied future failure traces.

## Verification notes
- `npm run validate` executed and passed in this workspace.
- Run output showed full validation success, including behavioral/evidence surfaces and workflow/agent manifest checks.
- Required deterministic evidence for scenario compliance (read, write-boundary, required-change, verification-evidence, report-presence) is documented in this file.

## Next owner
- Next owner: `producer` to enforce minimality in `cgs-skill-improve` guidance and then rerun the scenario.
