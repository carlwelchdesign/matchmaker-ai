import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";

export const candidateSearchObservationSchemaVersion =
  "candidate-search-observation/v1" as const;
export const candidateSearchCoverageSchemaVersion =
  "candidate-search-coverage/v1" as const;

export type CandidateSearchDataQualityState =
  | "backfilled"
  | "complete"
  | "delayed"
  | "invalid-quarantined"
  | "partial"
  | "stale";

export interface CandidateSearchObservationInput {
  readonly criteriaVersion: string;
  readonly dataQualityState: CandidateSearchDataQualityState;
  readonly eligibleCandidateCount: number;
  readonly occurredAt: string;
  readonly policyVersion: string;
  readonly retrievedCandidateCount: number;
  readonly reviewedCandidateCount: number;
  readonly searchId: string;
  readonly sourceProjectedAt: string;
}

export interface CandidateSearchObservation extends CandidateSearchObservationInput {
  readonly candidateIdentifiersStored: false;
  readonly queryContentStored: false;
  readonly schemaVersion: typeof candidateSearchObservationSchemaVersion;
}

export interface CandidateSearchCoverageSnapshot {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly lineage: {
    readonly criteriaVersions: readonly string[];
    readonly observationSchemaVersion: typeof candidateSearchObservationSchemaVersion;
    readonly policyVersions: readonly string[];
    readonly projectedAt: string;
    readonly projectionSchemaVersion: typeof candidatePurposeProjectionSchemaVersion;
    readonly sourceContentStored: false;
  };
  readonly metrics: {
    readonly completeSearchCount: number;
    readonly dataQualityStateCounts: Readonly<
      Record<CandidateSearchDataQualityState, number>
    >;
    readonly eligibleCandidateOpportunityCount: number;
    readonly recordedSearchCount: number;
    readonly retrievalCoverageBasisPoints: number | null;
    readonly retrievedCandidateOpportunityCount: number;
    readonly reviewRateBasisPoints: number | null;
    readonly reviewedCandidateOpportunityCount: number;
    readonly zeroResultRateBasisPoints: number | null;
    readonly zeroResultSearchCount: number;
  } | null;
  readonly minimumCohortSize: number;
  readonly schemaVersion: typeof candidateSearchCoverageSchemaVersion;
  readonly windowEnd: string;
  readonly windowStart: string;
}

const observationInputKeys = [
  "criteriaVersion",
  "dataQualityState",
  "eligibleCandidateCount",
  "occurredAt",
  "policyVersion",
  "retrievedCandidateCount",
  "reviewedCandidateCount",
  "searchId",
  "sourceProjectedAt",
] as const;
const observationKeys = [
  ...observationInputKeys,
  "candidateIdentifiersStored",
  "queryContentStored",
  "schemaVersion",
] as const;
const identifierPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validDataQualityStates = new Set<CandidateSearchDataQualityState>([
  "backfilled",
  "complete",
  "delayed",
  "invalid-quarantined",
  "partial",
  "stale",
]);

export function recordCandidateSearchObservation(
  input: unknown,
): CandidateSearchObservation {
  if (!isRecord(input) || !hasExactKeys(input, observationInputKeys)) {
    throw new Error("Candidate search observation has unexpected fields");
  }
  const eligibleCandidateCount = requireNonNegativeInteger(
    input.eligibleCandidateCount,
    "Eligible candidate count",
  );
  const retrievedCandidateCount = requireNonNegativeInteger(
    input.retrievedCandidateCount,
    "Retrieved candidate count",
  );
  const reviewedCandidateCount = requireNonNegativeInteger(
    input.reviewedCandidateCount,
    "Reviewed candidate count",
  );
  if (retrievedCandidateCount > eligibleCandidateCount) {
    throw new Error("Retrieved candidates cannot exceed eligible candidates");
  }
  if (reviewedCandidateCount > retrievedCandidateCount) {
    throw new Error("Reviewed candidates cannot exceed retrieved candidates");
  }
  const occurredAt = requireIsoTimestamp(
    input.occurredAt,
    "Search occurrence time",
  );
  const sourceProjectedAt = requireIsoTimestamp(
    input.sourceProjectedAt,
    "Source projection time",
  );
  if (sourceProjectedAt > occurredAt) {
    throw new Error("Search source projection cannot follow the search");
  }
  if (
    !validDataQualityStates.has(
      input.dataQualityState as CandidateSearchDataQualityState,
    )
  ) {
    throw new Error("Candidate search data-quality state is not supported");
  }

  return {
    candidateIdentifiersStored: false,
    criteriaVersion: requireIdentifier(
      input.criteriaVersion,
      "Criteria version",
    ),
    dataQualityState: input.dataQualityState as CandidateSearchDataQualityState,
    eligibleCandidateCount,
    occurredAt,
    policyVersion: requireIdentifier(input.policyVersion, "Policy version"),
    queryContentStored: false,
    retrievedCandidateCount,
    reviewedCandidateCount,
    schemaVersion: candidateSearchObservationSchemaVersion,
    searchId: requireIdentifier(input.searchId, "Search ID"),
    sourceProjectedAt,
  };
}

export function validateCandidateSearchObservation(
  input: unknown,
): CandidateSearchObservation {
  if (!isRecord(input) || !hasExactKeys(input, observationKeys)) {
    throw new Error(
      "Candidate search observation record has unexpected fields",
    );
  }
  if (
    input.schemaVersion !== candidateSearchObservationSchemaVersion ||
    input.candidateIdentifiersStored !== false ||
    input.queryContentStored !== false
  ) {
    throw new Error("Candidate search observation contract is invalid");
  }
  const {
    candidateIdentifiersStored: _candidateIdentifiersStored,
    queryContentStored: _queryContentStored,
    schemaVersion: _schemaVersion,
    ...raw
  } = input;
  return recordCandidateSearchObservation(raw);
}

export function buildCandidateSearchCoverageSnapshot(input: {
  readonly cohortKey: string;
  readonly minimumCohortSize: number;
  readonly observations: readonly CandidateSearchObservation[];
  readonly projection: CandidatePurposeProjection;
  readonly windowEnd: string;
  readonly windowStart: string;
}): CandidateSearchCoverageSnapshot {
  const windowStart = requireIsoTimestamp(
    input.windowStart,
    "Coverage window start",
  );
  const windowEnd = requireIsoTimestamp(input.windowEnd, "Coverage window end");
  if (windowStart >= windowEnd) throw new Error("Coverage window is invalid");
  if (!/^cohort-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.cohortKey)) {
    throw new Error("Coverage cohort key must be opaque");
  }
  if (
    !Number.isSafeInteger(input.minimumCohortSize) ||
    input.minimumCohortSize < 5
  ) {
    throw new Error("Coverage minimum cohort size must be at least five");
  }
  validateDiscoveryProjection(input.projection, windowStart, windowEnd);
  const observations = input.observations.map(
    validateCandidateSearchObservation,
  );
  const searchIds = new Set<string>();
  const dataQualityStateCounts = createEmptyDataQualityCounts();
  for (const observation of observations) {
    if (searchIds.has(observation.searchId)) {
      throw new Error("Candidate search coverage contains duplicate searches");
    }
    searchIds.add(observation.searchId);
    if (
      observation.occurredAt < windowStart ||
      observation.occurredAt > windowEnd
    ) {
      throw new Error(
        "Candidate search observation is outside the coverage window",
      );
    }
    if (observation.sourceProjectedAt !== input.projection.projectedAt) {
      throw new Error(
        "Candidate search observation has mismatched projection lineage",
      );
    }
    if (observation.eligibleCandidateCount > input.projection.candidateCount) {
      throw new Error("Search eligibility exceeds the source candidate cohort");
    }
    dataQualityStateCounts[observation.dataQualityState] += 1;
  }

  const base: Omit<CandidateSearchCoverageSnapshot, "dataState" | "metrics"> = {
    cohortKey: input.cohortKey,
    lineage: {
      criteriaVersions: [
        ...new Set(observations.map((item) => item.criteriaVersion)),
      ].sort(),
      observationSchemaVersion: candidateSearchObservationSchemaVersion,
      policyVersions: [
        ...new Set(observations.map((item) => item.policyVersion)),
      ].sort(),
      projectedAt: input.projection.projectedAt,
      projectionSchemaVersion: input.projection.schemaVersion,
      sourceContentStored: false,
    },
    minimumCohortSize: input.minimumCohortSize,
    schemaVersion: candidateSearchCoverageSchemaVersion,
    windowEnd,
    windowStart,
  };
  if (input.projection.candidateCount < input.minimumCohortSize) {
    return { ...base, dataState: "suppressed-small-cohort", metrics: null };
  }

  const complete = observations.filter(
    (observation) => observation.dataQualityState === "complete",
  );
  const eligibleCandidateCount = sum(
    complete.map((observation) => observation.eligibleCandidateCount),
    "Eligible candidate count",
  );
  const retrievedCandidateCount = sum(
    complete.map((observation) => observation.retrievedCandidateCount),
    "Retrieved candidate count",
  );
  const reviewedCandidateCount = sum(
    complete.map((observation) => observation.reviewedCandidateCount),
    "Reviewed candidate count",
  );
  const zeroResultSearchCount = complete.filter(
    (observation) => observation.retrievedCandidateCount === 0,
  ).length;

  return {
    ...base,
    dataState: "available",
    metrics: {
      completeSearchCount: complete.length,
      dataQualityStateCounts,
      eligibleCandidateOpportunityCount: eligibleCandidateCount,
      recordedSearchCount: observations.length,
      retrievalCoverageBasisPoints: ratio(
        retrievedCandidateCount,
        eligibleCandidateCount,
      ),
      retrievedCandidateOpportunityCount: retrievedCandidateCount,
      reviewRateBasisPoints: ratio(
        reviewedCandidateCount,
        retrievedCandidateCount,
      ),
      reviewedCandidateOpportunityCount: reviewedCandidateCount,
      zeroResultRateBasisPoints: ratio(zeroResultSearchCount, complete.length),
      zeroResultSearchCount,
    },
  };
}

function validateDiscoveryProjection(
  projection: CandidatePurposeProjection,
  windowStart: string,
  windowEnd: string,
): void {
  if (
    projection.schemaVersion !== candidatePurposeProjectionSchemaVersion ||
    projection.purpose !== "matchmaker-discovery" ||
    projection.role !== "matchmaker" ||
    !projection.approvedAssertionsOnly ||
    projection.rawSourceIncluded
  ) {
    throw new Error(
      "Search coverage requires an approved discovery projection",
    );
  }
  if (
    !Number.isSafeInteger(projection.candidateCount) ||
    projection.candidateCount < 0
  ) {
    throw new Error("Search coverage projection candidate count is invalid");
  }
  if (
    projection.projectedAt < windowStart ||
    projection.projectedAt > windowEnd
  ) {
    throw new Error(
      "Search coverage projection is outside the coverage window",
    );
  }
}

function createEmptyDataQualityCounts(): Record<
  CandidateSearchDataQualityState,
  number
> {
  return {
    backfilled: 0,
    complete: 0,
    delayed: 0,
    "invalid-quarantined": 0,
    partial: 0,
    stale: 0,
  };
}

function ratio(numerator: number, denominator: number): number | null {
  return denominator === 0
    ? null
    : Math.round((numerator * 10_000) / denominator);
}

function sum(values: readonly number[], label: string): number {
  return values.reduce((total, value) => {
    const next = total + value;
    if (!Number.isSafeInteger(next))
      throw new Error(`${label} exceeds safe range`);
    return next;
  }, 0);
}

function requireNonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
}

function requireIdentifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be a lowercase identifier`);
  }
  return value;
}

function requireIsoTimestamp(value: unknown, label: string): string {
  if (typeof value !== "string")
    throw new Error(`${label} must be an ISO timestamp`);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO timestamp`);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys<T extends readonly string[]>(
  value: Record<string, unknown>,
  keys: T,
): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return (
    actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
  );
}
