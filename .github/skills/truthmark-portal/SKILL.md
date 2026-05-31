---
name: truthmark-portal
description: Use when the user explicitly asks to generate, refresh, or update the Truthmark Portal static HTML site. Not for code change sync, route repair, truth validation/checking, documenting behavior, realizing docs into code, or machine-readable agent context.
argument-hint: Optional output path, template, or portal generation focus
user-invocable: true
truthmark-version: 1.6.1
---

# Truthmark Portal

Use this skill only when the user explicitly asks to generate or refresh the committed static HTML Truthmark Portal.

Use as a Copilot agent skill. Prompt files remain available under `.github/prompts/` for command-style invocation in supported Copilot IDEs.


Invocations: OpenCode /skill truthmark-portal; Codex /truthmark-portal or $truthmark-portal; Claude Code /truthmark-portal; GitHub Copilot /truthmark-portal; Gemini CLI /truthmark:portal.

Quick procedure:
- Follow repository instruction files that exist in this checkout; do not assume any optional policy path exists.
- Truthmark Portal is manual-only; never run it as a completion gate and never treat it as Truth Sync.
- Markdown remains canonical; generated HTML is non-canonical presentation only.
- Read Markdown directly; the workflow does not require the truthmark CLI or package.
- Generate committed, generated non-canonical static files for humans.
- Write only under configured Portal output docs/truthmark-portal; default output is docs/truthmark-portal.
- Use configured Portal template default; no .truthmark/index.json dependency.
- Use no remote dependencies by default and include source provenance on every page.
- Read support/procedure.md before generating Portal output.
- Read support/report-template.md before the final report.

Progressive disclosure:
- support/procedure.md
- support/report-template.md
