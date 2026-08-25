import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";
import type { CandidateFieldKnowledgeState } from "./candidate-intelligence.js";

export const candidateAnalyticsSnapshotSchemaVersion =
  "candidate-analytics-snapshot/v1" as const;

export interface CandidateAnalyticsSnapshotRequest {
  readonly cohortKey: string;
  readonly minimumCohortSize: number;
  readonly windowEnd: string;
  readonly windowStart: string;
}

export interface CandidateAnalyticsMetricSet {
  readonly approvedAssertionCount: number;
  readonly approvedFieldCoverageBasisPoints: number | null;
  readonly candidateSupplyCount: number;
  readonly excludedAssertionCount: number;
  readonly fieldStateCounts: Readonly<
    Record<CandidateFieldKnowledgeState, number>
  >;
  readonly observedFieldCount: number;
}

export interface CandidateAnalyticsSnapshot {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly lineage: {
    readonly approvedAssertionsOnly: true;
    readonly projectedAt: string;
    readonly projectionSchemaVersion: typeof candidatePurposeProjectionSchemaVersion;
    readonly rawSourceIncluded: false;
  };
  readonly metrics: CandidateAnalyticsMetricSet | null;
  readonly minimumCohortSize: number;
  readonly schemaVersion: typeof candidateAnalyticsSnapshotSchemaVersion;
  readonly windowEnd: string;
  readonly windowStart: string;
}

const cohortKeyPattern = /^cohort-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function buildCandidateAnalyticsSnapshot(
  projection: CandidatePurposeProjection,
  request: CandidateAnalyticsSnapshotRequest,
): CandidateAnalyticsSnapshot {
  validateProjection(projection);
  const windowStart = requireIsoTimestamp(
    request.windowStart,
    "Analytics window start",
  );
  const windowEnd = requireIsoTimestamp(
    request.windowEnd,
    "Analytics window end",
  );
  if (windowStart >= windowEnd) {
    throw new Error("Analytics window start must be before window end");
  }
  if (
    projection.projectedAt < windowStart ||
    projection.projectedAt > windowEnd
  ) {
    throw new Error("Projection time must fall inside the analytics window");
  }
  if (!cohortKeyPattern.test(request.cohortKey)) {
    throw new Error("Analytics cohort key must be an opaque cohort identifier");
  }
  if (
    !Number.isSafeInteger(request.minimumCohortSize) ||
    request.minimumCohortSize < 5
  ) {
    throw new Error("Analytics minimum cohort size must be at least five");
  }

  const base: Omit<CandidateAnalyticsSnapshot, "dataState" | "metrics"> = {
    cohortKey: request.cohortKey,
    lineage: {
      approvedAssertionsOnly: true,
      projectedAt: projection.projectedAt,
      projectionSchemaVersion: projection.schemaVersion,
      rawSourceIncluded: false,
    },
    minimumCohortSize: request.minimumCohortSize,
    schemaVersion: candidateAnalyticsSnapshotSchemaVersion,
    windowEnd,
    windowStart,
  };

  if (projection.candidateCount < request.minimumCohortSize) {
    return {
      ...base,
      dataState: "suppressed-small-cohort",
      metrics: null,
    };
  }

  const observedFieldCount = Object.values(projection.fieldStateCounts).reduce(
    (total, count) => total + count,
    0,
  );
  const approvedAssertionCount = projection.includedAssertions.length;

  return {
    ...base,
    dataState: "available",
    metrics: {
      approvedAssertionCount,
      approvedFieldCoverageBasisPoints:
        observedFieldCount === 0
          ? null
          : Math.round((approvedAssertionCount * 10_000) / observedFieldCount),
      candidateSupplyCount: projection.candidateCount,
      excludedAssertionCount: projection.excludedAssertionCount,
      fieldStateCounts: { ...projection.fieldStateCounts },
      observedFieldCount,
    },
  };
}

function validateProjection(projection: CandidatePurposeProjection): void {
  if (projection.schemaVersion !== candidatePurposeProjectionSchemaVersion) {
    throw new Error("Candidate analytics projection version is not supported");
  }
  if (
    projection.purpose !== "candidate-analytics" ||
    projection.role !== "data-analyst"
  ) {
    throw new Error(
      "Candidate analytics requires an analytics-only projection",
    );
  }
  if (!projection.approvedAssertionsOnly || projection.rawSourceIncluded) {
    throw new Error(
      "Candidate analytics projection violates its data boundary",
    );
  }
  const counts = [
    projection.candidateCount,
    projection.evaluatedAssertionCount,
    projection.excludedAssertionCount,
    ...Object.values(projection.fieldStateCounts),
  ];
  if (counts.some((count) => !Number.isSafeInteger(count) || count < 0)) {
    throw new Error(
      "Candidate analytics projection counts must be non-negative integers",
    );
  }
  if (
    projection.evaluatedAssertionCount - projection.excludedAssertionCount !==
    projection.includedAssertions.length
  ) {
    throw new Error(
      "Candidate analytics projection assertion counts are inconsistent",
    );
  }
}

function requireIsoTimestamp(value: string, label: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  return value;
}
