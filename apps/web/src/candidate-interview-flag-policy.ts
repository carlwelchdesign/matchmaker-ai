export const candidateInterviewFlagPolicyVersion =
  "candidate-interview-flag-policy/v1" as const;

export type CandidateInterviewFlagReason =
  "disabled" | "enabled" | "evaluation-error" | "invalid-value";

export type CandidateInterviewFlagDecision = {
  enabled: boolean;
  policyVersion: typeof candidateInterviewFlagPolicyVersion;
  reason: CandidateInterviewFlagReason;
  sensitiveAttributesStored: false;
};

export async function evaluateCandidateInterviewFlag(
  evaluate: () => unknown | Promise<unknown>,
): Promise<CandidateInterviewFlagDecision> {
  try {
    const value = await evaluate();
    if (value === true) return decision(true, "enabled");
    if (value === false) return decision(false, "disabled");
    return decision(false, "invalid-value");
  } catch {
    return decision(false, "evaluation-error");
  }
}

function decision(
  enabled: boolean,
  reason: CandidateInterviewFlagReason,
): CandidateInterviewFlagDecision {
  return {
    enabled,
    policyVersion: candidateInterviewFlagPolicyVersion,
    reason,
    sensitiveAttributesStored: false,
  };
}
