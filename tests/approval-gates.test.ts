import { mkdirSync, symlinkSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  approvalMatches,
  approvalStages,
  canonicalObjectiveSha256,
  createEmptyApprovalStore,
  explainApprovalMismatch,
  normalizeApprovalScope,
  validateApprovalStore,
  type ApprovalRecord
} from "../src/approvals.js";

const baseRecord: ApprovalRecord = {
  id: "appr_test",
  stage: "approved",
  role: "Gameplay-Programmer",
  objectiveSha256: canonicalObjectiveSha256({
    role: "gameplay-programmer",
    objective: "Implement jump feel",
    approvedGlobs: ["source/**/*.ts"],
    approvedFiles: ["documentation/design/gdd.md"],
    projectStage: "prototype",
    studioMode: "guided-studio"
  }),
  approvedGlobs: ["source/**/*.ts"],
  approvedFiles: ["documentation/design/gdd.md"],
  source: "draft-workflow",
  approvedBy: "designer",
  approvedAt: "2026-06-13T00:00:00.000Z",
  baseline: {
    gitHead: "abc123",
    diffSha256: "0".repeat(64),
    contextManifestSha256: "1".repeat(64)
  }
};

describe("approval gates", () => {
  test("approval stages include draft workflow lifecycle states", () => {
    expect(approvalStages).toEqual(["question", "options", "decision", "draft", "approved", "implemented", "reviewed", "blocked"]);
    for (const stage of approvalStages) {
      expect(validateApprovalStore({ ...createEmptyApprovalStore(), records: [{ ...baseRecord, stage }] }).ok).toBe(true);
    }
  });

  test("canonical objective hash normalizes role objective scope and selected axes", () => {
    const first = canonicalObjectiveSha256({
      role: " Gameplay-Programmer ",
      objective: "Implement   jump\nfeel",
      approvedGlobs: ["source/**/*.ts", "documentation/design/gdd.md"],
      approvedFiles: ["source/player.ts"],
      projectStage: "prototype",
      studioMode: "guided-studio"
    });
    const same = canonicalObjectiveSha256({
      role: "gameplay-programmer",
      objective: "Implement jump feel",
      approvedGlobs: ["documentation/design/gdd.md", "source/**/*.ts"],
      approvedFiles: ["source/player.ts"],
      projectStage: "prototype",
      studioMode: "guided-studio"
    });
    const differentMode = canonicalObjectiveSha256({
      role: "gameplay-programmer",
      objective: "Implement jump feel",
      approvedGlobs: ["documentation/design/gdd.md", "source/**/*.ts"],
      approvedFiles: ["source/player.ts"],
      projectStage: "prototype",
      studioMode: "strict-studio"
    });
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toBe(same);
    expect(first).not.toBe(differentMode);
  });

  test("scope normalization rejects unsafe approval scope", () => {
    const projectRoot = mkdtempSync(path.join(tmpdir(), "ogs-approval-"));
    const outside = mkdtempSync(path.join(tmpdir(), "ogs-outside-"));
    mkdirSync(path.join(projectRoot, "source"), { recursive: true });
    symlinkSync(outside, path.join(projectRoot, "source", "outside-link"));

    expect(() => normalizeApprovalScope(["/tmp/game.ts"], { projectRoot })).toThrow(/absolute/i);
    expect(() => normalizeApprovalScope([" C:/tmp/game.ts "], { projectRoot })).toThrow(/absolute/i);
    expect(() => normalizeApprovalScope([" C:\\tmp\\game.ts "], { projectRoot })).toThrow(/absolute/i);
    expect(() => normalizeApprovalScope(["../game.ts"], { projectRoot })).toThrow(/parent traversal/i);
    expect(() => normalizeApprovalScope(["source/\u0001.ts"], { projectRoot })).toThrow(/control/i);
    expect(() => normalizeApprovalScope([".env"], { projectRoot })).toThrow(/secret/i);
    expect(() => normalizeApprovalScope(["source/outside-link/file.ts"], { projectRoot })).toThrow(/symlink/i);
    expect(normalizeApprovalScope(["source\\player.ts", "source/**/*.ts"], { projectRoot })).toEqual(["source/**/*.ts", "source/player.ts"]);
  });

  test("approval matching ignores revoked expired or mismatched approvals", () => {
    const store = createEmptyApprovalStore();
    store.records.push(
      { ...baseRecord, id: "appr_revoked", revokedAt: "2026-06-13T01:00:00.000Z" },
      { ...baseRecord, id: "appr_expired", expiresAt: "2026-06-12T00:00:00.000Z" },
      { ...baseRecord, id: "appr_match" }
    );

    expect(
      approvalMatches(store, {
        role: "gameplay-programmer",
        objective: "Implement jump feel",
        approvedGlobs: ["source/**/*.ts"],
        approvedFiles: ["documentation/design/gdd.md"],
        projectStage: "prototype",
        studioMode: "guided-studio",
        now: new Date("2026-06-13T00:00:00.000Z")
      })
    ).toMatchObject({ matched: true, record: { id: "appr_match" } });

    expect(
      approvalMatches(store, {
        role: "gameplay-programmer",
        objective: "Implement jump feel",
        approvedGlobs: ["source/**/*.ts"],
        projectStage: "prototype",
        studioMode: "strict-studio",
        now: new Date("2026-06-13T00:00:00.000Z")
      })
    ).toMatchObject({ matched: false, reasons: expect.arrayContaining([expect.stringMatching(/objective hash/i)]) });
  });

  test("approval mismatch diagnostics show revoked and expired approvals as non-authorizing", () => {
    const store = createEmptyApprovalStore();
    store.records.push(
      { ...baseRecord, id: "approval-001", revokedAt: "2026-06-13T01:00:00.000Z" },
      { ...baseRecord, id: "approval-002", expiresAt: "2026-06-12T00:00:00.000Z" }
    );

    const diagnostic = explainApprovalMismatch(store, {
      role: "gameplay-programmer",
      objective: "Implement jump feel",
      approvedGlobs: ["source/**/*.ts"],
      approvedFiles: ["documentation/design/gdd.md"],
      projectStage: "prototype",
      studioMode: "guided-studio",
      now: new Date("2026-06-13T02:00:00.000Z")
    });

    expect(diagnostic.matched).toBe(false);
    expect(diagnostic.objectiveSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(diagnostic.reasons).toEqual(expect.arrayContaining(["approval revoked", "approval expired"]));
    expect(diagnostic.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "approval-001", authorizing: false, reasons: ["approval revoked"] }),
        expect.objectContaining({ id: "approval-002", authorizing: false, reasons: ["approval expired"] })
      ])
    );
  });

  test("malformed approval store fails validation with clear diagnostics", () => {
    const result = validateApprovalStore({
      schemaVersion: 1,
      product: "codex-game-studio",
      records: [{ ...baseRecord, stage: "unknown", approvedGlobs: ["../escape.ts"] }]
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/stage/i);
    expect(result.errors.join("\n")).toMatch(/approvedGlobs/i);
  });

  test("approval store validation rejects non-ISO approval timestamps", () => {
    const result = validateApprovalStore({
      ...createEmptyApprovalStore(),
      records: [{ ...baseRecord, approvedAt: "June 13 2026" }]
    });

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/approvedAt.*ISO timestamp/i);
  });

  test("approval store validation rejects duplicate approval ids", () => {
    const result = validateApprovalStore({
      ...createEmptyApprovalStore(),
      records: [
        { ...baseRecord, id: "approval-001" },
        { ...baseRecord, id: "approval-001" }
      ]
    });

    expect(result.ok).toBe(false);
    expect(result.errors.join("\n")).toMatch(/duplicate.*approval-001/i);
  });
});
