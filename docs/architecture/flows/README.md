---
status: active
doc_type: architecture
truth_kind: architecture
last_reviewed: 2026-05-30
source_of_truth:
  - ../repository-structure.md
  - ../../truthmark/engineering/repository/overview.md
---

# Architecture Flow Guides

## Purpose

These Architecture Flow Guides document Open Game Studio's important runtime scenarios, branching logic, failure paths, and code/truth-doc traceability. They are Markdown docs-as-code runtime views: readable in GitHub/VS Code, reviewable in pull requests, and detailed enough to guide humans and agents through the system.

## Professional Framing

This folder uses established software-architecture documentation patterns:

- **arc42 Runtime View**: documents concrete behavior, interactions between building blocks, important scenarios, operational flows, and error/exception scenarios.
- **C4 dynamic views**: describe how architecture elements interact at runtime when a static structure view is not enough.
- **Diátaxis explanation/how-to separation**: these guides explain and navigate flows; Truthmark truth docs remain the canonical reference layer.
- **Mermaid in Markdown**: sequence and flowchart diagrams are embedded directly in Markdown so the diagrams stay close to the walkthrough text.

## Relationship To Truthmark Truth Docs

Truthmark truth docs own canonical behavior claims. Architecture flow guides own comprehension.

| Layer | Purpose | Example |
| --- | --- | --- |
| Truth docs | Bounded, canonical behavior/reference claims | `docs/truthmark/engineering/codex/runtime-and-tasks.md` |
| Flow guides | Cross-cutting runtime scenarios, branches, and debugging paths | `docs/architecture/flows/role-run-lifecycle.md` |
| Portal | Generated non-canonical presentation | `docs/truthmark/generated/portal/` |

If a flow guide conflicts with source code or a truth doc, the source code and owning truth doc win. Update the owning truth doc first, then update the affected flow guide.

## Flow Index

| Flow guide | Scenario | Primary truth docs |
| --- | --- | --- |
| [Project Initialization](project-initialization.md) | `init` / `new` creates a deterministic generated game project. | `docs/truthmark/engineering/projects/project-scaffolding.md` |
| [Role Run Lifecycle](role-run-lifecycle.md) | `run <role>` renders, executes, verifies, reviews, and optionally fixes a Codex role run. | `docs/truthmark/engineering/codex/runtime-and-tasks.md`, `docs/truthmark/engineering/codex/roles-and-workflows.md` |
| [Workflow Prompt Rendering](workflow-prompt-rendering.md) | Workflow shortcut commands render deterministic prompts without executing Codex. | `docs/truthmark/engineering/codex/roles-and-workflows.md` |
| [Validation And Repository Truth](validation-and-repository-truth.md) | Repository/project validation and injected Truthmark repository-truth workflows around behavior changes. | `docs/truthmark/engineering/contracts/cli-and-validation.md`, `docs/truthmark/engineering/repository/overview.md` |

## Guide Template

Each flow guide should include:

1. Purpose and scenario boundary.
2. Entry points.
3. Preconditions and inputs.
4. Happy path sequence.
5. Branch map.
6. Decision table.
7. Failure modes and debugging cues.
8. Code traceability.
9. Truth sources and verification.

## Maintenance Rules

- Keep these guides focused on architecturally relevant scenarios, not every internal helper call.
- Do not use flow guides to introduce new behavior claims that are absent from source and truth docs.
- When behavior changes, update the owning truth doc and then any impacted flow guide.
- Keep Truthmark framed as an injected repository-truth workflow/tooling layer unless product code explicitly implements Truthmark-facing runtime behavior.
