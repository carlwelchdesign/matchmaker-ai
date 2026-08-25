import { describe, expect, it } from "vitest";

import { candidateInterviewRuntimePolicyVersion } from "../../../candidate-interview-runtime-policy";
import {
  createInterviewAvailabilityTransportFailure,
  fetchInterviewAvailability,
  interviewAvailabilityRefreshIntervalMs,
  parseInterviewAvailabilityResponse,
} from "./interview-availability-client";

describe("interview availability client boundary", () => {
  it.each([
    {
      dataBoundary: "synthetic-development",
      enabled: true,
      reason: "enabled-synthetic-development",
    },
    {
      dataBoundary: "release-blocked",
      enabled: false,
      reason: "feature-disabled",
    },
    {
      dataBoundary: "release-blocked",
      enabled: false,
      reason: "flag-evaluation-error",
    },
    {
      dataBoundary: "release-blocked",
      enabled: false,
      reason: "release-gates-closed",
    },
  ] as const)("accepts the versioned $reason decision", (decision) => {
    expect(
      parseInterviewAvailabilityResponse({
        ...decision,
        policyVersion: candidateInterviewRuntimePolicyVersion,
        sensitiveAttributesStored: false,
      }),
    ).toEqual({
      ...decision,
      policyVersion: candidateInterviewRuntimePolicyVersion,
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
      dataBoundary: "synthetic-development",
      policyVersion: candidateInterviewRuntimePolicyVersion,
      reason: "enabled-synthetic-development",
      sensitiveAttributesStored: false,
    },
    {
      enabled: true,
      dataBoundary: "synthetic-development",
      policyVersion: candidateInterviewRuntimePolicyVersion,
      reason: "unknown",
      sensitiveAttributesStored: false,
    },
    {
      enabled: true,
      dataBoundary: "synthetic-development",
      policyVersion: candidateInterviewRuntimePolicyVersion,
      reason: "enabled-synthetic-development",
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
        dataBoundary: "synthetic-development",
        policyVersion: "candidate-interview-runtime-policy/v0",
        reason: "enabled-synthetic-development",
        sensitiveAttributesStored: false,
      }),
    ).toMatchObject({ enabled: false, reason: "stale-policy" });
  });

  it.each([
    {
      dataBoundary: "release-blocked",
      enabled: true,
      reason: "feature-disabled",
    },
    {
      dataBoundary: "real-person-release",
      enabled: false,
      reason: "release-gates-closed",
    },
    {
      dataBoundary: "real-person-release",
      enabled: true,
      reason: "enabled-synthetic-development",
    },
  ] as const)("fails closed for contradictory decision %#", (decision) => {
    expect(
      parseInterviewAvailabilityResponse({
        ...decision,
        policyVersion: candidateInterviewRuntimePolicyVersion,
        sensitiveAttributesStored: false,
      }),
    ).toMatchObject({ enabled: false, reason: "invalid-response" });
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
          dataBoundary: "synthetic-development",
          policyVersion: candidateInterviewRuntimePolicyVersion,
          reason: "enabled-synthetic-development",
          sensitiveAttributesStored: false,
        }),
      );

    await expect(
      fetchInterviewAvailability({
        request,
        signal: new AbortController().signal,
      }),
    ).resolves.toMatchObject({
      enabled: true,
      reason: "enabled-synthetic-development",
    });
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
