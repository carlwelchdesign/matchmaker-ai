import {
  buildCandidateApprovedFactInspection,
  candidatePurposeProjectionSchemaVersion,
  type CandidateApprovedFactInspection,
  type CandidatePurposeProjection,
} from "@argent/domain";
import type {
  CandidateApprovedFactFreshness,
  CandidateInspectionPageData,
} from "./candidate-inspection-view-model";

export const candidateInspectionTimestamp = "2026-08-28T16:00:00.000Z";

export const candidateInspectionCandidates = [
  { id: "candidate-ember", label: "Ember Lane" },
  { id: "candidate-noor", label: "Noor Sable" },
  { id: "candidate-tarin", label: "Tarin Vale" },
] as const;

export const candidateInspectionTopics = [
  { id: "geography", label: "Geography" },
  { id: "relationship-intention", label: "Relationship intention" },
  { id: "social-rhythm", label: "Social rhythm" },
] as const;

export const candidateInspectionFreshness = [
  { id: "current", label: "Current" },
  { id: "expires-soon", label: "Expires soon" },
] as const satisfies readonly {
  id: CandidateApprovedFactFreshness;
  label: string;
}[];

const fieldStateCounts: CandidatePurposeProjection["fieldStateCounts"] = {
  active: 5,
  declined: 0,
  disputed: 1,
  private: 1,
  rejected: 0,
  stale: 0,
  superseded: 0,
  unknown: 3,
  withdrawn: 0,
};

const syntheticProjection: CandidatePurposeProjection = {
  approvedAssertionsOnly: true,
  candidateCount: candidateInspectionCandidates.length,
  evaluatedAssertionCount: 7,
  excludedAssertionCount: 2,
  fieldStateCounts,
  includedAssertions: [
    {
      assertionId: "ember-intention",
      candidateId: "candidate-ember",
      classification: "restricted-candidate-approved",
      fieldLabel: "Relationship intention",
      permission: {
        consentGrantId: "consent-ember-01",
        freshUntil: "2026-09-18T16:00:00.000Z",
        retainUntil: "2026-11-18T16:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-2026-08",
        questionId: "relationship-intention",
        responseRevision: 2,
        reviewedAt: "2026-08-24T18:30:00.000Z",
      },
      topic: "relationship-intention",
      value: "Seeking a committed long-term relationship",
    },
    {
      assertionId: "ember-geography",
      candidateId: "candidate-ember",
      classification: "restricted-candidate-approved",
      fieldLabel: "Preferred geography",
      permission: {
        consentGrantId: "consent-ember-02",
        freshUntil: "2026-09-03T16:00:00.000Z",
        retainUntil: "2026-11-03T16:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-2026-08",
        questionId: "preferred-geography",
        responseRevision: 1,
        reviewedAt: "2026-08-22T17:10:00.000Z",
      },
      topic: "geography",
      value: "Open to introductions within the Central Coast region",
    },
    {
      assertionId: "noor-intention",
      candidateId: "candidate-noor",
      classification: "restricted-candidate-approved",
      fieldLabel: "Relationship intention",
      permission: {
        consentGrantId: "consent-noor-01",
        freshUntil: "2026-09-24T16:00:00.000Z",
        retainUntil: "2026-11-24T16:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-2026-08",
        questionId: "relationship-intention",
        responseRevision: 3,
        reviewedAt: "2026-08-26T15:45:00.000Z",
      },
      topic: "relationship-intention",
      value: "Interested in a thoughtful, committed partnership",
    },
    {
      assertionId: "noor-rhythm",
      candidateId: "candidate-noor",
      classification: "restricted-candidate-approved",
      fieldLabel: "Preferred social rhythm",
      permission: {
        consentGrantId: "consent-noor-02",
        freshUntil: "2026-09-01T16:00:00.000Z",
        retainUntil: "2026-11-01T16:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-2026-08",
        questionId: "preferred-social-rhythm",
        responseRevision: 1,
        reviewedAt: "2026-08-20T19:00:00.000Z",
      },
      topic: "social-rhythm",
      value: "Prefers a balance of quiet evenings and small gatherings",
    },
    {
      assertionId: "tarin-geography",
      candidateId: "candidate-tarin",
      classification: "restricted-candidate-approved",
      fieldLabel: "Preferred geography",
      permission: {
        consentGrantId: "consent-tarin-01",
        freshUntil: "2026-09-20T16:00:00.000Z",
        retainUntil: "2026-11-20T16:00:00.000Z",
      },
      provenance: {
        guideVersion: "guide-2026-08",
        questionId: "preferred-geography",
        responseRevision: 2,
        reviewedAt: "2026-08-25T16:20:00.000Z",
      },
      topic: "geography",
      value: "Currently based in Santa Barbara County",
    },
  ],
  projectedAt: candidateInspectionTimestamp,
  purpose: "matchmaker-discovery",
  rawSourceIncluded: false,
  role: "matchmaker",
  schemaVersion: candidatePurposeProjectionSchemaVersion,
};

export function buildSyntheticCandidateInspection(): CandidateApprovedFactInspection {
  return buildCandidateApprovedFactInspection({
    freshnessWarningWindowMs: 7 * 24 * 60 * 60 * 1_000,
    inspectedAt: candidateInspectionTimestamp,
    projection: syntheticProjection,
  });
}

export function buildSyntheticCandidateInspectionPageData(): CandidateInspectionPageData {
  const inspection = buildSyntheticCandidateInspection();

  return {
    candidates: candidateInspectionCandidates,
    freshnessOptions: candidateInspectionFreshness,
    inspection: {
      approvedFactCount: inspection.approvedFactCount,
      excludedFactCount: inspection.excludedFactCount,
      facts: inspection.facts,
      fieldStateCounts: {
        disputed: inspection.fieldStateCounts.disputed,
        private: inspection.fieldStateCounts.private,
        unknown: inspection.fieldStateCounts.unknown,
      },
      inspectedAt: inspection.inspectedAt,
      matchingFactCount: inspection.matchingFactCount,
      sourcePurpose: "matchmaker-discovery",
    },
    topics: candidateInspectionTopics,
  };
}
