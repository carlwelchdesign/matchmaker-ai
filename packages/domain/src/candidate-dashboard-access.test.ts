import { describe, expect, it } from "vitest";

import {
  authorizeCandidateDashboardMetricSet,
  candidateDashboardAccessDecisionSchemaVersion,
} from "./candidate-dashboard-access.js";
import {
  buildCandidateDashboardMetricSet,
  type CandidateDashboardMetricSet,
} from "./candidate-dashboard-metrics.js";

const dashboard = buildCandidateDashboardMetricSet({
  cohortKey: "cohort-synthetic-pilot",
  generatedAt: "2026-08-26T00:00:00.000Z",
  maximumSourceAgeMs: 28_800_000,
  sources: {},
  windowEnd: "2026-08-26T00:00:00.000Z",
  windowStart: "2026-08-25T00:00:00.000Z",
});

const internalRequest = {
  accessedAt: "2026-08-26T01:00:00.000Z",
  allowedCohortKeys: [dashboard.cohortKey],
  audience: "internal-staff",
  role: "matchmaker",
} as const;

function withFirstModeStarts(value: number): CandidateDashboardMetricSet {
  return {
    ...dashboard,
    interviewModeBreakdown: dashboard.interviewModeBreakdown.map(
      (breakdown, index) =>
        index === 0
          ? {
              ...breakdown,
              metrics: breakdown.metrics.map((metric) =>
                metric.key === "interview-starts"
                  ? {
                      ...metric,
                      calculation: { ...metric.calculation, numerator: value },
                      missingDataState: "available" as const,
                      value,
                    }
                  : metric,
              ),
            }
          : breakdown,
    ),
  };
}

describe("candidate dashboard access", () => {
  it("returns the governed dashboard only to authorized internal staff", () => {
    expect(
      authorizeCandidateDashboardMetricSet(dashboard, internalRequest),
    ).toEqual({
      authorized: true,
      dashboard,
      partnerValuesExposed: false,
      reason: "authorized",
      schemaVersion: candidateDashboardAccessDecisionSchemaVersion,
      smallCohortValuesExposed: false,
    });
  });

  it("returns no dashboard for partner audiences, partner roles, or other cohorts", () => {
    expect(
      authorizeCandidateDashboardMetricSet(dashboard, {
        ...internalRequest,
        audience: "partner-report",
      }),
    ).toMatchObject({
      authorized: false,
      dashboard: null,
      reason: "audience-not-authorized",
    });
    expect(
      authorizeCandidateDashboardMetricSet(dashboard, {
        ...internalRequest,
        role: "partner",
      }),
    ).toMatchObject({
      authorized: false,
      dashboard: null,
      reason: "role-not-authorized",
    });
    expect(
      authorizeCandidateDashboardMetricSet(dashboard, {
        ...internalRequest,
        allowedCohortKeys: ["cohort-other-pilot"],
      }),
    ).toMatchObject({
      authorized: false,
      dashboard: null,
      reason: "cohort-not-authorized",
    });
  });

  it("preserves suppressed values instead of revealing a small cohort", () => {
    const suppressedDashboard = {
      ...dashboard,
      metrics: dashboard.metrics.map((metric, index) =>
        index === 0
          ? {
              ...metric,
              missingDataState: "suppressed-small-cohort" as const,
              value: null,
            }
          : metric,
      ),
    };
    const decision = authorizeCandidateDashboardMetricSet(
      suppressedDashboard,
      internalRequest,
    );

    expect(decision.authorized).toBe(true);
    expect(decision.dashboard?.metrics[0]).toMatchObject({
      missingDataState: "suppressed-small-cohort",
      value: null,
    });
    expect(decision.smallCohortValuesExposed).toBe(false);
  });

  it("fails closed on malformed or privacy-unsafe dashboard payloads", () => {
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          searchCriteriaContext: {
            ...dashboard.searchCriteriaContext,
            criteriaVersions: ["criteria-v2", "criteria-v1"],
          },
        },
        internalRequest,
      ),
    ).toThrow("search criteria versions must be sorted, unique identifiers");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          searchCriteriaContext: {
            ...dashboard.searchCriteriaContext,
            sourceContentStored: true as false,
          },
        },
        internalRequest,
      ),
    ).toThrow("search criteria context contains source content");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          workflowOutcomeContext: {
            ...dashboard.workflowOutcomeContext,
            policyVersions: ["workflow-policy-v2", "workflow-policy-v1"],
          },
        },
        internalRequest,
      ),
    ).toThrow("workflow policy versions must be sorted, unique identifiers");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          workflowOutcomeContext: {
            ...dashboard.workflowOutcomeContext,
            sourceContentStored: true as false,
          },
        },
        internalRequest,
      ),
    ).toThrow("workflow outcome context contains source content");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        { ...dashboard, metrics: dashboard.metrics.slice(1) },
        internalRequest,
      ),
    ).toThrow("metric set is incomplete");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          metrics: dashboard.metrics.map((metric, index) =>
            index === 0 ? { ...metric, key: "constructor" } : metric,
          ),
        } as unknown as CandidateDashboardMetricSet,
        internalRequest,
      ),
    ).toThrow("metric key constructor is invalid");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          metrics: dashboard.metrics.map((metric) =>
            metric.key === "candidate-supply"
              ? {
                  ...metric,
                  lineage: {
                    ...metric.lineage,
                    source: "availability" as const,
                  },
                }
              : metric,
          ),
        },
        internalRequest,
      ),
    ).toThrow("contract does not match its key");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          metrics: dashboard.metrics.map((metric) =>
            metric.key === "candidate-supply"
              ? {
                  ...metric,
                  lineage: {
                    ...metric.lineage,
                    sourceSchemaVersion: "candidate-analytics-snapshot/v0",
                  },
                }
              : metric,
          ),
        },
        internalRequest,
      ),
    ).toThrow("contract does not match its key");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          schemaVersion: "candidate-dashboard-metric-set/v4",
        } as unknown as CandidateDashboardMetricSet,
        internalRequest,
      ),
    ).toThrow("schema version is not supported");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          sourceContentStored: true,
        } as unknown as CandidateDashboardMetricSet,
        internalRequest,
      ),
    ).toThrow("prohibited candidate content");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          dataBoundary: {
            ...dashboard.dataBoundary,
            operationalRecordsStored: true,
          },
        } as unknown as CandidateDashboardMetricSet,
        internalRequest,
      ),
    ).toThrow("violates the product analytics data boundary");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          dataBoundary: {
            ...dashboard.dataBoundary,
            productAnalyticsOnly: false,
          },
        } as unknown as CandidateDashboardMetricSet,
        internalRequest,
      ),
    ).toThrow("violates the product analytics data boundary");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          metrics: dashboard.metrics.map((metric, index) =>
            index === 0
              ? {
                  ...metric,
                  missingDataState: "suppressed-small-cohort" as const,
                  value: 1,
                }
              : metric,
          ),
        },
        internalRequest,
      ),
    ).toThrow("missing-data state disagree");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          metrics: dashboard.metrics.map((metric, index) =>
            index === 0
              ? {
                  ...metric,
                  calculation: {
                    denominator: 2,
                    denominatorKind: "not-applicable" as const,
                    numerator: 1,
                  },
                }
              : metric,
          ),
        },
        internalRequest,
      ),
    ).toThrow("count metric calculation is invalid");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          metrics: dashboard.metrics.map((metric) =>
            metric.key === "interview-completion-rate"
              ? {
                  ...metric,
                  calculation: {
                    ...metric.calculation,
                    denominatorKind: "candidate-cohort" as const,
                  },
                }
              : metric,
          ),
        },
        internalRequest,
      ),
    ).toThrow("denominator kind is invalid");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          interviewModeBreakdown: dashboard.interviewModeBreakdown.slice(1),
        },
        internalRequest,
      ),
    ).toThrow("interview mode breakdown is incomplete");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          interviewModeBreakdown: dashboard.interviewModeBreakdown.map(
            (breakdown, index) =>
              index === 0
                ? {
                    ...breakdown,
                    mode: "unobserved" as const,
                  }
                : breakdown,
          ),
        },
        internalRequest,
      ),
    ).toThrow("interview modes must be valid and unique");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        withFirstModeStarts(5),
        internalRequest,
      ),
    ).toThrow("interview mode totals do not match overall");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          interviewModeBreakdown: dashboard.interviewModeBreakdown.map(
            (breakdown, index) =>
              index === 0
                ? {
                    ...breakdown,
                    metrics: breakdown.metrics.map((metric) =>
                      metric.key === "interview-starts"
                        ? {
                            ...metric,
                            freshness: "fresh" as const,
                            lineage: {
                              ...metric.lineage,
                              sourceAsOf: "2026-08-25T23:00:00.000Z",
                            },
                          }
                        : metric,
                    ),
                  }
                : breakdown,
          ),
        },
        internalRequest,
      ),
    ).toThrow("interview mode lineage does not match overall");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        withFirstModeStarts(1),
        internalRequest,
      ),
    ).toThrow("interview mode exposes a small cohort");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          interviewModeMinimumCohortSize: 4,
        },
        internalRequest,
      ),
    ).toThrow("minimum cohort size must be at least five");
    expect(() =>
      authorizeCandidateDashboardMetricSet(
        {
          ...dashboard,
          metrics: dashboard.metrics.map((metric, index) =>
            index === 0 ? { ...metric, freshness: "fresh" as const } : metric,
          ),
        },
        internalRequest,
      ),
    ).toThrow("freshness and source timestamp disagree");
    expect(() =>
      authorizeCandidateDashboardMetricSet(dashboard, {
        ...internalRequest,
        accessedAt: "2026-08-25T23:59:59.000Z",
      }),
    ).toThrow("cannot predate dashboard generation");
    expect(() =>
      authorizeCandidateDashboardMetricSet(dashboard, {
        ...internalRequest,
        allowedCohortKeys: [],
      }),
    ).toThrow("requires an allowed cohort");
  });
});
