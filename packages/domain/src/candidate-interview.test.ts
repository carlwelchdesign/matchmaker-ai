import { describe, expect, it } from "vitest";

import {
  buildCandidateInterviewReview,
  candidateInterviewReviewSchemaVersion,
  type CandidateInterviewFieldInput,
} from "./candidate-interview.js";

const approvedField: CandidateInterviewFieldInput = {
  disposition: "approved",
  fieldLabel: "Relationship intentions",
  questionId: "intentions",
  responseRevision: 2,
  sourceText: "  A relationship grounded in curiosity and generosity.  ",
  topic: "relationship-intention",
};

describe("buildCandidateInterviewReview", () => {
  it("makes only approved, source-exact fields eligible for use", () => {
    const review = buildCandidateInterviewReview({
      fields: [
        approvedField,
        {
          ...approvedField,
          disposition: "private",
          fieldLabel: "Life rhythm",
          questionId: "rhythm",
          responseRevision: 1,
          sourceText: "Quiet weekdays and social weekends.",
          topic: "life-rhythm",
        },
        {
          ...approvedField,
          disposition: "rejected",
          fieldLabel: "Early boundaries",
          questionId: "boundaries",
          responseRevision: 1,
          sourceText: "This field does not represent what I meant.",
          topic: "personal-boundaries",
        },
        {
          ...approvedField,
          disposition: "declined",
          fieldLabel: "Preferred introduction pace",
          questionId: "pace",
          responseRevision: 1,
          sourceText: "Prefer not to answer",
          topic: "introduction-pace",
        },
      ],
      guideVersion: "argent-text-guide-2026-08-24",
    });

    expect(review.schemaVersion).toBe(candidateInterviewReviewSchemaVersion);
    expect(review.approvedFieldCount).toBe(1);
    expect(review.fields[0]).toMatchObject({
      derivation: "source-exact",
      eligibleForAnalytics: true,
      eligibleForProfileUse: true,
      sourceText: "A relationship grounded in curiosity and generosity.",
      provenance: {
        questionId: "intentions",
        responseRevision: 2,
      },
    });
    expect(review.fields.slice(1)).toSatisfy((fields) =>
      fields.every(
        (field) => !field.eligibleForAnalytics && !field.eligibleForProfileUse,
      ),
    );
  });

  it.each([
    {
      name: "an empty review",
      fields: [],
      message: "at least one field",
    },
    {
      name: "duplicate question provenance",
      fields: [approvedField, approvedField],
      message: "Duplicate interview question",
    },
    {
      name: "an invalid revision",
      fields: [{ ...approvedField, responseRevision: 0 }],
      message: "positive integer",
    },
    {
      name: "a disguised decline",
      fields: [
        {
          ...approvedField,
          disposition: "declined" as const,
          sourceText: "No comment",
        },
      ],
      message: "explicit prefer-not-to-answer source",
    },
    {
      name: "an unknown disposition",
      fields: [
        {
          ...approvedField,
          disposition: "shared" as CandidateInterviewFieldInput["disposition"],
        },
      ],
      message: "disposition is not supported",
    },
  ])("rejects $name", ({ fields, message }) => {
    expect(() =>
      buildCandidateInterviewReview({
        fields,
        guideVersion: "argent-text-guide-2026-08-24",
      }),
    ).toThrow(message);
  });
});
