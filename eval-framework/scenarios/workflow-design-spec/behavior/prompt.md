# Scenario: workflow.design-spec behavior

Evaluate design-spec prompt requirements, acceptance criteria, and handoff clarity.

## Required context

- `.codex/workflows/design-spec.md`
- `.agents/skills/cgs-design-system/SKILL.md`
- `templates/gdd_template.md`
- `templates/feature_spec_template.md`
- `eval-framework/rubrics/prompt-workflow-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/design-spec-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
