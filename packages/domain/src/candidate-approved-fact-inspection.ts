import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeAssertion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";
import type { CandidateFieldKnowledgeState } from "./candidate-intelligence.js";

export const candidateApprovedFactInspectionSchemaVersion =
  "candidate-approved-fact-inspection/v1" as const;

export type CandidateApprovedFactFreshness = "current" | "expires-soon";

export interface CandidateApprovedFactInspectionFilter {
  readonly candidateIds?: readonly string[];
  readonly freshness?: readonly CandidateApprovedFactFreshness[];
  readonly topics?: readonly string[];
}

export interface CandidateApprovedFactInspectionRequest {
  readonly filter?: CandidateApprovedFactInspectionFilter;
  readonly freshnessWarningWindowMs: number;
  readonly inspectedAt: string;
  readonly projection: CandidatePurposeProjection;
}

export interface CandidateApprovedFact {
  readonly candidateId: string;
  readonly classification: "restricted-candidate-approved";
  readonly factId: string;
  readonly fieldLabel: string;
  readonly freshness: CandidateApprovedFactFreshness;
  readonly permission: {
    readonly consentGrantId: string;
    readonly freshUntil: string;
    readonly retainUntil: string;
  };
  readonly provenance: {
    readonly derivation: "source-exact";
    readonly guideVersion: string;
    readonly questionId: string;
    readonly responseRevision: number;
    readonly reviewedAt: string;
  };
  readonly topic: string;
  readonly value: string;
}

export interface CandidateApprovedFactInspection {
  readonly approvedFactCount: number;
  readonly approvedFactsOnly: true;
  readonly excludedFactCount: number;
  readonly fieldStateCounts: Readonly<
    Record<CandidateFieldKnowledgeState, number>
  >;
  readonly filter: {
    readonly candidateIds: readonly string[];
    readonly freshness: readonly CandidateApprovedFactFreshness[];
    readonly topics: readonly string[];
  };
  readonly freshnessWarningWindowMs: number;
  readonly inspectedAt: string;
  readonly matchingFactCount: number;
  readonly facts: readonly CandidateApprovedFact[];
  readonly rawInterviewContentIncluded: false;
  readonly schemaVersion: typeof candidateApprovedFactInspectionSchemaVersion;
  readonly sourceAssertionCount: number;
  readonly sourceProjection: {
    readonly projectedAt: string;
    readonly purpose: CandidatePurposeProjection["purpose"];
    readonly role: CandidatePurposeProjection["role"];
    readonly schemaVersion: typeof candidatePurposeProjectionSchemaVersion;
  };
}

const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validFreshnessStates = new Set<CandidateApprovedFactFreshness>([
  "current",
  "expires-soon",
]);
const purposeRole = {
  "candidate-analytics": "data-analyst",
  "matchmaker-discovery": "matchmaker",
} as const;

export function buildCandidateApprovedFactInspection(
  request: CandidateApprovedFactInspectionRequest,
): CandidateApprovedFactInspection {
  validateProjection(request.projection);
  const inspectedAt = timestamp(request.inspectedAt, "Inspection time");
  if (inspectedAt !== request.projection.projectedAt) {
    throw new Error(
      "Inspection requires a projection generated at access time",
    );
  }
  if (
    !Number.isSafeInteger(request.freshnessWarningWindowMs) ||
    request.freshnessWarningWindowMs <= 0
  ) {
    throw new Error("Freshness warning window must be a positive integer");
  }
  const filter = validateFilter(request.filter);

  const facts = request.projection.includedAssertions
    .map((assertion) =>
      inspectAssertion(
        assertion,
        inspectedAt,
        request.freshnessWarningWindowMs,
      ),
    )
    .filter((fact) => matchesFilter(fact, filter));

  return {
    approvedFactCount: request.projection.includedAssertions.length,
    approvedFactsOnly: true,
    excludedFactCount: request.projection.excludedAssertionCount,
    facts,
    fieldStateCounts: { ...request.projection.fieldStateCounts },
    filter,
    freshnessWarningWindowMs: request.freshnessWarningWindowMs,
    inspectedAt,
    matchingFactCount: facts.length,
    rawInterviewContentIncluded: false,
    schemaVersion: candidateApprovedFactInspectionSchemaVersion,
    sourceAssertionCount: request.projection.evaluatedAssertionCount,
    sourceProjection: {
      projectedAt: request.projection.projectedAt,
      purpose: request.projection.purpose,
      role: request.projection.role,
      schemaVersion: candidatePurposeProjectionSchemaVersion,
    },
  };
}

function inspectAssertion(
  assertion: CandidatePurposeAssertion,
  inspectedAt: string,
  freshnessWarningWindowMs: number,
): CandidateApprovedFact {
  const freshUntil = timestamp(assertion.permission.freshUntil, "Fresh until");
  const retainUntil = timestamp(
    assertion.permission.retainUntil,
    "Retain until",
  );
  if (freshUntil < inspectedAt || retainUntil < freshUntil) {
    throw new Error("Inspection projection contains an expired assertion");
  }
  const freshness =
    new Date(freshUntil).valueOf() - new Date(inspectedAt).valueOf() <=
    freshnessWarningWindowMs
      ? "expires-soon"
      : "current";

  return {
    candidateId: identifier(assertion.candidateId, "Candidate ID"),
    classification: assertion.classification,
    factId: identifier(assertion.assertionId, "Assertion ID"),
    fieldLabel: text(assertion.fieldLabel, "Field label"),
    freshness,
    permission: {
      consentGrantId: identifier(
        assertion.permission.consentGrantId,
        "Consent grant ID",
      ),
      freshUntil,
      retainUntil,
    },
    provenance: {
      derivation: "source-exact",
      guideVersion: identifier(
        assertion.provenance.guideVersion,
        "Guide version",
      ),
      questionId: identifier(assertion.provenance.questionId, "Question ID"),
      responseRevision: positiveInteger(
        assertion.provenance.responseRevision,
        "Response revision",
      ),
      reviewedAt: timestamp(assertion.provenance.reviewedAt, "Reviewed at"),
    },
    topic: identifier(assertion.topic, "Topic"),
    value: text(assertion.value, "Approved fact value"),
  };
}

function matchesFilter(
  fact: CandidateApprovedFact,
  filter: CandidateApprovedFactInspection["filter"],
): boolean {
  return (
    (filter.candidateIds.length === 0 ||
      filter.candidateIds.includes(fact.candidateId)) &&
    (filter.freshness.length === 0 ||
      filter.freshness.includes(fact.freshness)) &&
    (filter.topics.length === 0 || filter.topics.includes(fact.topic))
  );
}

function validateFilter(
  filter: CandidateApprovedFactInspectionFilter | undefined,
): CandidateApprovedFactInspection["filter"] {
  return {
    candidateIds: uniqueIdentifiers(filter?.candidateIds ?? [], "Candidate ID"),
    freshness: uniqueFreshness(filter?.freshness ?? []),
    topics: uniqueIdentifiers(filter?.topics ?? [], "Topic"),
  };
}

function uniqueIdentifiers(values: readonly string[], label: string): string[] {
  const unique = [...new Set(values)];
  if (unique.length !== values.length) {
    throw new Error(`${label} filters must be unique`);
  }
  return unique.map((value) => identifier(value, `${label} filter`));
}

function uniqueFreshness(
  values: readonly CandidateApprovedFactFreshness[],
): CandidateApprovedFactFreshness[] {
  const unique = [...new Set(values)];
  if (unique.length !== values.length) {
    throw new Error("Freshness filters must be unique");
  }
  if (!unique.every((value) => validFreshnessStates.has(value))) {
    throw new Error("Freshness filter is not supported");
  }
  return unique;
}

function validateProjection(projection: CandidatePurposeProjection): void {
  if (projection.schemaVersion !== candidatePurposeProjectionSchemaVersion) {
    throw new Error("Inspection projection schema is not supported");
  }
  if (
    projection.approvedAssertionsOnly !== true ||
    projection.rawSourceIncluded !== false
  ) {
    throw new Error("Inspection projection contains prohibited source content");
  }
  if (purposeRole[projection.purpose] !== projection.role) {
    throw new Error("Inspection projection purpose and role do not agree");
  }
  timestamp(projection.projectedAt, "Projection time");
  nonnegativeInteger(projection.candidateCount, "Candidate count");
  nonnegativeInteger(
    projection.evaluatedAssertionCount,
    "Evaluated assertion count",
  );
  nonnegativeInteger(
    projection.excludedAssertionCount,
    "Excluded assertion count",
  );
  if (
    projection.includedAssertions.length + projection.excludedAssertionCount !==
    projection.evaluatedAssertionCount
  ) {
    throw new Error("Inspection projection assertion counts do not agree");
  }
  const assertionIds = new Set<string>();
  const includedCandidateIds = new Set<string>();
  for (const assertion of projection.includedAssertions) {
    if (assertion.classification !== "restricted-candidate-approved") {
      throw new Error("Inspection projection contains an unapproved assertion");
    }
    const assertionId = identifier(assertion.assertionId, "Assertion ID");
    if (assertionIds.has(assertionId)) {
      throw new Error("Inspection projection contains duplicate assertions");
    }
    assertionIds.add(assertionId);
    includedCandidateIds.add(identifier(assertion.candidateId, "Candidate ID"));
    const reviewedAt = timestamp(
      assertion.provenance.reviewedAt,
      "Reviewed at",
    );
    if (reviewedAt > projection.projectedAt) {
      throw new Error("Inspection projection contains future provenance");
    }
  }
  if (includedCandidateIds.size > projection.candidateCount) {
    throw new Error("Inspection projection candidate count is invalid");
  }
  for (const value of Object.values(projection.fieldStateCounts)) {
    nonnegativeInteger(value, "Field state count");
  }
}

function nonnegativeInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a nonnegative integer`);
  }
  return value;
}

function positiveInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${label} must be a positive integer`);
  }
  return value;
}

function identifier(value: string, label: string): string {
  const normalized = text(value, label);
  if (!identifierPattern.test(normalized)) {
    throw new Error(`${label} must be a lowercase kebab-case identifier`);
  }
  return normalized;
}

function timestamp(value: string, label: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  return value;
}

function text(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${label} is required`);
  return normalized;
}
