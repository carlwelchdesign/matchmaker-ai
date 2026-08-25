import { describe, expect, it } from "vitest";

import {
  buildCandidateWorkflowFunnelSnapshot,
  candidateWorkflowFunnelSchemaVersion,
  recordCandidateWorkflowObservation,
} from "./candidate-workflow-outcomes.js";
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

function observation(number: number, overrides: Record<string, unknown> = {}) {
  return recordCandidateWorkflowObservation({
    dataQualityState: "complete",
    deliveredAt: "2026-08-25T15:00:00.000Z",
    firstMeetingState: "occurred",
    journeyId: `journey-synthetic-${number}`,
    observedAt: "2026-08-25T18:00:00.000Z",
    participantADecision: "accepted",
    participantAFollowupInterest: "interested",
    participantBDecision: "accepted",
    participantBFollowupInterest: "interested",
    policyVersion: "workflow-policy-v1",
    recommendedAt: "2026-08-25T14:00:00.000Z",
    respectfulClosureState: "open",
    reviewedAt: "2026-08-25T12:30:00.000Z",
    selectionProjectedAt: "2026-08-25T12:00:00.000Z",
    selectionSetVersion: "selection-set-v1",
    shortlistedAt: "2026-08-25T13:00:00.000Z",
    ...overrides,
  });
}

const request = {
  cohortKey: "cohort-synthetic-pilot",
  minimumCohortSize: 5,
  windowEnd: "2026-08-26T00:00:00.000Z",
  windowStart: "2026-08-25T00:00:00.000Z",
} as const;

describe("candidate workflow funnel", () => {
  it("keeps every downstream denominator separate", () => {
    const observations = [
      observation(1),
      observation(2, {
        deliveredAt: null,
        firstMeetingState: "not-applicable",
        participantBDecision: "declined",
        participantAFollowupInterest: "not-applicable",
        participantBFollowupInterest: "not-applicable",
        respectfulClosureState: "recorded",
      }),
      observation(3, {
        deliveredAt: null,
        firstMeetingState: "not-applicable",
        participantADecision: "pending",
        participantAFollowupInterest: "not-applicable",
        participantBDecision: "no-response",
        participantBFollowupInterest: "not-applicable",
      }),
      observation(4, {
        deliveredAt: null,
        firstMeetingState: "not-applicable",
        participantADecision: "pending",
        participantAFollowupInterest: "not-applicable",
        participantBDecision: "pending",
        participantBFollowupInterest: "not-applicable",
        recommendedAt: null,
      }),
      observation(5, {
        dataQualityState: "partial",
        deliveredAt: null,
        firstMeetingState: "not-applicable",
        participantADecision: "pending",
        participantAFollowupInterest: "not-applicable",
        participantBDecision: "pending",
        participantBFollowupInterest: "not-applicable",
        recommendedAt: null,
        shortlistedAt: null,
      }),
    ];
    const snapshot = buildCandidateWorkflowFunnelSnapshot({
      ...request,
      observations,
      projection: projection(),
    });

    expect(snapshot).toMatchObject({
      dataState: "available",
      metrics: {
        completeJourneyCount: 4,
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
        respectfulClosureCount: 1,
        reviewedCount: 4,
        shortlistedCount: 4,
        shortlistRateBasisPoints: 10_000,
      },
      schemaVersion: candidateWorkflowFunnelSchemaVersion,
    });
  });

  it("suppresses small cohorts and never emits a success score or identities", () => {
    const snapshot = buildCandidateWorkflowFunnelSnapshot({
      ...request,
      observations: [observation(1)],
      projection: projection(),
    });
    expect(snapshot.metrics).toBeNull();
    const serialized = JSON.stringify(snapshot);
    expect(serialized).not.toMatch(
      /journey-synthetic|candidateId|compatibility|successScore|safety/,
    );
  });

  it("rejects impossible stage and consent sequences", () => {
    expect(() => observation(1, { shortlistedAt: null })).toThrow(
      "requires shortlist inclusion",
    );
    expect(() => observation(1, { participantBDecision: "declined" })).toThrow(
      "independent mutual approval",
    );
    expect(() =>
      observation(1, {
        deliveredAt: null,
        firstMeetingState: "occurred",
      }),
    ).toThrow("requires delivery");
    expect(() =>
      observation(1, {
        participantAFollowupInterest: "not-applicable",
      }),
    ).toThrow("explicit or not-reported");
    expect(() =>
      observation(1, {
        selectionProjectedAt: "2026-08-25T12:31:00.000Z",
      }),
    ).toThrow("cannot follow workflow review");
    expect(() =>
      recordCandidateWorkflowObservation({
        ...observation(1),
        relationshipNarrative: "private outcome detail",
      }),
    ).toThrow("unexpected fields");
  });

  it("rejects duplicate and mismatched projection lineage", () => {
    expect(() =>
      buildCandidateWorkflowFunnelSnapshot({
        ...request,
        observations: [observation(1), observation(1)],
        projection: projection(),
      }),
    ).toThrow("duplicate journeys");
    expect(() =>
      buildCandidateWorkflowFunnelSnapshot({
        ...request,
        observations: [
          observation(1, {
            selectionProjectedAt: "2026-08-25T12:01:00.000Z",
          }),
        ],
        projection: projection(),
      }),
    ).toThrow("mismatched projection lineage");
  });
});
