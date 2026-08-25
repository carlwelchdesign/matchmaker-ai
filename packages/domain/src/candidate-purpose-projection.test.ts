import { describe, expect, it } from "vitest";

import { buildCandidateInterviewReview } from "./candidate-interview.js";
import {
  buildCandidateIntelligenceRecord,
  transitionCandidateAssertion,
  type CandidateIntelligenceInput,
  type CandidateIntelligenceRecord,
} from "./candidate-intelligence.js";
import {
  buildCandidatePurposeProjection,
  candidatePurposeProjectionSchemaVersion,
} from "./candidate-purpose-projection.js";

const reviewedAt = "2026-08-25T12:00:00.000Z";

function buildRecord(candidateId = "candidate-synthetic-001") {
  const input: CandidateIntelligenceInput = {
    candidateId,
    permissionByQuestionId: {
      intentions: {
        allowedRoles: ["matchmaker", "data-analyst"],
        consentGrantId: "consent-synthetic-001",
        freshUntil: "2026-11-25T12:00:00.000Z",
        purposes: ["matchmaker-discovery", "candidate-analytics"],
        retainUntil: "2027-08-25T12:00:00.000Z",
      },
    },
    review: buildCandidateInterviewReview({
      fields: [
        {
          disposition: "approved",
          fieldLabel: "Relationship intentions",
          questionId: "intentions",
          responseRevision: 2,
          sourceText: "A relationship grounded in curiosity and generosity.",
          topic: "relationship-intention",
        },
        {
          disposition: "private",
          fieldLabel: "Life rhythm",
          questionId: "rhythm",
          responseRevision: 1,
          sourceText: "Private transcript content must remain outside.",
          topic: "life-rhythm",
        },
        {
          disposition: "rejected",
          fieldLabel: "Early boundaries",
          questionId: "boundaries",
          responseRevision: 1,
          sourceText: "Rejected proposal content must remain outside.",
          topic: "personal-boundaries",
        },
      ],
      guideVersion: "argent-text-guide-2026-08-25",
    }),
    reviewedAt,
  };
  return buildCandidateIntelligenceRecord(input);
}

describe("candidate purpose projection", () => {
  it("projects only active approved assertions with consent lineage", () => {
    const projection = buildCandidatePurposeProjection([buildRecord()], {
      at: "2026-08-26T12:00:00.000Z",
      purpose: "matchmaker-discovery",
      role: "matchmaker",
    });

    expect(projection).toMatchObject({
      approvedAssertionsOnly: true,
      candidateCount: 1,
      evaluatedAssertionCount: 1,
      excludedAssertionCount: 0,
      fieldStateCounts: { active: 1, private: 1, rejected: 1 },
      projectedAt: "2026-08-26T12:00:00.000Z",
      purpose: "matchmaker-discovery",
      rawSourceIncluded: false,
      role: "matchmaker",
      schemaVersion: candidatePurposeProjectionSchemaVersion,
    });
    expect(projection.includedAssertions[0]).toMatchObject({
      classification: "restricted-candidate-approved",
      permission: { consentGrantId: "consent-synthetic-001" },
      provenance: {
        questionId: "intentions",
        responseRevision: 2,
      },
      value: "A relationship grounded in curiosity and generosity.",
    });
  });

  it("does not expose private or rejected interview source", () => {
    const serialized = JSON.stringify(
      buildCandidatePurposeProjection([buildRecord()], {
        at: "2026-08-26T12:00:00.000Z",
        purpose: "candidate-analytics",
        role: "data-analyst",
      }),
    );

    expect(serialized).not.toContain("Private transcript content");
    expect(serialized).not.toContain("Rejected proposal content");
    expect(serialized).not.toMatch(
      /rawAudio|privateNote|safetyRecord|unapprovedTranscript/,
    );
    expect(serialized).not.toMatch(
      /compatibility|attractiveness|desirability|wealthScore|candidateValue/,
    );
  });

  it("excludes assertions when purpose and role do not agree", () => {
    const projection = buildCandidatePurposeProjection([buildRecord()], {
      at: "2026-08-26T12:00:00.000Z",
      purpose: "candidate-analytics",
      role: "matchmaker",
    });

    expect(projection.includedAssertions).toEqual([]);
    expect(projection.excludedAssertionCount).toBe(1);
  });

  it("excludes withdrawn assertions without deleting lifecycle evidence", () => {
    const record = buildRecord();
    const assertion = record.assertions[0];
    if (!assertion) throw new Error("Expected approved assertion fixture");
    const withdrawn = transitionCandidateAssertion(assertion, {
      at: "2026-08-26T12:00:00.000Z",
      reasonCode: "candidate-withdrawal",
      status: "withdrawn",
    });
    const withdrawnRecord: CandidateIntelligenceRecord = {
      ...record,
      assertions: [withdrawn],
    };

    const projection = buildCandidatePurposeProjection([withdrawnRecord], {
      at: "2026-08-27T12:00:00.000Z",
      purpose: "matchmaker-discovery",
      role: "matchmaker",
    });

    expect(projection.includedAssertions).toEqual([]);
    expect(withdrawn.lifecycle.history).toHaveLength(1);
  });

  it("rejects duplicate candidate and assertion lineage", () => {
    const record = buildRecord();
    expect(() =>
      buildCandidatePurposeProjection([record, record], {
        at: "2026-08-26T12:00:00.000Z",
        purpose: "candidate-analytics",
        role: "data-analyst",
      }),
    ).toThrow("duplicate candidates");

    const duplicateAssertionRecord: CandidateIntelligenceRecord = {
      ...buildRecord("candidate-synthetic-002"),
      assertions: record.assertions.map((assertion) => ({
        ...assertion,
        candidateId: "candidate-synthetic-002",
      })),
    };
    expect(() =>
      buildCandidatePurposeProjection([record, duplicateAssertionRecord], {
        at: "2026-08-26T12:00:00.000Z",
        purpose: "candidate-analytics",
        role: "data-analyst",
      }),
    ).toThrow("duplicate assertions");
  });

  it("rejects malformed projection scope and cross-candidate assertions", () => {
    expect(() =>
      buildCandidatePurposeProjection([], {
        at: "not-a-timestamp",
        purpose: "candidate-analytics",
        role: "data-analyst",
      }),
    ).toThrow("Projection time");

    const record = buildRecord();
    expect(() =>
      buildCandidatePurposeProjection(
        [
          {
            ...record,
            candidateId: "candidate-synthetic-002",
          },
        ],
        {
          at: "2026-08-26T12:00:00.000Z",
          purpose: "candidate-analytics",
          role: "data-analyst",
        },
      ),
    ).toThrow("does not belong");
  });
});
