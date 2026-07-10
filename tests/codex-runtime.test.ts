import { chmodSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, test } from "node:test";
import { expect } from "expect";
import { buildCodexExecArgs, checkCodexAvailability, executeCodexCommandWithFallback, resolveCodexCommand } from "../src/codex-runtime.js";

describe("codex runtime", () => {
  test("resolves Codex command from CODEX_BIN only", () => {
    expect(resolveCodexCommand({ CODEX_BIN: "codex-custom" })).toBe("codex-custom");
    expect(resolveCodexCommand({ OPEN_GAMESTUDIO_CODEX_BIN: "legacy-codex" })).toBe("codex");
    expect(resolveCodexCommand({})).toBe("codex");
  });

  test("builds structured codex exec args with cwd, sandbox, model, reasoning, and stdin prompt", () => {
    const args = buildCodexExecArgs({ projectRoot: "/repo", sandbox: "read-only", model: "gpt-5.6-sol", reasoningEffort: "high" });
    expect(args).toContain("exec");
    expect(args).toContain("--model");
    expect(args).toContain("gpt-5.6-sol");
    expect(args).toEqual(expect.arrayContaining(["-c", 'model_reasoning_effort="high"']));
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

  test("uses the designated fallback only when the primary model is unavailable", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-codex-fallback-"));
    const stub = path.join(cwd, "codex-stub.mjs");
    writeFileSync(stub, `#!/usr/bin/env node\nconst model = process.argv[process.argv.indexOf('--model') + 1];\nif (model === 'gpt-5.6-sol') { console.error('model gpt-5.6-sol is not available for this account'); process.exit(1); }\nconsole.log(model);\n`);
    chmodSync(stub, 0o755);
    const primary = { command: stub, args: buildCodexExecArgs({ projectRoot: cwd, model: "gpt-5.6-sol", reasoningEffort: "high" }) };
    const fallback = { command: stub, args: buildCodexExecArgs({ projectRoot: cwd, model: "gpt-5.5", reasoningEffort: "high" }) };

    const result = await executeCodexCommandWithFallback({ primary, fallback, primaryModel: "gpt-5.6-sol", fallbackModel: "gpt-5.5" }, "prompt", { cwd });

    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("gpt-5.5");
    expect(result.executedModel).toBe("gpt-5.5");
    expect(result.fallbackFromModel).toBe("gpt-5.6-sol");
  });

  test("does not hide ordinary execution failures behind a fallback", async () => {
    const cwd = mkdtempSync(path.join(tmpdir(), "ogs-codex-no-fallback-"));
    const stub = path.join(cwd, "codex-stub.mjs");
    writeFileSync(stub, "#!/usr/bin/env node\nconsole.error('tests failed'); process.exit(2);\n");
    chmodSync(stub, 0o755);
    const primary = { command: stub, args: buildCodexExecArgs({ projectRoot: cwd, model: "gpt-5.6-terra", reasoningEffort: "medium" }) };
    const fallback = { command: stub, args: buildCodexExecArgs({ projectRoot: cwd, model: "gpt-5.4", reasoningEffort: "medium" }) };

    const result = await executeCodexCommandWithFallback({ primary, fallback, primaryModel: "gpt-5.6-terra", fallbackModel: "gpt-5.4" }, "prompt", { cwd });

    expect(result.status).toBe(2);
    expect(result.executedModel).toBe("gpt-5.6-terra");
    expect(result.fallbackFromModel).toBeUndefined();
  });
});
