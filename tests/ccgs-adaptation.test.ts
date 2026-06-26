import { describe, expect, test } from "vitest";
import { ccgsInventory, ccgsRoleAdaptations, ccgsSkillAdaptations, validateCcgsAdaptation } from "../src/ccgs-adaptation.js";
import { studioRoleIds } from "../src/roles.js";

describe("curated CCGS adaptation registry", () => {
  test("documents a pinned reviewed source without claiming clone parity", () => {
    expect(ccgsInventory.source).toContain("Claude-Code-Game-Studios");
    expect(ccgsInventory.reviewedAt).toBe("2026-06-25");
    expect(ccgsInventory.policy).toMatch(/Curated reference/i);
  });

  test("maps CCGS roles without reintroducing legacy underscore ids", () => {
    expect(ccgsRoleAdaptations.length).toBeGreaterThanOrEqual(49);
    for (const legacy of ["producer_agent", "qa_agent", "master_orchestrator"]) {
      expect(studioRoleIds).not.toContain(legacy as never);
    }
    expect(ccgsRoleAdaptations.find((item) => item.sourceId === "lead-programmer")?.decision).toBe("built-in-add-candidate");
    expect(ccgsRoleAdaptations.find((item) => item.sourceId === "godot-gdscript-specialist")?.decision).toBe("specialty-context");
  });

  test("maps team skills to recipes and skill-maintenance surfaces out of scope", () => {
    expect(ccgsSkillAdaptations.find((item) => item.sourceId === "team-ui")?.decision).toBe("recipe");
    expect(ccgsSkillAdaptations.find((item) => item.sourceId === "skill-test")?.decision).toBe("out-of-scope");
    expect(validateCcgsAdaptation()).toEqual([]);
  });
});
