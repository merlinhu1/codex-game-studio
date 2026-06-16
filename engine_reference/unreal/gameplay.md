reviewer: Open Game Studio seed review
date: 2026-06-14
source-link: https://dev.epicgames.com/documentation/en-us/unreal-engine/programming-with-cplusplus-in-unreal-engine

# Unreal Gameplay Reference

version-applicability: Unreal Engine 5.x gameplay C++, Blueprints, maps, and input setup.

## Prefer

- Keep gameplay state ownership clear across Actors, Components, Pawns, and GameMode.
- Mention Blueprint dependencies when C++ behavior expects asset wiring.

## Avoid

- Avoid unreviewed changes to generated project files or caches.
- Avoid broad asset edits without naming the map or Blueprint.

## Pitfalls

- UPROPERTY and UFUNCTION metadata affects editor and Blueprint behavior.
- Enhanced Input setup may live in assets as well as code.

## Verification Notes

- Run available automation or document PIE/editor smoke checks.
- Include compile, map load, and input checks where relevant.

## Role Notes

- Gameplay programmers receive this reference by default for Unreal projects.
- Technical artists should cite material, Blueprint, or asset pipeline effects.

## Official Links

- https://dev.epicgames.com/documentation/en-us/unreal-engine/programming-with-cplusplus-in-unreal-engine
