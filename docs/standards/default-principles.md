---
status: active
doc_type: standard
last_reviewed: 2026-05-30
source_of_truth:
  - README.md
---

# Default Principles

## Scope

This is a bootstrap standards baseline for repositories that adopt Truthmark.

## Reusable Defaults

- Authority order should be explicit.
- Committed repository artifacts are the durable source of truth.
- Each document should have one primary responsibility.
- Each class of fact should have one canonical source.
- Architecture docs describe system structure, module boundaries, runtime topology, persistence boundaries, cross-cutting contracts, generated-surface ownership, and architecturally relevant runtime views.
- Do not put ordinary feature behavior in architecture docs; use architecture flow guides only for cross-cutting runtime scenarios, branching logic, failure paths, and traceability back to bounded truth docs.
- Verification should be explicit, and skipped checks should state why.
- Missing, stale, broad, overloaded, or unrouteable documentation topology should be repaired through AI-native structure workflow before agents create more generic truth docs.
- Installed repository workflows should remain usable from committed files even when the Truthmark CLI is unavailable.
