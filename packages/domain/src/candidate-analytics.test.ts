import { describe, expect, it } from "vitest";

import {
  buildCandidateAnalyticsSnapshot,
  buildCandidateInterviewFunnelSnapshot,
  candidateAnalyticsSnapshotSchemaVersion,
  candidateInterviewFunnelSchemaVersion,
} from "./candidate-analytics.js";
import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";
import { recordInterviewOutcomeMeasurement } from "./interview-unit-economics.js";
import {
  recordInterviewUsageExecution,
  type InterviewUsageMode,
} from "./interview-usage.js";

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

function outcome(
  sessionNumber: number,
  input: {
    approvedFieldCount: number;
    completed: boolean;
    correctionCount: number;
  },
) {
  const minute = String(sessionNumber).padStart(2, "0");
  return recordInterviewOutcomeMeasurement({
    approvedFieldCount: input.approvedFieldCount,
    completedAt: input.completed ? `2026-08-25T12:${minute}:30.000Z` : null,
    correctionCount: input.correctionCount,
    estimatedHumanReviewTimeSavedMs: input.completed ? 60_000 : 0,
    sessionId: `session-synthetic-${sessionNumber}`,
    startedAt: `2026-08-25T12:${minute}:00.000Z`,
  });
}

function usage(
  sessionNumber: number,
  executionNumber: number,
  mode: InterviewUsageMode,
) {
  const minute = String(sessionNumber).padStart(2, "0");
  return recordInterviewUsageExecution({
    audioInputMs: 0,
    audioOutputMs: 0,
    cacheBehavior: "none",
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    environment: "test",
    estimatedCostMicrousd: 0,
    executionId: `execution-synthetic-${executionNumber}`,
    executionKind: "deterministic-template",
    inputTokens: 0,
    latencyMs: 0,
    mode,
    model: null,
    occurredAt: `2026-08-25T12:${minute}:15.000Z`,
    outputTokens: 0,
    provider: null,
    retryCount: 0,
    sessionId: `session-synthetic-${sessionNumber}`,
  });
}

const funnelOutcomes = [
  outcome(1, { approvedFieldCount: 2, completed: true, correctionCount: 1 }),
  outcome(2, { approvedFieldCount: 0, completed: false, correctionCount: 1 }),
  outcome(3, { approvedFieldCount: 3, completed: true, correctionCount: 0 }),
  outcome(4, { approvedFieldCount: 1, completed: true, correctionCount: 2 }),
  outcome(5, { approvedFieldCount: 4, completed: true, correctionCount: 0 }),
];
const funnelUsage = [
  usage(1, 1, "typed-conversation"),
  usage(2, 2, "typed-conversation"),
  usage(3, 3, "hybrid"),
  usage(4, 4, "hybrid"),
  usage(4, 5, "structured"),
];

describe("candidate interview funnel snapshot", () => {
  it("reports completion and correction burden by honest mode attribution", () => {
    const snapshot = buildCandidateInterviewFunnelSnapshot({
      outcomes: funnelOutcomes,
      request,
      usage: funnelUsage,
    });

    expect(snapshot).toMatchObject({
      cohortKey: "cohort-synthetic-pilot",
      dataState: "available",
      lineage: {
        outcomeSchemaVersion: "interview-outcome-measurement/v1",
        sourceContentStored: false,
        usageSchemaVersion: "interview-usage-ledger/v1",
      },
      minimumCohortSize: 5,
      schemaVersion: candidateInterviewFunnelSchemaVersion,
    });
    expect(snapshot.metrics?.overall).toEqual({
      approvedFieldCount: 10,
      completedCount: 4,
      completionRateBasisPoints: 8000,
      correctionCount: 4,
      correctionsPerCompletionBasisPoints: 10_000,
      startedCount: 5,
    });
    expect(snapshot.metrics?.byMode["typed-conversation"]).toMatchObject({
      completedCount: 1,
      completionRateBasisPoints: 5000,
      correctionCount: 2,
      correctionsPerCompletionBasisPoints: 20_000,
      startedCount: 2,
    });
    expect(snapshot.metrics?.byMode.mixed.startedCount).toBe(1);
    expect(snapshot.metrics?.byMode.unobserved.startedCount).toBe(1);
    expect(snapshot.metrics?.byMode.voice.completionRateBasisPoints).toBeNull();
  });

  it("suppresses all funnel metrics below the cohort threshold", () => {
    const snapshot = buildCandidateInterviewFunnelSnapshot({
      outcomes: funnelOutcomes.slice(0, 4),
      request,
      usage: funnelUsage.slice(0, 4),
    });

    expect(snapshot.dataState).toBe("suppressed-small-cohort");
    expect(snapshot.metrics).toBeNull();
  });

  it("emits no session, execution, provider, or interview content", () => {
    const serialized = JSON.stringify(
      buildCandidateInterviewFunnelSnapshot({
        outcomes: funnelOutcomes,
        request,
        usage: funnelUsage,
      }),
    );

    expect(serialized).not.toMatch(/session-synthetic|execution-synthetic/);
    expect(serialized).not.toMatch(/provider|model|prompt|answer|transcript/);
  });

  it("rejects orphaned, duplicate, and out-of-window lineage", () => {
    expect(() =>
      buildCandidateInterviewFunnelSnapshot({
        outcomes: funnelOutcomes,
        request,
        usage: [
          ...funnelUsage,
          {
            ...usage(5, 6, "structured"),
            sessionId: "session-orphaned",
          },
        ],
      }),
    ).toThrow("no outcome session");
    expect(() =>
      buildCandidateInterviewFunnelSnapshot({
        outcomes: [...funnelOutcomes, funnelOutcomes[0]!],
        request,
        usage: funnelUsage,
      }),
    ).toThrow("duplicate sessions");
    expect(() =>
      buildCandidateInterviewFunnelSnapshot({
        outcomes: [
          ...funnelOutcomes.slice(0, 4),
          {
            ...funnelOutcomes[4]!,
            startedAt: "2026-08-24T12:05:00.000Z",
          },
        ],
        request,
        usage: funnelUsage,
      }),
    ).toThrow("outside the funnel window");
    expect(() =>
      buildCandidateInterviewFunnelSnapshot({
        outcomes: funnelOutcomes,
        request,
        usage: [
          ...funnelUsage,
          {
            ...usage(5, 7, "structured"),
            occurredAt: "2026-08-26T00:00:01.000Z",
          },
        ],
      }),
    ).toThrow("outside its session");
  });
});
