# Studio Roles

Codex Game Studio generates Codex-native role prompts for common game-studio disciplines. Role IDs are hyphenated and stable. Unsupported legacy underscore IDs are rejected instead of silently mapped.

Use this catalog to choose a role before calling `run <role>`.

## Direction and production

| Role | Use it for |
| --- | --- |
| `studio-orchestrator` | Coordinating a bounded slice across roles and handoffs. |
| `producer` | Milestones, production planning, priority calls, and market-facing summaries. |
| `release-manager` | Release readiness, ship checks, handoff quality, and launch coordination. |

## Market and analytics

| Role | Use it for |
| --- | --- |
| `market-analyst` | Competitor review, positioning, audience fit, store-page risks, and market summaries. |
| `data-scientist` | Telemetry plans, analytics questions, experiment design, and metrics interpretation. |

## Design and writing

| Role | Use it for |
| --- | --- |
| `creative-director` | Pillars, tone, experience direction, and cross-discipline creative alignment. |
| `senior-game-designer` | Systems direction, design cohesion, and high-level gameplay decisions. |
| `game-designer` | GDD sections, mechanics, rules, progression, and feature design. |
| `narrative-designer` | Narrative systems, quest structure, story-gameplay integration. |
| `writer` | Dialogue, prose, descriptions, and voice/tone work. |
| `world-builder` | Setting, factions, locations, lore, and world consistency. |
| `level-designer` | Level goals, encounter flow, spatial pacing, and layout specs. |
| `game-feel-designer` | Moment-to-moment feel, tuning targets, juice, responsiveness, and experiential checks. |
| `systems-designer` | Interlocking systems, economies, progression, constraints, and balancing models. |
| `economy-designer` | Currencies, sinks/sources, pricing, reward loops, and economy risks. |

## Engineering

| Role | Use it for |
| --- | --- |
| `gameplay-programmer` | Gameplay implementation plans, feature code, and mechanics integration. |
| `ai-programmer` | NPC behavior, decision logic, navigation, perception, and combat AI. |
| `network-programmer` | Multiplayer architecture, synchronization, rollback, replication, and latency concerns. |
| `ui-programmer` | UI implementation, menus, HUD, state binding, and input/accessibility integration. |
| `engine-programmer` | Engine-level systems, performance-sensitive architecture, and low-level integration. |
| `tools-programmer` | Editor tools, pipelines, scripts, importers, and production automation. |
| `technical-director` | Technical architecture, constraints, feasibility reviews, and cross-system decisions. |
| `devops-engineer` | Build, CI, release automation, packaging, and environment workflow. |
| `security-engineer` | Threat models, abuse cases, credential handling, and multiplayer/backend risks. |
| `performance-analyst` | Profiling plans, optimization hypotheses, budgets, and bottleneck analysis. |

## Engine specialists

| Role | Use it for |
| --- | --- |
| `godot-specialist` | Godot-specific architecture, APIs, project layout, and version-sensitive guidance. |
| `unity-specialist` | Unity-specific architecture, packages, scenes/prefabs, and C# guidance. |
| `unreal-specialist` | Unreal-specific architecture, modules, Blueprints/C++, plugins, and content workflow. |

## Art, audio, and UX

| Role | Use it for |
| --- | --- |
| `senior-game-artist` | Art direction, asset planning, style guides, and visual production constraints. |
| `technical-artist` | Shaders, pipelines, asset integration, VFX, optimization, and DCC-engine bridges. |
| `audio-director` | Audio direction, music/sound strategy, mix priorities, and implementation needs. |
| `sound-designer` | SFX concepts, interactive audio details, event naming, and feedback loops. |
| `ui-ux-designer` | UX flows, HUD/menu design, player journeys, wireframes, and usability review. |
| `accessibility-specialist` | Accessibility risks, input alternatives, readability, audio/visual cues, and inclusive design. |

## QA, localization, and operations

| Role | Use it for |
| --- | --- |
| `qa-playtester` | Test plans, playtest notes, bug-risk reviews, and acceptance criteria. |
| `localization-lead` | Localization planning, string risks, culturalization, and translation handoff. |
| `live-ops-designer` | Events, retention loops, progression cadence, and live-service content planning. |
| `community-manager` | Community-facing messaging, feedback triage, and communication plans. |

## Choosing a role

- Use `producer` when the question is priority, milestone, or scope.
- Use `creative-director` or `senior-game-designer` when the question changes the player promise.
- Use an engine specialist when the implementation depends on Godot, Unity, or Unreal details.
- Use `qa-playtester` or `release-manager` before trusting a feature as shippable.
- Use `studio-orchestrator` only for bounded cross-role slices; do not use it as a general autonomous manager.

See the [User Guide](user-guide.md) for `run <role>` usage and inspection flags.
