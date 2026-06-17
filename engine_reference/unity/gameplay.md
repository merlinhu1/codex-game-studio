reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://docs.unity3d.com/Manual/CreatingAndUsingScripts.html

# Unity Gameplay Reference

version-applicability: Unity gameplay scripts, scenes, prefabs, and play-mode checks.

## Prefer

- Keep MonoBehaviour responsibilities small and visible through serialized fields.
- Use prefabs and scenes as explicit context when code depends on hierarchy.

## Avoid

- Avoid hidden scene-object lookup chains when dependencies can be assigned.
- Avoid editing generated project caches.

## Pitfalls

- Script execution order and physics timestep can affect gameplay behavior.
- Prefab overrides may not be obvious from script diffs alone.

## Verification Notes

- Run available edit-mode or play-mode tests, or document a play-mode check.
- Name the scene or prefab used for manual verification.

## Role Notes

- Gameplay programmers receive this reference by default for Unity projects.
- Technical artists should cite material, shader, or prefab runtime impact.

## Official Links

- https://docs.unity3d.com/Manual/CreatingAndUsingScripts.html
