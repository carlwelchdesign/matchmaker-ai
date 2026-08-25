export const interviewFeeDecisionSchemaVersion =
  "interview-fee-decision/v1" as const;

export type InterviewPilotPhase = "first-pilot" | "post-pilot";
export type InterviewAbuseControlState = "planned" | "verified";

export interface InterviewFeeDecisionInput {
  readonly accountVerificationState: InterviewAbuseControlState;
  readonly candidateSubmissionFeeMicrousd: number;
  readonly decisionId: string;
  readonly dec016SupersessionKey: string | null;
  readonly fairnessReviewKey: string | null;
  readonly founderApprovalKey: string | null;
  readonly invitationControlState: InterviewAbuseControlState;
  readonly legalReviewKey: string | null;
  readonly pilotPhase: InterviewPilotPhase;
  readonly pricingApprovalKey: string | null;
  readonly rateLimitState: InterviewAbuseControlState;
  readonly refundPolicyKey: string | null;
}

export interface InterviewFeeDecision extends InterviewFeeDecisionInput {
  readonly abuseControlsVerified: boolean;
  readonly candidateApplicationFree: boolean;
  readonly paymentCredentialsStored: false;
  readonly schemaVersion: typeof interviewFeeDecisionSchemaVersion;
}

const inputKeys = [
  "accountVerificationState",
  "candidateSubmissionFeeMicrousd",
  "decisionId",
  "dec016SupersessionKey",
  "fairnessReviewKey",
  "founderApprovalKey",
  "invitationControlState",
  "legalReviewKey",
  "pilotPhase",
  "pricingApprovalKey",
  "rateLimitState",
  "refundPolicyKey",
] as const;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pilotPhases = new Set<InterviewPilotPhase>(["first-pilot", "post-pilot"]);
const controlStates = new Set<InterviewAbuseControlState>([
  "planned",
  "verified",
]);

export function createInterviewFeeDecision(
  input: unknown,
): InterviewFeeDecision {
  if (!isRecord(input) || !hasExactKeys(input, inputKeys)) {
    throw new Error("Interview fee decision has unexpected or missing fields");
  }

  const candidateSubmissionFeeMicrousd = requireNonNegativeInteger(
    input.candidateSubmissionFeeMicrousd,
    "Candidate submission fee",
  );
  const accountVerificationState = requireEnum(
    input.accountVerificationState,
    controlStates,
    "Account verification state",
  );
  const invitationControlState = requireEnum(
    input.invitationControlState,
    controlStates,
    "Invitation control state",
  );
  const rateLimitState = requireEnum(
    input.rateLimitState,
    controlStates,
    "Rate-limit state",
  );
  const abuseControlsVerified =
    accountVerificationState === "verified" &&
    invitationControlState === "verified" &&
    rateLimitState === "verified";

  const decision: InterviewFeeDecision = {
    abuseControlsVerified,
    accountVerificationState,
    candidateApplicationFree: candidateSubmissionFeeMicrousd === 0,
    candidateSubmissionFeeMicrousd,
    decisionId: requireIdentifier(input.decisionId, "Decision ID"),
    dec016SupersessionKey: requireNullableIdentifier(
      input.dec016SupersessionKey,
      "DEC-016 supersession key",
    ),
    fairnessReviewKey: requireNullableIdentifier(
      input.fairnessReviewKey,
      "Fairness review key",
    ),
    founderApprovalKey: requireNullableIdentifier(
      input.founderApprovalKey,
      "Founder approval key",
    ),
    invitationControlState,
    legalReviewKey: requireNullableIdentifier(
      input.legalReviewKey,
      "Legal review key",
    ),
    paymentCredentialsStored: false,
    pilotPhase: requireEnum(input.pilotPhase, pilotPhases, "Pilot phase"),
    pricingApprovalKey: requireNullableIdentifier(
      input.pricingApprovalKey,
      "Pricing approval key",
    ),
    rateLimitState,
    refundPolicyKey: requireNullableIdentifier(
      input.refundPolicyKey,
      "Refund policy key",
    ),
    schemaVersion: interviewFeeDecisionSchemaVersion,
  };

  if (candidateSubmissionFeeMicrousd > 0) validatePaidDecision(decision);
  return decision;
}

function validatePaidDecision(decision: InterviewFeeDecision): void {
  if (!decision.abuseControlsVerified) {
    throw new Error(
      "Candidate fees require verified account, invitation, and rate-limit controls",
    );
  }
  const approvalKeys = [
    decision.dec016SupersessionKey,
    decision.fairnessReviewKey,
    decision.founderApprovalKey,
    decision.legalReviewKey,
    decision.pricingApprovalKey,
    decision.refundPolicyKey,
  ];
  if (approvalKeys.some((key) => key === null)) {
    throw new Error(
      "Candidate fees require DEC-016 supersession and founder, legal, fairness, pricing, and refund approval",
    );
  }
}

function requireEnum<T extends string>(
  value: unknown,
  allowed: ReadonlySet<T>,
  label: string,
): T {
  if (typeof value === "string" && allowed.has(value as T)) return value as T;
  throw new Error(`${label} is invalid`);
}

function requireIdentifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be a lowercase identifier`);
  }
  return value;
}

function requireNullableIdentifier(
  value: unknown,
  label: string,
): string | null {
  if (value === null) return null;
  return requireIdentifier(value, label);
}

function requireNonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const actualKeys = Object.keys(value).sort();
  return (
    actualKeys.length === expectedKeys.length &&
    [...expectedKeys].sort().every((key, index) => key === actualKeys[index])
  );
}
