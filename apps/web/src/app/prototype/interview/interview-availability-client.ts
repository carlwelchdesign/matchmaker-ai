import {
  candidateInterviewRuntimePolicyVersion,
  type CandidateInterviewRuntimeDecision,
} from "../../../candidate-interview-runtime-policy";

export const interviewAvailabilityRefreshIntervalMs = 60_000;
const availabilityEndpoint = "/api/prototype/interview-availability";

const runtimeReasons = new Set<CandidateInterviewRuntimeDecision["reason"]>([
  "enabled-approved-release",
  "enabled-synthetic-development",
  "feature-disabled",
  "flag-evaluation-error",
  "flag-invalid-value",
  "release-gates-closed",
  "unknown-environment",
]);

const dataBoundaries = new Set<
  CandidateInterviewRuntimeDecision["dataBoundary"]
>(["real-person-release", "release-blocked", "synthetic-development"]);

export type InterviewAvailabilityResult =
  | CandidateInterviewRuntimeDecision
  | {
      dataBoundary: "release-blocked";
      enabled: false;
      policyVersion: typeof candidateInterviewRuntimePolicyVersion;
      reason: "invalid-response" | "stale-policy" | "transport-error";
      sensitiveAttributesStored: false;
    };

export function parseInterviewAvailabilityResponse(
  value: unknown,
): InterviewAvailabilityResult {
  if (!isRecord(value)) return clientFailure("invalid-response");
  if (typeof value.policyVersion !== "string") {
    return clientFailure("invalid-response");
  }
  if (value.policyVersion !== candidateInterviewRuntimePolicyVersion) {
    return clientFailure("stale-policy");
  }
  if (
    !dataBoundaries.has(
      value.dataBoundary as CandidateInterviewRuntimeDecision["dataBoundary"],
    ) ||
    typeof value.enabled !== "boolean" ||
    !runtimeReasons.has(
      value.reason as CandidateInterviewRuntimeDecision["reason"],
    ) ||
    value.sensitiveAttributesStored !== false
  ) {
    return clientFailure("invalid-response");
  }

  const decision = {
    dataBoundary:
      value.dataBoundary as CandidateInterviewRuntimeDecision["dataBoundary"],
    enabled: value.enabled,
    policyVersion: candidateInterviewRuntimePolicyVersion,
    reason: value.reason as CandidateInterviewRuntimeDecision["reason"],
    sensitiveAttributesStored: false as const,
  };
  if (!isConsistentRuntimeDecision(decision)) {
    return clientFailure("invalid-response");
  }

  return decision;
}

export function createInterviewAvailabilityTransportFailure(): InterviewAvailabilityResult {
  return clientFailure("transport-error");
}

export async function fetchInterviewAvailability({
  request = fetch,
  signal,
}: Readonly<{
  request?: typeof fetch;
  signal: AbortSignal;
}>): Promise<InterviewAvailabilityResult> {
  try {
    const response = await request(availabilityEndpoint, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal,
    });
    if (!response.ok) return createInterviewAvailabilityTransportFailure();

    return parseInterviewAvailabilityResponse(await response.json());
  } catch {
    return createInterviewAvailabilityTransportFailure();
  }
}

function clientFailure(
  reason: Extract<
    InterviewAvailabilityResult["reason"],
    "invalid-response" | "stale-policy" | "transport-error"
  >,
): InterviewAvailabilityResult {
  return {
    dataBoundary: "release-blocked",
    enabled: false,
    policyVersion: candidateInterviewRuntimePolicyVersion,
    reason,
    sensitiveAttributesStored: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isConsistentRuntimeDecision(
  decision: CandidateInterviewRuntimeDecision,
): boolean {
  if (decision.enabled) {
    if (decision.reason === "enabled-synthetic-development") {
      return decision.dataBoundary === "synthetic-development";
    }
    return (
      decision.reason === "enabled-approved-release" &&
      decision.dataBoundary === "real-person-release"
    );
  }

  return (
    decision.dataBoundary === "release-blocked" &&
    decision.reason !== "enabled-approved-release" &&
    decision.reason !== "enabled-synthetic-development"
  );
}
