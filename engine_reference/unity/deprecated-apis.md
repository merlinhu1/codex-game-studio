reviewer: Codex Game Studio seed review
date: 2026-06-17
source-link: https://docs.unity3d.com/Manual/index.html
engine: unity
version-reviewed: 6000.0
tags: unity,deprecated,apis
roles: gameplay-programmer,engine-programmer,qa-playtester,performance-analyst
workflows: prototype,bugfix,architecture-review,qa-plan

# Unity Deprecated APIs

## Purpose

Avoid stale APIs and migration traps when editing or reviewing engine code.

## Guidance

- Check version-specific deprecations before copying older snippets.
- Prefer supported APIs and document unavoidable legacy use.
- Treat deprecated APIs as warnings unless the task is a migration or compatibility fix.

## Validation

- Prefer project-local engine commands and Codex Game Studio project validation before readiness claims.
- Record unknown version-specific behavior as a risk instead of presenting it as confirmed.
- Keep this reference selected by relevance; do not load every engine reference for one task.
