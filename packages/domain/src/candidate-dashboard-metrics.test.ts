import { describe, expect, it } from "vitest";

import {
  candidateAnalyticsSnapshotSchemaVersion,
  candidateInterviewFunnelSchemaVersion,
  type CandidateAnalyticsSnapshot,
  type CandidateInterviewFunnelSnapshot,
  type CandidateInterviewFunnelMetric,
} from "./candidate-analytics.js";
import {
  candidateAvailabilityObservationSchemaVersion,
  candidateAvailabilitySnapshotSchemaVersion,
  type CandidateAvailabilitySnapshot,
} from "./candidate-availability.js";
import {
  buildCandidateDashboardMetricSet,
  candidateDashboardMetricSetSchemaVersion,
} from "./candidate-dashboard-metrics.js";
import { candidatePurposeProjectionSchemaVersion } from "./candidate-purpose-projection.js";
import { interviewOutcomeSchemaVersion } from "./interview-unit-economics.js";
import { interviewUsageSchemaVersion } from "./interview-usage.js";

const scope = {
  cohortKey: "cohort-synthetic-pilot",
  generatedAt: "2026-08-26T00:00:00.000Z",
  maximumSourceAgeMs: 28_800_000,
  windowEnd: "2026-08-26T00:00:00.000Z",
  windowStart: "2026-08-25T00:00:00.000Z",
} as const;

const supply: CandidateAnalyticsSnapshot = {
  cohortKey: scope.cohortKey,
  dataState: "available",
  lineage: {
    approvedAssertionsOnly: true,
    projectedAt: "2026-08-25T17:00:00.000Z",
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
  evaluatedAt: "2026-08-25T17:30:00.000Z",
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

describe("candidate dashboard metric set", () => {
  it("gives every dashboard value source, scope, freshness, and missing-data state", () => {
    const metricSet = buildCandidateDashboardMetricSet({
      ...scope,
      sources: {
        availability,
        candidateSupply: supply,
        interviewFunnel,
      },
    });

    expect(metricSet).toMatchObject({
      candidateIdentifiersStored: false,
      cohortKey: scope.cohortKey,
      dataBoundary: {
        legalAuditEvidenceStored: false,
        operationalRecordsStored: false,
        productAnalyticsOnly: true,
        providerPayloadsStored: false,
        securityTelemetryStored: false,
      },
      generatedAt: scope.generatedAt,
      schemaVersion: candidateDashboardMetricSetSchemaVersion,
      sourceContentStored: false,
      windowEnd: scope.windowEnd,
      windowStart: scope.windowStart,
    });
    expect(metricSet.metrics).toHaveLength(13);
    expect(
      metricSet.metrics.find((metric) => metric.key === "candidate-supply"),
    ).toEqual({
      calculation: {
        denominator: null,
        denominatorKind: "not-applicable",
        numerator: 6,
      },
      freshness: "fresh",
      key: "candidate-supply",
      lineage: {
        cohortKey: scope.cohortKey,
        source: "candidate-supply",
        sourceAsOf: "2026-08-25T17:00:00.000Z",
        sourceSchemaVersion: candidateAnalyticsSnapshotSchemaVersion,
        windowEnd: scope.windowEnd,
        windowStart: scope.windowStart,
      },
      missingDataState: "available",
      unit: "count",
      value: 6,
    });
    expect(
      metricSet.metrics.find((metric) => metric.key === "available-candidates"),
    ).toMatchObject({ freshness: "fresh", value: 3 });
    expect(
      metricSet.metrics.find(
        (metric) => metric.key === "interview-completion-rate",
      ),
    ).toMatchObject({
      calculation: {
        denominator: 6,
        denominatorKind: "interview-starts",
        numerator: 4,
      },
      freshness: "fresh",
      missingDataState: "available",
      unit: "basis-points",
      value: 6667,
    });
    expect(
      metricSet.metrics.find(
        (metric) => metric.key === "search-retrieval-coverage",
      ),
    ).toMatchObject({
      freshness: "unknown",
      missingDataState: "source-unavailable",
      value: null,
    });
  });

  it("distinguishes a missing denominator from a missing source", () => {
    const metricSet = buildCandidateDashboardMetricSet({
      ...scope,
      sources: {
        interviewFunnel: {
          ...interviewFunnel,
          metrics: {
            ...interviewFunnel.metrics!,
            overall: funnelMetric(),
          },
        },
      },
    });

    expect(
      metricSet.metrics.find(
        (metric) => metric.key === "interview-completion-rate",
      ),
    ).toMatchObject({
      calculation: {
        denominator: 0,
        denominatorKind: "interview-starts",
        numerator: 0,
      },
      missingDataState: "missing-denominator",
    });
    expect(
      metricSet.metrics.find((metric) => metric.key === "candidate-supply")
        ?.missingDataState,
    ).toBe("source-unavailable");
  });

  it("labels old source values as stale without hiding their lineage", () => {
    const metricSet = buildCandidateDashboardMetricSet({
      ...scope,
      maximumSourceAgeMs: 60_000,
      sources: { candidateSupply: supply },
    });
    const metric = metricSet.metrics.find(
      (item) => item.key === "approved-field-coverage",
    );

    expect(metric).toMatchObject({
      freshness: "stale",
      missingDataState: "available",
      value: 7500,
    });
    expect(metric?.lineage.sourceAsOf).toBe("2026-08-25T17:00:00.000Z");
  });

  it("preserves small-cohort suppression through the display boundary", () => {
    const metricSet = buildCandidateDashboardMetricSet({
      ...scope,
      sources: {
        availability: {
          ...availability,
          dataState: "suppressed-small-cohort",
          metrics: null,
        },
      },
    });

    expect(
      metricSet.metrics.filter(
        (metric) => metric.lineage.source === "availability",
      ),
    ).toEqual([
      expect.objectContaining({
        calculation: {
          denominator: null,
          denominatorKind: "not-applicable",
          numerator: null,
        },
        missingDataState: "suppressed-small-cohort",
        value: null,
      }),
      expect.objectContaining({
        calculation: {
          denominator: null,
          denominatorKind: "candidate-cohort",
          numerator: null,
        },
        missingDataState: "suppressed-small-cohort",
        value: null,
      }),
    ]);
  });

  it("fails closed on mismatched scope, schema, state, or future lineage", () => {
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          candidateSupply: { ...supply, cohortKey: "cohort-different" },
        },
      }),
    ).toThrow("scope does not match");
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          candidateSupply: {
            ...supply,
            schemaVersion: "candidate-analytics-snapshot/v2",
          } as CandidateAnalyticsSnapshot,
        },
      }),
    ).toThrow("schema version is not supported");
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          candidateSupply: { ...supply, metrics: null },
        },
      }),
    ).toThrow("data state and metrics do not agree");
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          candidateSupply: {
            ...supply,
            lineage: {
              ...supply.lineage,
              projectedAt: "2026-08-26T01:00:00.000Z",
            },
          },
        },
      }),
    ).toThrow("newer than the dashboard");
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          candidateSupply: {
            ...supply,
            metrics: {
              ...supply.metrics!,
              approvedFieldCoverageBasisPoints: 10_001,
            },
          },
        },
      }),
    ).toThrow("approved-field-coverage is invalid");
  });

  it("emits no identity, interview content, or generalized score", () => {
    const serialized = JSON.stringify(
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          availability,
          candidateSupply: supply,
          interviewFunnel,
        },
      }),
    );

    expect(serialized).not.toMatch(
      /candidate-synthetic|availability-synthetic/,
    );
    expect(serialized).not.toMatch(/prompt|answer|transcript|compatibility/);
    expect(serialized).not.toMatch(
      /attractiveness|wealth|relationship-success/,
    );
  });
});
