import { describe, expect, it } from "vitest";

import { buildCandidateInterviewReview } from "./candidate-interview.js";
import {
  buildCandidateIntelligenceRecord,
  canUseCandidateAssertion,
  candidateIntelligenceSchemaVersion,
  createUnknownCandidateFieldState,
  transitionCandidateAssertion,
  type CandidateIntelligenceInput,
} from "./candidate-intelligence.js";

const reviewedAt = "2026-08-25T12:00:00.000Z";
const freshUntil = "2026-11-25T12:00:00.000Z";
const retainUntil = "2027-08-25T12:00:00.000Z";

function buildInput(): CandidateIntelligenceInput {
  return {
    automationLineageByQuestionId: {
      intentions: {
        kind: "deterministic-template",
        plannerVersion: "argent-template-planner-2026-08-25",
      },
    },
    candidateId: "candidate-synthetic-001",
    permissionByQuestionId: {
      intentions: {
        allowedRoles: ["matchmaker", "data-analyst"],
        consentGrantId: "consent-synthetic-001",
        freshUntil,
        purposes: ["matchmaker-discovery", "candidate-analytics"],
        retainUntil,
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
          sourceText:
            "Private source that must not enter candidate intelligence.",
          topic: "life-rhythm",
        },
        {
          disposition: "rejected",
          fieldLabel: "Early boundaries",
          questionId: "boundaries",
          responseRevision: 1,
          sourceText:
            "Rejected source that must not enter candidate intelligence.",
          topic: "personal-boundaries",
        },
        {
          disposition: "declined",
          fieldLabel: "Preferred introduction pace",
          questionId: "pace",
          responseRevision: 1,
          sourceText: "Prefer not to answer",
          topic: "introduction-pace",
        },
      ],
      guideVersion: "argent-text-guide-2026-08-25",
    }),
    reviewedAt,
  };
}

describe("candidate intelligence record", () => {
  it("projects only candidate-approved source into purpose-limited assertions", () => {
    const record = buildCandidateIntelligenceRecord(buildInput());

    expect(record.schemaVersion).toBe(candidateIntelligenceSchemaVersion);
    expect(record.assertions).toHaveLength(1);
    expect(record.assertions[0]).toMatchObject({
      assertionId: "candidate-synthetic-001-intentions-r2",
      classification: "restricted-candidate-approved",
      lifecycle: { status: "active" },
      provenance: {
        automation: {
          kind: "deterministic-template",
          plannerVersion: "argent-template-planner-2026-08-25",
        },
        derivation: "source-exact",
        questionId: "intentions",
        responseRevision: 2,
      },
      retentionClass: "candidate-controlled",
      value: "A relationship grounded in curiosity and generosity.",
    });
    expect(record.fieldStates.map((field) => field.state)).toEqual([
      "active",
      "private",
      "rejected",
      "declined",
    ]);
    expect(JSON.stringify(record.fieldStates)).not.toContain("Private source");
    expect(JSON.stringify(record.fieldStates)).not.toContain("Rejected source");
    expect(JSON.stringify(record)).not.toMatch(
      /compatibility|desirability|score/i,
    );
  });

  it("keeps unknown distinct without inventing source provenance", () => {
    expect(
      createUnknownCandidateFieldState({
        fieldLabel: "Location flexibility",
        topic: "location-flexibility",
      }),
    ).toEqual({
      eligibleForAnalytics: false,
      eligibleForDiscovery: false,
      fieldLabel: "Location flexibility",
      questionId: null,
      responseRevision: null,
      state: "unknown",
      topic: "location-flexibility",
    });
  });

  it("models provider and cost-ledger lineage without making an AI call", () => {
    const input = buildInput();
    const record = buildCandidateIntelligenceRecord({
      ...input,
      automationLineageByQuestionId: {
        intentions: {
          costLedgerEntryId: "cost-entry-synthetic-001",
          executionId: "execution-synthetic-001",
          kind: "ai-execution",
          modelVersion: "model-synthetic-v1",
          promptVersion: "prompt-synthetic-v1",
        },
      },
    });

    expect(record.assertions[0]?.provenance.automation).toEqual({
      costLedgerEntryId: "cost-entry-synthetic-001",
      executionId: "execution-synthetic-001",
      kind: "ai-execution",
      modelVersion: "model-synthetic-v1",
      promptVersion: "prompt-synthetic-v1",
    });
  });

  it("requires purpose, role, freshness, retention, consent, and active state", () => {
    const assertion =
      buildCandidateIntelligenceRecord(buildInput()).assertions[0];
    if (!assertion) throw new Error("Expected approved assertion fixture");

    expect(
      canUseCandidateAssertion(assertion, {
        at: reviewedAt,
        purpose: "matchmaker-discovery",
        role: "matchmaker",
      }),
    ).toBe(true);
    expect(
      canUseCandidateAssertion(assertion, {
        at: reviewedAt,
        purpose: "candidate-analytics",
        role: "matchmaker",
      }),
    ).toBe(false);
    expect(
      canUseCandidateAssertion(assertion, {
        at: "2026-12-01T12:00:00.000Z",
        purpose: "matchmaker-discovery",
        role: "matchmaker",
      }),
    ).toBe(false);

    const withdrawn = transitionCandidateAssertion(assertion, {
      at: "2026-08-26T12:00:00.000Z",
      reasonCode: "candidate-withdrawal",
      status: "withdrawn",
    });
    expect(
      canUseCandidateAssertion(withdrawn, {
        at: "2026-08-27T12:00:00.000Z",
        purpose: "matchmaker-discovery",
        role: "matchmaker",
      }),
    ).toBe(false);
  });

  it("records immutable disputed and withdrawn lifecycle history", () => {
    const original =
      buildCandidateIntelligenceRecord(buildInput()).assertions[0];
    if (!original) throw new Error("Expected approved assertion fixture");

    const disputed = transitionCandidateAssertion(original, {
      at: "2026-08-26T12:00:00.000Z",
      reasonCode: "candidate-dispute",
      status: "disputed",
    });
    const withdrawn = transitionCandidateAssertion(disputed, {
      at: "2026-08-27T12:00:00.000Z",
      reasonCode: "candidate-withdrawal",
      status: "withdrawn",
    });

    expect(original.lifecycle).toEqual({ history: [], status: "active" });
    expect(withdrawn.lifecycle.status).toBe("withdrawn");
    expect(withdrawn.lifecycle.history).toEqual([
      {
        at: "2026-08-26T12:00:00.000Z",
        from: "active",
        reasonCode: "candidate-dispute",
        to: "disputed",
      },
      {
        at: "2026-08-27T12:00:00.000Z",
        from: "disputed",
        reasonCode: "candidate-withdrawal",
        to: "withdrawn",
      },
    ]);
  });

  it("keeps stale distinct and immediately ineligible", () => {
    const assertion =
      buildCandidateIntelligenceRecord(buildInput()).assertions[0];
    if (!assertion) throw new Error("Expected approved assertion fixture");

    const stale = transitionCandidateAssertion(assertion, {
      at: "2026-08-26T12:00:00.000Z",
      reasonCode: "freshness-review-required",
      status: "stale",
    });

    expect(stale.lifecycle.status).toBe("stale");
    expect(
      canUseCandidateAssertion(stale, {
        at: "2026-08-27T12:00:00.000Z",
        purpose: "candidate-analytics",
        role: "data-analyst",
      }),
    ).toBe(false);
  });

  it("requires replacement provenance when an assertion is superseded", () => {
    const assertion =
      buildCandidateIntelligenceRecord(buildInput()).assertions[0];
    if (!assertion) throw new Error("Expected approved assertion fixture");

    expect(() =>
      transitionCandidateAssertion(assertion, {
        at: "2026-08-26T12:00:00.000Z",
        reasonCode: "candidate-correction",
        status: "superseded",
      }),
    ).toThrow("replacement assertion ID");

    expect(
      transitionCandidateAssertion(assertion, {
        at: "2026-08-26T12:00:00.000Z",
        reasonCode: "candidate-correction",
        replacementAssertionId: "candidate-synthetic-001-intentions-r3",
        status: "superseded",
      }).lifecycle.history[0],
    ).toMatchObject({
      replacementAssertionId: "candidate-synthetic-001-intentions-r3",
      to: "superseded",
    });
  });

  it("rejects lifecycle history at or before candidate approval", () => {
    const assertion =
      buildCandidateIntelligenceRecord(buildInput()).assertions[0];
    if (!assertion) throw new Error("Expected approved assertion fixture");

    expect(() =>
      transitionCandidateAssertion(assertion, {
        at: reviewedAt,
        reasonCode: "candidate-dispute",
        status: "disputed",
      }),
    ).toThrow("chronological order");
  });

  it.each([
    {
      change: (input: CandidateIntelligenceInput) => ({
        ...input,
        permissionByQuestionId: {},
      }),
      message: "requires field permission",
      name: "an approved field without field-specific permission",
    },
    {
      change: (input: CandidateIntelligenceInput) => ({
        ...input,
        permissionByQuestionId: {
          intentions: {
            ...input.permissionByQuestionId.intentions!,
            allowedRoles: [
              "matchmaker",
              "staff",
            ] as CandidateIntelligenceInput["permissionByQuestionId"][string]["allowedRoles"],
          },
        },
      }),
      message: "Allowed role is not supported",
      name: "an unsupported runtime role",
    },
    {
      change: (input: CandidateIntelligenceInput) => ({
        ...input,
        permissionByQuestionId: {
          intentions: {
            ...input.permissionByQuestionId.intentions!,
            allowedRoles: ["data-analyst"] as const,
          },
        },
      }),
      message: "requires role matchmaker",
      name: "a purpose without its required role",
    },
    {
      change: (input: CandidateIntelligenceInput) => ({
        ...input,
        permissionByQuestionId: {
          intentions: {
            ...input.permissionByQuestionId.intentions!,
            freshUntil: reviewedAt,
          },
        },
      }),
      message: "Freshness must extend",
      name: "freshness ending at review time",
    },
    {
      change: (input: CandidateIntelligenceInput) => ({
        ...input,
        permissionByQuestionId: {
          intentions: {
            ...input.permissionByQuestionId.intentions!,
            retainUntil: "2026-10-25T12:00:00.000Z",
          },
        },
      }),
      message: "Retention must not end before freshness",
      name: "retention shorter than freshness",
    },
  ])("rejects $name", ({ change, message }) => {
    expect(() =>
      buildCandidateIntelligenceRecord(change(buildInput())),
    ).toThrow(message);
  });
});
