# Scenario: workflow.ui-ux-review behavior

Evaluate UI/UX review output quality and accessibility coverage.

## Required context

- `.codex/workflows/ui-ux-review.md`
- `.agents/skills/cgs-ui-ux-review/SKILL.md`
- `templates/ui_ux_review_template.md`
- `templates/accessibility_requirements_template.md`
- `eval-framework/rubrics/prompt-workflow-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/ui-ux-review-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
