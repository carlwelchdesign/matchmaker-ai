import { describe, expect, it } from "vitest";

import {
  buildCandidateAnalyticsSnapshot,
  candidateAnalyticsSnapshotSchemaVersion,
} from "./candidate-analytics.js";
import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";

function projection(candidateCount = 5): CandidatePurposeProjection {
  return {
    approvedAssertionsOnly: true,
    candidateCount,
    evaluatedAssertionCount: 3,
    excludedAssertionCount: 1,
    fieldStateCounts: {
      active: 2,
      declined: 1,
      disputed: 0,
      private: 1,
      rejected: 0,
      stale: 0,
      superseded: 0,
      unknown: 1,
      withdrawn: 0,
    },
    includedAssertions: [
      {
        assertionId: "assertion-private-001",
        candidateId: "candidate-private-001",
        classification: "restricted-candidate-approved",
        fieldLabel: "Relationship intentions",
        permission: {
          consentGrantId: "consent-private-001",
          freshUntil: "2026-12-01T00:00:00.000Z",
          retainUntil: "2027-08-01T00:00:00.000Z",
        },
        provenance: {
          guideVersion: "guide-v1",
          questionId: "intentions",
          responseRevision: 1,
          reviewedAt: "2026-08-25T12:00:00.000Z",
        },
        topic: "relationship-intention",
        value: "Private approved source one",
      },
      {
        assertionId: "assertion-private-002",
        candidateId: "candidate-private-002",
        classification: "restricted-candidate-approved",
        fieldLabel: "Life rhythm",
        permission: {
          consentGrantId: "consent-private-002",
          freshUntil: "2026-12-01T00:00:00.000Z",
          retainUntil: "2027-08-01T00:00:00.000Z",
        },
        provenance: {
          guideVersion: "guide-v1",
          questionId: "rhythm",
          responseRevision: 2,
          reviewedAt: "2026-08-25T12:00:00.000Z",
        },
        topic: "life-rhythm",
        value: "Private approved source two",
      },
    ],
    projectedAt: "2026-08-25T12:00:00.000Z",
    purpose: "candidate-analytics",
    rawSourceIncluded: false,
    role: "data-analyst",
    schemaVersion: candidatePurposeProjectionSchemaVersion,
  };
}

const request = {
  cohortKey: "cohort-synthetic-pilot",
  minimumCohortSize: 5,
  windowEnd: "2026-08-26T00:00:00.000Z",
  windowStart: "2026-08-25T00:00:00.000Z",
} as const;

describe("candidate analytics snapshot", () => {
  it("reports aggregate supply, coverage, missing states, and lineage", () => {
    const snapshot = buildCandidateAnalyticsSnapshot(projection(), request);

    expect(snapshot).toEqual({
      cohortKey: "cohort-synthetic-pilot",
      dataState: "available",
      lineage: {
        approvedAssertionsOnly: true,
        projectedAt: "2026-08-25T12:00:00.000Z",
        projectionSchemaVersion: candidatePurposeProjectionSchemaVersion,
        rawSourceIncluded: false,
      },
      metrics: {
        approvedAssertionCount: 2,
        approvedFieldCoverageBasisPoints: 4000,
        candidateSupplyCount: 5,
        excludedAssertionCount: 1,
        fieldStateCounts: {
          active: 2,
          declined: 1,
          disputed: 0,
          private: 1,
          rejected: 0,
          stale: 0,
          superseded: 0,
          unknown: 1,
          withdrawn: 0,
        },
        observedFieldCount: 5,
      },
      minimumCohortSize: 5,
      schemaVersion: candidateAnalyticsSnapshotSchemaVersion,
      windowEnd: "2026-08-26T00:00:00.000Z",
      windowStart: "2026-08-25T00:00:00.000Z",
    });
  });

  it("suppresses every metric for a small cohort", () => {
    const snapshot = buildCandidateAnalyticsSnapshot(projection(4), request);

    expect(snapshot.dataState).toBe("suppressed-small-cohort");
    expect(snapshot.metrics).toBeNull();
    expect(JSON.stringify(snapshot)).not.toContain("candidate-private");
    expect(JSON.stringify(snapshot)).not.toContain("Private approved source");
  });

  it("never emits candidate identity or approved source text", () => {
    const serialized = JSON.stringify(
      buildCandidateAnalyticsSnapshot(projection(), request),
    );

    expect(serialized).not.toMatch(/candidate-private|assertion-private/);
    expect(serialized).not.toContain("Private approved source");
    expect(serialized).not.toMatch(/compatibility|attractiveness|wealthScore/);
  });

  it("rejects discovery projections and broken aggregate lineage", () => {
    expect(() =>
      buildCandidateAnalyticsSnapshot(
        {
          ...projection(),
          purpose: "matchmaker-discovery",
          role: "matchmaker",
        },
        request,
      ),
    ).toThrow("analytics-only projection");

    expect(() =>
      buildCandidateAnalyticsSnapshot(
        { ...projection(), excludedAssertionCount: 2 },
        request,
      ),
    ).toThrow("assertion counts are inconsistent");
  });

  it("requires a bounded opaque cohort and normalized time window", () => {
    expect(() =>
      buildCandidateAnalyticsSnapshot(projection(), {
        ...request,
        cohortKey: "Montecito invitees",
      }),
    ).toThrow("opaque cohort identifier");
    expect(() =>
      buildCandidateAnalyticsSnapshot(projection(), {
        ...request,
        minimumCohortSize: 4,
      }),
    ).toThrow("at least five");
    expect(() =>
      buildCandidateAnalyticsSnapshot(projection(), {
        ...request,
        windowEnd: "2026-08-25T11:00:00.000Z",
      }),
    ).toThrow("inside the analytics window");
  });
});
