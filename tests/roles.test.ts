import { describe, test } from "node:test";
import { expect } from "expect";
import { isStudioRoleId, rolePackages, studioRoleIds, unknownStudioRoleMessage } from "../src/roles.js";

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
      "unity-specialist",
      "unreal-specialist",
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
