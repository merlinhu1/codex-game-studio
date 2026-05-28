import { describe, expect, test } from "vitest";
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
      "game-feel-designer",
      "gameplay-programmer",
      "engine-programmer",
      "tools-programmer",
      "senior-game-artist",
      "technical-artist",
      "ui-ux-designer",
      "qa-playtester",
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

  test("legacy underscore aliases are rejected with guidance", () => {
    for (const alias of ["producer_agent", "qa_agent", "master_orchestrator"]) {
      expect(isStudioRoleId(alias)).toBe(false);
      expect(unknownStudioRoleMessage(alias)).toContain("Codex-native hyphenated role IDs");
    }
  });
});
