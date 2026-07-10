# Scenario: workflow.market-analysis behavior

Evaluate market-analysis prompt context selection and positioning output quality.

## Required context

- `.codex/workflows/market-analysis.md`
- `.agents/skills/cgs-content-audit/SKILL.md`
- `templates/market_analysis_template.md`
- `templates/pitch_document_template.md`
- `eval-framework/rubrics/prompt-workflow-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/market-analysis-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
