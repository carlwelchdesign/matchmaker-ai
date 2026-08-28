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
          schemaVersion: "candidate-dashboard-metric-set/v1",
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
