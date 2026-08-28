import { describe, expect, it } from "vitest";

import {
  buildCandidateApprovedFactInspection,
  candidateApprovedFactInspectionSchemaVersion,
} from "./candidate-approved-fact-inspection.js";
import {
  candidatePurposeProjectionSchemaVersion,
  type CandidatePurposeProjection,
} from "./candidate-purpose-projection.js";

const projectedAt = "2026-08-26T00:00:00.000Z";
const fieldStateCounts = {
  active: 3,
  declined: 1,
  disputed: 1,
  private: 1,
  rejected: 0,
  stale: 0,
  superseded: 0,
  unknown: 2,
  withdrawn: 0,
} as const;

const projection: CandidatePurposeProjection = {
  approvedAssertionsOnly: true,
  candidateCount: 2,
  evaluatedAssertionCount: 5,
  excludedAssertionCount: 2,
  fieldStateCounts,
  includedAssertions: [
    {
      assertionId: "candidate-alpha-intentions-r1",
      candidateId: "candidate-alpha",
      classification: "restricted-candidate-approved",
      fieldLabel: "Intentions",
      permission: {
        consentGrantId: "consent-alpha",
        freshUntil: "2026-08-28T00:00:00.000Z",
        retainUntil: "2026-09-26T00:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-v1",
        questionId: "intentions",
        responseRevision: 1,
        reviewedAt: "2026-08-25T20:00:00.000Z",
      },
      topic: "intentions",
      value: "Seeking a committed relationship",
    },
    {
      assertionId: "candidate-alpha-location-r2",
      candidateId: "candidate-alpha",
      classification: "restricted-candidate-approved",
      fieldLabel: "Location flexibility",
      permission: {
        consentGrantId: "consent-alpha",
        freshUntil: "2026-08-26T01:00:00.000Z",
        retainUntil: "2026-09-26T00:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-v1",
        questionId: "location-flexibility",
        responseRevision: 2,
        reviewedAt: "2026-08-25T21:00:00.000Z",
      },
      topic: "location",
      value: "Open to the Central Coast",
    },
    {
      assertionId: "candidate-beta-lifestyle-r1",
      candidateId: "candidate-beta",
      classification: "restricted-candidate-approved",
      fieldLabel: "Lifestyle rhythm",
      permission: {
        consentGrantId: "consent-beta",
        freshUntil: "2026-08-30T00:00:00.000Z",
        retainUntil: "2026-09-30T00:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-v1",
        questionId: "lifestyle-rhythm",
        responseRevision: 1,
        reviewedAt: "2026-08-25T22:00:00.000Z",
      },
      topic: "lifestyle",
      value: "Values unhurried weekends",
    },
  ],
  projectedAt,
  purpose: "matchmaker-discovery",
  rawSourceIncluded: false,
  role: "matchmaker",
  schemaVersion: candidatePurposeProjectionSchemaVersion,
};

const request = {
  freshnessWarningWindowMs: 7_200_000,
  inspectedAt: projectedAt,
  projection,
} as const;

describe("candidate approved fact inspection", () => {
  it("presents only approved facts with exact provenance and honest freshness", () => {
    const inspection = buildCandidateApprovedFactInspection(request);

    expect(inspection).toMatchObject({
      approvedFactCount: 3,
      approvedFactsOnly: true,
      excludedFactCount: 2,
      fieldStateCounts,
      freshnessWarningWindowMs: 7_200_000,
      inspectedAt: projectedAt,
      matchingFactCount: 3,
      rawInterviewContentIncluded: false,
      schemaVersion: candidateApprovedFactInspectionSchemaVersion,
      sourceAssertionCount: 5,
      sourceProjection: {
        projectedAt,
        purpose: "matchmaker-discovery",
        role: "matchmaker",
        schemaVersion: candidatePurposeProjectionSchemaVersion,
      },
    });
    expect(inspection.facts[0]).toMatchObject({
      candidateId: "candidate-alpha",
      freshness: "current",
      provenance: {
        derivation: "source-exact",
        guideVersion: "guide-v1",
        questionId: "intentions",
        responseRevision: 1,
        reviewedAt: "2026-08-25T20:00:00.000Z",
      },
      value: "Seeking a committed relationship",
    });
    expect(inspection.facts[1]?.freshness).toBe("expires-soon");
    expect(JSON.stringify(inspection)).not.toMatch(
      /prompt|transcript|audio|modelVersion|compatibility|attractiveness|wealth/,
    );
  });

  it("filters by candidate, topic, and freshness without inventing facts", () => {
    const inspection = buildCandidateApprovedFactInspection({
      ...request,
      filter: {
        candidateIds: ["candidate-alpha"],
        freshness: ["expires-soon"],
        topics: ["location"],
      },
    });

    expect(inspection.filter).toEqual({
      candidateIds: ["candidate-alpha"],
      freshness: ["expires-soon"],
      topics: ["location"],
    });
    expect(inspection.matchingFactCount).toBe(1);
    expect(inspection.facts.map((fact) => fact.factId)).toEqual([
      "candidate-alpha-location-r2",
    ]);
    expect(inspection.fieldStateCounts.unknown).toBe(2);
    expect(inspection.fieldStateCounts.disputed).toBe(1);
  });

  it("returns an honest empty result while preserving projection uncertainty", () => {
    const inspection = buildCandidateApprovedFactInspection({
      ...request,
      filter: { topics: ["family-planning"] },
    });

    expect(inspection.facts).toEqual([]);
    expect(inspection.matchingFactCount).toBe(0);
    expect(inspection.approvedFactCount).toBe(3);
    expect(inspection.excludedFactCount).toBe(2);
    expect(inspection.sourceAssertionCount).toBe(5);
    expect(inspection.fieldStateCounts.unknown).toBe(2);
  });

  it("fails closed on stale access, inconsistent roles, or invalid projections", () => {
    expect(() =>
      buildCandidateApprovedFactInspection({
        ...request,
        inspectedAt: "2026-08-26T00:00:01.000Z",
      }),
    ).toThrow("projection generated at access time");
    expect(() =>
      buildCandidateApprovedFactInspection({
        ...request,
        projection: { ...projection, role: "data-analyst" },
      }),
    ).toThrow("purpose and role do not agree");
    expect(() =>
      buildCandidateApprovedFactInspection({
        ...request,
        projection: { ...projection, evaluatedAssertionCount: 6 },
      }),
    ).toThrow("assertion counts do not agree");
    expect(() =>
      buildCandidateApprovedFactInspection({
        ...request,
        projection: {
          ...projection,
          includedAssertions: projection.includedAssertions.map(
            (assertion, index) =>
              index === 0
                ? {
                    ...assertion,
                    permission: {
                      ...assertion.permission,
                      freshUntil: "2026-08-25T23:59:59.000Z",
                    },
                  }
                : assertion,
          ),
        },
      }),
    ).toThrow("expired assertion");
    expect(() =>
      buildCandidateApprovedFactInspection({
        ...request,
        filter: { candidateIds: ["candidate-alpha", "candidate-alpha"] },
      }),
    ).toThrow("filters must be unique");
  });
});
