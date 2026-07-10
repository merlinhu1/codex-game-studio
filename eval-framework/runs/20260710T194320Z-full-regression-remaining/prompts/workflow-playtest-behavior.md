# Scenario: workflow.playtest behavior

Evaluate QA/playtest routing and evidence quality without implementation writes.

## Required context

- `.codex/workflows/playtest.md`
- `.agents/skills/cgs-playtest-report/SKILL.md`
- `templates/playtest_report_template.md`
- `templates/test_evidence_template.md`
- `eval-framework/rubrics/prompt-workflow-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/playtest-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
