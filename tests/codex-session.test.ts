import { describe, expect, test } from "vitest";
import { createCodexStudioSession, validateCodexStudioSession } from "../src/codex-session.js";

describe("Codex studio sessions", () => {
  test("constructs default sandbox settings by phase", () => {
    const plan = createCodexStudioSession({
      projectRoot: "/repo/projects/game",
      role: "producer",
      objective: "Plan the milestone",
      phase: "plan"
    });
    expect(plan.allowFileEdits).toBe(false);
    expect(plan.sandbox).toBe("read-only");
    expect(plan.contextFiles).toEqual(["AGENTS.md", ".codex/studio.json"]);

    const impl = createCodexStudioSession({
      projectRoot: "/repo/projects/game",
      role: "gameplay-programmer",
      objective: "Implement movement",
      phase: "implement"
    });
    expect(impl.allowFileEdits).toBe(true);
    expect(impl.sandbox).toBe("danger-full-access");
  });

  test("rejects invalid sessions and writable sandbox without file edits", () => {
    expect(() =>
      validateCodexStudioSession({
        projectRoot: "",
        role: "producer",
        objective: "x",
        phase: "plan",
        contextFiles: [],
        expectedOutputs: [],
        allowFileEdits: false,
        sandbox: "read-only"
      })
    ).toThrow(/project root/i);

    expect(() =>
      createCodexStudioSession({
        projectRoot: "/repo",
        role: "producer",
        objective: "x",
        phase: "review",
        sandbox: "workspace-write",
        allowFileEdits: false
      })
    ).toThrow(/writable sandbox/i);
  });
});
