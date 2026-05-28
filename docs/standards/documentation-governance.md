---
status: active
doc_type: standard
last_reviewed: 2026-05-03
source_of_truth:
  - README.md
---

# Documentation Governance

## Core Rules

- Each document should have one primary responsibility.
- Each class of fact should have one canonical source.
- Current implementation, reusable standards, and future proposals should be stored separately.
- Generated helper output is never canonical truth.
- Architecture docs describe structure and ownership; truth docs describe current product behavior.

## Truthmark Implications

- Truth Sync should extend mapped docs first, create an area-local doc second, and create a new area only as a last resort.
- Weak routing produces weak truth maintenance.
- Missing, stale, broad, overloaded, or unrouteable routing should trigger Truth Structure before more generic truth docs are created.
