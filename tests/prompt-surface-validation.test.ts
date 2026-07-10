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
  writeFileSync(path.join(root, ".codex", "agents", "producer.toml"), `name = "producer"\ndescription = "Producer"\nmodel = "gpt-5.6-sol"\nmodel_reasoning_effort = "high"\n# source_reference = ".claude/agents/producer.md"\n# source_hash = "${"a".repeat(64)}"\n# primary_skills = ["cgs-bugfix"]\n# allowed_tool_categories = ["read", "edit", "shell"]\ndeveloper_instructions = """\n## Stop Conditions\n\nStop.\n## Use When\n\nUse.\n## Do Not Use When\n\nDo not.\n## Procedure\n\n1. Do work.\n## Handoff Contract\n\nReport evidence.\n"""\n`);
  const skillBody = (name: string, model: string, effort: string, hash: string) => `---\nname: ${name}\ndescription: ${name}\nmodel: ${model}\nmodel_reasoning_effort: ${effort}\nargument-hint: describe target\nprimary-agent: producer\ntool-policy: read/edit/shell\nisolation: repository-root\nsource-reference: local\nsource-hash: ${hash}\n---\n\n# ${name}\n\n## Objective\n\nObjective.\n## Inputs\n\nInputs.\n## Arguments\n\nArgs.\n## Procedure\n\nProcedure.\n## Output Contract\n\nOutput.\n## Quality Gates\n\nQuality.\n## Decision Gates\n\nGates.\n## Handoff\n\nHandoff.\n`;
  writeFileSync(path.join(root, ".agents", "skills", "cgs-bugfix", "SKILL.md"), skillBody("cgs-bugfix", "gpt-5.6-terra", "medium", "b".repeat(64)));
  writeFileSync(path.join(root, ".agents", "skills", "cgs-standards-gameplay", "SKILL.md"), skillBody("cgs-standards-gameplay", "gpt-5.6-luna", "low", "c".repeat(64)));
  writeFileSync(path.join(root, ".codex", "workflows", "bugfix.md"), `---\nmodel: gpt-5.6-terra\nmodel_reasoning_effort: medium\nprimary-agent: producer\nlinked-skills: [cgs-bugfix]\nphase: implement\nrisk: medium\nargument-hint: describe bug\nsource-reference: .codex/workflows/bugfix.md\nsource-hash: ${"d".repeat(64)}\n---\n\n# Bugfix\n\n## Purpose\n\nPurpose.\n## Inputs\n\nInputs.\n## Phase Gates\n\nGates.\n## Required Artifacts\n\nArtifacts.\n## Context Contract\n\nContext.\n## Output Contract\n\nOutput.\n## Stop Conditions\n\nStop.\n## Handoff\n\nHandoff.\n`);
  return root;
}

describe("prompt surface validation", () => {
  test("fails exact metadata regressions with stable diagnostics", () => {
    const root = makeRoot();
    writeFileSync(path.join(root, ".codex", "agents", "bad.toml"), `name = "bad"\ndescription = "Bad"\nmodel = "sonnet"\nmodel_reasoning_effort = "high"\n# source_reference = "local"\n# primary_skills = ["missing-skill"]\n# allowed_tool_categories = ["read"]\ndeveloper_instructions = """thin"""\n`);
    const failures = validateTemplateSurfaces(root).filter((check) => check.status === "fail").map((check) => check.id);
    expect(failures).toEqual(expect.arrayContaining(["prompt_surface.agent.bad.model", "prompt_surface.agent.bad.traceability", "prompt_surface.agent.bad.links", "prompt_surface.agent.bad.depth"]));
  });

  test("rejects prompt surfaces whose model and reasoning effort drift", () => {
    const root = makeRoot();
    const workflow = path.join(root, ".codex", "workflows", "bugfix.md");
    writeFileSync(workflow, readFileSync(workflow, "utf8").replace("model: gpt-5.6-terra", "model: gpt-5.6-sol"));

    const failures = validateTemplateSurfaces(root).filter((check) => check.status === "fail").map((check) => check.id);

    expect(failures).toContain("prompt_surface.workflow.bugfix.model");
  });

  test("skill validation rejects duplicated generic adapter sections", () => {
    const root = makeRoot();
    const skill = path.join(root, ".agents", "skills", "cgs-bugfix", "SKILL.md");
    writeFileSync(skill, `${readFileSync(skill, "utf8")}\n## Phased Procedure\n\nDuplicated generic boilerplate.\n`);

    const failures = validateTemplateSurfaces(root).filter((check) => check.status === "fail").map((check) => check.id);

    expect(failures).toContain("prompt_surface.skill.cgs-bugfix.concise");
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
