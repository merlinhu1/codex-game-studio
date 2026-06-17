reviewer: Open Game Studio seed review
date: 2026-06-17
source-link: https://docs.unity3d.com/Manual/index.html
engine: unity
version-reviewed: 6000.0
tags: unity,plugins
roles: tools-programmer,engine-programmer,unity-specialist
workflows: prototype,bugfix,architecture-review,qa-plan

# Unity Plugin And Package Reference

## Purpose

Guide plugin/package use without adding hidden runtime dependencies.

## Guidance

- Prefer package-manager or marketplace sources that are reviewable in the project.
- Record plugin version, install surface, and rollback risk.
- Avoid requiring plugins for lightweight prototypes unless explicitly justified.

## Validation

- Prefer project-local engine commands and Open Game Studio project validation before readiness claims.
- Record unknown version-specific behavior as a risk instead of presenting it as confirmed.
- Keep this reference selected by relevance; do not load every engine reference for one task.
