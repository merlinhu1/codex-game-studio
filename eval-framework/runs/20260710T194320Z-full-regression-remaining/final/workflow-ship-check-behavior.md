Completed. I evaluated the scenario and wrote the report at:

- [production/session-state/ship-check-eval-report.md](/opt/data/cgs-20260710T194320Z-full-regression-remaining-HYWBzt/fixture-workflow-ship-check-behavior/production/session-state/ship-check-eval-report.md)

Result summary:
1. Verdict: `PASS` (workflow-compliance pass, not a true release-approval pass).
2. Required behavior gates satisfied:
   - Required prompt/workflow/template/rubric context was used.
   - Target output file created.
   - Boundaries respected (no source/template/agent/workflow edits).
   - `npm run validate` executed and succeeded (no blocker).
3. Bounded-scope semantic focus findings: triggering, context selection, role-routing, template selection, output quality, verification discipline, and token discipline were all acceptable.
4. Verified residual risk included in report: no live release artifact/package evidence was present to fully establish real ship readiness.

If you want, I can also generate a matching `eval-framework/runs/.../summary.md` + `audit.json` entry for this scenario.