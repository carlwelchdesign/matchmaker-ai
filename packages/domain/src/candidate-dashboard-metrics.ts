import {
  candidateAnalyticsSnapshotSchemaVersion,
  candidateAssertionEligibilitySchemaVersion,
  candidateInterviewFunnelSchemaVersion,
  type CandidateAnalyticsSnapshot,
  type CandidateAssertionEligibilitySnapshot,
  type CandidateInterviewFunnelSnapshot,
} from "./candidate-analytics.js";
import {
  candidateAvailabilitySnapshotSchemaVersion,
  type CandidateAvailabilitySnapshot,
} from "./candidate-availability.js";
import {
  candidateSearchCoverageSchemaVersion,
  type CandidateSearchCoverageSnapshot,
} from "./candidate-search-coverage.js";
import {
  candidateWorkflowFunnelSchemaVersion,
  type CandidateWorkflowFunnelSnapshot,
} from "./candidate-workflow-outcomes.js";

export const candidateDashboardMetricSetSchemaVersion =
  "candidate-dashboard-metric-set/v1" as const;

export type CandidateDashboardSource =
  | "availability"
  | "candidate-supply"
  | "consent-eligibility"
  | "interview-funnel"
  | "search-coverage"
  | "workflow-outcomes";

export type CandidateDashboardMetricKey =
  | "approved-field-coverage"
  | "availability-known"
  | "available-candidates"
  | "candidate-supply"
  | "eligible-assertions"
  | "first-meeting-rate"
  | "interview-completion-rate"
  | "interview-starts"
  | "mutual-approval-rate"
  | "reciprocal-interest-rate"
  | "search-retrieval-coverage"
  | "search-review-rate"
  | "shortlist-rate";

export type CandidateDashboardMetricUnit = "basis-points" | "count";
export type CandidateDashboardMissingDataState =
  | "available"
  | "missing-denominator"
  | "source-unavailable"
  | "suppressed-small-cohort";
export type CandidateDashboardFreshnessState = "fresh" | "stale" | "unknown";

export interface CandidateDashboardMetric {
  readonly freshness: CandidateDashboardFreshnessState;
  readonly key: CandidateDashboardMetricKey;
  readonly lineage: {
    readonly cohortKey: string;
    readonly source: CandidateDashboardSource;
    readonly sourceAsOf: string | null;
    readonly sourceSchemaVersion: string;
    readonly windowEnd: string;
    readonly windowStart: string;
  };
  readonly missingDataState: CandidateDashboardMissingDataState;
  readonly unit: CandidateDashboardMetricUnit;
  readonly value: number | null;
}

export interface CandidateDashboardMetricSet {
  readonly candidateIdentifiersStored: false;
  readonly cohortKey: string;
  readonly generatedAt: string;
  readonly metrics: readonly CandidateDashboardMetric[];
  readonly schemaVersion: typeof candidateDashboardMetricSetSchemaVersion;
  readonly sourceContentStored: false;
  readonly windowEnd: string;
  readonly windowStart: string;
}

export interface CandidateDashboardMetricSetInput {
  readonly cohortKey: string;
  readonly generatedAt: string;
  readonly maximumSourceAgeMs: number;
  readonly sources: {
    readonly availability?: CandidateAvailabilitySnapshot | null;
    readonly candidateSupply?: CandidateAnalyticsSnapshot | null;
    readonly consentEligibility?: CandidateAssertionEligibilitySnapshot | null;
    readonly interviewFunnel?: CandidateInterviewFunnelSnapshot | null;
    readonly searchCoverage?: CandidateSearchCoverageSnapshot | null;
    readonly workflowOutcomes?: CandidateWorkflowFunnelSnapshot | null;
  };
  readonly windowEnd: string;
  readonly windowStart: string;
}

interface MetricDescriptor {
  readonly key: CandidateDashboardMetricKey;
  readonly unit: CandidateDashboardMetricUnit;
  readonly value: () => number | null;
}

interface DashboardSourceContract {
  readonly cohortKey: string;
  readonly dataState: "available" | "suppressed-small-cohort";
  readonly metrics: object | null;
  readonly schemaVersion: string;
  readonly windowEnd: string;
  readonly windowStart: string;
}

const cohortKeyPattern = /^cohort-[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function buildCandidateDashboardMetricSet(
  input: CandidateDashboardMetricSetInput,
): CandidateDashboardMetricSet {
  const generatedAt = timestamp(input.generatedAt, "Dashboard generation time");
  const windowStart = timestamp(input.windowStart, "Dashboard window start");
  const windowEnd = timestamp(input.windowEnd, "Dashboard window end");
  if (windowStart >= windowEnd) throw new Error("Dashboard window is invalid");
  if (generatedAt < windowStart || generatedAt > windowEnd) {
    throw new Error("Dashboard generation must fall inside the window");
  }
  if (!cohortKeyPattern.test(input.cohortKey)) {
    throw new Error("Dashboard cohort key must be opaque");
  }
  if (
    !Number.isSafeInteger(input.maximumSourceAgeMs) ||
    input.maximumSourceAgeMs <= 0
  ) {
    throw new Error("Dashboard maximum source age must be a positive integer");
  }

  const metrics = [
    ...supplyMetrics(input, generatedAt, windowStart, windowEnd),
    ...eligibilityMetrics(input, generatedAt, windowStart, windowEnd),
    ...availabilityMetrics(input, generatedAt, windowStart, windowEnd),
    ...interviewMetrics(input, generatedAt, windowStart, windowEnd),
    ...searchMetrics(input, generatedAt, windowStart, windowEnd),
    ...workflowMetrics(input, generatedAt, windowStart, windowEnd),
  ];
  const keys = new Set(metrics.map((metric) => metric.key));
  if (keys.size !== metrics.length) {
    throw new Error("Dashboard contains duplicate metric keys");
  }

  return {
    candidateIdentifiersStored: false,
    cohortKey: input.cohortKey,
    generatedAt,
    metrics,
    schemaVersion: candidateDashboardMetricSetSchemaVersion,
    sourceContentStored: false,
    windowEnd,
    windowStart,
  };
}

function supplyMetrics(
  input: CandidateDashboardMetricSetInput,
  generatedAt: string,
  windowStart: string,
  windowEnd: string,
): CandidateDashboardMetric[] {
  const source = input.sources.candidateSupply;
  return buildMetrics({
    cohortKey: input.cohortKey,
    descriptors: [
      {
        key: "candidate-supply",
        unit: "count",
        value: () => source?.metrics?.candidateSupplyCount ?? null,
      },
      {
        key: "approved-field-coverage",
        unit: "basis-points",
        value: () => source?.metrics?.approvedFieldCoverageBasisPoints ?? null,
      },
    ],
    expectedSchemaVersion: candidateAnalyticsSnapshotSchemaVersion,
    generatedAt,
    maximumSourceAgeMs: input.maximumSourceAgeMs,
    source,
    sourceAsOf: source?.lineage.projectedAt ?? null,
    sourceName: "candidate-supply",
    windowEnd,
    windowStart,
  });
}

function eligibilityMetrics(
  input: CandidateDashboardMetricSetInput,
  generatedAt: string,
  windowStart: string,
  windowEnd: string,
): CandidateDashboardMetric[] {
  const source = input.sources.consentEligibility;
  return buildMetrics({
    cohortKey: input.cohortKey,
    descriptors: [
      {
        key: "eligible-assertions",
        unit: "count",
        value: () => source?.metrics?.eligibleAssertionCount ?? null,
      },
    ],
    expectedSchemaVersion: candidateAssertionEligibilitySchemaVersion,
    generatedAt,
    maximumSourceAgeMs: input.maximumSourceAgeMs,
    source,
    sourceAsOf: source?.evaluatedAt ?? null,
    sourceName: "consent-eligibility",
    windowEnd,
    windowStart,
  });
}

function availabilityMetrics(
  input: CandidateDashboardMetricSetInput,
  generatedAt: string,
  windowStart: string,
  windowEnd: string,
): CandidateDashboardMetric[] {
  const source = input.sources.availability;
  return buildMetrics({
    cohortKey: input.cohortKey,
    descriptors: [
      {
        key: "available-candidates",
        unit: "count",
        value: () => source?.metrics?.availableCandidateCount ?? null,
      },
      {
        key: "availability-known",
        unit: "basis-points",
        value: () => source?.metrics?.knownAvailabilityShareBasisPoints ?? null,
      },
    ],
    expectedSchemaVersion: candidateAvailabilitySnapshotSchemaVersion,
    generatedAt,
    maximumSourceAgeMs: input.maximumSourceAgeMs,
    source,
    sourceAsOf: source?.evaluatedAt ?? null,
    sourceName: "availability",
    windowEnd,
    windowStart,
  });
}

function interviewMetrics(
  input: CandidateDashboardMetricSetInput,
  generatedAt: string,
  windowStart: string,
  windowEnd: string,
): CandidateDashboardMetric[] {
  const source = input.sources.interviewFunnel;
  return buildMetrics({
    cohortKey: input.cohortKey,
    descriptors: [
      {
        key: "interview-starts",
        unit: "count",
        value: () => source?.metrics?.overall.startedCount ?? null,
      },
      {
        key: "interview-completion-rate",
        unit: "basis-points",
        value: () => source?.metrics?.overall.completionRateBasisPoints ?? null,
      },
    ],
    expectedSchemaVersion: candidateInterviewFunnelSchemaVersion,
    generatedAt,
    maximumSourceAgeMs: input.maximumSourceAgeMs,
    source,
    sourceAsOf: source?.windowEnd ?? null,
    sourceName: "interview-funnel",
    windowEnd,
    windowStart,
  });
}

function searchMetrics(
  input: CandidateDashboardMetricSetInput,
  generatedAt: string,
  windowStart: string,
  windowEnd: string,
): CandidateDashboardMetric[] {
  const source = input.sources.searchCoverage;
  return buildMetrics({
    cohortKey: input.cohortKey,
    descriptors: [
      {
        key: "search-retrieval-coverage",
        unit: "basis-points",
        value: () => source?.metrics?.retrievalCoverageBasisPoints ?? null,
      },
      {
        key: "search-review-rate",
        unit: "basis-points",
        value: () => source?.metrics?.reviewRateBasisPoints ?? null,
      },
    ],
    expectedSchemaVersion: candidateSearchCoverageSchemaVersion,
    generatedAt,
    maximumSourceAgeMs: input.maximumSourceAgeMs,
    source,
    sourceAsOf: source?.lineage.projectedAt ?? null,
    sourceName: "search-coverage",
    windowEnd,
    windowStart,
  });
}

function workflowMetrics(
  input: CandidateDashboardMetricSetInput,
  generatedAt: string,
  windowStart: string,
  windowEnd: string,
): CandidateDashboardMetric[] {
  const source = input.sources.workflowOutcomes;
  return buildMetrics({
    cohortKey: input.cohortKey,
    descriptors: [
      {
        key: "shortlist-rate",
        unit: "basis-points",
        value: () => source?.metrics?.shortlistRateBasisPoints ?? null,
      },
      {
        key: "mutual-approval-rate",
        unit: "basis-points",
        value: () => source?.metrics?.mutualApprovalRateBasisPoints ?? null,
      },
      {
        key: "first-meeting-rate",
        unit: "basis-points",
        value: () => source?.metrics?.firstMeetingRateBasisPoints ?? null,
      },
      {
        key: "reciprocal-interest-rate",
        unit: "basis-points",
        value: () => source?.metrics?.reciprocalInterestRateBasisPoints ?? null,
      },
    ],
    expectedSchemaVersion: candidateWorkflowFunnelSchemaVersion,
    generatedAt,
    maximumSourceAgeMs: input.maximumSourceAgeMs,
    source,
    sourceAsOf: source?.lineage.projectedAt ?? null,
    sourceName: "workflow-outcomes",
    windowEnd,
    windowStart,
  });
}

function buildMetrics(input: {
  readonly cohortKey: string;
  readonly descriptors: readonly MetricDescriptor[];
  readonly expectedSchemaVersion: string;
  readonly generatedAt: string;
  readonly maximumSourceAgeMs: number;
  readonly source: DashboardSourceContract | null | undefined;
  readonly sourceAsOf: string | null;
  readonly sourceName: CandidateDashboardSource;
  readonly windowEnd: string;
  readonly windowStart: string;
}): CandidateDashboardMetric[] {
  if (input.source) {
    validateSource(input.source, input);
  }
  const freshness = calculateFreshness(
    input.sourceAsOf,
    input.generatedAt,
    input.maximumSourceAgeMs,
  );
  return input.descriptors.map((descriptor) => {
    const value = input.source?.metrics ? descriptor.value() : null;
    if (
      value !== null &&
      (!Number.isSafeInteger(value) ||
        value < 0 ||
        (descriptor.unit === "basis-points" && value > 10_000))
    ) {
      throw new Error(`Dashboard metric ${descriptor.key} is invalid`);
    }
    const missingDataState = !input.source
      ? "source-unavailable"
      : input.source.dataState === "suppressed-small-cohort"
        ? "suppressed-small-cohort"
        : value === null
          ? "missing-denominator"
          : "available";
    return {
      freshness,
      key: descriptor.key,
      lineage: {
        cohortKey: input.cohortKey,
        source: input.sourceName,
        sourceAsOf: input.sourceAsOf,
        sourceSchemaVersion: input.expectedSchemaVersion,
        windowEnd: input.windowEnd,
        windowStart: input.windowStart,
      },
      missingDataState,
      unit: descriptor.unit,
      value,
    };
  });
}

function validateSource(
  source: DashboardSourceContract,
  scope: {
    readonly cohortKey: string;
    readonly expectedSchemaVersion: string;
    readonly generatedAt: string;
    readonly sourceAsOf: string | null;
    readonly windowEnd: string;
    readonly windowStart: string;
  },
): void {
  if (source.schemaVersion !== scope.expectedSchemaVersion) {
    throw new Error("Dashboard source schema version is not supported");
  }
  if (
    source.cohortKey !== scope.cohortKey ||
    source.windowStart !== scope.windowStart ||
    source.windowEnd !== scope.windowEnd
  ) {
    throw new Error("Dashboard source scope does not match the dashboard");
  }
  if ((source.dataState === "available") !== (source.metrics !== null)) {
    throw new Error("Dashboard source data state and metrics do not agree");
  }
  if (scope.sourceAsOf === null) {
    throw new Error("Dashboard source timestamp is missing");
  }
  const sourceAsOf = timestamp(scope.sourceAsOf, "Dashboard source time");
  if (sourceAsOf > scope.generatedAt) {
    throw new Error("Dashboard source cannot be newer than the dashboard");
  }
}

function calculateFreshness(
  sourceAsOf: string | null,
  generatedAt: string,
  maximumSourceAgeMs: number,
): CandidateDashboardFreshnessState {
  if (sourceAsOf === null) return "unknown";
  const age = new Date(generatedAt).valueOf() - new Date(sourceAsOf).valueOf();
  return age <= maximumSourceAgeMs ? "fresh" : "stale";
}

function timestamp(value: string, label: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a normalized ISO-8601 UTC timestamp`);
  }
  return value;
}
