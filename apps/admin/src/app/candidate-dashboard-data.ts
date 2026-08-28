import "server-only";

import {
  authorizeCandidateDashboardMetricSet,
  buildCandidateDashboardMetricSet,
  candidateAnalyticsSnapshotSchemaVersion,
  candidateAvailabilityObservationSchemaVersion,
  candidateAvailabilitySnapshotSchemaVersion,
  candidateInterviewFunnelSchemaVersion,
  candidatePurposeProjectionSchemaVersion,
  interviewOutcomeSchemaVersion,
  interviewUsageSchemaVersion,
  type CandidateAnalyticsSnapshot,
  type CandidateAvailabilitySnapshot,
  type CandidateDashboardMetric,
  type CandidateDashboardMetricKey,
  type CandidateInterviewFunnelMetric,
  type CandidateInterviewFunnelSnapshot,
} from "@argent/domain";
import type {
  CandidateDashboardMetricGroup,
  CandidateDashboardMetricView,
  CandidateDashboardPageData,
} from "./candidate-dashboard-view-model";

const scope = {
  cohortKey: "cohort-synthetic-pilot",
  generatedAt: "2026-08-28T20:00:00.000Z",
  maximumSourceAgeMs: 8 * 60 * 60 * 1_000,
  windowEnd: "2026-08-28T20:00:00.000Z",
  windowStart: "2026-08-27T20:00:00.000Z",
} as const;

const metricContent = {
  "approved-field-coverage": {
    description: "Approved assertions among observed candidate fields.",
    group: "Candidate supply",
    label: "Approved field coverage",
  },
  "availability-known": {
    description: "Candidates with a current confirmed availability state.",
    group: "Candidate supply",
    label: "Availability known",
  },
  "available-candidates": {
    description: "Candidates who explicitly confirmed they are available.",
    group: "Candidate supply",
    label: "Available candidates",
  },
  "candidate-supply": {
    description: "Candidates in this synthetic reporting cohort.",
    group: "Candidate supply",
    label: "Candidate supply",
  },
  "eligible-assertions": {
    description: "Approved assertions eligible for product analytics.",
    group: "Candidate supply",
    label: "Eligible assertions",
  },
  "first-meeting-rate": {
    description: "Delivered introductions that reached a first meeting.",
    group: "Introduction outcomes",
    label: "First meeting rate",
  },
  "interview-completion-rate": {
    description: "Started candidate interviews that reached completion.",
    group: "Intake operations",
    label: "Interview completion",
  },
  "interview-approved-fields": {
    description: "Candidate-approved fields collected through interviews.",
    group: "Intake operations",
    label: "Approved interview fields",
  },
  "interview-correction-burden": {
    description: "Candidate corrections per completed interview.",
    group: "Intake operations",
    label: "Correction burden",
  },
  "interview-starts": {
    description: "Candidate interviews started in the reporting window.",
    group: "Intake operations",
    label: "Interview starts",
  },
  "mutual-approval-rate": {
    description: "Recommendations independently approved by both people.",
    group: "Introduction outcomes",
    label: "Mutual approval rate",
  },
  "reciprocal-interest-rate": {
    description: "First meetings with reciprocal follow-up interest.",
    group: "Introduction outcomes",
    label: "Reciprocal interest",
  },
  "search-retrieval-coverage": {
    description: "Eligible opportunities retrieved by complete searches.",
    group: "Discovery coverage",
    label: "Retrieval coverage",
  },
  "search-review-rate": {
    description: "Retrieved opportunities that received human review.",
    group: "Discovery coverage",
    label: "Human review rate",
  },
  "shortlist-rate": {
    description: "Reviewed candidate journeys advanced to a shortlist.",
    group: "Introduction outcomes",
    label: "Shortlist rate",
  },
} as const satisfies Record<
  CandidateDashboardMetricKey,
  {
    readonly description: string;
    readonly group: CandidateDashboardMetricGroup;
    readonly label: string;
  }
>;

const denominatorLabels = {
  "candidate-cohort": "candidate cohort",
  "delivered-introductions": "delivered introductions",
  "eligible-opportunities": "eligible opportunities",
  "first-meetings": "first meetings",
  "interview-completions": "completed interviews",
  "interview-starts": "interview starts",
  "not-applicable": "not applicable",
  "observed-fields": "observed fields",
  recommendations: "recommendations",
  "retrieved-opportunities": "retrieved opportunities",
  "reviewed-journeys": "reviewed journeys",
} as const;

const sourceLabels = {
  availability: "Candidate-confirmed availability",
  "candidate-supply": "Approved candidate projection",
  "consent-eligibility": "Analytics consent eligibility",
  "interview-funnel": "Content-free interview outcomes",
  "search-coverage": "Search coverage observations",
  "workflow-outcomes": "Introduction workflow outcomes",
} as const;

const candidateSupply: CandidateAnalyticsSnapshot = {
  cohortKey: scope.cohortKey,
  dataState: "available",
  lineage: {
    approvedAssertionsOnly: true,
    projectedAt: "2026-08-28T19:00:00.000Z",
    projectionSchemaVersion: candidatePurposeProjectionSchemaVersion,
    rawSourceIncluded: false,
  },
  metrics: {
    approvedAssertionCount: 18,
    approvedFieldCoverageBasisPoints: 7500,
    candidateSupplyCount: 6,
    excludedAssertionCount: 2,
    fieldStateCounts: {
      active: 18,
      declined: 1,
      disputed: 0,
      private: 2,
      rejected: 0,
      stale: 1,
      superseded: 0,
      unknown: 2,
      withdrawn: 0,
    },
    observedFieldCount: 24,
  },
  minimumCohortSize: 5,
  schemaVersion: candidateAnalyticsSnapshotSchemaVersion,
  windowEnd: scope.windowEnd,
  windowStart: scope.windowStart,
};

const availability: CandidateAvailabilitySnapshot = {
  cohortKey: scope.cohortKey,
  dataState: "available",
  evaluatedAt: "2026-08-28T19:15:00.000Z",
  lineage: {
    admissionDecisionGranted: false,
    candidateConfirmedOnly: true,
    discoveryEligibilityGranted: false,
    interviewContentStored: false,
    observationSchemaVersion: candidateAvailabilityObservationSchemaVersion,
  },
  metrics: {
    availableCandidateCount: 3,
    availableCandidateShareBasisPoints: 5000,
    candidateCount: 6,
    knownAvailabilityCount: 5,
    knownAvailabilityShareBasisPoints: 8333,
    stateCounts: {
      available: 3,
      "not-available": 1,
      paused: 1,
      stale: 0,
      unknown: 1,
      withdrawn: 0,
    },
  },
  minimumCohortSize: 5,
  schemaVersion: candidateAvailabilitySnapshotSchemaVersion,
  windowEnd: scope.windowEnd,
  windowStart: scope.windowStart,
};

function funnelMetric(
  values: Partial<CandidateInterviewFunnelMetric> = {},
): CandidateInterviewFunnelMetric {
  return {
    approvedFieldCount: 0,
    completedCount: 0,
    completionRateBasisPoints: null,
    correctionCount: 0,
    correctionsPerCompletionBasisPoints: null,
    startedCount: 0,
    ...values,
  };
}

const interviewFunnel: CandidateInterviewFunnelSnapshot = {
  cohortKey: scope.cohortKey,
  dataState: "available",
  lineage: {
    outcomeSchemaVersion: interviewOutcomeSchemaVersion,
    sourceContentStored: false,
    usageSchemaVersion: interviewUsageSchemaVersion,
  },
  metrics: {
    byMode: {
      hybrid: funnelMetric(),
      mixed: funnelMetric(),
      structured: funnelMetric(),
      "typed-conversation": funnelMetric(),
      unobserved: funnelMetric(),
      voice: funnelMetric(),
    },
    overall: funnelMetric({
      approvedFieldCount: 12,
      completedCount: 4,
      completionRateBasisPoints: 6667,
      correctionCount: 2,
      correctionsPerCompletionBasisPoints: 5000,
      startedCount: 6,
    }),
  },
  minimumCohortSize: 5,
  schemaVersion: candidateInterviewFunnelSchemaVersion,
  windowEnd: scope.windowEnd,
  windowStart: scope.windowStart,
};

export function buildSyntheticCandidateDashboardPageData(): CandidateDashboardPageData {
  const dashboard = buildCandidateDashboardMetricSet({
    ...scope,
    sources: { availability, candidateSupply, interviewFunnel },
  });
  const decision = authorizeCandidateDashboardMetricSet(dashboard, {
    accessedAt: "2026-08-28T21:00:00.000Z",
    allowedCohortKeys: [scope.cohortKey],
    audience: "internal-staff",
    role: "matchmaker",
  });
  if (!decision.authorized) {
    throw new Error("Synthetic candidate dashboard access was denied");
  }

  return {
    accessContext: {
      audience: "Internal staff",
      cohortLabel: "Synthetic pilot cohort",
      generatedAtLabel: formatUtc(dashboard.generatedAt),
      role: "Matchmaker",
      windowLabel: `${formatUtc(dashboard.windowStart)} to ${formatUtc(dashboard.windowEnd)}`,
    },
    metrics: decision.dashboard.metrics.map(toMetricView),
    separationNotice:
      "Product analytics only. Operational records, legal audit evidence, security telemetry, provider payloads, and candidate identifiers are not stored in this view.",
  };
}

function toMetricView(
  metric: CandidateDashboardMetric,
): CandidateDashboardMetricView {
  const content = metricContent[metric.key];
  return {
    calculationLabel: calculationLabel(metric),
    description: content.description,
    displayValue:
      metric.value === null
        ? "—"
        : metric.unit === "count"
          ? metric.value.toLocaleString("en-US")
          : `${(metric.value / 100).toFixed(metric.value % 100 === 0 ? 0 : 1)}%`,
    freshnessLabel:
      metric.freshness === "fresh"
        ? "Fresh"
        : metric.freshness === "stale"
          ? "Stale"
          : "Unknown freshness",
    group: content.group,
    key: metric.key,
    label: content.label,
    missingDataLabel:
      metric.missingDataState === "available"
        ? "Available"
        : metric.missingDataState === "missing-denominator"
          ? "Missing denominator"
          : metric.missingDataState === "suppressed-small-cohort"
            ? "Suppressed small cohort"
            : "Source unavailable",
    sourceAsOfLabel:
      metric.lineage.sourceAsOf === null
        ? "No source timestamp"
        : formatUtc(metric.lineage.sourceAsOf),
    sourceLabel: sourceLabels[metric.lineage.source],
  };
}

function calculationLabel(metric: CandidateDashboardMetric): string {
  if (metric.calculation.numerator === null) return "Calculation unavailable";
  if (metric.calculation.denominator === null) {
    return `${metric.calculation.numerator.toLocaleString("en-US")} counted`;
  }
  return `${metric.calculation.numerator.toLocaleString("en-US")} of ${metric.calculation.denominator.toLocaleString("en-US")} ${denominatorLabels[metric.calculation.denominatorKind]}`;
}

function formatUtc(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(value));
}
