import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { activeAgentsForProject } from "./config.js";
import { projectAgentsMdRequiredSections, projectRolePromptSourceInput, renderProjectRolePrompt, validateBaseAgents } from "./agents.js";
import { validateApprovalStore } from "./approvals.js";
import { runBehavioralEvaluations } from "./behavioral-evaluation.js";
import { checkCodexAvailability } from "./codex-runtime.js";
import { contextManifestInput, createContextManifest, type ContextManifest, type ContextManifestMeta } from "./context-manifest.js";
import { validateProjectCustomization } from "./customization.js";
import { createCodexStudioSession } from "./codex-session.js";
import { renderCodexPrompt } from "./codex-prompts.js";
import { loadEngineConfigs, sourceRoot, unrealProjectFileName } from "./engines.js";
import { engineReferenceRegistry, selectedEngineReferencePrompts, validateEngineReferencePacks } from "./engine-reference.js";
import { hashGeneratedBody, parseGeneratedSurfaceMetadataParts, stripGeneratedMetadata, stableHash } from "./generated-surfaces.js";
import { packageAssetPath } from "./paths.js";
import { readStudioProject, resumeProject, statusProject, workflowBody, workflowSourceInput, type StudioProjectState } from "./projects.js";
import { isEngineSpecialistRoleId, projectRoleIdsForEngine, rolePackages, studioRoleIds, type StudioRoleId } from "./roles.js";
import { templateRegistry, validateTemplateFiles } from "./templates.js";
import { renderWorkflowPrompt, workflowIds, workflowRegistry } from "./workflows.js";

export type CheckStatus = "pass" | "fail" | "skip";
export type ValidationCheck = { id: string; status: CheckStatus; message: string; path?: string };

function pass(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "pass", message, path: file };
}

function fail(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "fail", message, path: file };
}

function skip(id: string, message: string, file?: string): ValidationCheck {
  return { id, status: "skip", message, path: file };
}

function sectionHasContent(body: string, section: string): boolean {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`^${escaped}\\s*$`, "m").exec(body);
  if (!match) return false;
  const start = match.index + match[0].length;
  const rest = body.slice(start);
  const nextHeading = rest.search(/^#/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim().length > 0;
}

function configFromStudio(studio: StudioProjectState) {
  return {
    schema_version: "1.0" as const,
    project: {
      name: studio.name,
      slug: studio.slug,
      concept: studio.concept,
      genre: studio.genre,
      platform: studio.platform,
      audience: studio.audience,
      competitors: studio.competitors ?? [],
      monetization: studio.monetization ?? "undecided",
      timeline: studio.timeline ?? "TBD",
      engine: studio.engine,
      engine_version: studio.engineVersion,
      mode: studio.mode,
      studio_mode: studio.studioMode,
      phase: studio.phase,
      status: studio.status
    },
    team: { active_agents: studio.activeRoles },
    production: { milestones: [] }
  };
}

function generatedSurfaceChecks(args: { file: string; body: string; surface: string; id: string; target: { role?: string; id?: string }; sourceInput: unknown; expectedBody?: string }): ValidationCheck[] {
  const metadata = parseGeneratedSurfaceMetadataParts(args.body);
  if (!metadata.hasAnyMarker) {
    return [skip(args.id, "legacy generated surface lacks freshness metadata; regenerate before relying on freshness checks", args.file)];
  }
  const checks: ValidationCheck[] = [];
  const targetMatches =
    metadata.generated?.surface === args.surface && (!args.target.role || metadata.generated.role === args.target.role) && (!args.target.id || metadata.generated.id === args.target.id) && metadata.generated.schema === "1.0";
  const sourceHash = stableHash(args.sourceInput);
  checks.push(targetMatches && metadata.sourceInputSha256 === sourceHash ? pass(args.id, `${args.surface} source metadata is fresh`, args.file) : fail(args.id, `${args.surface} source metadata is stale`, args.file));
  const bodyId = args.id.replace(/\.freshness$/, ".body");
  const strippedBody = stripGeneratedMetadata(args.body);
  const bodyHash = hashGeneratedBody(strippedBody);
  const currentRendererBody = args.expectedBody ? stripGeneratedMetadata(args.expectedBody) === strippedBody : true;
  checks.push(metadata.renderedBodySha256 === bodyHash && currentRendererBody ? pass(bodyId, `${args.surface} body hash matches current renderer`, args.file) : fail(bodyId, `${args.surface} body hash mismatch`, args.file));
  return checks;
}

function parseJsonFile<T>(file: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(readFileSync(file, "utf8")) as T };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

function hashJsonBody(value: unknown): string {
  return createHash("sha256").update(`${JSON.stringify(value, null, 2)}\n`).digest("hex");
}

function contextManifestChecks(projectRoot: string, studio: StudioProjectState): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const manifestPath = path.join(projectRoot, ".codex", "context-manifest.json");
  const metaPath = path.join(projectRoot, ".codex", "context-manifest.meta.json");
  if (!existsSync(manifestPath)) return [fail("codex.project.context_manifest", "context manifest missing", manifestPath)];
  if (!existsSync(metaPath)) return [pass("codex.project.context_manifest", "context manifest exists", manifestPath), fail("codex.project.context_manifest.meta", "context manifest metadata missing", metaPath)];

  const manifestParsed = parseJsonFile<ContextManifest>(manifestPath);
  if (!manifestParsed.ok) return [fail("codex.project.context_manifest", `context manifest invalid JSON: ${manifestParsed.error}`, manifestPath)];
  const metaParsed = parseJsonFile<ContextManifestMeta>(metaPath);
  if (!metaParsed.ok) return [pass("codex.project.context_manifest", "context manifest JSON is valid", manifestPath), fail("codex.project.context_manifest.meta", `context manifest metadata invalid JSON: ${metaParsed.error}`, metaPath)];
  const manifest = manifestParsed.value;
  const meta = metaParsed.value;
  const entryStatuses = new Set(["selected", "missing", "omitted", "rejected"]);
  const entrySafeties = new Set(["safe", "unsafe", "secret", "generated", "binary"]);
  const schemaOk =
    manifest.schemaVersion === 1 &&
    manifest.product === "codex-game-studio" &&
    manifest.projectStage === studio.mode &&
    manifest.studioMode === studio.studioMode &&
    Array.isArray(manifest.entries) &&
    manifest.entries.every(
      (entry) =>
        typeof entry.sourcePath === "string" &&
        typeof entry.reason === "string" &&
        typeof entry.required === "boolean" &&
        entryStatuses.has(entry.status) &&
        entrySafeties.has(entry.safety) &&
        typeof entry.statusReason === "string" &&
        typeof entry.chars === "number"
    ) &&
    manifest.budget &&
    typeof manifest.budget.maxFiles === "number" &&
    typeof manifest.budget.maxChars === "number" &&
    typeof manifest.budget.maxEntryChars === "number";
  checks.push(schemaOk ? pass("codex.project.context_manifest", "context manifest schema-readable", manifestPath) : fail("codex.project.context_manifest", "context manifest schema invalid", manifestPath));

  const expected = createContextManifest(projectRoot, studio);
  const freshnessOk =
    meta.schemaVersion === 1 &&
    meta.product === "codex-game-studio" &&
    meta.projectStage === studio.mode &&
    meta.studioMode === studio.studioMode &&
    meta.manifestSha256 === hashJsonBody(manifest) &&
    meta.inputsSha256 === stableHash(contextManifestInput(studio)) &&
    JSON.stringify(manifest) === JSON.stringify(expected.manifest);
  checks.push(freshnessOk ? pass("codex.project.context_manifest.freshness", "context manifest freshness metadata is current", metaPath) : fail("codex.project.context_manifest.freshness", "context manifest freshness metadata is stale", metaPath));
  return checks;
}

function engineReferenceRepoChecks(root: string): ValidationCheck[] {
  return validateEngineReferencePacks(root).map((check) => ({
    id: check.id,
    status: check.status,
    message: check.message,
    path: check.path
  }));
}

function engineReferenceProjectChecks(projectRoot: string, studio: StudioProjectState): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const pack = engineReferenceRegistry[studio.engine];
  const materializedFiles = [...new Set([...pack.requiredFiles, ...pack.moduleFiles, ...pack.pluginFiles, ...pack.specialistFiles])];
  for (const file of materializedFiles) {
    const projectFile = path.join(projectRoot, pack.projectPath(file));
    checks.push(existsSync(projectFile) ? pass(`engine_reference.project.${studio.engine}.${file}`, `${studio.engine} ${file} materialized`, projectFile) : fail(`engine_reference.project.${studio.engine}.${file}`, `${studio.engine} ${file} missing from generated project`, projectFile));
  }
  for (const check of validateEngineReferencePacks(packageAssetPath("."))) {
    if (!check.id.startsWith(`engine_reference.${studio.engine}.`)) continue;
    checks.push({
      id: check.id.replace(`engine_reference.${studio.engine}.`, `engine_reference.package.${studio.engine}.`),
      status: check.status,
      message: check.message,
      path: check.path
    });
  }
  return checks;
}

function stablePromptSectionChecks(projectRoot: string, role: StudioRoleId, studio: StudioProjectState): ValidationCheck[] {
  const file = path.join(projectRoot, ".codex", "prompts", `${role}.md`);
  if (!existsSync(file)) return [fail(`codex.role.${role}.prompt.exists`, `${role} prompt missing`, file), fail(`codex.prompt.${role}`, `${role} prompt missing`, file)];
  const body = readFileSync(file, "utf8");
  const checks = [pass(`codex.role.${role}.prompt.exists`, `${role} prompt exists`, file)];
  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  checks.push(
    ...generatedSurfaceChecks({
      file,
      body,
      surface: "role-prompt",
      id: `codex.role.${role}.prompt.freshness`,
      target: { role },
      sourceInput: projectRolePromptSourceInput(role, configFromStudio(studio), engines),
      expectedBody: renderProjectRolePrompt(role, configFromStudio(studio), engines)
    })
  );
  checks.push(body.trim().length > 0 ? pass(`codex.prompt.${role}`, `${role} prompt exists`, file) : fail(`codex.prompt.${role}`, `${role} prompt missing`, file));
  const projectLine = `Project: ${studio.name}`;
  checks.push(body.includes(projectLine) ? pass(`codex.role.${role}.prompt.project`, `${projectLine} exists`, file) : fail(`codex.role.${role}.prompt.project`, `${projectLine} missing`, file));
  const roleLine = `Role: ${rolePackages[role].displayName}`;
  checks.push(body.includes(roleLine) ? pass(`codex.role.${role}.prompt.role`, `${roleLine} exists`, file) : fail(`codex.role.${role}.prompt.role`, `${roleLine} missing`, file));
  for (const [id, label] of [
    ["project-summary", "## Project Summary"],
    ["engine-context", "## Engine Context"],
    ["role-instructions", "## Role Instructions"],
    ["expected-outputs", "## Expected Outputs"],
    ["review-checklist", "## Review Checklist"],
    ["handoff", "## Handoff"]
  ] as const) {
    checks.push(sectionHasContent(body, label) ? pass(`codex.role.${role}.prompt.${id}`, `${label} exists`, file) : fail(`codex.role.${role}.prompt.${id}`, `${label} missing content`, file));
  }
  for (const reference of selectedEngineReferencePrompts(studio.engine, role)) {
    const expected = engineReferenceRegistry[studio.engine].projectPath(reference.path);
    checks.push(body.includes(expected) ? pass(`codex.role.${role}.engine_reference.${reference.path}`, `${role} references ${expected}`, file) : fail(`codex.role.${role}.engine_reference.${reference.path}`, `${role} prompt missing ${expected}`, file));
  }
  return checks;
}

export async function validateRepo(root = process.cwd()): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = [];
  const pkgPath = path.join(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { scripts?: Record<string, string>; bin?: Record<string, string>; files?: string[]; engines?: { node?: string } };
  const scripts = pkg.scripts ?? {};
  for (const script of ["init", "manage", "test", "validate", "templates"]) {
    checks.push(scripts[script] ? pass(`pkg.script.${script}`, `script ${script} exists`) : fail(`pkg.script.${script}`, `missing script ${script}`, pkgPath));
  }
  checks.push(scripts.build === "tsc -p tsconfig.build.json" ? pass("package.build", "build uses tsconfig.build.json") : fail("package.build", "build must use tsconfig.build.json", pkgPath));
  checks.push(pkg.bin?.opengamestudio === "./dist/cli.js" && !pkg.bin?.["open-gamestudio"] ? pass("package.bin", "opengamestudio bin points to dist/cli.js") : fail("package.bin", "opengamestudio bin must point to ./dist/cli.js and replace open-gamestudio", pkgPath));
  checks.push(pkg.engines?.node?.includes(">=24") ? pass("package.node", "node 24 floor declared") : fail("package.node", "node >=24 must be declared", pkgPath));
  for (const file of ["dist/", "engine_configs/", "engine_reference/", "templates/"]) {
    checks.push(pkg.files?.includes(file) ? pass(`pkg.files.${file}`, `${file} shipped`) : fail(`pkg.files.${file}`, `${file} missing from package files`, pkgPath));
  }
  for (const file of ["src/cli.ts", "src/behavioral-evaluation.ts", "src/customization.ts", "src/codex-runtime.ts", "src/codex-session.ts", "src/codex-prompts.ts", "src/prompt-context.ts", "src/context-manifest.ts", "src/roles.ts", "src/tasks.ts", "src/orchestrator.ts", "src/orchestrator-locks.ts", "src/workflow-recipes.ts", "src/ccgs-adaptation.ts", "src/workflows.ts", "src/verification.ts", "src/projects.ts", "src/runner.ts", "src/validation.ts"]) {
    checks.push(existsSync(path.join(root, file)) ? pass(`src.${file}`, `${file} exists`) : fail(`src.${file}`, `${file} missing`, file));
  }

  const codex = await checkCodexAvailability();
  checks.push(codex.ok ? pass("codex.cli", "Codex CLI is available") : fail("codex.cli", codex.reason ?? "Codex CLI unavailable or unauthenticated"));

  const baseAgentFailures = validateBaseAgents();
  checks.push(...baseAgentFailures.map((message) => fail("codex.roles", message)));
  for (const role of studioRoleIds) {
    const rendered = renderCodexPrompt(createCodexStudioSession({ projectRoot: root, role, objective: "validate role rendering", phase: "plan" }));
    checks.push(rendered.includes(rolePackages[role].displayName) ? pass(`codex.role.${role}.package-render`, `${role} package renders`) : fail(`codex.role.${role}.package-render`, `${role} package did not render`));
  }

  const engines = loadEngineConfigs(packageAssetPath("engine_configs"));
  for (const [id, config] of Object.entries(engines)) {
    checks.push(config.codex_hints.length && config.run_command && config.test_command ? pass(`codex.engine.${id}`, `${id} Codex hints parse`) : fail(`codex.engine.${id}`, `${id} Codex hints missing`));
  }
  checks.push(...engineReferenceRepoChecks(root));

  for (const workflow of workflowIds()) {
    const definition = workflowRegistry[workflow];
    checks.push(definition.file.endsWith(`${workflow}.md`) ? pass(`codex.workflow.${workflow}.registry`, `${workflow} registry entry exists`) : fail(`codex.workflow.${workflow}.registry`, `${workflow} registry file mismatch`));
    const rendered = renderCodexPrompt(createCodexStudioSession({ projectRoot: root, role: definition.role, objective: definition.objective, phase: definition.phase, contextFiles: definition.contextFiles }));
    checks.push(rendered.includes(definition.objective) ? pass(`codex.workflow.${workflow}.render`, `${workflow} workflow renders`) : fail(`codex.workflow.${workflow}.render`, `${workflow} workflow did not render`));
  }

  for (const result of runBehavioralEvaluations({})) {
    const message = result.status === "pass"
      ? `${result.id} behavioral scenario passes`
      : `${result.id} behavioral scenario failed: missing phrases [${result.missingRequiredPhrases.join(", ")}], forbidden phrases [${result.presentForbiddenPhrases.join(", ")}], missing context [${result.missingContextCategories.join(", ")}], missing templates [${result.missingTemplateIds.join(", ")}], forbidden templates [${result.presentForbiddenTemplateIds.join(", ")}]`;
    checks.push(result.status === "pass" ? pass(`behavioral.scenario.${result.id}`, message) : fail(`behavioral.scenario.${result.id}`, message));
  }

  const templateFailures = validateTemplateFiles();
  checks.push(...templateFailures.map((message) => fail("templates", message)));
  for (const [id, info] of Object.entries(templateRegistry)) {
    const file = packageAssetPath(info.path);
    if (!existsSync(file)) {
      checks.push(fail(`codex.template.${id}.exists`, `${id} template missing`, file));
      continue;
    }
    const body = readFileSync(file, "utf8");
    const missingSection = info.requiredSections.find((section) => !sectionHasContent(body, section));
    if (missingSection) {
      checks.push(fail(`codex.template.${id}.exists`, `${id} template missing non-empty ${missingSection}`, file));
      continue;
    }
    if (id === "project_config") {
      try {
        JSON.parse(body);
        checks.push(pass(`codex.template.${id}.exists`, `${id} template exists`, file));
      } catch (error) {
        checks.push(fail(`codex.template.${id}.exists`, `${id} template JSON invalid: ${(error as Error).message}`, file));
      }
      continue;
    }
    checks.push(pass(`codex.template.${id}.exists`, `${id} template exists`, file));
  }
  if (templateFailures.length === 0) checks.push(pass("templates", "all templates exist"));

  const cliHelp = existsSync(path.join(root, "src", "cli.ts")) ? execFileSync(path.join(root, "node_modules", ".bin", "tsx"), [path.join(root, "src", "cli.ts"), "--help"], { cwd: root, encoding: "utf8" }) : "";
  checks.push(/\bnext\b/.test(cliHelp) ? fail("codex.surface.future.next", "future next command exposed") : pass("codex.surface.future.next", "future next command is not exposed"));
  checks.push(/\btelemetry\b/.test(cliHelp) ? fail("codex.surface.future.telemetry", "future telemetry command exposed") : pass("codex.surface.future.telemetry", "future telemetry command is not exposed"));
  checks.push(/\bparallel\b/.test(cliHelp) ? fail("codex.surface.future.parallel", "future parallel command exposed") : pass("codex.surface.future.parallel", "future parallel command is not exposed"));
  checks.push(/ownership/i.test(cliHelp) ? fail("codex.surface.future.ownership", "future ownership enforcement surface exposed") : pass("codex.surface.future.ownership", "future ownership enforcement surface is not exposed"));

  checks.push(existsSync(path.join(root, "dist", "cli.js")) ? pass("build.output", "dist/cli.js exists") : fail("build.output", "dist/cli.js missing; run npm run build", path.join(root, "dist", "cli.js")));
  if (existsSync(path.join(root, "dist", "cli.js"))) {
    try {
      const packRaw = execFileSync("npm", ["pack", "--json"], { cwd: root, encoding: "utf8", shell: false });
      const packInfo = JSON.parse(packRaw)[0] as { filename: string; files: { path: string }[] };
      const packed = new Set(packInfo.files.map((file) => file.path));
      for (const need of [
        "dist/cli.js",
        "engine_configs/godot.json",
        "engine_configs/unity.json",
        "engine_configs/unreal.json",
        ...Object.values(templateRegistry).map((template) => template.path),
        ...Object.values(engineReferenceRegistry).flatMap((pack) => pack.packageSmokeFiles.map((file) => `${pack.packageRoot}/${file}`))
      ]) {
        checks.push(packed.has(need) ? pass(`pack.${need}`, `${need} packed`) : fail(`pack.${need}`, `${need} missing from npm pack`));
      }
      const temp = mkdtempSync(path.join(tmpdir(), "open-gamestudio-pack-"));
      try {
        execFileSync("npm", ["install", "--silent", "--prefix", temp, path.join(root, packInfo.filename)], { cwd: root, encoding: "utf8", shell: false });
        execFileSync("npm", ["exec", "--prefix", temp, "opengamestudio", "--", "templates", "list"], { cwd: temp, encoding: "utf8", shell: false });
        checks.push(pass("pack.install_smoke", "installed package bin loads templates from temp cwd"));
      } finally {
        rmSync(temp, { recursive: true, force: true });
        unlinkSync(path.join(root, packInfo.filename));
      }
    } catch (error) {
      checks.push(fail("pack.install_smoke", `package smoke failed: ${(error as Error).message}`));
    }
  }
  return checks;
}

export function validateProject(projectRoot: string): ValidationCheck[] {
  const checks: ValidationCheck[] = [];
  const studioPath = path.join(projectRoot, ".codex", "studio.json");
  let studio: ReturnType<typeof readStudioProject>;
  try {
    studio = readStudioProject(projectRoot);
    checks.push(pass("codex.project.studio", "studio.json schema-readable", studioPath));
  } catch (error) {
    return [fail("codex.project.studio", `invalid studio state: ${(error as Error).message}`, studioPath)];
  }

  const expectedProjectRoles = projectRoleIdsForEngine(studio.engine);
  const expectedActiveRoles = activeAgentsForProject(studio.mode, studio.engine);
  checks.push(JSON.stringify(studio.roles) === JSON.stringify(expectedProjectRoles) ? pass("codex.project.roles", "engine-scoped role roster recorded", studioPath) : fail("codex.project.roles", "studio roles must match engine-scoped project roles", studioPath));
  checks.push(JSON.stringify(studio.activeRoles) === JSON.stringify(expectedActiveRoles) ? pass("codex.project.activeRoles", "mode and engine-active roles recorded", studioPath) : fail("codex.project.activeRoles", "activeRoles must match project mode and engine", studioPath));
  checks.push(JSON.stringify(studio.workflows) === JSON.stringify(workflowIds()) ? pass("codex.project.workflows", "canonical workflows recorded", studioPath) : fail("codex.project.workflows", "workflows must match registry keys", studioPath));
  checks.push(
    ...validateProjectCustomization(projectRoot, { builtInWorkflowIds: workflowIds(), builtInTemplateIds: Object.keys(templateRegistry) }).map((check) =>
      check.status === "pass" ? pass(check.id, check.message, check.path) : fail(check.id, check.message, check.path)
    )
  );

  const approvalsPath = path.join(projectRoot, ".codex", "approvals.json");
  if (!existsSync(approvalsPath)) {
    checks.push(fail("codex.project.approvals", "approval store missing", approvalsPath));
  } else {
    try {
      const approvalStore = JSON.parse(readFileSync(approvalsPath, "utf8")) as unknown;
      const result = validateApprovalStore(approvalStore, { projectRoot });
      checks.push(result.ok ? pass("codex.project.approvals", "approval store schema-readable", approvalsPath) : fail("codex.project.approvals", `approval store invalid: ${result.errors.join("; ")}`, approvalsPath));
    } catch (error) {
      checks.push(fail("codex.project.approvals", `approval store invalid JSON: ${(error as Error).message}`, approvalsPath));
    }
  }

  checks.push(...contextManifestChecks(projectRoot, studio));
  checks.push(...engineReferenceProjectChecks(projectRoot, studio));

  const agentsMd = path.join(projectRoot, "AGENTS.md");
  if (existsSync(agentsMd)) {
    const body = readFileSync(agentsMd, "utf8");
    for (const section of projectAgentsMdRequiredSections) {
      checks.push(sectionHasContent(body, section) ? pass(`codex.project.AGENTS.md.${section}`, `${section} exists`, agentsMd) : fail(`codex.project.AGENTS.md.${section}`, `${section} missing content`, agentsMd));
    }
  } else {
    checks.push(fail("project.agents_md", "AGENTS.md missing", agentsMd));
  }

  const expectedPromptRoles = new Set(expectedProjectRoles);
  for (const role of expectedProjectRoles) checks.push(...stablePromptSectionChecks(projectRoot, role, studio));
  for (const role of studioRoleIds) {
    if (!isEngineSpecialistRoleId(role) || expectedPromptRoles.has(role)) continue;
    const file = path.join(projectRoot, ".codex", "prompts", `${role}.md`);
    checks.push(existsSync(file) ? fail(`codex.role.${role}.prompt.absent`, `${role} prompt must not be materialized for ${studio.engine} projects`, file) : pass(`codex.role.${role}.prompt.absent`, `${role} prompt absent for ${studio.engine} project`, file));
  }

  for (const workflow of workflowIds()) {
    const file = path.join(projectRoot, workflowRegistry[workflow].file);
    if (!existsSync(file)) {
      checks.push(fail(`codex.workflow.${workflow}.file.exists`, `${workflow} workflow missing`, file));
      continue;
    }
    const body = readFileSync(file, "utf8");
    checks.push(pass(`codex.workflow.${workflow}.file.exists`, `${workflow} workflow exists`, file));
    checks.push(
      ...generatedSurfaceChecks({
        file,
        body,
        surface: "workflow",
        id: `codex.workflow.${workflow}.freshness`,
        target: { id: workflow },
        sourceInput: workflowSourceInput(workflow),
        expectedBody: workflowBody(workflow)
      })
    );
    const hasSections = ["## Purpose", "## Inputs", "## Role", "## Outputs", "## Validation"].every((section) => sectionHasContent(body, section));
    checks.push(hasSections ? pass(`codex.workflow.${workflow}.sections`, `${workflow} workflow sections exist`, file) : fail(`codex.workflow.${workflow}.sections`, `${workflow} workflow sections missing content`, file));
    checks.push(renderWorkflowPrompt(projectRoot, workflow).includes(workflowRegistry[workflow].objective) ? pass(`codex.workflow.${workflow}.render`, `${workflow} workflow renders`) : fail(`codex.workflow.${workflow}.render`, `${workflow} workflow did not render`));
    checks.push(pass(`codex.workflow.${workflow}.registry`, `${workflow} registry entry exists`));
    checks.push(pass(`codex.workflow.${workflow}`, `${workflow} workflow exists`, file));
  }

  const root = sourceRoot(projectRoot, studio.slug);
  checks.push(existsSync(root) ? pass("project.source_root", "engine source root exists", root) : fail("project.source_root", "engine source root missing", root));
  const engineFile = studio.engine === "godot" ? path.join(root, "project.godot") : studio.engine === "unity" ? path.join(root, "Packages", "manifest.json") : path.join(root, unrealProjectFileName(studio.name));
  checks.push(existsSync(engineFile) ? pass("project.engine_file", "engine project file exists", engineFile) : fail("project.engine_file", "engine project file missing", engineFile));
  if (studio.engine === "unity") {
    const settings = path.join(root, "ProjectSettings", "ProjectSettings.asset");
    checks.push(existsSync(settings) ? pass("project.engine_settings", "Unity ProjectSettings marker exists", settings) : fail("project.engine_settings", "Unity ProjectSettings marker missing", settings));
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

  for (const forbidden of ["project_orchestrator.md", "CODEX.md", path.join(".gamestudio", "runs")]) {
    const file = path.join(projectRoot, forbidden);
    checks.push(existsSync(file) ? fail(`project.forbidden.${forbidden}`, `${forbidden} must not exist`, file) : pass(`project.forbidden.${forbidden}`, `${forbidden} absent`));
  }

  const before = readFileSync(studioPath, "utf8");
  statusProject(projectRoot, path.dirname(projectRoot));
  resumeProject(projectRoot, path.dirname(projectRoot));
  const after = readFileSync(studioPath, "utf8");
  checks.push(before === after ? pass("project.read_only", "status/resume are read-only") : fail("project.read_only", "status/resume mutated project", studioPath));
  return checks;
}

export async function runValidation(options: { project?: string; root?: string } = {}): Promise<{ checks: ValidationCheck[]; failed: boolean }> {
  const root = options.root ?? process.cwd();
  const checks = options.project ? validateProject(path.resolve(root, options.project)) : await validateRepo(root);
  return { checks, failed: checks.some((check) => check.status === "fail") };
}
