# Scenario: workflow.architecture-review behavior

Evaluate architecture review verdict, risks, and traceability evidence.

## Required context

- `.codex/workflows/architecture-review.md`
- `.agents/skills/cgs-architecture-review/SKILL.md`
- `templates/technical_design_template.md`
- `templates/architecture_traceability_template.md`
- `eval-framework/rubrics/prompt-workflow-behavior.json`

## Required behavior

- Use the target skill, workflow, or role prompt only when it fits this task.
- Select bounded context; do not load unrelated studio surfaces.
- Produce `production/session-state/architecture-review-eval-report.md` with verdict, evidence, changed files or proposed files, risks, verification notes, and next owner.
- Keep source, templates, skills, workflows, and agent definitions unchanged during the evaluation.
- Run `npm run validate` or explain the concrete blocker.

## Semantic review focus

Judge triggering, context selection, output quality, verification discipline, human-review usefulness, and token discipline.
