import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { validateTemplateSurfaces } from "../src/validation.js";

function makeRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "ogs-prompt-surface-"));
  mkdirSync(path.join(root, ".codex", "agents"), { recursive: true });
  mkdirSync(path.join(root, ".codex", "workflows"), { recursive: true });
  mkdirSync(path.join(root, ".agents", "skills", "cgs-bugfix"), { recursive: true });
  mkdirSync(path.join(root, ".agents", "skills", "cgs-standards-gameplay"), { recursive: true });
  writeFileSync(path.join(root, "AGENTS.md"), "# Template\n\n.codex/agents game template guidance.\n");
  writeFileSync(path.join(root, ".codex", "agents", "producer.toml"), `name = "producer"\ndescription = "Producer"\nmodel = "gpt-5.5"\nmodel_reasoning_effort = "high"\nsource_reference = ".claude/agents/producer.md"\nsource_hash = "${"a".repeat(64)}"\nprimary_skills = ["cgs-bugfix"]\nallowed_tool_categories = ["read", "edit", "shell"]\ndeveloper_instructions = """\n## Stop Conditions\n\nStop.\n## Use When\n\nUse.\n## Do Not Use When\n\nDo not.\n## Procedure\n\n1. Do work.\n## Handoff Contract\n\nReport evidence.\n"""\n`);
  const skillBody = (name: string, model: string, effort: string, hash: string) => `---\nname: ${name}\ndescription: ${name}\nmodel: ${model}\nmodel_reasoning_effort: ${effort}\nargument-hint: describe target\nprimary-agent: producer\ntool-policy: read/edit/shell\nisolation: repository-root\nsource-reference: local\nsource-hash: ${hash}\n---\n\n# ${name}\n\n## Purpose\n\nPurpose.\n## Prerequisites\n\nPrereq.\n## Arguments\n\nArgs.\n## Phased Procedure\n\nProcedure.\n## Decision Gates\n\nGates.\n## Output Contract\n\nOutput.\n## Quality Gates\n\nQuality.\n## Failure Modes\n\nFailures.\n## Verification\n\nVerify.\n## Handoff\n\nHandoff.\n`;
  writeFileSync(path.join(root, ".agents", "skills", "cgs-bugfix", "SKILL.md"), skillBody("cgs-bugfix", "gpt-5.4", "medium", "b".repeat(64)));
  writeFileSync(path.join(root, ".agents", "skills", "cgs-standards-gameplay", "SKILL.md"), skillBody("cgs-standards-gameplay", "gpt-5.4-mini", "low", "c".repeat(64)));
  writeFileSync(path.join(root, ".codex", "workflows", "bugfix.md"), `---\nmodel: gpt-5.4\nmodel_reasoning_effort: medium\nprimary-agent: producer\nlinked-skills: [cgs-bugfix]\nphase: implement\nrisk: medium\nargument-hint: describe bug\nsource-reference: .codex/workflows/bugfix.md\nsource-hash: ${"d".repeat(64)}\n---\n\n# Bugfix\n\n## Purpose\n\nPurpose.\n## Inputs\n\nInputs.\n## Phase Gates\n\nGates.\n## Required Artifacts\n\nArtifacts.\n## Context Contract\n\nContext.\n## Output Contract\n\nOutput.\n## Stop Conditions\n\nStop.\n## Handoff\n\nHandoff.\n`);
  return root;
}

describe("prompt surface validation", () => {
  test("fails exact metadata regressions with stable diagnostics", () => {
    const root = makeRoot();
    writeFileSync(path.join(root, ".codex", "agents", "bad.toml"), `name = "bad"\ndescription = "Bad"\nmodel = "sonnet"\nmodel_reasoning_effort = "medium"\nsource_reference = "local"\nprimary_skills = ["missing-skill"]\nallowed_tool_categories = ["read"]\ndeveloper_instructions = """thin"""\n`);
    const failures = validateTemplateSurfaces(root).filter((check) => check.status === "fail").map((check) => check.id);
    expect(failures).toEqual(expect.arrayContaining(["prompt_surface.agent.bad.model", "prompt_surface.agent.bad.traceability", "prompt_surface.agent.bad.links", "prompt_surface.agent.bad.depth"]));
  });

  test("optional OpenAI skill UI metadata paths resolve", () => {
    for (const skill of ["cgs-prototype", "cgs-vertical-slice", "cgs-bugfix", "cgs-release-checklist", "cgs-help"]) {
      const file = path.join(process.cwd(), ".agents", "skills", skill, "agents", "openai.yaml");
      expect(existsSync(file)).toBe(true);
      const body = readFileSync(file, "utf8");
      expect(body).toContain("display_name:");
      expect(body).toContain("default_prompt:");
      expect(body).toContain("invocation_policy:");
      expect(body).toContain("dependencies:");
    }
  });
});
