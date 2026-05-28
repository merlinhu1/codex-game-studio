import { spawn, spawnSync } from "node:child_process";
import type { CodexSandboxMode } from "./codex-session.js";

export type CodexRuntimeOptions = {
  projectRoot: string;
  sandbox?: CodexSandboxMode;
  codexBin?: string;
};

export type CodexAvailability = {
  ok: boolean;
  command: string;
  reason?: string;
  stdout: string;
  stderr: string;
};

export type CodexExecutionResult = {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  error?: Error;
};

export function resolveCodexCommand(env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env): string {
  return env.CODEX_BIN?.trim() || "codex";
}

export function buildCodexExecArgs(options: CodexRuntimeOptions): string[] {
  return ["exec", "--cd", options.projectRoot, "--sandbox", options.sandbox ?? "workspace-write", "-"];
}

export async function checkCodexAvailability(options: { codexBin?: string } = {}): Promise<CodexAvailability> {
  const command = options.codexBin ?? resolveCodexCommand();
  const result = spawnSync(command, ["--version"], { encoding: "utf8", shell: false });
  if (result.error) {
    return { ok: false, command, reason: `Codex CLI unavailable or not found: ${result.error.message}`, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
  }
  if (result.status !== 0) {
    return { ok: false, command, reason: `Codex CLI exited with status ${result.status}`, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
  }
  return { ok: true, command, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

export async function executeCodexPrompt(prompt: string, options: CodexRuntimeOptions): Promise<CodexExecutionResult> {
  const command = options.codexBin ?? resolveCodexCommand();
  const args = buildCodexExecArgs(options);
  return await new Promise((resolve) => {
    const child = spawn(command, args, { cwd: options.projectRoot, shell: false, stdio: ["pipe", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (error) => resolve({ status: null, signal: null, stdout, stderr, error }));
    child.on("close", (status, signal) => resolve({ status, signal, stdout, stderr }));
    child.stdin.end(prompt);
  });
}
