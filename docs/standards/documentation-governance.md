---
status: active
doc_type: standard
last_reviewed: 2026-07-10
source_of_truth:
  - README.md
---

# Documentation Governance

## Core Rules

- Each document has one primary responsibility.
- Each class of fact has one canonical source.
- Current implementation, reusable standards, and future proposals stay separate.
- Generated helper output is never canonical truth.
- The root README is the concise human storefront; command reference, role catalog, generated-file detail, and contributor workflow detail belong in linked subdocs.
- Material root README changes update localized README storefronts under `docs/readmes/` in the same change or state why they intentionally differ.
- Architecture docs describe structure, ownership, and runtime views; design and production records describe the current game.

## Initialized Game Documentation

- `design/` owns player-facing rules, systems, controls, and content intent.
- `docs/architecture/` owns technical boundaries and durable architecture decisions.
- `production/` owns milestone, ownership, handoff, and documentation-impact records.
- `docs/changelog.md` and `docs/patch-notes.md` own release-visible communications.
- Functional source, engine, or asset changes require an updated owner document or an explicit `no-update` decision in `production/session-state/active.md`.
- `./codex-game-studio docs-impact --base <review-base>` validates the record against the changed paths; it checks evidence, not prose semantics.
