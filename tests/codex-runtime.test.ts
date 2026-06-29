import { chmodSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { buildCodexExecArgs, checkCodexAvailability, resolveCodexCommand } from "../src/codex-runtime.js";

describe("codex runtime", () => {
  test("resolves Codex command from CODEX_BIN only", () => {
    expect(resolveCodexCommand({ CODEX_BIN: "codex-custom" })).toBe("codex-custom");
    expect(resolveCodexCommand({ OPEN_GAMESTUDIO_CODEX_BIN: "legacy-codex" })).toBe("codex");
    expect(resolveCodexCommand({})).toBe("codex");
  });

  test("builds structured codex exec args with cwd, sandbox, and stdin prompt", () => {
    const args = buildCodexExecArgs({ projectRoot: "/repo", sandbox: "read-only", model: "gpt-5.5" });
    expect(args).toContain("exec");
    expect(args).toContain("--model");
    expect(args).toContain("gpt-5.5");
    expect(args).toContain("--cd");
    expect(args).toContain("/repo");
    expect(args).toContain("--sandbox");
    expect(args).toContain("read-only");
    expect(args).toContain("-");
  });

  test("reports availability failures without throwing", async () => {
    const result = await checkCodexAvailability({ codexBin: "/missing/codex" });
    expect(result.ok).toBe(false);
    expect(result.command).toBe("/missing/codex");
    expect(result.reason).toMatch(/not found|unavailable/i);
  });

  test("reports authenticated stub as available", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-codex-"));
    const stub = path.join(cwd, "codex-stub.mjs");
    writeFileSync(stub, "#!/usr/bin/env node\nconsole.log('codex 1.0.0');\n");
    chmodSync(stub, 0o755);
    const result = await checkCodexAvailability({ codexBin: stub });
    expect(result.ok).toBe(true);
    expect(result.command).toBe(stub);
  });
});
