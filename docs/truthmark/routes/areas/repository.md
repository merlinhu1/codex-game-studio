---
status: active
doc_type: routing
last_reviewed: 2026-06-29
---

# Repository Area

## Repository

Truth documents:

```yaml
truth_documents:
  - path: docs/truthmark/engineering/repository/bootstrap-routing.md
    kind: engineering-workflow
    lane: engineering
```

Code surface:

- AGENTS.md
- README.md
- docs/\*\*
- src/\*\*
- tests/\*\*
- scripts/\*\*
- templates/\*\*
- engine_configs/\*\*
- engine_reference/\*\*
- references/\*\*
- package.json
- package-lock.json

Update truth when:

- repository instructions or product boundaries change
- CLI, validation, task, role, workflow, template, engine-reference, or package behavior changes
- a future Truthmark workflow creates a narrower bounded owner

## Source References

- ../areas.md
- ../../../../.truthmark/config.yml
- ../../engineering/repository/bootstrap-routing.md
