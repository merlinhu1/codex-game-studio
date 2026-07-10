import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export type DocumentationImpactCheck = {
  id: string;
  status: "pass" | "fail";
  message: string;
  path?: string;
};

export type DocumentationImpactRecord = {
  decision?: string;
  reason?: string;
  documents: string[];
};

export type DocumentationImpactOptions = {
  base?: string;
  changedPaths?: string[];
};

const activeSessionPath = path.join("production", "session-state", "active.md");
const documentationRoots = ["design/", "docs/", "production/"];

function pass(id: string, message: string, file?: string): DocumentationImpactCheck {
  return { id, status: "pass", message, path: file };
}

function fail(id: string, message: string, file?: string): DocumentationImpactCheck {
  return { id, status: "fail", message, path: file };
}

function documentationSection(body: string): string | undefined {
  const heading = /^## Documentation Impact\s*$/m.exec(body);
  if (!heading || heading.index === undefined) return undefined;
  const rest = body.slice(heading.index + heading[0].length);
  const nextHeading = rest.search(/^##\s/m);
  return (nextHeading === -1 ? rest : rest.slice(0, nextHeading)).trim();
}

export function parseDocumentationImpactRecord(body: string): DocumentationImpactRecord | undefined {
  const section = documentationSection(body);
  if (section === undefined) return undefined;
  const fields = new Map<string, string>();
  for (const line of section.split("\n")) {
    const match = /^-\s*(Decision|Reason|Documents):\s*(.*)$/i.exec(line.trim());
    if (match) fields.set(match[1].toLowerCase(), match[2].trim());
  }
  const documentsValue = fields.get("documents") ?? "";
  const documents = documentsValue.toLowerCase() === "none" || documentsValue === "" ? [] : documentsValue.split(",").map((entry) => entry.trim()).filter(Boolean);
  return { decision: fields.get("decision")?.toLowerCase(), reason: fields.get("reason"), documents };
}

export function isDocumentationPath(file: string): boolean {
  return documentationRoots.some((root) => file.startsWith(root));
}

export function isFunctionalGamePath(file: string): boolean {
  if (isDocumentationPath(file) || file.startsWith(".codex/") || file.startsWith("tests/") || file.startsWith("tools/")) return false;
  return file.startsWith("src/") || file.startsWith("assets/") || file === "project.godot" || file.endsWith(".uproject");
}

function changedPathsFromGit(projectRoot: string, base: string): string[] {
  const run = (args: string[]) => execFileSync("git", args, { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  const tracked = run(["diff", "--name-only", "--diff-filter=ACMRD", base, "--"]);
  const untracked = run(["ls-files", "--others", "--exclude-standard"]);
  return [...new Set([...tracked.split("\n"), ...untracked.split("\n")].map((file) => file.trim()).filter(Boolean))].sort();
}

function isProjectDocumentPath(file: string): boolean {
  if (path.isAbsolute(file)) return false;
  const normalized = path.posix.normalize(file.replaceAll("\\", "/"));
  return normalized === file && documentationRoots.some((root) => normalized.startsWith(root));
}

export function documentationImpactChecks(projectRoot: string, options: DocumentationImpactOptions = {}): DocumentationImpactCheck[] {
  let changedPaths = options.changedPaths;
  if (!changedPaths) {
    const base = options.base ?? "HEAD";
    try {
      changedPaths = changedPathsFromGit(projectRoot, base);
    } catch (error) {
      return [fail("project.documentation_impact.base", `documentation impact could not inspect Git base ${base}: ${(error as Error).message}`)];
    }
  }

  const functionalPaths = changedPaths.filter(isFunctionalGamePath);
  if (functionalPaths.length === 0) {
    return [pass("project.documentation_impact", "no functional game paths changed; documentation-impact record is not required")];
  }

  const recordPath = path.join(projectRoot, activeSessionPath);
  if (!existsSync(recordPath)) {
    return [fail("project.documentation_impact.record", `functional game paths changed (${functionalPaths.join(", ")}) but ${activeSessionPath} is missing`, recordPath)];
  }

  const record = parseDocumentationImpactRecord(readFileSync(recordPath, "utf8"));
  if (!record) return [fail("project.documentation_impact.record", `${activeSessionPath} must contain a ## Documentation Impact section`, recordPath)];

  const checks: DocumentationImpactCheck[] = [];
  if (record.decision !== "updated" && record.decision !== "no-update") {
    checks.push(fail("project.documentation_impact.decision", "Documentation Impact Decision must be updated or no-update", recordPath));
    return checks;
  }
  if (!record.reason?.trim()) checks.push(fail("project.documentation_impact.reason", "Documentation Impact Reason is required", recordPath));

  if (record.decision === "no-update") {
    if (record.documents.length > 0) checks.push(fail("project.documentation_impact.documents", "no-update decisions must declare Documents: none", recordPath));
    if (checks.length === 0) checks.push(pass("project.documentation_impact", "functional changes have an explicit no-update documentation decision", recordPath));
    return checks;
  }

  if (record.documents.length === 0) {
    checks.push(fail("project.documentation_impact.documents", "updated decisions must name one or more changed game documents", recordPath));
    return checks;
  }

  for (const document of record.documents) {
    const id = `project.documentation_impact.document.${document}`;
    const fullPath = path.join(projectRoot, document);
    if (!isProjectDocumentPath(document)) {
      checks.push(fail(id, "Documentation Impact documents must be project-relative paths under design/, docs/, or production/", recordPath));
    } else if (!existsSync(fullPath)) {
      checks.push(fail(id, `Documentation Impact document does not exist: ${document}`, fullPath));
    } else if (!changedPaths.includes(document)) {
      checks.push(fail(id, `Documentation Impact document did not differ from the selected base: ${document}`, fullPath));
    } else {
      checks.push(pass(id, `Documentation Impact document changed: ${document}`, fullPath));
    }
  }
  if (checks.every((check) => check.status === "pass") && record.reason?.trim()) checks.push(pass("project.documentation_impact", "functional changes have updated documentation evidence", recordPath));
  return checks;
}
