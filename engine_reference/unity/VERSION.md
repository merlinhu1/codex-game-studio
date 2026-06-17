reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://docs.unity3d.com/Manual/index.html

# Unity Version Reference

version-applicability: Unity 2022 LTS and Unity 6 style projects unless project files state otherwise.

## Prefer

- Use component-oriented scripts and keep serialized fields inspectable.
- Treat ProjectSettings and package manifest changes as reviewable engine changes.

## Avoid

- Do not edit Library or other generated Unity cache folders.
- Do not assume package APIs without checking the manifest.

## Pitfalls

- Scene and prefab YAML changes can be noisy and order-sensitive.
- Assembly definitions and packages can change compile boundaries.

## Verification Notes

- Run the configured Unity command or document an editor play-mode smoke check.
- Report scenes, prefabs, scripts, packages, and settings touched.

## Role Notes

- Programmers should distinguish runtime script changes from editor or package changes.

## Official Links

- https://docs.unity3d.com/Manual/index.html
