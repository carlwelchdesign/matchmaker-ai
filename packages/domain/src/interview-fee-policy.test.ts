import { describe, expect, it } from "vitest";

import {
  createInterviewFeeDecision,
  interviewFeeDecisionSchemaVersion,
  type InterviewFeeDecisionInput,
} from "./interview-fee-policy.js";

const freePilot: InterviewFeeDecisionInput = {
  accountVerificationState: "planned",
  candidateSubmissionFeeMicrousd: 0,
  decisionId: "decision-first-pilot",
  dec016SupersessionKey: null,
  fairnessReviewKey: null,
  founderApprovalKey: null,
  invitationControlState: "planned",
  legalReviewKey: null,
  pilotPhase: "first-pilot",
  pricingApprovalKey: null,
  rateLimitState: "planned",
  refundPolicyKey: null,
};

describe("interview fee policy", () => {
  it("keeps the first-pilot candidate application free by default", () => {
    expect(createInterviewFeeDecision(freePilot)).toEqual({
      ...freePilot,
      abuseControlsVerified: false,
      candidateApplicationFree: true,
      paymentCredentialsStored: false,
      schemaVersion: interviewFeeDecisionSchemaVersion,
    });
  });

  it("rejects a fee when abuse controls are only planned", () => {
    expect(() =>
      createInterviewFeeDecision({
        ...freePilot,
        candidateSubmissionFeeMicrousd: 10_000_000,
      }),
    ).toThrow(
      "Candidate fees require verified account, invitation, and rate-limit controls",
    );
  });

  it("rejects a fee without the full supersession and review package", () => {
    expect(() =>
      createInterviewFeeDecision({
        ...freePilot,
        accountVerificationState: "verified",
        candidateSubmissionFeeMicrousd: 10_000_000,
        invitationControlState: "verified",
        rateLimitState: "verified",
      }),
    ).toThrow("Candidate fees require DEC-016 supersession");
  });

  it("represents an explicitly superseded fee without payment credentials", () => {
    expect(
      createInterviewFeeDecision({
        ...freePilot,
        accountVerificationState: "verified",
        candidateSubmissionFeeMicrousd: 10_000_000,
        dec016SupersessionKey: "dec-016-superseded",
        fairnessReviewKey: "fairness-review-approved",
        founderApprovalKey: "founder-approved",
        invitationControlState: "verified",
        legalReviewKey: "legal-review-approved",
        pilotPhase: "post-pilot",
        pricingApprovalKey: "pricing-approved",
        rateLimitState: "verified",
        refundPolicyKey: "refund-policy-approved",
      }),
    ).toMatchObject({
      abuseControlsVerified: true,
      candidateApplicationFree: false,
      paymentCredentialsStored: false,
    });
  });

  it("rejects card data and other unrecognized fields", () => {
    expect(() =>
      createInterviewFeeDecision({
        ...freePilot,
        cardNumber: "not-allowed",
      }),
    ).toThrow("unexpected or missing fields");
  });
});
