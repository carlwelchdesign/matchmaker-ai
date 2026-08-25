import {
  candidateInterviewReviewSchemaVersion,
  type CandidateFieldDisposition,
  type CandidateInterviewReview,
} from "./candidate-interview.js";

export const candidateIntelligenceSchemaVersion =
  "candidate-intelligence-record/v1" as const;

export type CandidateUsePurpose =
  "candidate-analytics" | "matchmaker-discovery";

export type CandidateAccessRole = "data-analyst" | "matchmaker";

export type CandidateAssertionStatus =
  "active" | "disputed" | "stale" | "superseded" | "withdrawn";

export type CandidateFieldKnowledgeState =
  CandidateAssertionStatus | "declined" | "private" | "rejected" | "unknown";

export type CandidateAutomationLineageInput =
  | {
      readonly kind: "ai-execution";
      readonly costLedgerEntryId: string;
      readonly executionId: string;
      readonly modelVersion: string;
      readonly promptVersion: string;
    }
  | {
      readonly kind: "deterministic-template";
      readonly plannerVersion: string;
    };

export interface CandidatePermissionInput {
  readonly allowedRoles: readonly CandidateAccessRole[];
  readonly consentGrantId: string;
  readonly freshUntil: string;
  readonly purposes: readonly CandidateUsePurpose[];
  readonly retainUntil: string;
}

export interface CandidateIntelligenceInput {
  readonly automationLineageByQuestionId?: Readonly<
    Record<string, CandidateAutomationLineageInput>
  >;
  readonly candidateId: string;
  readonly permissionByQuestionId: Readonly<
    Record<string, CandidatePermissionInput>
  >;
  readonly review: CandidateInterviewReview;
  readonly reviewedAt: string;
}

export interface CandidateAssertionTransition {
  readonly at: string;
  readonly from: CandidateAssertionStatus;
  readonly reasonCode: string;
  readonly replacementAssertionId?: string;
  readonly to: CandidateAssertionStatus;
}

export interface CandidateApprovedAssertion {
  readonly assertionId: string;
  readonly candidateId: string;
  readonly classification: "restricted-candidate-approved";
  readonly fieldLabel: string;
  readonly lifecycle: {
    readonly history: readonly CandidateAssertionTransition[];
    readonly status: CandidateAssertionStatus;
  };
  readonly permission: {
    readonly allowedRoles: readonly CandidateAccessRole[];
    readonly consentGrantId: string;
    readonly freshUntil: string;
    readonly purposes: readonly CandidateUsePurpose[];
    readonly retainUntil: string;
  };
  readonly provenance: {
    readonly automation: CandidateAutomationLineageInput | null;
    readonly derivation: "source-exact";
    readonly guideVersion: string;
    readonly questionId: string;
    readonly responseRevision: number;
    readonly reviewedAt: string;
    readonly reviewSchemaVersion: typeof candidateInterviewReviewSchemaVersion;
  };
  readonly retentionClass: "candidate-controlled";
  readonly topic: string;
  readonly value: string;
}

export interface CandidateFieldState {
  readonly eligibleForAnalytics: false;
  readonly eligibleForDiscovery: false;
  readonly fieldLabel: string;
  readonly questionId: string | null;
  readonly responseRevision: number | null;
  readonly state: CandidateFieldKnowledgeState;
  readonly topic: string;
}

export interface CandidateIntelligenceRecord {
  readonly assertions: readonly CandidateApprovedAssertion[];
  readonly candidateId: string;
  readonly fieldStates: readonly CandidateFieldState[];
  readonly schemaVersion: typeof candidateIntelligenceSchemaVersion;
}

export interface CandidateAssertionAccessRequest {
  readonly at: string;
  readonly purpose: CandidateUsePurpose;
  readonly role: CandidateAccessRole;
}

export type CandidateAssertionAccessReason =
  | "eligible"
  | "freshness-expired"
  | "lifecycle-disputed"
  | "lifecycle-stale"
  | "lifecycle-superseded"
  | "lifecycle-withdrawn"
  | "purpose-not-granted"
  | "purpose-role-mismatch"
  | "retention-expired"
  | "role-not-granted";

export interface CandidateAssertionAccessDecision {
  readonly eligible: boolean;
  readonly reason: CandidateAssertionAccessReason;
}

const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const purposeRole: Record<CandidateUsePurpose, CandidateAccessRole> = {
  "candidate-analytics": "data-analyst",
  "matchmaker-discovery": "matchmaker",
};
const validPurposes = new Set<CandidateUsePurpose>([
  "candidate-analytics",
  "matchmaker-discovery",
]);
const validRoles = new Set<CandidateAccessRole>(["data-analyst", "matchmaker"]);
const dispositionState: Record<
  CandidateFieldDisposition,
  CandidateFieldKnowledgeState
> = {
  approved: "active",
  declined: "declined",
  private: "private",
  rejected: "rejected",
};
const allowedTransitions: Readonly<
  Record<CandidateAssertionStatus, readonly CandidateAssertionStatus[]>
> = {
  active: ["disputed", "stale", "superseded", "withdrawn"],
  disputed: ["superseded", "withdrawn"],
  stale: ["superseded", "withdrawn"],
  superseded: [],
  withdrawn: [],
};

export function buildCandidateIntelligenceRecord(
  input: CandidateIntelligenceInput,
): CandidateIntelligenceRecord {
  const candidateId = requireIdentifier(input.candidateId, "Candidate ID");
  const reviewedAt = requireIsoTimestamp(input.reviewedAt, "Reviewed at");

  if (input.review.schemaVersion !== candidateInterviewReviewSchemaVersion) {
    throw new Error("Interview review schema version is not supported");
  }

  const assertions = input.review.fields.flatMap((field) => {
    if (field.disposition !== "approved") return [];
    if (
      !field.eligibleForAnalytics ||
      !field.eligibleForProfileUse ||
      field.derivation !== "source-exact"
    ) {
      throw new Error(
        "Approved interview field is not source-exact and eligible",
      );
    }

    const questionId = requireIdentifier(
      field.provenance.questionId,
      "Question ID",
    );
    const assertionId = `${candidateId}-${questionId}-r${field.provenance.responseRevision}`;
    const permissionInput = input.permissionByQuestionId[questionId];
    if (!permissionInput) {
      throw new Error(
        `Approved question ${questionId} requires field permission`,
      );
    }
    const permission = validatePermission(permissionInput, reviewedAt);
    const automation = validateAutomationLineage(
      input.automationLineageByQuestionId?.[questionId],
    );

    return [
      {
        assertionId,
        candidateId,
        classification: "restricted-candidate-approved" as const,
        fieldLabel: requireText(field.fieldLabel, "Field label"),
        lifecycle: {
          history: [],
          status: "active" as const,
        },
        permission,
        provenance: {
          automation,
          derivation: "source-exact" as const,
          guideVersion: requireIdentifier(
            field.provenance.guideVersion,
            "Guide version",
          ),
          questionId,
          responseRevision: requirePositiveInteger(
            field.provenance.responseRevision,
            "Response revision",
          ),
          reviewedAt,
          reviewSchemaVersion: candidateInterviewReviewSchemaVersion,
        },
        retentionClass: "candidate-controlled" as const,
        topic: requireIdentifier(field.topic, "Topic"),
        value: requireText(field.sourceText, "Approved assertion value"),
      },
    ];
  });

  return {
    assertions,
    candidateId,
    fieldStates: input.review.fields.map((field) => ({
      eligibleForAnalytics: false,
      eligibleForDiscovery: false,
      fieldLabel: requireText(field.fieldLabel, "Field label"),
      questionId: requireIdentifier(field.provenance.questionId, "Question ID"),
      responseRevision: requirePositiveInteger(
        field.provenance.responseRevision,
        "Response revision",
      ),
      state: dispositionState[field.disposition],
      topic: requireIdentifier(field.topic, "Topic"),
    })),
    schemaVersion: candidateIntelligenceSchemaVersion,
  };
}

export function createUnknownCandidateFieldState(
  input: Readonly<{ fieldLabel: string; topic: string }>,
): CandidateFieldState {
  return {
    eligibleForAnalytics: false,
    eligibleForDiscovery: false,
    fieldLabel: requireText(input.fieldLabel, "Field label"),
    questionId: null,
    responseRevision: null,
    state: "unknown",
    topic: requireIdentifier(input.topic, "Topic"),
  };
}

export function canUseCandidateAssertion(
  assertion: CandidateApprovedAssertion,
  request: CandidateAssertionAccessRequest,
): boolean {
  return evaluateCandidateAssertionAccess(assertion, request).eligible;
}

export function evaluateCandidateAssertionAccess(
  assertion: CandidateApprovedAssertion,
  request: CandidateAssertionAccessRequest,
): CandidateAssertionAccessDecision {
  const at = requireIsoTimestamp(request.at, "Access time");
  if (assertion.lifecycle.status !== "active") {
    return {
      eligible: false,
      reason: `lifecycle-${assertion.lifecycle.status}`,
    };
  }
  if (at > assertion.permission.retainUntil) {
    return { eligible: false, reason: "retention-expired" };
  }
  if (at > assertion.permission.freshUntil) {
    return { eligible: false, reason: "freshness-expired" };
  }
  if (!assertion.permission.purposes.includes(request.purpose)) {
    return { eligible: false, reason: "purpose-not-granted" };
  }
  if (!assertion.permission.allowedRoles.includes(request.role)) {
    return { eligible: false, reason: "role-not-granted" };
  }
  if (purposeRole[request.purpose] !== request.role) {
    return { eligible: false, reason: "purpose-role-mismatch" };
  }
  return { eligible: true, reason: "eligible" };
}

export function transitionCandidateAssertion(
  assertion: CandidateApprovedAssertion,
  transition: Readonly<{
    at: string;
    reasonCode: string;
    replacementAssertionId?: string;
    status: Exclude<CandidateAssertionStatus, "active">;
  }>,
): CandidateApprovedAssertion {
  const at = requireIsoTimestamp(transition.at, "Transition time");
  const reasonCode = requireIdentifier(transition.reasonCode, "Reason code");
  const from = assertion.lifecycle.status;
  if (!allowedTransitions[from].includes(transition.status)) {
    throw new Error(
      `Cannot transition assertion from ${from} to ${transition.status}`,
    );
  }

  const replacementAssertionId = transition.replacementAssertionId
    ? requireIdentifier(
        transition.replacementAssertionId,
        "Replacement assertion ID",
      )
    : undefined;
  if (transition.status === "superseded" && !replacementAssertionId) {
    throw new Error("Superseded assertions require a replacement assertion ID");
  }
  if (transition.status !== "superseded" && replacementAssertionId) {
    throw new Error("Only superseded assertions may reference a replacement");
  }

  const previousTransition = assertion.lifecycle.history.at(-1);
  const priorTimestamp =
    previousTransition?.at ?? assertion.provenance.reviewedAt;
  if (at <= priorTimestamp) {
    throw new Error(
      "Assertion transitions must be recorded in chronological order",
    );
  }

  const nextTransition: CandidateAssertionTransition = {
    at,
    from,
    reasonCode,
    ...(replacementAssertionId ? { replacementAssertionId } : {}),
    to: transition.status,
  };

  return {
    ...assertion,
    lifecycle: {
      history: [...assertion.lifecycle.history, nextTransition],
      status: transition.status,
    },
  };
}

function validatePermission(
  input: CandidatePermissionInput,
  reviewedAt: string,
): CandidateApprovedAssertion["permission"] {
  const consentGrantId = requireIdentifier(
    input.consentGrantId,
    "Consent grant ID",
  );
  const freshUntil = requireIsoTimestamp(input.freshUntil, "Fresh until");
  const retainUntil = requireIsoTimestamp(input.retainUntil, "Retain until");
  const purposes = requireUniqueValues(input.purposes, "Permission purpose");
  const allowedRoles = requireUniqueValues(input.allowedRoles, "Allowed role");

  if (purposes.length === 0)
    throw new Error("At least one permission purpose is required");
  if (allowedRoles.length === 0)
    throw new Error("At least one allowed role is required");
  if (!purposes.every((purpose) => validPurposes.has(purpose))) {
    throw new Error("Permission purpose is not supported");
  }
  if (!allowedRoles.every((role) => validRoles.has(role))) {
    throw new Error("Allowed role is not supported");
  }
  if (freshUntil <= reviewedAt)
    throw new Error("Freshness must extend beyond review time");
  if (retainUntil < freshUntil)
    throw new Error("Retention must not end before freshness");
  for (const purpose of purposes) {
    if (!allowedRoles.includes(purposeRole[purpose])) {
      throw new Error(
        `Purpose ${purpose} requires role ${purposeRole[purpose]}`,
      );
    }
  }

  return { allowedRoles, consentGrantId, freshUntil, purposes, retainUntil };
}

function validateAutomationLineage(
  input: CandidateAutomationLineageInput | undefined,
): CandidateAutomationLineageInput | null {
  if (!input) return null;
  if (input.kind === "deterministic-template") {
    return {
      kind: input.kind,
      plannerVersion: requireIdentifier(
        input.plannerVersion,
        "Planner version",
      ),
    };
  }
  if (input.kind === "ai-execution") {
    return {
      costLedgerEntryId: requireIdentifier(
        input.costLedgerEntryId,
        "Cost ledger entry ID",
      ),
      executionId: requireIdentifier(input.executionId, "AI execution ID"),
      kind: input.kind,
      modelVersion: requireIdentifier(input.modelVersion, "Model version"),
      promptVersion: requireIdentifier(input.promptVersion, "Prompt version"),
    };
  }
  throw new Error("Automation lineage kind is not supported");
}

function requireUniqueValues<T extends string>(
  values: readonly T[],
  label: string,
): T[] {
  const unique = [...new Set(values)];
  if (unique.length !== values.length)
    throw new Error(`${label} values must be unique`);
  return unique;
}

function requireIdentifier(value: string, label: string): string {
  const normalized = requireText(value, label);
  if (!identifierPattern.test(normalized)) {
    throw new Error(`${label} must be a lowercase kebab-case identifier`);
  }
  return normalized;
}

function requireIsoTimestamp(value: string, label: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  return value;
}

function requirePositiveInteger(value: number, label: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

function requireText(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} must not be empty`);
  return normalized;
}
