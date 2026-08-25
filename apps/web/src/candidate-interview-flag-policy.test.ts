import { describe, expect, it } from "vitest";

import {
  candidateInterviewFlagPolicyVersion,
  evaluateCandidateInterviewFlag,
} from "./candidate-interview-flag-policy";

describe("candidate interview flag policy", () => {
  it("enables only an explicit boolean true", async () => {
    await expect(
      evaluateCandidateInterviewFlag(async () => true),
    ).resolves.toEqual({
      enabled: true,
      policyVersion: candidateInterviewFlagPolicyVersion,
      reason: "enabled",
      sensitiveAttributesStored: false,
    });
  });

  it("keeps an explicit boolean false disabled", async () => {
    await expect(
      evaluateCandidateInterviewFlag(async () => false),
    ).resolves.toMatchObject({ enabled: false, reason: "disabled" });
  });

  it.each([undefined, null, "true", 1, { enabled: true }])(
    "fails closed for malformed value %j",
    async (value) => {
      await expect(
        evaluateCandidateInterviewFlag(async () => value),
      ).resolves.toMatchObject({ enabled: false, reason: "invalid-value" });
    },
  );

  it("fails closed when provider evaluation throws", async () => {
    await expect(
      evaluateCandidateInterviewFlag(async () => {
        throw new Error("synthetic provider outage");
      }),
    ).resolves.toMatchObject({
      enabled: false,
      reason: "evaluation-error",
      sensitiveAttributesStored: false,
    });
  });
});
