reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://docs.godotengine.org/en/stable/tutorials/scripting/index.html

# Godot Gameplay Reference

version-applicability: Godot 4.x gameplay scripts and scenes.

## Prefer

- Keep behavior near the scene nodes that own it.
- Use exported properties for tunables that designers should inspect.

## Avoid

- Avoid broad singleton state for feature-local behavior.
- Avoid hard-coded node paths when a typed exported reference is clearer.

## Pitfalls

- `_process` and `_physics_process` serve different timing needs.
- InputMap entries must exist before gameplay code can rely on them.

## Verification Notes

- Exercise the scene that owns the changed script.
- Include manual input and physics checks when no automated test exists.

## Role Notes

- Gameplay programmers receive this reference by default for Godot projects.
- Technical artists should use it when visual scripts or scene materials affect runtime behavior.

## Official Links

- https://docs.godotengine.org/en/stable/tutorials/scripting/index.html
