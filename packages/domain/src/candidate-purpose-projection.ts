import {
  canUseCandidateAssertion,
  candidateIntelligenceSchemaVersion,
  type CandidateAccessRole,
  type CandidateFieldKnowledgeState,
  type CandidateIntelligenceRecord,
  type CandidateUsePurpose,
} from "./candidate-intelligence.js";

export const candidatePurposeProjectionSchemaVersion =
  "candidate-purpose-projection/v1" as const;

export interface CandidatePurposeProjectionRequest {
  readonly at: string;
  readonly purpose: CandidateUsePurpose;
  readonly role: CandidateAccessRole;
}

export interface CandidatePurposeAssertion {
  readonly assertionId: string;
  readonly candidateId: string;
  readonly classification: "restricted-candidate-approved";
  readonly fieldLabel: string;
  readonly permission: {
    readonly consentGrantId: string;
    readonly freshUntil: string;
    readonly retainUntil: string;
  };
  readonly provenance: {
    readonly guideVersion: string;
    readonly questionId: string;
    readonly responseRevision: number;
    readonly reviewedAt: string;
  };
  readonly topic: string;
  readonly value: string;
}

export interface CandidatePurposeProjection {
  readonly approvedAssertionsOnly: true;
  readonly candidateCount: number;
  readonly evaluatedAssertionCount: number;
  readonly excludedAssertionCount: number;
  readonly fieldStateCounts: Readonly<
    Record<CandidateFieldKnowledgeState, number>
  >;
  readonly includedAssertions: readonly CandidatePurposeAssertion[];
  readonly projectedAt: string;
  readonly purpose: CandidateUsePurpose;
  readonly rawSourceIncluded: false;
  readonly role: CandidateAccessRole;
  readonly schemaVersion: typeof candidatePurposeProjectionSchemaVersion;
}

export function buildCandidatePurposeProjection(
  records: readonly CandidateIntelligenceRecord[],
  request: CandidatePurposeProjectionRequest,
): CandidatePurposeProjection {
  const projectedAt = requireIsoTimestamp(request.at);
  if (
    !["candidate-analytics", "matchmaker-discovery"].includes(request.purpose)
  ) {
    throw new Error("Candidate projection purpose is not supported");
  }
  if (!["data-analyst", "matchmaker"].includes(request.role)) {
    throw new Error("Candidate projection role is not supported");
  }
  const candidateIds = new Set<string>();
  const assertionIds = new Set<string>();
  const includedAssertions: CandidatePurposeAssertion[] = [];
  const fieldStateCounts = createEmptyFieldStateCounts();
  let evaluatedAssertionCount = 0;

  for (const record of records) {
    if (record.schemaVersion !== candidateIntelligenceSchemaVersion) {
      throw new Error("Candidate intelligence schema version is not supported");
    }
    if (candidateIds.has(record.candidateId)) {
      throw new Error(
        "Candidate purpose projection contains duplicate candidates",
      );
    }
    candidateIds.add(record.candidateId);

    for (const fieldState of record.fieldStates) {
      fieldStateCounts[fieldState.state] += 1;
    }

    for (const assertion of record.assertions) {
      evaluatedAssertionCount += 1;
      if (assertion.candidateId !== record.candidateId) {
        throw new Error(
          "Candidate assertion does not belong to its intelligence record",
        );
      }
      if (assertionIds.has(assertion.assertionId)) {
        throw new Error(
          "Candidate purpose projection contains duplicate assertions",
        );
      }
      assertionIds.add(assertion.assertionId);
      if (!canUseCandidateAssertion(assertion, request)) continue;

      includedAssertions.push({
        assertionId: assertion.assertionId,
        candidateId: assertion.candidateId,
        classification: assertion.classification,
        fieldLabel: assertion.fieldLabel,
        permission: {
          consentGrantId: assertion.permission.consentGrantId,
          freshUntil: assertion.permission.freshUntil,
          retainUntil: assertion.permission.retainUntil,
        },
        provenance: {
          guideVersion: assertion.provenance.guideVersion,
          questionId: assertion.provenance.questionId,
          responseRevision: assertion.provenance.responseRevision,
          reviewedAt: assertion.provenance.reviewedAt,
        },
        topic: assertion.topic,
        value: assertion.value,
      });
    }
  }

  return {
    approvedAssertionsOnly: true,
    candidateCount: candidateIds.size,
    evaluatedAssertionCount,
    excludedAssertionCount: evaluatedAssertionCount - includedAssertions.length,
    fieldStateCounts,
    includedAssertions,
    projectedAt,
    purpose: request.purpose,
    rawSourceIncluded: false,
    role: request.role,
    schemaVersion: candidatePurposeProjectionSchemaVersion,
  };
}

function requireIsoTimestamp(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(
      "Projection time must be a normalized ISO-8601 UTC timestamp",
    );
  }
  return value;
}

function createEmptyFieldStateCounts(): Record<
  CandidateFieldKnowledgeState,
  number
> {
  return {
    active: 0,
    declined: 0,
    disputed: 0,
    private: 0,
    rejected: 0,
    stale: 0,
    superseded: 0,
    unknown: 0,
    withdrawn: 0,
  };
}
