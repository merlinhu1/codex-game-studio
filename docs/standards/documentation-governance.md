---
status: active
doc_type: standard
last_reviewed: 2026-05-30
source_of_truth:
  - README.md
---

# Documentation Governance

## Core Rules

- Each document should have one primary responsibility.
- Each class of fact should have one canonical source.
- Current implementation, reusable standards, and future proposals should be stored separately.
- Generated helper output is never canonical truth.
- Architecture docs describe structure, ownership, and runtime views; truth docs describe current product behavior and remain the canonical behavior reference.
- Architecture flow guides may explain branching logic and failure paths, but they must trace back to the owning truth docs rather than becoming a competing source of behavior truth.

## Truthmark Implications

- Truth Sync should extend mapped docs first, create an area-local doc second, and create a new area only as a last resort.
- Weak routing produces weak truth maintenance.
- Missing, stale, broad, overloaded, or unrouteable routing should trigger Truth Structure before more generic truth docs are created.
