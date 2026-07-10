# Scenario: workflow.ship-check behavior

Evaluate ship-check readiness judgment and release-manager handoff.

## Required context

- `.codex/workflows/ship-check.md`
- `templates/ship_check_template.md`
- `templates/risk_register_template.md`
- `eval-framework/rubrics/prompt-workflow-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/ship-check-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
