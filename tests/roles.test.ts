import { describe, test } from "node:test";
import { expect } from "expect";
import { engineForRole, engineRoleIdsForEngine, engineRoleSets, isRoleAvailableForEngine, isStudioRoleId, rolePackages, studioRoleIds, unknownStudioRoleMessage } from "../src/roles.js";

describe("Codex role packages", () => {
  test("defines all canonical StudioRoleId packages", () => {
    expect(studioRoleIds).toEqual([
      "studio-orchestrator",
      "producer",
      "market-analyst",
      "data-scientist",
      "creative-director",
      "senior-game-designer",
      "game-designer",
      "narrative-designer",
      "writer",
      "world-builder",
      "level-designer",
      "game-feel-designer",
      "systems-designer",
      "economy-designer",
      "gameplay-programmer",
      "ai-programmer",
      "network-programmer",
      "ui-programmer",
      "engine-programmer",
      "godot-specialist",
      "godot-gdscript-specialist",
      "godot-csharp-specialist",
      "godot-shader-specialist",
      "godot-gdextension-specialist",
      "unity-specialist",
      "unity-dots-specialist",
      "unity-shader-specialist",
      "unity-addressables-specialist",
      "unity-ui-specialist",
      "unreal-specialist",
      "ue-gas-specialist",
      "ue-blueprint-specialist",
      "ue-replication-specialist",
      "ue-umg-specialist",
      "tools-programmer",
      "technical-director",
      "devops-engineer",
      "security-engineer",
      "performance-analyst",
      "senior-game-artist",
      "technical-artist",
      "audio-director",
      "sound-designer",
      "ui-ux-designer",
      "accessibility-specialist",
      "qa-playtester",
      "localization-lead",
      "live-ops-designer",
      "community-manager",
      "release-manager"
    ]);
    expect(Object.keys(rolePackages).sort()).toEqual([...studioRoleIds].sort());
  });

  test("role packages have non-empty Codex contracts", () => {
    for (const role of Object.values(rolePackages)) {
      expect(role.displayName).toMatch(/\S/);
      expect(role.systemPrompt).toMatch(/\S/);
      expect(role.expectedOutputs.length).toBeGreaterThan(0);
      expect(role.handoffTemplate).toMatch(/\S/);
      expect(role.reviewChecklist.length).toBeGreaterThan(0);
    }
  });


  test("role packages cover bounded specialist domain clusters", () => {
    const clusters = {
      audio: ["audio-director", "sound-designer"],
      content: ["writer", "world-builder", "level-designer"],
      systems: ["systems-designer", "economy-designer"],
      operations: ["live-ops-designer", "community-manager", "localization-lead", "accessibility-specialist"],
      technical: ["technical-director", "devops-engineer", "security-engineer", "performance-analyst", "network-programmer", "ai-programmer", "ui-programmer"]
    } as const;

    for (const roles of Object.values(clusters)) {
      for (const role of roles) {
        expect(studioRoleIds).toContain(role);
        expect(rolePackages[role].expectedOutputs.length).toBeGreaterThanOrEqual(2);
        expect(rolePackages[role].reviewChecklist.length).toBeGreaterThanOrEqual(2);
      }
    }

    expect(rolePackages["audio-director"].systemPrompt).toContain("audio");
    expect(rolePackages["network-programmer"].systemPrompt).toContain("network");
    expect(rolePackages["accessibility-specialist"].systemPrompt).toContain("accessibility");
  });

  test("engine sub-specialists are first-class engine-scoped role packages", () => {
    expect(engineRoleSets).toEqual({
      godot: ["godot-specialist", "godot-gdscript-specialist", "godot-csharp-specialist", "godot-shader-specialist", "godot-gdextension-specialist"],
      unity: ["unity-specialist", "unity-dots-specialist", "unity-shader-specialist", "unity-addressables-specialist", "unity-ui-specialist"],
      unreal: ["unreal-specialist", "ue-gas-specialist", "ue-blueprint-specialist", "ue-replication-specialist", "ue-umg-specialist"]
    });
    const roleTerms = {
      "godot-gdscript-specialist": ["GDScript", "static typing", "signals"],
      "godot-csharp-specialist": ["C#", ".NET", "Signal"],
      "godot-shader-specialist": ["shader", "rendering", "VFX"],
      "godot-gdextension-specialist": ["GDExtension", "native", "bindings"],
      "unity-dots-specialist": ["DOTS", "ECS", "Burst"],
      "unity-shader-specialist": ["shader", "VFX", "rendering"],
      "unity-addressables-specialist": ["Addressables", "asset", "memory"],
      "unity-ui-specialist": ["UI Toolkit", "UGUI", "input"],
      "ue-gas-specialist": ["Gameplay Ability System", "attributes", "prediction"],
      "ue-blueprint-specialist": ["Blueprint", "C++", "graph"],
      "ue-replication-specialist": ["replication", "RPC", "bandwidth"],
      "ue-umg-specialist": ["UMG", "CommonUI", "widget"]
    } as const;
    for (const [roleId, terms] of Object.entries(roleTerms)) {
      expect(studioRoleIds).toContain(roleId);
      const role = rolePackages[roleId as keyof typeof roleTerms];
      const contractText = [role.systemPrompt, ...role.responsibilities, ...(role.outputSchema ?? []), ...role.qualityGates, ...role.collaborationNotes, ...role.stopConditions, role.handoffTemplate].join("\n");
      expect(role.responsibilities.length).toBeGreaterThanOrEqual(3);
      expect(role.outputSchema?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(role.qualityGates.length).toBeGreaterThanOrEqual(3);
      expect(role.collaborationNotes.length).toBeGreaterThanOrEqual(2);
      expect(role.stopConditions.length).toBeGreaterThanOrEqual(1);
      expect(role.handoffTemplate).toContain(role.displayName);
      for (const term of terms) expect(contractText).toContain(term);
    }
  });

  test("engine role helpers expose selected-engine role sets and wrong-engine availability", () => {
    expect(engineRoleIdsForEngine("godot")).toEqual(engineRoleSets.godot);
    expect(engineForRole("godot-gdscript-specialist")).toBe("godot");
    expect(engineForRole("unity-dots-specialist")).toBe("unity");
    expect(engineForRole("ue-gas-specialist")).toBe("unreal");
    expect(engineForRole("gameplay-programmer")).toBeUndefined();
    expect(isRoleAvailableForEngine("godot-gdscript-specialist", "godot")).toBe(true);
    expect(isRoleAvailableForEngine("unity-dots-specialist", "godot")).toBe(false);
    expect(isRoleAvailableForEngine("gameplay-programmer", "godot")).toBe(true);
  });



  test("accessibility specialist exposes CCGS-depth accessibility contract", () => {
    const role = rolePackages["accessibility-specialist"];
    const contractText = [
      ...role.responsibilities,
      ...role.inputsToInspect,
      ...(role.outputSchema ?? []),
      ...role.qualityGates,
      ...role.collaborationNotes,
      ...role.stopConditions,
      role.handoffTemplate
    ].join("\n");

    expect(role.outputSchema).toEqual(expect.arrayContaining(["Finding", "WCAG criterion", "Severity", "Recommendation", "Verification steps", "Owner handoff"]));
    for (const phrase of ["WCAG", "contrast", "colorblind", "subtitle", "input remapping", "motor", "cognitive", "structured findings"]) {
      expect(contractText).toContain(phrase);
    }
    expect(contractText).toMatch(/UI Programmer|ui-programmer/);
    expect(contractText).toMatch(/Audio Director|audio-director|Sound Designer|sound-designer/);
    expect(contractText).toMatch(/QA Playtester|qa-playtester/);
    expect(contractText).toMatch(/Localization Lead|localization-lead/);
    expect(contractText).toMatch(/Producer|producer/);
  });

  test("remaining direct CCGS role gaps expose upgraded role contracts", () => {
    const directRoleGapIds = [
      "ai-programmer",
      "audio-director",
      "community-manager",
      "devops-engineer",
      "economy-designer",
      "engine-programmer",
      "godot-specialist",
      "level-designer",
      "live-ops-designer",
      "localization-lead",
      "network-programmer",
      "security-engineer",
      "sound-designer",
      "technical-artist",
      "tools-programmer",
      "ui-programmer",
      "unity-specialist",
      "unreal-specialist",
      "world-builder",
      "writer"
    ] as const;

    for (const roleId of directRoleGapIds) {
      const role = rolePackages[roleId];
      const contractText = [
        ...role.responsibilities,
        ...role.inputsToInspect,
        ...(role.outputSchema ?? []),
        ...role.qualityGates,
        ...role.collaborationNotes,
        ...role.stopConditions,
        role.handoffTemplate
      ].join("\n");

      expect(role.responsibilities.length).toBeGreaterThanOrEqual(3);
      expect(role.outputSchema?.length ?? 0).toBeGreaterThanOrEqual(4);
      expect(role.qualityGates.length).toBeGreaterThanOrEqual(3);
      expect(role.collaborationNotes.length).toBeGreaterThanOrEqual(2);
      expect(role.stopConditions.length).toBeGreaterThanOrEqual(1);
      expect(role.handoffTemplate).toContain(role.displayName);
      expect(contractText).toContain("verification");
      expect(contractText).toContain("handoff");
    }
  });

  test("role packages expose structured compact role contracts", () => {
    for (const role of Object.values(rolePackages)) {
      expect(role.responsibilities.length).toBeGreaterThanOrEqual(2);
      expect(role.inputsToInspect.length).toBeGreaterThanOrEqual(2);
      expect(role.qualityGates.length).toBeGreaterThanOrEqual(2);
      expect(role.stopConditions.length).toBeGreaterThanOrEqual(1);
      expect(role.sharedFragments).toBeDefined();
      expect(new Set(role.sharedFragments).size).toBe(role.sharedFragments.length);
    }

    expect(rolePackages["gameplay-programmer"].outputSchema).toEqual(
      expect.arrayContaining(["Changed files", "Implementation notes", "Verification evidence", "Risks or follow-ups"])
    );
    expect(rolePackages["qa-playtester"].outputSchema).toEqual(
      expect.arrayContaining(["Issue ID", "Severity", "Reproduction steps", "Expected result", "Actual result", "Evidence"])
    );
    expect(rolePackages["release-manager"].outputSchema).toEqual(
      expect.arrayContaining(["Release decision", "Blocking issues", "Warnings", "Validation evidence", "Rollback notes"])
    );
  });

  test("legacy underscore aliases are rejected with guidance", () => {
    for (const alias of ["producer_agent", "qa_agent", "master_orchestrator"]) {
      expect(isStudioRoleId(alias)).toBe(false);
      expect(unknownStudioRoleMessage(alias)).toContain("Codex-native hyphenated role IDs");
    }
  });
});
