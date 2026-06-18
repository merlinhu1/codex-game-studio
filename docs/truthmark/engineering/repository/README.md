---
status: active
doc_type: index
last_reviewed: 2026-06-18
source_of_truth:
  - ../../routes/areas/repository.md
---

# Repository Truth Docs

This directory is reserved for repository-level truth indexes and generated Truthmark repository handoffs.

README.md files are indexes, not Truth Sync targets. Current bounded truth lives in:

- [Project Scaffolding](../projects/project-scaffolding.md)
- [Codex Roles And Workflows](../codex/roles-and-workflows.md)
- [Runtime And Task Execution](../codex/runtime-and-tasks.md)
- [CLI And Validation Contracts](../contracts/cli-and-validation.md)

Truthmark 2.2.2 also installs [Repository Bootstrap Routing](bootstrap-routing.md) as a generated handoff for fresh repositories whose default broad route still needs to be split. In this repository, the bounded areas in `../../routes/areas/repository.md` remain canonical; do not expand the bootstrap handoff into behavior truth.
