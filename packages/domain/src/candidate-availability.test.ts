import { describe, expect, it } from "vitest";

import {
  buildCandidateAvailabilitySnapshot,
  candidateAvailabilityObservationSchemaVersion,
  candidateAvailabilitySnapshotSchemaVersion,
  recordCandidateAvailabilityObservation,
  validateCandidateAvailabilityObservation,
  type CandidateAvailabilityObservation,
  type CandidateAvailabilityState,
} from "./candidate-availability.js";

const candidateIds = Array.from(
  { length: 6 },
  (_, index) => `candidate-synthetic-${index + 1}`,
);

function observation(
  candidateNumber: number,
  state: CandidateAvailabilityState,
  input: { confirmedAt?: string; freshUntil?: string; suffix?: string } = {},
): CandidateAvailabilityObservation {
  return recordCandidateAvailabilityObservation({
    availabilityId: `availability-synthetic-${candidateNumber}${input.suffix ? `-${input.suffix}` : ""}`,
    candidateId: `candidate-synthetic-${candidateNumber}`,
    confirmedAt: input.confirmedAt ?? "2026-08-25T12:00:00.000Z",
    effectiveAt: "2026-08-25T11:00:00.000Z",
    freshUntil: input.freshUntil ?? "2026-09-25T12:00:00.000Z",
    state,
  });
}

const snapshotInput = {
  candidateIds,
  cohortKey: "cohort-synthetic-pilot",
  evaluatedAt: "2026-08-25T18:00:00.000Z",
  minimumCohortSize: 5,
  windowEnd: "2026-08-26T00:00:00.000Z",
  windowStart: "2026-08-25T00:00:00.000Z",
} as const;

describe("candidate availability observation", () => {
  it("records only a candidate-confirmed, source-free decision", () => {
    expect(observation(1, "available")).toEqual({
      availabilityId: "availability-synthetic-1",
      candidateConfirmed: true,
      candidateId: "candidate-synthetic-1",
      confirmedAt: "2026-08-25T12:00:00.000Z",
      discoveryEligibilityGranted: false,
      effectiveAt: "2026-08-25T11:00:00.000Z",
      freshUntil: "2026-09-25T12:00:00.000Z",
      interviewContentStored: false,
      schemaVersion: candidateAvailabilityObservationSchemaVersion,
      state: "available",
    });
  });

  it("rejects inferred decisions, content, and consequential fields", () => {
    const valid = observation(1, "available");

    expect(() =>
      validateCandidateAvailabilityObservation({
        ...valid,
        candidateConfirmed: false,
      }),
    ).toThrow("contract is invalid");
    expect(() =>
      validateCandidateAvailabilityObservation({
        ...valid,
        interviewContent: "I am ready to meet someone",
      }),
    ).toThrow("unexpected fields");
    expect(() =>
      validateCandidateAvailabilityObservation({
        ...valid,
        compatibilityScore: 99,
      }),
    ).toThrow("unexpected fields");
  });

  it("requires chronological confirmation and freshness", () => {
    expect(() =>
      recordCandidateAvailabilityObservation({
        availabilityId: "availability-synthetic-1",
        candidateId: "candidate-synthetic-1",
        confirmedAt: "2026-08-25T12:00:00.000Z",
        effectiveAt: "2026-08-25T13:00:00.000Z",
        freshUntil: "2026-09-25T12:00:00.000Z",
        state: "available",
      }),
    ).toThrow("cannot take effect after confirmation");
  });
});

describe("candidate availability snapshot", () => {
  it("reports current availability with honest unknown and stale states", () => {
    const snapshot = buildCandidateAvailabilitySnapshot({
      ...snapshotInput,
      observations: [
        observation(1, "available"),
        observation(2, "paused"),
        observation(3, "not-available"),
        observation(4, "withdrawn"),
        observation(5, "available", {
          freshUntil: "2026-08-25T17:00:00.000Z",
        }),
      ],
    });

    expect(snapshot).toEqual({
      cohortKey: "cohort-synthetic-pilot",
      dataState: "available",
      evaluatedAt: "2026-08-25T18:00:00.000Z",
      lineage: {
        admissionDecisionGranted: false,
        candidateConfirmedOnly: true,
        discoveryEligibilityGranted: false,
        interviewContentStored: false,
        observationSchemaVersion: candidateAvailabilityObservationSchemaVersion,
      },
      metrics: {
        availableCandidateCount: 1,
        availableCandidateShareBasisPoints: 1667,
        candidateCount: 6,
        knownAvailabilityCount: 4,
        knownAvailabilityShareBasisPoints: 6667,
        stateCounts: {
          available: 1,
          "not-available": 1,
          paused: 1,
          stale: 1,
          unknown: 1,
          withdrawn: 1,
        },
      },
      minimumCohortSize: 5,
      schemaVersion: candidateAvailabilitySnapshotSchemaVersion,
      windowEnd: "2026-08-26T00:00:00.000Z",
      windowStart: "2026-08-25T00:00:00.000Z",
    });
  });

  it("uses the latest candidate confirmation without erasing history", () => {
    const snapshot = buildCandidateAvailabilitySnapshot({
      ...snapshotInput,
      observations: [
        observation(1, "paused", { suffix: "one" }),
        observation(1, "available", {
          confirmedAt: "2026-08-25T16:00:00.000Z",
          suffix: "two",
        }),
      ],
    });

    expect(snapshot.metrics?.stateCounts.available).toBe(1);
    expect(snapshot.metrics?.stateCounts.paused).toBe(0);
    expect(snapshot.metrics?.stateCounts.unknown).toBe(5);
  });

  it("suppresses every metric for a small cohort", () => {
    const snapshot = buildCandidateAvailabilitySnapshot({
      ...snapshotInput,
      candidateIds: candidateIds.slice(0, 4),
      observations: [observation(1, "available")],
    });

    expect(snapshot.dataState).toBe("suppressed-small-cohort");
    expect(snapshot.metrics).toBeNull();
    expect(JSON.stringify(snapshot)).not.toContain("candidate-synthetic");
  });

  it("does not expose candidate, observation, or interview content", () => {
    const serialized = JSON.stringify(
      buildCandidateAvailabilitySnapshot({
        ...snapshotInput,
        observations: [observation(1, "available")],
      }),
    );

    expect(serialized).not.toMatch(
      /candidate-synthetic|availability-synthetic/,
    );
    expect(serialized).not.toMatch(
      /answer|transcript|prompt|compatibility|rank/,
    );
  });

  it("rejects duplicates, out-of-cohort decisions, and future observations", () => {
    const valid = observation(1, "available");
    expect(() =>
      buildCandidateAvailabilitySnapshot({
        ...snapshotInput,
        observations: [valid, valid],
      }),
    ).toThrow("duplicate observations");
    expect(() =>
      buildCandidateAvailabilitySnapshot({
        ...snapshotInput,
        observations: [observation(7, "available")],
      }),
    ).toThrow("outside the cohort");
    expect(() =>
      buildCandidateAvailabilitySnapshot({
        ...snapshotInput,
        observations: [
          observation(1, "available", {
            confirmedAt: "2026-08-25T19:00:00.000Z",
          }),
        ],
      }),
    ).toThrow("follows evaluation");
  });
});
