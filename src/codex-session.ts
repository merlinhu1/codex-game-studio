import type { EngineId } from "./engines.js";
import { isStudioRoleId, rolePackages, unknownStudioRoleMessage, type StudioRoleId } from "./roles.js";
import type { StudioRunEligibility, WritePolicy } from "./studio-policy.js";

export type CodexStudioPhase = "plan" | "implement" | "review" | "fix" | "ship";
export type CodexSandboxMode = "read-only" | "workspace-write" | "danger-full-access";

export type VerificationCommand = {
  command: string;
  args: string[];
};

export type CodexStudioSession = {
  projectRoot: string;
  role: StudioRoleId;
  objective: string;
  phase: CodexStudioPhase;
  engine?: EngineId;
  contextFiles: string[];
  expectedOutputs: string[];
  verification?: VerificationCommand;
  allowFileEdits: boolean;
  sandbox: CodexSandboxMode;
  writePolicy?: WritePolicy;
  eligibility?: StudioRunEligibility;
  reviewMode?: "none" | "diff" | "full";
  contextContract?: string;
};

export type CreateCodexStudioSessionInput = {
  projectRoot: string;
  role: StudioRoleId;
  objective: string;
  phase: CodexStudioPhase;
  engine?: EngineId;
  contextFiles?: string[];
  expectedOutputs?: string[];
  verification?: VerificationCommand;
  allowFileEdits?: boolean;
  sandbox?: CodexSandboxMode;
  writePolicy?: WritePolicy;
  eligibility?: StudioRunEligibility;
  reviewMode?: "none" | "diff" | "full";
  contextContract?: string;
};

function defaultsForPhase(phase: CodexStudioPhase): Pick<CodexStudioSession, "allowFileEdits" | "sandbox"> {
  if (phase === "implement" || phase === "fix") return { allowFileEdits: true, sandbox: "danger-full-access" };
  return { allowFileEdits: false, sandbox: "read-only" };
}

export function validateCodexStudioSession(session: CodexStudioSession): CodexStudioSession {
  if (!session.projectRoot.trim()) throw new Error("Codex studio session requires project root");
  if (!isStudioRoleId(session.role)) throw new Error(unknownStudioRoleMessage(session.role));
  if (!session.objective.trim()) throw new Error("Codex studio session requires objective");
  if (!["plan", "implement", "review", "fix", "ship"].includes(session.phase)) throw new Error(`Unknown studio phase: ${session.phase}`);
  if (session.expectedOutputs.length === 0) throw new Error("Codex studio session requires expected outputs");
  if (!session.allowFileEdits && session.sandbox !== "read-only") throw new Error("Session with allowFileEdits false cannot use a writable sandbox");
  return session;
}

export function createCodexStudioSession(input: CreateCodexStudioSessionInput): CodexStudioSession {
  const defaults = defaultsForPhase(input.phase);
  const session: CodexStudioSession = {
    projectRoot: input.projectRoot,
    role: input.role,
    objective: input.objective,
    phase: input.phase,
    engine: input.engine,
    contextFiles: input.contextFiles ?? ["AGENTS.md", ".codex/studio.json"],
    expectedOutputs: input.expectedOutputs ?? rolePackages[input.role].expectedOutputs,
    verification: input.verification,
    allowFileEdits: input.allowFileEdits ?? defaults.allowFileEdits,
    sandbox: input.sandbox ?? defaults.sandbox,
    writePolicy: input.writePolicy,
    eligibility: input.eligibility,
    reviewMode: input.reviewMode,
    contextContract: input.contextContract
  };
  return validateCodexStudioSession(session);
}
