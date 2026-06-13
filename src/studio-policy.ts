export type ProjectStage = "design" | "prototype" | "development";
export type StudioMode = "fast-prototype" | "guided-studio" | "strict-studio";
export type ApprovalPolicy = "advisory" | "approval-or-override" | "approval-required";
export type WritePolicy = "read-only" | "advisory-write" | "approved-write" | "override-write";
export type CodexSandboxMode = "read-only" | "workspace-write" | "danger-full-access";
export type CodexStudioPhase = "plan" | "implement" | "review" | "fix" | "ship";

export type StudioPolicyOptions = {
  hasMatchingApproval?: boolean;
  approvedByUser?: boolean;
};

export type CodexPermissionOptions = {
  constrainedSandbox?: boolean;
};

export type CodexPermission = {
  allowFileEdits: boolean;
  codexSandbox: CodexSandboxMode;
};

export type ApprovalRequirement = {
  projectStage: ProjectStage;
  studioMode: StudioMode;
  phase: CodexStudioPhase;
  approvalPolicy: ApprovalPolicy;
  reason: string;
};

export type StudioRunEligibilityInput = StudioPolicyOptions &
  CodexPermissionOptions & {
    projectStage: ProjectStage;
    studioMode: StudioMode;
    phase: CodexStudioPhase;
  };

export type StudioRunEligibility = CodexPermission & {
  allowed: boolean;
  writePolicy: WritePolicy;
  reason: string;
  requiredApproval?: ApprovalRequirement;
  metadata: Record<string, unknown>;
};

function isReadOnlyPhase(phase: CodexStudioPhase): boolean {
  return phase === "plan" || phase === "review" || phase === "ship";
}

function isMutatingPhase(phase: CodexStudioPhase): boolean {
  return phase === "implement" || phase === "fix";
}

export function defaultApprovalPolicyForStudioMode(mode: StudioMode): ApprovalPolicy {
  const defaults: Record<StudioMode, ApprovalPolicy> = {
    "fast-prototype": "advisory",
    "guided-studio": "approval-or-override",
    "strict-studio": "approval-required"
  };
  return defaults[mode];
}

export function defaultWritePolicyForStudioMode(mode: StudioMode, phase: CodexStudioPhase, options: StudioPolicyOptions = {}): WritePolicy {
  if (isReadOnlyPhase(phase)) return "read-only";

  const approvalPolicy = defaultApprovalPolicyForStudioMode(mode);
  switch (approvalPolicy) {
    case "advisory":
      return isMutatingPhase(phase) ? "advisory-write" : "read-only";
    case "approval-or-override":
      if (!isMutatingPhase(phase)) return "read-only";
      if (options.hasMatchingApproval) return "approved-write";
      if (options.approvedByUser) return "override-write";
      return "read-only";
    case "approval-required":
      return isMutatingPhase(phase) && options.hasMatchingApproval ? "approved-write" : "read-only";
  }

  const exhaustive: never = approvalPolicy;
  return exhaustive;
}

export function codexPermissionForWritePolicy(writePolicy: WritePolicy, options: CodexPermissionOptions = {}): CodexPermission {
  if (writePolicy === "read-only") {
    return {
      allowFileEdits: false,
      codexSandbox: "read-only"
    };
  }

  return {
    allowFileEdits: true,
    codexSandbox: options.constrainedSandbox ? "workspace-write" : "danger-full-access"
  };
}

function provenanceForWritePolicy(writePolicy: WritePolicy): string {
  const provenance: Record<WritePolicy, string> = {
    "read-only": "read-only",
    "advisory-write": "advisory",
    "approved-write": "approval",
    "override-write": "override"
  };
  return provenance[writePolicy];
}

function requiredApprovalFor(input: StudioRunEligibilityInput, approvalPolicy: ApprovalPolicy): ApprovalRequirement {
  return {
    projectStage: input.projectStage,
    studioMode: input.studioMode,
    phase: input.phase,
    approvalPolicy,
    reason:
      approvalPolicy === "approval-required"
        ? "Strict studio implementation and fix phases require a matching approval."
        : "Guided studio implementation and fix phases require a matching approval or explicit override."
  };
}

export function evaluateStudioRunEligibility(input: StudioRunEligibilityInput): StudioRunEligibility {
  const approvalPolicy = defaultApprovalPolicyForStudioMode(input.studioMode);
  const writePolicy = defaultWritePolicyForStudioMode(input.studioMode, input.phase, input);
  const permission = codexPermissionForWritePolicy(writePolicy, input);
  const mutatingPhase = isMutatingPhase(input.phase);
  const blockedForApproval = mutatingPhase && writePolicy === "read-only" && approvalPolicy !== "advisory";
  const requiredApproval = blockedForApproval ? requiredApprovalFor(input, approvalPolicy) : undefined;

  return {
    allowed: !blockedForApproval,
    writePolicy,
    ...permission,
    reason: requiredApproval?.reason ?? (writePolicy === "read-only" ? "This studio phase is read-only." : `Allowed with ${provenanceForWritePolicy(writePolicy)} write policy.`),
    requiredApproval,
    metadata: {
      projectStage: input.projectStage,
      studioMode: input.studioMode,
      phase: input.phase,
      approvalPolicy,
      writePolicy,
      provenance: provenanceForWritePolicy(writePolicy),
      hasMatchingApproval: input.hasMatchingApproval === true,
      approvedByUser: input.approvedByUser === true,
      constrainedSandbox: input.constrainedSandbox === true
    }
  };
}
