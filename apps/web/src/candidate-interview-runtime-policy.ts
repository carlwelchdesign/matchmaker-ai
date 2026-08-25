import type { CandidateInterviewFlagDecision } from "./candidate-interview-flag-policy";

export const candidateInterviewRuntimePolicyVersion =
  "candidate-interview-runtime-policy/v1" as const;

export type CandidateInterviewEnvironment =
  "development" | "preview" | "production" | "unknown";

export type CandidateInterviewReleaseGates = {
  readonly authorizationEnforced: boolean;
  readonly consentEnforced: boolean;
  readonly eligibilityEnforced: boolean;
  readonly providerKillSwitchEnforced: boolean;
  readonly retentionEnforced: boolean;
};

export type CandidateInterviewRuntimeReason =
  | "enabled-approved-release"
  | "enabled-synthetic-development"
  | "feature-disabled"
  | "flag-evaluation-error"
  | "flag-invalid-value"
  | "release-gates-closed"
  | "unknown-environment";

export type CandidateInterviewRuntimeDecision = {
  dataBoundary:
    "real-person-release" | "release-blocked" | "synthetic-development";
  enabled: boolean;
  policyVersion: typeof candidateInterviewRuntimePolicyVersion;
  reason: CandidateInterviewRuntimeReason;
  sensitiveAttributesStored: false;
};

export const unapprovedCandidateInterviewReleaseGates: CandidateInterviewReleaseGates =
  Object.freeze({
    authorizationEnforced: false,
    consentEnforced: false,
    eligibilityEnforced: false,
    providerKillSwitchEnforced: false,
    retentionEnforced: false,
  });

export function evaluateCandidateInterviewRuntime({
  environment,
  flagDecision,
  releaseGates,
  syntheticDataOnly,
}: Readonly<{
  environment: CandidateInterviewEnvironment;
  flagDecision: CandidateInterviewFlagDecision;
  releaseGates: CandidateInterviewReleaseGates;
  syntheticDataOnly: boolean;
}>): CandidateInterviewRuntimeDecision {
  if (!flagDecision.enabled) {
    return blocked(flagReason(flagDecision.reason));
  }

  if (environment === "development" && syntheticDataOnly) {
    return decision(
      true,
      "enabled-synthetic-development",
      "synthetic-development",
    );
  }

  if (environment === "unknown") {
    return blocked("unknown-environment");
  }

  if (!allReleaseGatesEnforced(releaseGates)) {
    return blocked("release-gates-closed");
  }

  return decision(true, "enabled-approved-release", "real-person-release");
}

export function resolveCandidateInterviewEnvironment({
  nodeEnvironment,
  vercelEnvironment,
}: Readonly<{
  nodeEnvironment?: string;
  vercelEnvironment?: string;
}>): CandidateInterviewEnvironment {
  if (
    vercelEnvironment === "development" ||
    vercelEnvironment === "preview" ||
    vercelEnvironment === "production"
  ) {
    return vercelEnvironment;
  }
  if (nodeEnvironment === "development") return "development";
  return "unknown";
}

function allReleaseGatesEnforced(
  gates: CandidateInterviewReleaseGates,
): boolean {
  return (
    gates.authorizationEnforced === true &&
    gates.consentEnforced === true &&
    gates.eligibilityEnforced === true &&
    gates.providerKillSwitchEnforced === true &&
    gates.retentionEnforced === true
  );
}

function flagReason(
  reason: CandidateInterviewFlagDecision["reason"],
): CandidateInterviewRuntimeReason {
  if (reason === "evaluation-error") return "flag-evaluation-error";
  if (reason === "invalid-value") return "flag-invalid-value";
  return "feature-disabled";
}

function blocked(
  reason: CandidateInterviewRuntimeReason,
): CandidateInterviewRuntimeDecision {
  return decision(false, reason, "release-blocked");
}

function decision(
  enabled: boolean,
  reason: CandidateInterviewRuntimeReason,
  dataBoundary: CandidateInterviewRuntimeDecision["dataBoundary"],
): CandidateInterviewRuntimeDecision {
  return {
    dataBoundary,
    enabled,
    policyVersion: candidateInterviewRuntimePolicyVersion,
    reason,
    sensitiveAttributesStored: false,
  };
}
