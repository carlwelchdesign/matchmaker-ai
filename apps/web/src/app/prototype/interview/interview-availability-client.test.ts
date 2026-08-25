import { describe, expect, it } from "vitest";

import { candidateInterviewFlagPolicyVersion } from "../../../candidate-interview-flag-policy";
import {
  createInterviewAvailabilityTransportFailure,
  fetchInterviewAvailability,
  interviewAvailabilityRefreshIntervalMs,
  parseInterviewAvailabilityResponse,
} from "./interview-availability-client";

describe("interview availability client boundary", () => {
  it.each([
    { enabled: true, reason: "enabled" },
    { enabled: false, reason: "disabled" },
    { enabled: false, reason: "evaluation-error" },
    { enabled: false, reason: "invalid-value" },
  ] as const)("accepts the versioned $reason decision", (decision) => {
    expect(
      parseInterviewAvailabilityResponse({
        ...decision,
        policyVersion: candidateInterviewFlagPolicyVersion,
        sensitiveAttributesStored: false,
      }),
    ).toEqual({
      ...decision,
      policyVersion: candidateInterviewFlagPolicyVersion,
      sensitiveAttributesStored: false,
    });
  });

  it.each([
    undefined,
    null,
    true,
    {},
    {
      enabled: "true",
      policyVersion: candidateInterviewFlagPolicyVersion,
      reason: "enabled",
      sensitiveAttributesStored: false,
    },
    {
      enabled: true,
      policyVersion: candidateInterviewFlagPolicyVersion,
      reason: "unknown",
      sensitiveAttributesStored: false,
    },
    {
      enabled: true,
      policyVersion: candidateInterviewFlagPolicyVersion,
      reason: "enabled",
      sensitiveAttributesStored: true,
    },
  ])("fails closed for malformed payload %#", (payload) => {
    expect(parseInterviewAvailabilityResponse(payload)).toMatchObject({
      enabled: false,
      reason: "invalid-response",
    });
  });

  it("fails closed for a stale policy version", () => {
    expect(
      parseInterviewAvailabilityResponse({
        enabled: true,
        policyVersion: "candidate-interview-flag-policy/v0",
        reason: "enabled",
        sensitiveAttributesStored: false,
      }),
    ).toMatchObject({ enabled: false, reason: "stale-policy" });
  });

  it("fails closed for transport errors", () => {
    expect(createInterviewAvailabilityTransportFailure()).toMatchObject({
      enabled: false,
      reason: "transport-error",
    });
  });

  it("maps a successful HTTP response through the versioned parser", async () => {
    const request = async () =>
      new Response(
        JSON.stringify({
          enabled: true,
          policyVersion: candidateInterviewFlagPolicyVersion,
          reason: "enabled",
          sensitiveAttributesStored: false,
        }),
      );

    await expect(
      fetchInterviewAvailability({
        request,
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({ enabled: true, reason: "enabled" });
  });

  it.each([
    async () => new Response(null, { status: 503 }),
    async () => new Response("not-json"),
    async () => {
      throw new Error("synthetic network outage");
    },
  ])("fails closed for an unavailable transport %#", async (request) => {
    await expect(
      fetchInterviewAvailability({
        request,
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({ enabled: false, reason: "transport-error" });
  });

  it("caps visible active-session refreshes at once per minute", () => {
    expect(interviewAvailabilityRefreshIntervalMs).toBe(60_000);
  });
});
