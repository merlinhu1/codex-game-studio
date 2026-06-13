import { describe, expect, test } from "vitest";
import {
  codexPermissionForWritePolicy,
  defaultApprovalPolicyForStudioMode,
  defaultWritePolicyForStudioMode,
  evaluateStudioRunEligibility,
  type ProjectStage,
  type StudioMode
} from "../src/studio-policy.js";

describe("studio policy primitives", () => {
  test("project stage and studio mode are independent policy axes", () => {
    const stages: ProjectStage[] = ["design", "prototype", "development"];
    const modes: StudioMode[] = ["fast-prototype", "guided-studio", "strict-studio"];

    for (const projectStage of stages) {
      expect(defaultApprovalPolicyForStudioMode("guided-studio")).toBe("approval-or-override");
      expect(
        evaluateStudioRunEligibility({
          projectStage,
          studioMode: "guided-studio",
          phase: "implement",
          hasMatchingApproval: true
        })
      ).toMatchObject({
        allowed: true,
        writePolicy: "approved-write",
        metadata: {
          projectStage,
          studioMode: "guided-studio",
          approvalPolicy: "approval-or-override"
        }
      });
    }

    for (const studioMode of modes) {
      expect(
        evaluateStudioRunEligibility({
          projectStage: "prototype",
          studioMode,
          phase: "plan"
        })
      ).toMatchObject({
        allowed: true,
        writePolicy: "read-only",
        metadata: {
          projectStage: "prototype",
          studioMode
        }
      });
    }
  });

  test("studio modes define approval policy defaults", () => {
    expect(defaultApprovalPolicyForStudioMode("fast-prototype")).toBe("advisory");
    expect(defaultApprovalPolicyForStudioMode("guided-studio")).toBe("approval-or-override");
    expect(defaultApprovalPolicyForStudioMode("strict-studio")).toBe("approval-required");
  });

  test("plan, review, and ship phases are read-only in every studio mode", () => {
    for (const studioMode of ["fast-prototype", "guided-studio", "strict-studio"] satisfies StudioMode[]) {
      for (const phase of ["plan", "review", "ship"] as const) {
        expect(defaultWritePolicyForStudioMode(studioMode, phase, { hasMatchingApproval: true, approvedByUser: true })).toBe("read-only");
        expect(
          evaluateStudioRunEligibility({
            projectStage: "development",
            studioMode,
            phase,
            hasMatchingApproval: true,
            approvedByUser: true
          })
        ).toMatchObject({
          allowed: true,
          writePolicy: "read-only",
          allowFileEdits: false,
          codexSandbox: "read-only"
        });
      }
    }
  });

  test("implementation and fix eligibility follows studio-mode approval rules", () => {
    for (const phase of ["implement", "fix"] as const) {
      expect(defaultWritePolicyForStudioMode("fast-prototype", phase)).toBe("advisory-write");
      expect(evaluateStudioRunEligibility({ projectStage: "prototype", studioMode: "fast-prototype", phase })).toMatchObject({
        allowed: true,
        writePolicy: "advisory-write",
        allowFileEdits: true,
        codexSandbox: "danger-full-access",
        metadata: {
          provenance: "advisory"
        }
      });

      expect(evaluateStudioRunEligibility({ projectStage: "prototype", studioMode: "guided-studio", phase })).toMatchObject({
        allowed: false,
        writePolicy: "read-only",
        allowFileEdits: false,
        codexSandbox: "read-only",
        requiredApproval: {
          approvalPolicy: "approval-or-override",
          studioMode: "guided-studio",
          phase
        }
      });
      expect(evaluateStudioRunEligibility({ projectStage: "prototype", studioMode: "guided-studio", phase, hasMatchingApproval: true })).toMatchObject({
        allowed: true,
        writePolicy: "approved-write",
        allowFileEdits: true,
        codexSandbox: "danger-full-access",
        metadata: {
          provenance: "approval"
        }
      });
      expect(evaluateStudioRunEligibility({ projectStage: "prototype", studioMode: "guided-studio", phase, approvedByUser: true })).toMatchObject({
        allowed: true,
        writePolicy: "override-write",
        allowFileEdits: true,
        codexSandbox: "danger-full-access",
        metadata: {
          provenance: "override"
        }
      });

      expect(evaluateStudioRunEligibility({ projectStage: "development", studioMode: "strict-studio", phase })).toMatchObject({
        allowed: false,
        writePolicy: "read-only",
        allowFileEdits: false,
        codexSandbox: "read-only",
        requiredApproval: {
          approvalPolicy: "approval-required",
          studioMode: "strict-studio",
          phase
        }
      });
      expect(evaluateStudioRunEligibility({ projectStage: "development", studioMode: "strict-studio", phase, approvedByUser: true })).toMatchObject({
        allowed: false,
        writePolicy: "read-only",
        allowFileEdits: false,
        codexSandbox: "read-only"
      });
      expect(evaluateStudioRunEligibility({ projectStage: "development", studioMode: "strict-studio", phase, hasMatchingApproval: true })).toMatchObject({
        allowed: true,
        writePolicy: "approved-write",
        allowFileEdits: true,
        codexSandbox: "danger-full-access",
        metadata: {
          provenance: "approval"
        }
      });
    }
  });

  test("mutating write policies default to danger-full-access unless constrained explicitly", () => {
    for (const writePolicy of ["advisory-write", "approved-write", "override-write"] as const) {
      expect(codexPermissionForWritePolicy(writePolicy)).toEqual({
        allowFileEdits: true,
        codexSandbox: "danger-full-access"
      });
      expect(codexPermissionForWritePolicy(writePolicy, { constrainedSandbox: true })).toEqual({
        allowFileEdits: true,
        codexSandbox: "workspace-write"
      });
    }

    expect(codexPermissionForWritePolicy("read-only", { constrainedSandbox: true })).toEqual({
      allowFileEdits: false,
      codexSandbox: "read-only"
    });
  });
});
