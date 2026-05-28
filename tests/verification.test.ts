import { writeFileSync, chmodSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { runVerificationCommand } from "../src/verification.js";

describe("verification runner", () => {
  test("runs structured argv with cwd and captures output", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-verify-"));
    const script = path.join(cwd, "verify.mjs");
    writeFileSync(script, "console.log(process.cwd()); console.error(process.argv.slice(2).join('|'));\n");
    const result = await runVerificationCommand({ command: process.execPath, args: [script, "a b", "\"quoted\""] }, { cwd, timeoutMs: 1000 });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(cwd);
    expect(result.stderr).toContain("a b|\"quoted\"");
    expect(result.timedOut).toBe(false);
  });

  test("reports nonzero, timeout, and bounded output", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-verify-"));
    const fail = await runVerificationCommand({ command: process.execPath, args: ["-e", "process.exit(3)"] }, { cwd, timeoutMs: 1000 });
    expect(fail.exitCode).toBe(3);
    const timeout = await runVerificationCommand({ command: process.execPath, args: ["-e", "setTimeout(()=>{}, 5000)"] }, { cwd, timeoutMs: 50 });
    expect(timeout.timedOut).toBe(true);
    const noisy = await runVerificationCommand({ command: process.execPath, args: ["-e", "console.log('x'.repeat(1000))"] }, { cwd, timeoutMs: 1000, maxOutputBytes: 20 });
    expect(noisy.stdout.length).toBeLessThanOrEqual(20);
  });

  test("does not require shell scripts", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-verify-"));
    const script = path.join(cwd, "ok");
    writeFileSync(script, "#!/usr/bin/env node\nconsole.log('ok')\n");
    chmodSync(script, 0o755);
    const result = await runVerificationCommand({ command: script, args: [] }, { cwd, timeoutMs: 1000 });
    expect(result.stdout).toContain("ok");
  });
});
