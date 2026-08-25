import {
  candidateInterviewFlagPolicyVersion,
  type CandidateInterviewFlagDecision,
} from "../../../candidate-interview-flag-policy";

export const interviewAvailabilityRefreshIntervalMs = 60_000;
const availabilityEndpoint = "/api/prototype/interview-availability";

const flagReasons = new Set<CandidateInterviewFlagDecision["reason"]>([
  "disabled",
  "enabled",
  "evaluation-error",
  "invalid-value",
]);

export type InterviewAvailabilityResult =
  | CandidateInterviewFlagDecision
  | {
      enabled: false;
      policyVersion: typeof candidateInterviewFlagPolicyVersion;
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
  if (value.policyVersion !== candidateInterviewFlagPolicyVersion) {
    return clientFailure("stale-policy");
  }
  if (
    typeof value.enabled !== "boolean" ||
    !flagReasons.has(
      value.reason as CandidateInterviewFlagDecision["reason"],
    ) ||
    value.sensitiveAttributesStored !== false
  ) {
    return clientFailure("invalid-response");
  }

  return {
    enabled: value.enabled,
    policyVersion: candidateInterviewFlagPolicyVersion,
    reason: value.reason as CandidateInterviewFlagDecision["reason"],
    sensitiveAttributesStored: false,
  };
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
    enabled: false,
    policyVersion: candidateInterviewFlagPolicyVersion,
    reason,
    sensitiveAttributesStored: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
