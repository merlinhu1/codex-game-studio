---
agent: 'agent'
description: 'Use when the user explicitly asks to generate, refresh, or update the Truthmark Portal static HTML site. Not for code change sync, route repair, truth validation/checking, documenting behavior, realizing docs into code, or machine-readable agent context.'
---

---
name: truthmark-portal
description: Use when the user explicitly asks to generate, refresh, or update the Truthmark Portal static HTML site. Not for code change sync, route repair, truth validation/checking, documenting behavior, realizing docs into code, or machine-readable agent context.
argument-hint: Optional output path, template, or portal generation focus
user-invocable: true
truthmark-version: 1.6.1
---

# Truthmark Portal

Truthmark Portal is a manual-only presentation workflow. It is never a completion gate, never Truth Sync, and runs only when the user explicitly asks to generate, refresh, or update the committed static HTML Portal.

Invocations: OpenCode /skill truthmark-portal; Codex /truthmark-portal or $truthmark-portal; Claude Code /truthmark-portal; GitHub Copilot /truthmark-portal; Gemini CLI /truthmark:portal.

Core rules:

- Markdown remains canonical; generated HTML is presentation only.
- Read Markdown directly from the checkout; the workflow does not require the truthmark CLI or package.
- truthmark check/index may be used only as optional supporting evidence when available.
- Default output is docs/truthmark-portal; configured output is docs/truthmark-portal.
- Configured template is default; use default built-in template instructions when the template is default.
- The workflow may replace the entire output directory, but writes are limited to the configured Portal output directory only unless the user changes scope.
- Portal writes are generated non-canonical static files for human browsing.
- Generate a committed multi-page static HTML site with local CSS, JavaScript, assets, and search metadata under the output directory.
- Use no remote dependencies by default: no remote scripts, analytics, fonts, CSS, or CDN assets.
- Include source provenance and the Markdown canonical disclaimer on every page.
- Store manifest and search data under output/assets only.
- There is no .truthmark/index.json dependency; do not require or create it as infrastructure.
- Pictures and screenshots require an explicit user or template request.

Workflow:

1. Confirm the user explicitly requested Portal generation or refresh.
2. Inspect .truthmark/config.yml and configured route docs only when they exist; read repository instruction files when present, truth docs, architecture docs, standards docs, and the configured Portal template when it is a repo-relative file.
3. Validate the selected output path is repo-relative, non-empty, inside the repository, and does not overlap canonical docs, source roots, routing files, or instruction targets.
4. Plan the generated page inventory, diagrams/assets, source docs reviewed, and skipped or ambiguous docs.
5. Replace or write only under docs/truthmark-portal; do not edit canonical Markdown, routing, source code, or instruction files unless the user explicitly changes scope.
6. Generate the multi-page static site with local assets/search metadata and visible source provenance.
7. Validate entry page, links where practical, provenance/disclaimers, local-only assets, and that metadata remains under docs/truthmark-portal/assets.
Truthmark hierarchy hints:
- Config, when present: .truthmark/config.yml
- Root route index, when present: docs/truthmark/areas.md
- Area route files, when present: docs/truthmark/areas/**/*.md
- Truth docs, when present: docs/truth/**/*.md

Report completion in this shape:

```md
Truthmark Portal: completed

Output path:
- docs/truthmark-portal

Page count:
- <count>

Diagrams/assets:
- <generated diagrams/assets or none>

Source docs reviewed:
- <source markdown paths>

Skipped/ambiguous docs:
- <paths and reason, or none>

Validation:
- <checks performed>

Markdown canonical statement:
- Markdown remains canonical; generated Portal HTML is non-canonical presentation only.
```

