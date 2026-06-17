reviewer: Open Game Studio seed review
date: 2026-06-17
source-link: https://dev.epicgames.com/documentation/en-us/unreal-engine/
engine: unreal
version-reviewed: 5.5
tags: unreal,current,best,practices
roles: gameplay-programmer,engine-programmer,tools-programmer,technical-artist
workflows: prototype,bugfix,architecture-review,qa-plan

# Unreal Current Best Practices

## Purpose

Apply current engine-native defaults without turning the task into broad process ceremony.

## Guidance

- Prefer engine-native composition and asset workflows.
- Keep edits scoped to the requested role/task.
- Mention scene, prefab, resource, project-setting, or asset-import changes explicitly.
- Use local validation evidence before claiming readiness.

## Validation

- Prefer project-local engine commands and Open Game Studio project validation before readiness claims.
- Record unknown version-specific behavior as a risk instead of presenting it as confirmed.
- Keep this reference selected by relevance; do not load every engine reference for one task.
