# CCGS Surface Parity Matrix

Reference root: `/opt/data/repos/Claude-Code-Game-Studios`

## Counts

- Agents: 49
- Skills: 73
- Workflow steps: 45
- Templates: 40
- Rules: 11
- Total rows: 218

## Decision Summary

- adopt: 44
- adapt: 166
- merge: 8
- rename-alias: 0
- defer: 0
- out-of-scope: 0

## Rows

| Type | Source | Decision | CGS target | Status | Rationale |
| --- | --- | --- | --- | --- | --- |
| agent | accessibility-specialist | adapt | role:accessibility-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | ai-programmer | adapt | role:ai-programmer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | analytics-engineer | merge | role:data-scientist | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | art-director | merge | role:senior-game-artist | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | audio-director | adapt | role:audio-director | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | community-manager | adapt | role:community-manager | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | creative-director | adapt | role:creative-director | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | devops-engineer | adapt | role:devops-engineer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | economy-designer | adapt | role:economy-designer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | engine-programmer | adapt | role:engine-programmer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | game-designer | adapt | role:game-designer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | gameplay-programmer | adapt | role:gameplay-programmer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | godot-csharp-specialist | adapt | role:godot-csharp-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | godot-gdextension-specialist | adapt | role:godot-gdextension-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | godot-gdscript-specialist | adapt | role:godot-gdscript-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | godot-shader-specialist | adapt | role:godot-shader-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | godot-specialist | adapt | role:godot-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | lead-programmer | merge | role:technical-director | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | level-designer | adapt | role:level-designer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | live-ops-designer | adapt | role:live-ops-designer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | localization-lead | adapt | role:localization-lead | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | narrative-director | merge | role:narrative-designer | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | network-programmer | adapt | role:network-programmer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | performance-analyst | adapt | role:performance-analyst | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | producer | adapt | role:producer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | prototyper | merge | role:gameplay-programmer | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | qa-lead | merge | role:qa-playtester | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | qa-tester | merge | role:qa-playtester | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | release-manager | adapt | role:release-manager | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | security-engineer | adapt | role:security-engineer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | sound-designer | adapt | role:sound-designer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | systems-designer | adapt | role:systems-designer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | technical-artist | adapt | role:technical-artist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | technical-director | adapt | role:technical-director | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | tools-programmer | adapt | role:tools-programmer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | ue-blueprint-specialist | adapt | role:ue-blueprint-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | ue-gas-specialist | adapt | role:ue-gas-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | ue-replication-specialist | adapt | role:ue-replication-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | ue-umg-specialist | adapt | role:ue-umg-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | ui-programmer | adapt | role:ui-programmer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | unity-addressables-specialist | adapt | role:unity-addressables-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | unity-dots-specialist | adapt | role:unity-dots-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | unity-shader-specialist | adapt | role:unity-shader-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | unity-specialist | adapt | role:unity-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | unity-ui-specialist | adapt | role:unity-ui-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | unreal-specialist | adapt | role:unreal-specialist | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | ux-designer | merge | role:ui-ux-designer | implemented | CCGS role is intentionally merged into an upgraded broader CGS role package. |
| agent | world-builder | adapt | role:world-builder | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| agent | writer | adapt | role:writer | implemented | Direct role has an upgraded CCGS-depth Codex role package and generated TOML coverage. |
| skill | adopt | adapt | skill:cgs-adopt | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | architecture-decision | adapt | skill:cgs-architecture-decision | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | architecture-review | adapt | skill:cgs-architecture-review | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | art-bible | adapt | skill:cgs-art-bible | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | asset-audit | adapt | skill:cgs-asset-audit | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | asset-spec | adapt | skill:cgs-asset-spec | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | balance-check | adapt | skill:cgs-balance-check | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | brainstorm | adapt | skill:cgs-brainstorm | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | bug-report | adapt | skill:cgs-bug-report | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | bug-triage | adapt | skill:cgs-bug-triage | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | changelog | adapt | skill:cgs-changelog | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | code-review | adapt | skill:cgs-code-review | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | consistency-check | adapt | skill:cgs-consistency-check | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | content-audit | adapt | skill:cgs-content-audit | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | create-architecture | adapt | skill:cgs-create-architecture | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | create-control-manifest | adapt | skill:cgs-create-control-manifest | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | create-epics | adapt | skill:cgs-create-epics | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | create-stories | adapt | skill:cgs-create-stories | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | day-one-patch | adapt | skill:cgs-day-one-patch | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | design-review | adapt | skill:cgs-design-review | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | design-system | adapt | skill:cgs-design-system | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | dev-story | adapt | skill:cgs-dev-story | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | estimate | adapt | skill:cgs-estimate | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | gate-check | adapt | skill:cgs-gate-check | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | help | adapt | skill:cgs-help | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | hotfix | adapt | skill:cgs-hotfix | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | launch-checklist | adapt | skill:cgs-launch-checklist | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | localize | adapt | skill:cgs-localize | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | map-systems | adapt | skill:cgs-map-systems | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | milestone-review | adapt | skill:cgs-milestone-review | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | onboard | adapt | skill:cgs-start | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | patch-notes | adapt | skill:cgs-patch-notes | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | perf-profile | adapt | skill:cgs-perf-profile | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | playtest-report | adapt | skill:cgs-playtest-report | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | project-stage-detect | adapt | skill:cgs-project-stage-detect | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | propagate-design-change | adapt | skill:cgs-propagate-design-change | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | prototype | adapt | skill:cgs-prototype | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | qa-plan | adapt | skill:cgs-qa-plan | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | quick-design | adapt | skill:cgs-quick-design | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | regression-suite | adapt | skill:cgs-regression-suite | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | release-checklist | adapt | skill:cgs-release-checklist | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | retrospective | adapt | skill:cgs-retrospective | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | reverse-document | adapt | skill:cgs-reverse-document | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | review-all-gdds | adapt | skill:cgs-review-all-gdds | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | scope-check | adapt | skill:cgs-scope-check | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | security-audit | adapt | skill:cgs-security-audit | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | setup-engine | adapt | skill:cgs-setup-engine | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | skill-improve | adapt | skill:cgs-skill-improve | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | skill-test | adapt | skill:cgs-skill-test | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | smoke-check | adapt | skill:cgs-smoke-check | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | soak-test | adapt | skill:cgs-soak-test | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | sprint-plan | adapt | skill:cgs-sprint-plan | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | sprint-status | adapt | skill:cgs-sprint-status | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | start | adapt | skill:cgs-start | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | story-done | adapt | skill:cgs-story-done | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | story-readiness | adapt | skill:cgs-story-readiness | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-audio | adapt | skill:cgs-team-audio | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-combat | adapt | skill:cgs-team-combat | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-level | adapt | skill:cgs-team-level | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-live-ops | adapt | skill:cgs-team-live-ops | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-narrative | adapt | skill:cgs-team-narrative | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-polish | adapt | skill:cgs-team-polish | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-qa | adapt | skill:cgs-team-qa | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-release | adapt | skill:cgs-team-release | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | team-ui | adapt | skill:cgs-team-ui | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | tech-debt | adapt | skill:cgs-tech-debt | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | test-evidence-review | adapt | skill:cgs-test-evidence-review | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | test-flakiness | adapt | skill:cgs-test-flakiness | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | test-helpers | adapt | skill:cgs-test-helpers | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | test-setup | adapt | skill:cgs-test-setup | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | ux-design | adapt | skill:cgs-ux-design | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | ux-review | adapt | skill:cgs-ux-review | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| skill | vertical-slice | adapt | skill:cgs-vertical-slice | implemented | Generated Codex skill exists; adapt the CCGS workflow depth to Codex-native instructions. |
| workflow-step | brainstorm | adapt | workflow:brainstorm | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | engine-setup | adapt | workflow:engine-setup | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | game-concept | adapt | workflow:game-concept | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | design-review-concept | adapt | workflow:design-review-concept | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | art-bible | adapt | workflow:art-bible | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | map-systems | adapt | workflow:map-systems | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | design-system | adapt | workflow:design-system | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | design-review | adapt | workflow:design-review | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | review-all-gdds | adapt | workflow:review-all-gdds | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | consistency-check | adapt | workflow:consistency-check | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | create-architecture | adapt | workflow:create-architecture | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | architecture-decision | adapt | workflow:architecture-decision | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | architecture-review | adapt | workflow:architecture-review | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | control-manifest | adapt | workflow:control-manifest | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | accessibility-doc | adapt | workflow:accessibility-doc | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | entity-inventory | adopt | workflow:entity-inventory | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | asset-spec | adopt | workflow:asset-spec | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | ux-design | adopt | workflow:ux-design | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | ux-review | adopt | workflow:ux-review | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | prototype | adapt | workflow:prototype | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | create-epics | adapt | workflow:create-epics | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | create-stories | adapt | workflow:create-stories | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | test-setup | adopt | workflow:test-setup | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | sprint-plan | adapt | workflow:sprint-plan | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | vertical-slice | adapt | workflow:vertical-slice | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | sprint-plan | adapt | workflow:sprint-plan | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | story-readiness | adapt | workflow:story-readiness | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | implement | adopt | workflow:implement | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | code-review | adopt | workflow:code-review | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | story-done | adapt | workflow:story-done | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | qa-plan | adapt | workflow:qa-plan | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | bug-report | adopt | workflow:bug-report | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | retrospective | adopt | workflow:retrospective | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | team-feature | adopt | workflow:team-feature | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | scope-check | adopt | workflow:scope-check | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | sprint-status | adapt | workflow:sprint-status | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | perf-profile | adapt | workflow:perf-profile | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | balance-check | adopt | workflow:balance-check | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | asset-audit | adopt | workflow:asset-audit | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | playtest-polish | adopt | workflow:playtest-polish | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | team-polish | adopt | workflow:team-polish | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | release-checklist | adapt | workflow:release-checklist | implemented | Workflow exists; add CCGS-style phase/artifact semantics where useful. |
| workflow-step | patch-notes | adopt | workflow:patch-notes | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | changelog | adopt | workflow:changelog | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| workflow-step | launch-checklist | adopt | workflow:launch-checklist | todo | CCGS catalog step is missing and should be represented in the CGS phase catalog or as a workflow alias. |
| template | accessibility-requirements | adapt | template:accessibility-requirements | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | architecture-decision-record | adopt | template:architecture-decision-record | todo | CCGS template has no CGS equivalent yet. |
| template | architecture-doc-from-code | adopt | template:architecture-doc-from-code | todo | CCGS template has no CGS equivalent yet. |
| template | architecture-traceability | adapt | template:architecture-traceability | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | art-bible | adapt | template:art-bible | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | changelog-template | adopt | template:changelog-template | todo | CCGS template has no CGS equivalent yet. |
| template | design-agent-protocol | adopt | template:design-agent-protocol | todo | CCGS template has no CGS equivalent yet. |
| template | implementation-agent-protocol | adopt | template:implementation-agent-protocol | todo | CCGS template has no CGS equivalent yet. |
| template | leadership-agent-protocol | adopt | template:leadership-agent-protocol | todo | CCGS template has no CGS equivalent yet. |
| template | concept-doc-from-prototype | adopt | template:concept-doc-from-prototype | todo | CCGS template has no CGS equivalent yet. |
| template | design-doc-from-implementation | adopt | template:design-doc-from-implementation | todo | CCGS template has no CGS equivalent yet. |
| template | difficulty-curve | adapt | template:difficulty-curve | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | economy-model | adapt | template:economy-model | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | faction-design | adopt | template:faction-design | todo | CCGS template has no CGS equivalent yet. |
| template | game-concept | adopt | template:game-concept | todo | CCGS template has no CGS equivalent yet. |
| template | game-design-document | adopt | template:game-design-document | todo | CCGS template has no CGS equivalent yet. |
| template | game-pillars | adopt | template:game-pillars | todo | CCGS template has no CGS equivalent yet. |
| template | hud-design | adopt | template:hud-design | todo | CCGS template has no CGS equivalent yet. |
| template | incident-response | adopt | template:incident-response | todo | CCGS template has no CGS equivalent yet. |
| template | interaction-pattern-library | adopt | template:interaction-pattern-library | todo | CCGS template has no CGS equivalent yet. |
| template | level-design-document | adopt | template:level-design-document | todo | CCGS template has no CGS equivalent yet. |
| template | milestone-definition | adopt | template:milestone-definition | todo | CCGS template has no CGS equivalent yet. |
| template | narrative-character-sheet | adopt | template:narrative-character-sheet | todo | CCGS template has no CGS equivalent yet. |
| template | pitch-document | adapt | template:pitch-document | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | player-journey | adapt | template:player-journey | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | post-mortem | adopt | template:post-mortem | todo | CCGS template has no CGS equivalent yet. |
| template | project-stage-report | adopt | template:project-stage-report | todo | CCGS template has no CGS equivalent yet. |
| template | prototype-report | adopt | template:prototype-report | todo | CCGS template has no CGS equivalent yet. |
| template | release-checklist-template | adopt | template:release-checklist-template | todo | CCGS template has no CGS equivalent yet. |
| template | release-notes | adapt | template:release-notes | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | risk-register-entry | adopt | template:risk-register-entry | todo | CCGS template has no CGS equivalent yet. |
| template | skill-test-spec | adopt | template:skill-test-spec | todo | CCGS template has no CGS equivalent yet. |
| template | sound-bible | adapt | template:sound-bible | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | sprint-plan | adapt | template:sprint-plan | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | systems-index | adopt | template:systems-index | todo | CCGS template has no CGS equivalent yet. |
| template | technical-design-document | adopt | template:technical-design-document | todo | CCGS template has no CGS equivalent yet. |
| template | test-evidence | adapt | template:test-evidence | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | test-plan | adapt | template:test-plan | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | ux-spec | adapt | template:ux-spec | implemented | Template equivalent exists; compare body quality and update if thinner. |
| template | vertical-slice-report | adapt | template:vertical-slice-report | implemented | Template equivalent exists; compare body quality and update if thinner. |
| rule | ai-code | adapt | rule:ai-code | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | data-files | adapt | rule:data-files | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | design-docs | adapt | rule:design-docs | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | engine-code | adapt | rule:engine-code | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | gameplay-code | adapt | rule:gameplay-code | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | narrative | adapt | rule:narrative | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | network-code | adapt | rule:network-code | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | prototype-code | adapt | rule:prototype-code | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | shader-code | adapt | rule:shader-code | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | test-standards | adapt | rule:test-standards | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
| rule | ui-code | adapt | rule:ui-code | todo | CCGS coding rule intent should become skills, AGENTS guidance, or selected context, not `.codex/rules/*.rules`. |
