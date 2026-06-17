import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, realpathSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { ProjectStage, StudioMode } from "./studio-policy.js";

export const approvalStages = ["question", "options", "decision", "draft", "approved", "implemented", "reviewed", "blocked"] as const;
export type ApprovalStage = (typeof approvalStages)[number];
export type ApprovalSource = "draft-workflow" | "approval-command" | "cli-override";

export type ApprovalBaseline = {
  gitHead?: string;
  diffSha256?: string;
  contextManifestSha256?: string;
};

export type ApprovalRecord = {
  id: string;
  stage: ApprovalStage;
  role: string;
  objectiveSha256: string;
  objective?: string;
  projectStage?: ProjectStage;
  studioMode?: StudioMode;
  approvedGlobs: string[];
  approvedFiles?: string[];
  source: ApprovalSource;
  approvedBy: string;
  approvedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  baseline?: ApprovalBaseline;
};

export type ApprovalStore = {
  schemaVersion: 1;
  product: "codex-game-studio";
  records: ApprovalRecord[];
};

export type ApprovalScopeOptions = {
  projectRoot?: string;
};

export type ApprovalStoreValidationOptions = ApprovalScopeOptions;

export type ObjectiveHashInput = {
  role: string;
  objective: string;
  approvedGlobs: string[];
  approvedFiles?: string[];
  projectStage: ProjectStage;
  studioMode: StudioMode;
};

export type ApprovalMatchInput = ObjectiveHashInput & {
  now?: Date;
};

export type ApprovalMatchResult =
  | { matched: true; record: ApprovalRecord; reasons: string[] }
  | { matched: false; record?: undefined; reasons: string[] };

export type ApprovalRecordDiagnostic = {
  id: string;
  authorizing: boolean;
  reasons: string[];
};

export type ApprovalMismatchDiagnostic = {
  matched: boolean;
  objectiveSha256: string;
  reasons: string[];
  records: ApprovalRecordDiagnostic[];
};

export type AppendApprovalInput = {
  role: string;
  objectiveSha256: string;
  objective?: string;
  projectStage?: ProjectStage;
  studioMode?: StudioMode;
  approvedGlobs: string[];
  approvedFiles?: string[];
  approvedBy: string;
  approvedAt?: string;
  expiresAt?: string;
  baseline?: ApprovalBaseline;
};

const approvalStageSet = new Set<string>(approvalStages);
const approvalSources = new Set<string>(["draft-workflow", "approval-command", "cli-override"]);
const projectStages = new Set<string>(["design", "prototype", "development"]);
const studioModes = new Set<string>(["fast-prototype", "guided-studio", "strict-studio"]);
const hashPattern = /^[a-f0-9]{64}$/;
const broadScopeSet = new Set<string>([".", "*", "**", "**/*"]);

export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortCanonical(value));
}

function sortCanonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortCanonical);
  if (!value || typeof value !== "object") return value;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>).sort()) {
    const child = (value as Record<string, unknown>)[key];
    if (child !== undefined) sorted[key] = sortCanonical(child);
  }
  return sorted;
}

export function createEmptyApprovalStore(): ApprovalStore {
  return {
    schemaVersion: 1,
    product: "codex-game-studio",
    records: []
  };
}

export function approvalStorePath(projectRoot: string): string {
  return path.join(projectRoot, ".codex", "approvals.json");
}

export function readApprovalStore(projectRoot: string): ApprovalStore {
  const store = JSON.parse(readFileSync(approvalStorePath(projectRoot), "utf8")) as unknown;
  const result = validateApprovalStore(store, { projectRoot });
  if (!result.ok) throw new Error(`approval store invalid: ${result.errors.join("; ")}`);
  return store as ApprovalStore;
}

export function writeApprovalStore(projectRoot: string, store: ApprovalStore = createEmptyApprovalStore()): void {
  const storePath = approvalStorePath(projectRoot);
  mkdirSync(path.dirname(storePath), { recursive: true });
  writeFileSync(storePath, `${JSON.stringify(sortCanonical(store), null, 2)}\n`);
}

export function canonicalObjectiveSha256(input: ObjectiveHashInput): string {
  const canonical = {
    role: normalizeRole(input.role),
    objective: normalizeObjective(input.objective),
    approvedGlobs: normalizeApprovalScope(input.approvedGlobs),
    approvedFiles: input.approvedFiles ? normalizeApprovalScope(input.approvedFiles) : [],
    projectStage: input.projectStage,
    studioMode: input.studioMode
  };
  return sha256(canonicalJson(canonical));
}

export function normalizeApprovalScope(scope: string[], options: ApprovalScopeOptions = {}): string[] {
  if (!Array.isArray(scope)) throw new Error("approval scope must be an array");
  const normalized = scope.map((entry) => normalizeScopeEntry(entry, options));
  return [...new Set(normalized)].sort();
}

function normalizeScopeEntry(entry: string, options: ApprovalScopeOptions): string {
  if (typeof entry !== "string") throw new Error("approval scope entry must be a string");
  const raw = entry.trim().replace(/\\/g, "/");
  if (!raw) throw new Error("approval scope entry must not be empty");
  if (/[\x00-\x1f\x7f]/.test(raw)) throw new Error(`approval scope contains control characters: ${entry}`);
  if (path.posix.isAbsolute(raw) || path.win32.isAbsolute(raw)) throw new Error(`approval scope must not use absolute paths: ${entry}`);
  const segments = raw.split("/");
  if (segments.some((segment) => segment === "..")) throw new Error(`approval scope contains parent traversal: ${entry}`);
  if (segments.some((segment) => secretLikeSegment(segment))) throw new Error(`approval scope contains secret-like path segment: ${entry}`);
  rejectSymlinkEscape(raw, options.projectRoot);
  return path.posix.normalize(raw);
}

function secretLikeSegment(segment: string): boolean {
  const lower = segment.toLowerCase();
  return (
    lower === ".env" ||
    lower.startsWith(".env.") ||
    lower === "id_rsa" ||
    lower === "id_dsa" ||
    lower === "id_ecdsa" ||
    lower === "id_ed25519" ||
    lower === "secret" ||
    lower === "secrets" ||
    lower === "credential" ||
    lower === "credentials" ||
    lower === "token" ||
    lower === "tokens"
  );
}

function rejectSymlinkEscape(scope: string, projectRoot?: string): void {
  if (!projectRoot) return;
  const rootReal = realpathSync(projectRoot);
  let current = projectRoot;
  for (const segment of scope.split("/")) {
    if (/[*!?[\]{}]/.test(segment)) break;
    current = path.join(current, segment);
    if (!existsSync(current)) continue;
    const real = realpathSync(current);
    if (!isPathInside(rootReal, real)) throw new Error(`approval scope follows symlink outside project: ${scope}`);
  }
}

function isPathInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function approvalMatches(store: ApprovalStore, input: ApprovalMatchInput): ApprovalMatchResult {
  const objectiveSha256 = canonicalObjectiveSha256(input);
  const now = input.now ?? new Date();
  const reasons = new Set<string>();
  for (const record of store.records) {
    const recordReasons = approvalRecordMismatchReasons(record, input, objectiveSha256, now);
    if (recordReasons.length === 0) return { matched: true, record, reasons: [] };
    for (const reason of recordReasons) reasons.add(reason);
  }
  return { matched: false, reasons: [...reasons] };
}

export function explainApprovalMismatch(store: ApprovalStore, input: ApprovalMatchInput): ApprovalMismatchDiagnostic {
  const objectiveSha256 = canonicalObjectiveSha256(input);
  const now = input.now ?? new Date();
  const records = store.records.map((record) => {
    const reasons = approvalRecordMismatchReasons(record, input, objectiveSha256, now);
    return {
      id: record.id,
      authorizing: reasons.length === 0,
      reasons
    };
  });
  const matched = records.some((record) => record.authorizing);
  const reasons = [...new Set(records.flatMap((record) => record.reasons))];
  return {
    matched,
    objectiveSha256,
    reasons: reasons.length > 0 ? reasons : matched ? [] : ["no approval records"],
    records
  };
}

export function appendApprovalRecord(projectRoot: string, input: AppendApprovalInput): ApprovalRecord {
  const store = readApprovalStore(projectRoot);
  const record: ApprovalRecord = {
    id: nextApprovalId(store.records),
    stage: "approved",
    role: normalizeRole(input.role),
    objectiveSha256: normalizeObjectiveSha256(input.objectiveSha256),
    objective: input.objective ? normalizeObjective(input.objective) : undefined,
    projectStage: input.projectStage,
    studioMode: input.studioMode,
    approvedGlobs: normalizeApprovalScope(input.approvedGlobs, { projectRoot }),
    approvedFiles: input.approvedFiles ? normalizeApprovalScope(input.approvedFiles, { projectRoot }) : undefined,
    source: "approval-command",
    approvedBy: input.approvedBy.trim(),
    approvedAt: input.approvedAt ?? new Date().toISOString(),
    expiresAt: input.expiresAt,
    baseline: input.baseline ?? collectApprovalBaseline(projectRoot)
  };
  const result = validateApprovalStore({ ...store, records: [...store.records, record] }, { projectRoot });
  if (!result.ok) throw new Error(`approval record invalid: ${result.errors.join("; ")}`);
  writeApprovalStore(projectRoot, { ...store, records: [...store.records, record] });
  return record;
}

export function revokeApprovalRecord(projectRoot: string, approvalId: string, revokedAt = new Date().toISOString()): ApprovalRecord {
  const store = readApprovalStore(projectRoot);
  const record = store.records.find((candidate) => candidate.id === approvalId);
  if (!record) throw new Error(`Unknown approval id: ${approvalId}`);
  if (!record.revokedAt) record.revokedAt = revokedAt;
  const result = validateApprovalStore(store, { projectRoot });
  if (!result.ok) throw new Error(`approval store invalid after revoke: ${result.errors.join("; ")}`);
  writeApprovalStore(projectRoot, store);
  return record;
}

export function approvalListState(record: ApprovalRecord, now = new Date()): { state: string; authorizing: boolean; reasons: string[] } {
  const reasons = approvalRecordLifecycleReasons(record, now);
  return {
    state: reasons.includes("approval revoked") ? "revoked" : reasons.includes("approval expired") ? "expired" : record.stage,
    authorizing: reasons.length === 0,
    reasons
  };
}

export function isBroadApprovalScope(scope: string): boolean {
  return broadScopeSet.has(scope);
}

export function validateApprovalStore(value: unknown, options: ApprovalStoreValidationOptions = {}): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(value)) return { ok: false, errors: ["approval store must be a JSON object"] };
  if (value.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (value.product !== "codex-game-studio") errors.push("product must be codex-game-studio");
  if (!Array.isArray(value.records)) {
    errors.push("records must be an array");
  } else {
    const seenIds = new Set<string>();
    value.records.forEach((record, index) => {
      validateApprovalRecord(record, index, errors, options);
      if (!isRecord(record) || typeof record.id !== "string") return;
      if (seenIds.has(record.id)) errors.push(`records[${index}].id duplicates an earlier approval id: ${record.id}`);
      seenIds.add(record.id);
    });
  }
  return { ok: errors.length === 0, errors };
}

function validateApprovalRecord(value: unknown, index: number, errors: string[], options: ApprovalStoreValidationOptions): void {
  const prefix = `records[${index}]`;
  if (!isRecord(value)) {
    errors.push(`${prefix} must be an object`);
    return;
  }
  requireString(value.id, `${prefix}.id`, errors);
  if (!approvalStageSet.has(String(value.stage))) errors.push(`${prefix}.stage must be one of ${approvalStages.join(", ")}`);
  requireString(value.role, `${prefix}.role`, errors);
  if (typeof value.objectiveSha256 !== "string" || !hashPattern.test(value.objectiveSha256)) errors.push(`${prefix}.objectiveSha256 must be a sha256 hex string`);
  if (value.objective !== undefined) requireString(value.objective, `${prefix}.objective`, errors);
  if (value.projectStage !== undefined && !projectStages.has(String(value.projectStage))) errors.push(`${prefix}.projectStage must be design, prototype, or development`);
  if (value.studioMode !== undefined && !studioModes.has(String(value.studioMode))) errors.push(`${prefix}.studioMode must be fast-prototype, guided-studio, or strict-studio`);
  validateScopeField(value.approvedGlobs, `${prefix}.approvedGlobs`, errors, options);
  if (value.approvedFiles !== undefined) validateScopeField(value.approvedFiles, `${prefix}.approvedFiles`, errors, options);
  if (!approvalSources.has(String(value.source))) errors.push(`${prefix}.source must be draft-workflow, approval-command, or cli-override`);
  requireString(value.approvedBy, `${prefix}.approvedBy`, errors);
  requireIsoDate(value.approvedAt, `${prefix}.approvedAt`, errors);
  if (value.expiresAt !== undefined) requireIsoDate(value.expiresAt, `${prefix}.expiresAt`, errors);
  if (value.revokedAt !== undefined) requireIsoDate(value.revokedAt, `${prefix}.revokedAt`, errors);
  if (value.baseline !== undefined) validateBaseline(value.baseline, `${prefix}.baseline`, errors);
}

function validateScopeField(value: unknown, field: string, errors: string[], options: ApprovalStoreValidationOptions): void {
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array`);
    return;
  }
  try {
    normalizeApprovalScope(value, options);
  } catch (error) {
    errors.push(`${field} invalid: ${(error as Error).message}`);
  }
}

function validateBaseline(value: unknown, field: string, errors: string[]): void {
  if (!isRecord(value)) {
    errors.push(`${field} must be an object`);
    return;
  }
  for (const key of ["gitHead", "diffSha256", "contextManifestSha256"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "string") errors.push(`${field}.${key} must be a string`);
  }
  for (const key of ["diffSha256", "contextManifestSha256"] as const) {
    if (typeof value[key] === "string" && !hashPattern.test(value[key])) errors.push(`${field}.${key} must be a sha256 hex string`);
  }
}

function requireString(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string" || value.trim().length === 0) errors.push(`${field} must be a non-empty string`);
}

function requireIsoDate(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string" || !isCanonicalUtcIsoTimestamp(value)) errors.push(`${field} must be an ISO timestamp string`);
}

function isCanonicalUtcIsoTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function approvalRecordMismatchReasons(record: ApprovalRecord, input: ApprovalMatchInput, objectiveSha256: string, now: Date): string[] {
  const reasons: string[] = [];
  if (normalizeRole(record.role) !== normalizeRole(input.role)) reasons.push("role mismatch");
  if (record.objective !== undefined && normalizeObjective(record.objective) !== normalizeObjective(input.objective)) reasons.push("normalized objective mismatch");
  if (!sameScope(record.approvedGlobs, input.approvedGlobs)) reasons.push("scope mismatch");
  if (!sameScope(record.approvedFiles ?? [], input.approvedFiles ?? [])) reasons.push("approved files mismatch");
  if (record.projectStage !== undefined && record.projectStage !== input.projectStage) reasons.push("project stage mismatch");
  if (record.studioMode !== undefined && record.studioMode !== input.studioMode) reasons.push("studio mode mismatch");
  if (record.objectiveSha256 !== objectiveSha256) reasons.push("objective hash mismatch");
  reasons.push(...approvalRecordLifecycleReasons(record, now));
  return reasons;
}

function sameScope(left: string[], right: string[]): boolean {
  try {
    return JSON.stringify(normalizeApprovalScope(left)) === JSON.stringify(normalizeApprovalScope(right));
  } catch {
    return false;
  }
}

function collectApprovalBaseline(projectRoot: string): ApprovalBaseline {
  try {
    const gitHead = execFileSync("git", ["-C", projectRoot, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    const diff = execFileSync("git", ["-C", projectRoot, "diff", "--binary", "HEAD", "--"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return {
      gitHead,
      diffSha256: sha256(diff)
    };
  } catch {
    return {
      gitHead: "unavailable:no-git-baseline",
      diffSha256: sha256("unavailable:no-git-baseline\n")
    };
  }
}

function approvalRecordLifecycleReasons(record: ApprovalRecord, now: Date): string[] {
  const reasons: string[] = [];
  if (record.revokedAt) reasons.push("approval revoked");
  if (record.expiresAt && Date.parse(record.expiresAt) <= now.getTime()) reasons.push("approval expired");
  if (record.stage !== "approved") reasons.push(`approval stage is ${record.stage}`);
  return reasons;
}

function nextApprovalId(records: ApprovalRecord[]): string {
  const max = records.reduce((found, record) => {
    const match = /^approval-(\d+)$/.exec(record.id);
    return match ? Math.max(found, Number(match[1])) : found;
  }, 0);
  return `approval-${String(max + 1).padStart(3, "0")}`;
}

function normalizeObjectiveSha256(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!hashPattern.test(normalized)) throw new Error("objectiveSha256 must be a sha256 hex string");
  return normalized;
}

function normalizeRole(role: string): string {
  return role.trim().toLowerCase();
}

function normalizeObjective(objective: string): string {
  return objective.trim().replace(/\s+/g, " ");
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
