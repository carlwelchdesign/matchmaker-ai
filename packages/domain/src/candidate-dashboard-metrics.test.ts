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
  candidateDashboardInterviewModes,
  candidateDashboardMetricKeys,
  candidateDashboardMetricSetSchemaVersion,
} from "./candidate-dashboard-metrics.js";
import { candidatePurposeProjectionSchemaVersion } from "./candidate-purpose-projection.js";
import {
  candidateSearchCoverageSchemaVersion,
  candidateSearchObservationSchemaVersion,
  type CandidateSearchCoverageSnapshot,
} from "./candidate-search-coverage.js";
import { interviewOutcomeSchemaVersion } from "./interview-unit-economics.js";
import { interviewUsageSchemaVersion } from "./interview-usage.js";
import {
  candidateWorkflowFunnelSchemaVersion,
  candidateWorkflowObservationSchemaVersion,
  type CandidateWorkflowFunnelSnapshot,
} from "./candidate-workflow-outcomes.js";

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

const searchCoverage: CandidateSearchCoverageSnapshot = {
  cohortKey: scope.cohortKey,
  dataState: "available",
  lineage: {
    criteriaVersions: ["criteria-synthetic-v1"],
    observationSchemaVersion: candidateSearchObservationSchemaVersion,
    policyVersions: ["search-policy-synthetic-v1"],
    projectedAt: "2026-08-25T18:00:00.000Z",
    projectionSchemaVersion: candidatePurposeProjectionSchemaVersion,
    sourceContentStored: false,
  },
  metrics: {
    completeSearchCount: 2,
    dataQualityStateCounts: {
      backfilled: 0,
      complete: 2,
      delayed: 0,
      "invalid-quarantined": 0,
      partial: 1,
      stale: 0,
    },
    eligibleCandidateOpportunityCount: 10,
    recordedSearchCount: 3,
    retrievalCoverageBasisPoints: 6000,
    retrievedCandidateOpportunityCount: 6,
    reviewRateBasisPoints: 6667,
    reviewedCandidateOpportunityCount: 4,
    zeroResultRateBasisPoints: 0,
    zeroResultSearchCount: 0,
  },
  minimumCohortSize: 5,
  schemaVersion: candidateSearchCoverageSchemaVersion,
  windowEnd: scope.windowEnd,
  windowStart: scope.windowStart,
};

const workflowOutcomes: CandidateWorkflowFunnelSnapshot = {
  cohortKey: scope.cohortKey,
  dataState: "available",
  lineage: {
    observationSchemaVersion: candidateWorkflowObservationSchemaVersion,
    policyVersions: ["workflow-policy-v1"],
    projectedAt: "2026-08-25T18:30:00.000Z",
    projectionSchemaVersion: candidatePurposeProjectionSchemaVersion,
    selectionSetVersions: ["selection-set-v1"],
    sourceContentStored: false,
  },
  metrics: {
    completeJourneyCount: 4,
    dataQualityStateCounts: {
      backfilled: 0,
      complete: 4,
      delayed: 0,
      "invalid-quarantined": 0,
      partial: 1,
      stale: 0,
    },
    deliveredCount: 1,
    deliveryRateBasisPoints: 10_000,
    firstMeetingCount: 1,
    firstMeetingRateBasisPoints: 10_000,
    mutualApprovalCount: 1,
    mutualApprovalRateBasisPoints: 3333,
    participantAAcceptedCount: 2,
    participantAResponseMissingCount: 2,
    participantBAcceptedCount: 1,
    participantBResponseMissingCount: 2,
    reciprocalInterestCount: 1,
    reciprocalInterestRateBasisPoints: 10_000,
    recommendedCount: 3,
    recommendationRateBasisPoints: 7500,
    recordedJourneyCount: 5,
    respectfulClosureCount: 1,
    reviewedCount: 4,
    shortlistedCount: 4,
    shortlistRateBasisPoints: 10_000,
  },
  minimumCohortSize: 5,
  schemaVersion: candidateWorkflowFunnelSchemaVersion,
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
      structured: funnelMetric({
        approvedFieldCount: 11,
        completedCount: 4,
        completionRateBasisPoints: 8000,
        correctionCount: 2,
        correctionsPerCompletionBasisPoints: 5000,
        startedCount: 5,
      }),
      "typed-conversation": funnelMetric(),
      unobserved: funnelMetric({
        approvedFieldCount: 1,
        completionRateBasisPoints: 0,
        startedCount: 1,
      }),
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
        searchCoverage,
        workflowOutcomes,
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
      interviewModeMinimumCohortSize: 5,
      searchCriteriaContext: {
        criteriaVersions: ["criteria-synthetic-v1"],
        observationQuality: {
          completeObservationCount: 2,
          dataQualityStateCounts: {
            backfilled: 0,
            complete: 2,
            delayed: 0,
            "invalid-quarantined": 0,
            partial: 1,
            stale: 0,
          },
          recordedObservationCount: 3,
          state: "available",
        },
        policyVersions: ["search-policy-synthetic-v1"],
        sourceContentStored: false,
      },
      workflowOutcomeContext: {
        observationQuality: {
          completeObservationCount: 4,
          dataQualityStateCounts: {
            backfilled: 0,
            complete: 4,
            delayed: 0,
            "invalid-quarantined": 0,
            partial: 1,
            stale: 0,
          },
          recordedObservationCount: 5,
          state: "available",
        },
        policyVersions: ["workflow-policy-v1"],
        selectionSetVersions: ["selection-set-v1"],
        sourceContentStored: false,
      },
      schemaVersion: candidateDashboardMetricSetSchemaVersion,
      sourceContentStored: false,
      windowEnd: scope.windowEnd,
      windowStart: scope.windowStart,
    });
    expect(metricSet.metrics).toHaveLength(15);
    expect(metricSet.metrics.map((metric) => metric.key)).toEqual(
      candidateDashboardMetricKeys,
    );
    expect(
      metricSet.interviewModeBreakdown.map((breakdown) => breakdown.mode),
    ).toEqual(candidateDashboardInterviewModes);
    expect(
      metricSet.interviewModeBreakdown.find(
        (breakdown) => breakdown.mode === "structured",
      ),
    ).toMatchObject({
      metrics: [
        { key: "interview-starts", value: 5 },
        {
          calculation: { denominator: 5, numerator: 4 },
          key: "interview-completion-rate",
          value: 8000,
        },
        { key: "interview-approved-fields", value: 11 },
        {
          calculation: { denominator: 4, numerator: 2 },
          key: "interview-correction-burden",
          value: 5000,
        },
      ],
      mode: "structured",
    });
    expect(
      metricSet.interviewModeBreakdown.find(
        (breakdown) => breakdown.mode === "unobserved",
      )?.metrics,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "interview-starts",
          missingDataState: "suppressed-small-cohort",
          value: null,
        }),
      ]),
    );
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
        (metric) => metric.key === "interview-approved-fields",
      ),
    ).toMatchObject({
      calculation: {
        denominator: null,
        denominatorKind: "not-applicable",
        numerator: 12,
      },
      unit: "count",
      value: 12,
    });
    expect(
      metricSet.metrics.find(
        (metric) => metric.key === "interview-correction-burden",
      ),
    ).toMatchObject({
      calculation: {
        denominator: 4,
        denominatorKind: "interview-completions",
        numerator: 2,
      },
      missingDataState: "available",
      unit: "basis-points",
      value: 5000,
    });
    expect(
      metricSet.metrics.find(
        (metric) => metric.key === "search-retrieval-coverage",
      ),
    ).toMatchObject({
      calculation: { denominator: 10, numerator: 6 },
      freshness: "fresh",
      missingDataState: "available",
      value: 6000,
    });
    expect(
      metricSet.metrics.filter(
        (metric) => metric.lineage.source === "workflow-outcomes",
      ),
    ).toEqual([
      expect.objectContaining({
        calculation: expect.objectContaining({ denominator: 4, numerator: 4 }),
        key: "shortlist-rate",
        value: 10_000,
      }),
      expect.objectContaining({
        calculation: expect.objectContaining({ denominator: 3, numerator: 1 }),
        key: "mutual-approval-rate",
        value: 3333,
      }),
      expect.objectContaining({
        calculation: expect.objectContaining({ denominator: 1, numerator: 1 }),
        key: "first-meeting-rate",
        value: 10_000,
      }),
      expect.objectContaining({
        calculation: expect.objectContaining({ denominator: 1, numerator: 1 }),
        key: "reciprocal-interest-rate",
        value: 10_000,
      }),
    ]);
  });

  it("distinguishes a missing denominator from a missing source", () => {
    const metricSet = buildCandidateDashboardMetricSet({
      ...scope,
      sources: {
        interviewFunnel: {
          ...interviewFunnel,
          metrics: {
            ...interviewFunnel.metrics!,
            byMode: {
              hybrid: funnelMetric(),
              mixed: funnelMetric(),
              structured: funnelMetric(),
              "typed-conversation": funnelMetric(),
              unobserved: funnelMetric(),
              voice: funnelMetric(),
            },
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
      metricSet.metrics.find(
        (metric) => metric.key === "interview-correction-burden",
      ),
    ).toMatchObject({
      calculation: {
        denominator: 0,
        denominatorKind: "interview-completions",
        numerator: 0,
      },
      missingDataState: "missing-denominator",
    });
    expect(
      metricSet.metrics.find((metric) => metric.key === "candidate-supply")
        ?.missingDataState,
    ).toBe("source-unavailable");
    expect(metricSet.searchCriteriaContext.observationQuality).toEqual({
      completeObservationCount: null,
      dataQualityStateCounts: null,
      recordedObservationCount: null,
      state: "source-unavailable",
    });
  });

  it("allows correction burden above one correction per completion", () => {
    const metricSet = buildCandidateDashboardMetricSet({
      ...scope,
      sources: {
        interviewFunnel: {
          ...interviewFunnel,
          metrics: {
            ...interviewFunnel.metrics!,
            byMode: {
              ...interviewFunnel.metrics!.byMode,
              structured: funnelMetric({
                approvedFieldCount: 11,
                completedCount: 4,
                completionRateBasisPoints: 8000,
                correctionCount: 8,
                correctionsPerCompletionBasisPoints: 20_000,
                startedCount: 5,
              }),
            },
            overall: funnelMetric({
              approvedFieldCount: 12,
              completedCount: 4,
              completionRateBasisPoints: 6667,
              correctionCount: 8,
              correctionsPerCompletionBasisPoints: 20_000,
              startedCount: 6,
            }),
          },
        },
      },
    });

    expect(
      metricSet.metrics.find(
        (metric) => metric.key === "interview-correction-burden",
      ),
    ).toMatchObject({
      calculation: { denominator: 4, numerator: 8 },
      value: 20_000,
    });
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
        searchCoverage: {
          ...searchCoverage,
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
    expect(metricSet.searchCriteriaContext.observationQuality).toEqual({
      completeObservationCount: null,
      dataQualityStateCounts: null,
      recordedObservationCount: null,
      state: "suppressed-small-cohort",
    });
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
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          searchCoverage: {
            ...searchCoverage,
            lineage: {
              ...searchCoverage.lineage,
              criteriaVersions: ["criteria-v2", "criteria-v1"],
            },
          },
        },
      }),
    ).toThrow("search criteria versions must be sorted, unique identifiers");
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          workflowOutcomes: {
            ...workflowOutcomes,
            lineage: {
              ...workflowOutcomes.lineage,
              selectionSetVersions: ["selection-set-v2", "selection-set-v1"],
            },
          },
        },
      }),
    ).toThrow(
      "workflow selection-set versions must be sorted, unique identifiers",
    );
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          searchCoverage: {
            ...searchCoverage,
            metrics: {
              ...searchCoverage.metrics!,
              recordedSearchCount: 4,
            },
          },
        },
      }),
    ).toThrow("search observation quality is invalid");
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          interviewFunnel: {
            ...interviewFunnel,
            metrics: {
              ...interviewFunnel.metrics!,
              byMode: {
                ...interviewFunnel.metrics!.byMode,
                voice: funnelMetric({ startedCount: 1 }),
              },
            },
          },
        },
      }),
    ).toThrow("interview mode totals do not match overall");
    expect(() =>
      buildCandidateDashboardMetricSet({
        ...scope,
        sources: {
          interviewFunnel: {
            ...interviewFunnel,
            minimumCohortSize: 4,
          },
        },
      }),
    ).toThrow("minimum cohort size must be at least five");
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
