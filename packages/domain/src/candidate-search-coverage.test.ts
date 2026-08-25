import { describe, expect, it } from "vitest";

import {
  buildCandidateSearchCoverageSnapshot,
  candidateSearchCoverageSchemaVersion,
  recordCandidateSearchObservation,
} from "./candidate-search-coverage.js";
import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";

function projection(candidateCount = 5): CandidatePurposeProjection {
  return {
    approvedAssertionsOnly: true,
    candidateCount,
    evaluatedAssertionCount: 0,
    excludedAssertionCount: 0,
    fieldStateCounts: {
      active: 0,
      declined: 0,
      disputed: 0,
      private: 0,
      rejected: 0,
      stale: 0,
      superseded: 0,
      unknown: 0,
      withdrawn: 0,
    },
    includedAssertions: [],
    projectedAt: "2026-08-25T12:00:00.000Z",
    purpose: "matchmaker-discovery",
    rawSourceIncluded: false,
    role: "matchmaker",
    schemaVersion: candidatePurposeProjectionSchemaVersion,
  };
}

function observation(
  searchNumber: number,
  overrides: Record<string, unknown> = {},
) {
  return recordCandidateSearchObservation({
    criteriaVersion: "criteria-synthetic-v1",
    dataQualityState: "complete",
    eligibleCandidateCount: 5,
    occurredAt: `2026-08-25T13:0${searchNumber}:00.000Z`,
    policyVersion: "search-policy-synthetic-v1",
    retrievedCandidateCount: 2,
    reviewedCandidateCount: 1,
    searchId: `search-synthetic-${searchNumber}`,
    sourceProjectedAt: "2026-08-25T12:00:00.000Z",
    ...overrides,
  });
}

const request = {
  cohortKey: "cohort-synthetic-pilot",
  minimumCohortSize: 5,
  windowEnd: "2026-08-26T00:00:00.000Z",
  windowStart: "2026-08-25T00:00:00.000Z",
} as const;

describe("candidate search coverage", () => {
  it("reports complete-search coverage with honest denominators", () => {
    const snapshot = buildCandidateSearchCoverageSnapshot({
      ...request,
      observations: [
        observation(1),
        observation(2, {
          retrievedCandidateCount: 0,
          reviewedCandidateCount: 0,
        }),
        observation(3, { dataQualityState: "partial" }),
      ],
      projection: projection(),
    });

    expect(snapshot).toMatchObject({
      dataState: "available",
      lineage: {
        criteriaVersions: ["criteria-synthetic-v1"],
        policyVersions: ["search-policy-synthetic-v1"],
        projectedAt: "2026-08-25T12:00:00.000Z",
        sourceContentStored: false,
      },
      metrics: {
        completeSearchCount: 2,
        dataQualityStateCounts: { complete: 2, partial: 1 },
        eligibleCandidateOpportunityCount: 10,
        recordedSearchCount: 3,
        retrievalCoverageBasisPoints: 2000,
        retrievedCandidateOpportunityCount: 2,
        reviewRateBasisPoints: 5000,
        reviewedCandidateOpportunityCount: 1,
        zeroResultRateBasisPoints: 5000,
        zeroResultSearchCount: 1,
      },
      schemaVersion: candidateSearchCoverageSchemaVersion,
    });
  });

  it("keeps non-complete observations out of metric denominators", () => {
    const snapshot = buildCandidateSearchCoverageSnapshot({
      ...request,
      observations: [
        observation(1, { dataQualityState: "backfilled" }),
        observation(2, { dataQualityState: "stale" }),
      ],
      projection: projection(),
    });

    expect(snapshot.metrics).toMatchObject({
      completeSearchCount: 0,
      eligibleCandidateOpportunityCount: 0,
      retrievalCoverageBasisPoints: null,
      reviewRateBasisPoints: null,
      zeroResultRateBasisPoints: null,
    });
    expect(snapshot.metrics?.dataQualityStateCounts).toMatchObject({
      backfilled: 1,
      stale: 1,
    });
  });

  it("suppresses small cohorts and emits no search or query identifiers", () => {
    const snapshot = buildCandidateSearchCoverageSnapshot({
      ...request,
      observations: [observation(1, { eligibleCandidateCount: 4 })],
      projection: projection(4),
    });

    expect(snapshot.metrics).toBeNull();
    expect(snapshot.dataState).toBe("suppressed-small-cohort");
    expect(snapshot).not.toHaveProperty("dataQualityStateCounts");
    const serialized = JSON.stringify(snapshot);
    expect(serialized).not.toContain("search-synthetic");
    expect(serialized).not.toMatch(/candidateId|queryContent/);
  });

  it("rejects content, impossible counts, and broken lineage", () => {
    expect(() =>
      recordCandidateSearchObservation({
        ...observation(1),
        query: "private candidate criteria",
      }),
    ).toThrow("unexpected fields");
    expect(() => observation(1, { retrievedCandidateCount: 6 })).toThrow(
      "cannot exceed eligible",
    );
    expect(() =>
      observation(1, { occurredAt: "2026-08-25T11:59:00.000Z" }),
    ).toThrow("cannot follow the search");
    expect(() =>
      buildCandidateSearchCoverageSnapshot({
        ...request,
        observations: [observation(1), observation(1)],
        projection: projection(),
      }),
    ).toThrow("duplicate searches");
    expect(() =>
      buildCandidateSearchCoverageSnapshot({
        ...request,
        observations: [
          observation(1, {
            sourceProjectedAt: "2026-08-25T12:01:00.000Z",
          }),
        ],
        projection: projection(),
      }),
    ).toThrow("mismatched projection lineage");
  });
});
