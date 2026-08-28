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
  "candidate-dashboard-metric-set/v3" as const;

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
export type CandidateDashboardDenominatorKind =
  | "candidate-cohort"
  | "delivered-introductions"
  | "eligible-opportunities"
  | "first-meetings"
  | "interview-starts"
  | "not-applicable"
  | "observed-fields"
  | "recommendations"
  | "retrieved-opportunities"
  | "reviewed-journeys";

const denominatorKindByMetric = Object.freeze({
  "approved-field-coverage": "observed-fields",
  "availability-known": "candidate-cohort",
  "available-candidates": "not-applicable",
  "candidate-supply": "not-applicable",
  "eligible-assertions": "not-applicable",
  "first-meeting-rate": "delivered-introductions",
  "interview-completion-rate": "interview-starts",
  "interview-starts": "not-applicable",
  "mutual-approval-rate": "recommendations",
  "reciprocal-interest-rate": "first-meetings",
  "search-retrieval-coverage": "eligible-opportunities",
  "search-review-rate": "retrieved-opportunities",
  "shortlist-rate": "reviewed-journeys",
} satisfies Record<
  CandidateDashboardMetricKey,
  CandidateDashboardDenominatorKind
>);

export function candidateDashboardDenominatorKindForMetric(
  key: CandidateDashboardMetricKey,
): CandidateDashboardDenominatorKind {
  const denominatorKind = denominatorKindByMetric[key];
  if (!denominatorKind) {
    throw new Error(`Dashboard metric key ${String(key)} is invalid`);
  }
  return denominatorKind;
}

export type CandidateDashboardMissingDataState =
  | "available"
  | "missing-denominator"
  | "source-unavailable"
  | "suppressed-small-cohort";
export type CandidateDashboardFreshnessState = "fresh" | "stale" | "unknown";

export interface CandidateDashboardMetric {
  readonly calculation: {
    readonly denominator: number | null;
    readonly denominatorKind: CandidateDashboardDenominatorKind;
    readonly numerator: number | null;
  };
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
  readonly dataBoundary: {
    readonly legalAuditEvidenceStored: false;
    readonly operationalRecordsStored: false;
    readonly productAnalyticsOnly: true;
    readonly providerPayloadsStored: false;
    readonly securityTelemetryStored: false;
  };
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
  readonly denominator: () => number | null;
  readonly denominatorKind: CandidateDashboardDenominatorKind;
  readonly key: CandidateDashboardMetricKey;
  readonly numerator: () => number | null;
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
    dataBoundary: {
      legalAuditEvidenceStored: false,
      operationalRecordsStored: false,
      productAnalyticsOnly: true,
      providerPayloadsStored: false,
      securityTelemetryStored: false,
    },
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
        denominator: () => null,
        denominatorKind: "not-applicable",
        key: "candidate-supply",
        numerator: () => source?.metrics?.candidateSupplyCount ?? null,
        unit: "count",
        value: () => source?.metrics?.candidateSupplyCount ?? null,
      },
      {
        denominator: () => source?.metrics?.observedFieldCount ?? null,
        denominatorKind: "observed-fields",
        key: "approved-field-coverage",
        numerator: () => source?.metrics?.approvedAssertionCount ?? null,
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
        denominator: () => null,
        denominatorKind: "not-applicable",
        key: "eligible-assertions",
        numerator: () => source?.metrics?.eligibleAssertionCount ?? null,
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
        denominator: () => null,
        denominatorKind: "not-applicable",
        key: "available-candidates",
        numerator: () => source?.metrics?.availableCandidateCount ?? null,
        unit: "count",
        value: () => source?.metrics?.availableCandidateCount ?? null,
      },
      {
        denominator: () => source?.metrics?.candidateCount ?? null,
        denominatorKind: "candidate-cohort",
        key: "availability-known",
        numerator: () => source?.metrics?.knownAvailabilityCount ?? null,
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
        denominator: () => null,
        denominatorKind: "not-applicable",
        key: "interview-starts",
        numerator: () => source?.metrics?.overall.startedCount ?? null,
        unit: "count",
        value: () => source?.metrics?.overall.startedCount ?? null,
      },
      {
        denominator: () => source?.metrics?.overall.startedCount ?? null,
        denominatorKind: "interview-starts",
        key: "interview-completion-rate",
        numerator: () => source?.metrics?.overall.completedCount ?? null,
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
        denominator: () =>
          source?.metrics?.eligibleCandidateOpportunityCount ?? null,
        denominatorKind: "eligible-opportunities",
        key: "search-retrieval-coverage",
        numerator: () =>
          source?.metrics?.retrievedCandidateOpportunityCount ?? null,
        unit: "basis-points",
        value: () => source?.metrics?.retrievalCoverageBasisPoints ?? null,
      },
      {
        denominator: () =>
          source?.metrics?.retrievedCandidateOpportunityCount ?? null,
        denominatorKind: "retrieved-opportunities",
        key: "search-review-rate",
        numerator: () =>
          source?.metrics?.reviewedCandidateOpportunityCount ?? null,
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
        denominator: () => source?.metrics?.reviewedCount ?? null,
        denominatorKind: "reviewed-journeys",
        key: "shortlist-rate",
        numerator: () => source?.metrics?.shortlistedCount ?? null,
        unit: "basis-points",
        value: () => source?.metrics?.shortlistRateBasisPoints ?? null,
      },
      {
        denominator: () => source?.metrics?.recommendedCount ?? null,
        denominatorKind: "recommendations",
        key: "mutual-approval-rate",
        numerator: () => source?.metrics?.mutualApprovalCount ?? null,
        unit: "basis-points",
        value: () => source?.metrics?.mutualApprovalRateBasisPoints ?? null,
      },
      {
        denominator: () => source?.metrics?.deliveredCount ?? null,
        denominatorKind: "delivered-introductions",
        key: "first-meeting-rate",
        numerator: () => source?.metrics?.firstMeetingCount ?? null,
        unit: "basis-points",
        value: () => source?.metrics?.firstMeetingRateBasisPoints ?? null,
      },
      {
        denominator: () => source?.metrics?.firstMeetingCount ?? null,
        denominatorKind: "first-meetings",
        key: "reciprocal-interest-rate",
        numerator: () => source?.metrics?.reciprocalInterestCount ?? null,
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
    const sourceAvailable =
      input.source?.metrics !== null && input.source?.metrics !== undefined;
    const value = sourceAvailable ? descriptor.value() : null;
    const numerator = sourceAvailable ? descriptor.numerator() : null;
    const denominator = sourceAvailable ? descriptor.denominator() : null;
    if (
      value !== null &&
      (!Number.isSafeInteger(value) ||
        value < 0 ||
        (descriptor.unit === "basis-points" && value > 10_000))
    ) {
      throw new Error(`Dashboard metric ${descriptor.key} is invalid`);
    }
    validateCalculation(descriptor, value, numerator, denominator);
    const missingDataState = !input.source
      ? "source-unavailable"
      : input.source.dataState === "suppressed-small-cohort"
        ? "suppressed-small-cohort"
        : value === null
          ? "missing-denominator"
          : "available";
    return {
      calculation: {
        denominator,
        denominatorKind: descriptor.denominatorKind,
        numerator,
      },
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

function validateCalculation(
  descriptor: MetricDescriptor,
  value: number | null,
  numerator: number | null,
  denominator: number | null,
): void {
  if (
    descriptor.denominatorKind !==
    candidateDashboardDenominatorKindForMetric(descriptor.key)
  ) {
    throw new Error(
      `Dashboard metric ${descriptor.key} denominator kind is invalid`,
    );
  }
  if (
    (numerator !== null &&
      (!Number.isSafeInteger(numerator) || numerator < 0)) ||
    (denominator !== null &&
      (!Number.isSafeInteger(denominator) || denominator < 0))
  ) {
    throw new Error(
      `Dashboard metric ${descriptor.key} calculation is invalid`,
    );
  }
  if (descriptor.unit === "count") {
    if (
      descriptor.denominatorKind !== "not-applicable" ||
      denominator !== null ||
      numerator !== value
    ) {
      throw new Error(
        `Dashboard count metric ${descriptor.key} calculation is invalid`,
      );
    }
    return;
  }
  if (
    descriptor.denominatorKind === "not-applicable" ||
    (numerator === null) !== (denominator === null)
  ) {
    throw new Error(
      `Dashboard ratio metric ${descriptor.key} calculation is invalid`,
    );
  }
  if (numerator === null || denominator === null) return;
  const expectedValue =
    denominator === 0 ? null : Math.round((numerator * 10_000) / denominator);
  if (value !== expectedValue) {
    throw new Error(`Dashboard ratio metric ${descriptor.key} is inconsistent`);
  }
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
