import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { agentNames, activeAgentsForMode, guidanceConfigHash, readProjectConfig } from "./config.js";
import { validateBaseAgents } from "./agents.js";
import { loadEngineConfigs, normalizeEngine, sourceRoot } from "./engines.js";
import { packageAssetPath } from "./paths.js";
import { expectedEngineProjectFile, resumeProject, statusProject } from "./projects.js";
import { templateRegistry, validateTemplateFiles } from "./templates.js";

export type CheckStatus = "pass" | "fail" | "skip";
export type ValidationCheck = { id: string; status: CheckStatus; message: string; path?: string };

function pass(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "pass", message, path: file };
}

function fail(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "fail", message, path: file };
}

function sectionHasContent(body: string, section: string): boolean {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped}\\s*$`, "m").exec(body);
  if (!match) return false;
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const nextHeading = rest.search(/^#/m);
  const content = nextHeading === -1 ? rest : rest.slice(0, nextHeading);
  return content.trim().length > 0;
}

const requiredAgentSections = ["# Role", "# Inputs", "# Outputs", "# Validation", "# Engine Notes", "# Rules"];

export async function validateRepo(root = process.cwd()): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = [];
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    scripts?: Record<string, string>;
    bin?: Record<string, string>;
    files?: string[];
    engines?: { node?: string };
  };
  const scripts = pkg.scripts ?? {};
  for (const script of ["init", "manage", "test", "validate", "templates"]) {
    checks.push(scripts[script] ? pass(`package.script.${script}`, `script ${script} exists`) : fail(`package.script.${script}`, `missing script ${script}`, pkgPath));
  }
  checks.push(scripts.build === "tsc -p tsconfig.build.json" ? pass("package.build", "build uses tsconfig.build.json") : fail("package.build", "build must use tsconfig.build.json", pkgPath));
  checks.push(pkg.bin?.["open-gamestudio"] === "./dist/cli.js" ? pass("package.bin", "bin points to dist/cli.js") : fail("package.bin", "bin must point to ./dist/cli.js", pkgPath));
  checks.push(pkg.engines?.node?.includes(">=20") ? pass("package.node", "node floor declared") : fail("package.node", "node >=20 must be declared", pkgPath));
  for (const file of ["dist/", "engine_configs/", "agents/base/", "templates/"]) {
    checks.push(pkg.files?.includes(file) ? pass(`package.files.${file}`, `${file} shipped`) : fail(`package.files.${file}`, `${file} missing from package files`, pkgPath));
  }
  for (const file of ["src/cli.ts", "src/paths.ts", "src/config.ts", "src/engines.ts", "src/templates.ts", "src/agents.ts", "src/projects.ts", "src/runner.ts", "src/validation.ts"]) {
    checks.push(existsSync(path.join(root, file)) ? pass(`source.${file}`, `${file} exists`) : fail(`source.${file}`, `${file} missing`, file));
  }
  const tsFiles = ["cli", "config", "engines", "templates", "agents", "projects", "runner", "validation", "paths"].map((f) => path.join(root, "src", `${f}.ts`));
  for (const file of tsFiles.filter(existsSync)) {
    const body = readFileSync(file, "utf8");
    const bad = body.match(/from "\.\/(?!.*\.js")/);
    if (bad) checks.push(fail("typescript.imports", `relative import missing .js in ${file}`, file));
  }
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  for (const value of ["Godot", "Unity", "Unreal", "Unreal Engine", "ue5"]) {
    try {
      normalizeEngine(value, engines);
      checks.push(pass(`engine.alias.${value}`, `${value} normalizes`));
    } catch (error) {
      checks.push(fail(`engine.alias.${value}`, (error as Error).message));
    }
  }
  checks.push(...validateBaseAgents().map((message) => fail("agents.base", message)));
  if (validateBaseAgents().length === 0) checks.push(pass("agents.base", "all 12 base agents exist"));
  const templateFailures = validateTemplateFiles();
  checks.push(...templateFailures.map((message) => fail("templates", message)));
  if (templateFailures.length === 0 && Object.keys(templateRegistry).length === 7) checks.push(pass("templates", "all templates exist"));
  checks.push(existsSync(path.join(root, "dist", "cli.js")) ? pass("build.output", "dist/cli.js exists") : fail("build.output", "dist/cli.js missing; run npm run build", path.join(root, "dist", "cli.js")));
  if (existsSync(path.join(root, "dist", "cli.js"))) {
    try {
      const packRaw = execFileSync("npm", ["pack", "--json"], { cwd: root, encoding: "utf8" });
      const packInfo = JSON.parse(packRaw)[0] as { filename: string; files: { path: string }[] };
      const packed = new Set(packInfo.files.map((file) => file.path));
      for (const need of ["dist/cli.js", "engine_configs/godot.json", "engine_configs/unity.json", "engine_configs/unreal.json", "templates/gdd_template.md", "agents/base/master_orchestrator.md"]) {
        checks.push(packed.has(need) ? pass(`pack.${need}`, `${need} packed`) : fail(`pack.${need}`, `${need} missing from npm pack`));
      }
      const temp = mkdtempSync(path.join(tmpdir(), "open-gamestudio-pack-"));
      try {
        execFileSync("npm", ["install", "--silent", "--prefix", temp, path.join(root, packInfo.filename)], { cwd: root, encoding: "utf8" });
        execFileSync("npm", ["exec", "--prefix", temp, "open-gamestudio", "--", "templates", "list"], { cwd: temp, encoding: "utf8" });
        checks.push(pass("pack.install_smoke", "installed package bin loads templates from temp cwd"));
      } finally {
        rmSync(temp, { recursive: true, force: true });
        unlinkSync(path.join(root, packInfo.filename));
      }
    } catch (error) {
      checks.push(fail("pack.install_smoke", `package smoke failed: ${(error as Error).message}`));
    }
  }
  const help = readFileSync(path.join(root, "src", "cli.ts"), "utf8");
  checks.push(help.includes('.option("--exec"') ? pass("codex.exec", "direct codex exec option exposed") : fail("codex.exec", "run command must expose --exec for direct Codex integration"));
  for (const forbidden of ["next", "telemetry", "parallel orchestration", "ownership enforcement"]) {
    checks.push(!help.includes(`command("${forbidden}`) && !help.includes(`option("${forbidden}`) ? pass(`future.absent.${forbidden}`, `${forbidden} not exposed`) : fail(`future.absent.${forbidden}`, `${forbidden} must not be exposed`));
  }
  return checks;
}

export function validateProject(projectRoot: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const configPath = path.join(projectRoot, "project-config.json");
  let config;
  try {
    config = readProjectConfig(configPath);
    checks.push(pass("project.config", "config schema-valid", configPath));
  } catch (error) {
    return [fail("project.config", `invalid project config: ${(error as Error).message}`, configPath)];
  }
  const expectedAgents = activeAgentsForMode(config.project.mode);
  checks.push(JSON.stringify(expectedAgents) === JSON.stringify(config.team.active_agents) ? pass("project.active_agents", "active agents match mode") : fail("project.active_agents", "active agents do not match mode", configPath));
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  const root = sourceRoot(projectRoot, config.project.slug);
  checks.push(existsSync(root) ? pass("project.source_root", "engine source root exists", root) : fail("project.source_root", "engine source root missing", root));
  const engineFile = expectedEngineProjectFile(projectRoot, config);
  checks.push(existsSync(engineFile) ? pass("project.engine_file", "engine project file exists", engineFile) : fail("project.engine_file", "engine project file missing", engineFile));
  if (config.project.engine === "unity") {
    const settings = path.join(root, "ProjectSettings", "ProjectSettings.asset");
    checks.push(existsSync(settings) ? pass("project.engine_settings", "Unity ProjectSettings marker exists", settings) : fail("project.engine_settings", "Unity ProjectSettings marker missing", settings));
  }
  for (const agent of config.team.active_agents) {
    const file = path.join(projectRoot, ".gamestudio", "agents", `${agent}.md`);
    if (!existsSync(file)) {
      checks.push(fail(`project.agent.${agent}`, `${agent} prompt missing`, file));
      continue;
    }
    const body = readFileSync(file, "utf8");
    const engine = engines[config.project.engine];
    const hasProjectContext =
      sectionHasContent(body, "# Project Context") &&
      body.includes(`- Name: ${config.project.name}`) &&
      body.includes(`- Engine: ${engine.display_name} ${config.project.engine_version}`) &&
      sectionHasContent(body, "# Engine Overlay");
    const missingSections = requiredAgentSections.filter((section) => !sectionHasContent(body, section));
    checks.push(
      hasProjectContext && missingSections.length === 0
        ? pass(`project.agent.${agent}`, `${agent} materialized`, file)
        : fail(`project.agent.${agent}`, `${agent} prompt missing project context or non-empty sections: ${missingSections.join(", ") || "project context"}`, file)
    );
  }
  const agentsMd = path.join(projectRoot, "AGENTS.md");
  if (existsSync(agentsMd)) {
    const body = readFileSync(agentsMd, "utf8");
    const hash = guidanceConfigHash(config);
    checks.push(body.includes("generated-by: open-gamestudio src/agents.ts") ? pass("project.agents_md.provenance", "AGENTS.md provenance ok", agentsMd) : fail("project.agents_md.provenance", "AGENTS.md provenance missing", agentsMd));
    checks.push(body.includes(`source-config-sha256: ${hash}`) ? pass("project.agents_md.hash", "AGENTS.md hash current", agentsMd) : fail("project.agents_md.hash", "AGENTS.md stale; regenerate project agents", agentsMd));
  } else {
    checks.push(fail("project.agents_md", "project AGENTS.md missing", agentsMd));
  }
  for (const file of ["resources/market-research/market-overview.md", "documentation/design/gdd.md", "documentation/production/timeline.md"]) {
    checks.push(existsSync(path.join(projectRoot, file)) ? pass(`project.artifact.${file}`, `${file} exists`) : fail(`project.artifact.${file}`, `${file} missing`, path.join(projectRoot, file)));
  }
  const timeline = path.join(projectRoot, "documentation", "production", "timeline.md");
  if (existsSync(timeline)) {
    const body = readFileSync(timeline, "utf8");
    for (const section of ["# Timeline", "# Milestones", "# Risks", "# Next Validation Gate"]) {
      checks.push(sectionHasContent(body, section) ? pass(`project.timeline.${section}`, `${section} exists`, timeline) : fail(`project.timeline.${section}`, `${section} missing non-empty content`, timeline));
    }
  }
  const before = JSON.stringify(readFileSync(configPath, "utf8"));
  statusProject(projectRoot, path.dirname(projectRoot));
  resumeProject(projectRoot, path.dirname(projectRoot));
  const after = JSON.stringify(readFileSync(configPath, "utf8"));
  checks.push(before === after ? pass("project.read_only", "status/resume are read-only") : fail("project.read_only", "status/resume mutated project", configPath));
  return checks;
}

export async function runValidation(options: { project?: string; root?: string } = {}): Promise<{ checks: ValidationCheck[]; failed: boolean }> {
  const root = options.root ?? process.cwd();
  const checks = options.project ? validateProject(path.resolve(root, options.project)) : await validateRepo(root);
  return { checks, failed: checks.some((check) => check.status === "fail") };
}
