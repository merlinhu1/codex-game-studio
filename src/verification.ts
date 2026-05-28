import { spawn } from "node:child_process";

export type VerificationCommand = {
  command: string;
  args: string[];
};

export type VerificationResult = {
  command: string;
  args: string[];
  cwd: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
};

export type RunVerificationOptions = {
  cwd: string;
  timeoutMs?: number;
  maxOutputBytes?: number;
};

function appendBounded(current: string, chunk: string, max: number): string {
  const next = current + chunk;
  if (Buffer.byteLength(next, "utf8") <= max) return next;
  return next.slice(Math.max(0, next.length - max));
}

export async function runVerificationCommand(command: VerificationCommand, options: RunVerificationOptions): Promise<VerificationResult> {
  if (!command.command.trim()) throw new Error("verification command is required");
  const timeoutMs = options.timeoutMs ?? 30_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("verification timeout must be finite and positive");
  const maxOutputBytes = options.maxOutputBytes ?? 64_000;
  if (!Number.isFinite(maxOutputBytes) || maxOutputBytes <= 0) throw new Error("verification output bound must be finite and positive");

  return await new Promise((resolve) => {
    const child = spawn(command.command, command.args, {
      cwd: options.cwd,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout = appendBounded(stdout, chunk, maxOutputBytes);
    });
    child.stderr.on("data", (chunk: string) => {
      stderr = appendBounded(stderr, chunk, maxOutputBytes);
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({ command: command.command, args: command.args, cwd: options.cwd, exitCode: null, signal: null, stdout, stderr: appendBounded(stderr, error.message, maxOutputBytes), timedOut });
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({ command: command.command, args: command.args, cwd: options.cwd, exitCode, signal, stdout, stderr, timedOut });
    });
  });
}
