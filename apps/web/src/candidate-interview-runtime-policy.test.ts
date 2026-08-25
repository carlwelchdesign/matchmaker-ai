import { describe, expect, it } from "vitest";

import type { CandidateInterviewFlagDecision } from "./candidate-interview-flag-policy";
import {
  candidateInterviewRuntimePolicyVersion,
  evaluateCandidateInterviewRuntime,
  resolveCandidateInterviewEnvironment,
  type CandidateInterviewReleaseGates,
} from "./candidate-interview-runtime-policy";

const enabledFlag: CandidateInterviewFlagDecision = {
  enabled: true,
  policyVersion: "candidate-interview-flag-policy/v1",
  reason: "enabled",
  sensitiveAttributesStored: false,
};

const approvedReleaseGates: CandidateInterviewReleaseGates = {
  authorizationEnforced: true,
  consentEnforced: true,
  eligibilityEnforced: true,
  providerKillSwitchEnforced: true,
  retentionEnforced: true,
};

describe("candidate interview runtime policy", () => {
  it("allows only synthetic data in development before release approval", () => {
    expect(
      evaluateCandidateInterviewRuntime({
        environment: "development",
        flagDecision: enabledFlag,
        releaseGates: {
          ...approvedReleaseGates,
          authorizationEnforced: false,
        },
        syntheticDataOnly: true,
      }),
    ).toEqual({
      dataBoundary: "synthetic-development",
      enabled: true,
      policyVersion: candidateInterviewRuntimePolicyVersion,
      reason: "enabled-synthetic-development",
      sensitiveAttributesStored: false,
    });
  });

  it.each(["preview", "production"] as const)(
    "blocks an enabled feature flag in %s while release gates are closed",
    (environment) => {
      expect(
        evaluateCandidateInterviewRuntime({
          environment,
          flagDecision: enabledFlag,
          releaseGates: {
            ...approvedReleaseGates,
            consentEnforced: false,
          },
          syntheticDataOnly: false,
        }),
      ).toMatchObject({
        dataBoundary: "release-blocked",
        enabled: false,
        reason: "release-gates-closed",
      });
    },
  );

  it.each(
    Object.keys(approvedReleaseGates) as Array<
      keyof CandidateInterviewReleaseGates
    >,
  )("keeps the release closed when %s is not enforced", (gate) => {
    expect(
      evaluateCandidateInterviewRuntime({
        environment: "production",
        flagDecision: enabledFlag,
        releaseGates: { ...approvedReleaseGates, [gate]: false },
        syntheticDataOnly: false,
      }),
    ).toMatchObject({ enabled: false, reason: "release-gates-closed" });
  });

  it("allows a real-person release only after every independent gate is enforced", () => {
    expect(
      evaluateCandidateInterviewRuntime({
        environment: "production",
        flagDecision: enabledFlag,
        releaseGates: approvedReleaseGates,
        syntheticDataOnly: false,
      }),
    ).toMatchObject({
      dataBoundary: "real-person-release",
      enabled: true,
      reason: "enabled-approved-release",
    });
  });

  it("does not let synthetic mode bypass gates outside development", () => {
    expect(
      evaluateCandidateInterviewRuntime({
        environment: "production",
        flagDecision: enabledFlag,
        releaseGates: {
          ...approvedReleaseGates,
          retentionEnforced: false,
        },
        syntheticDataOnly: true,
      }),
    ).toMatchObject({ enabled: false, reason: "release-gates-closed" });
  });

  it.each([
    ["disabled", "feature-disabled"],
    ["evaluation-error", "flag-evaluation-error"],
    ["invalid-value", "flag-invalid-value"],
  ] as const)(
    "preserves a closed %s flag outcome",
    (reason, expectedReason) => {
      expect(
        evaluateCandidateInterviewRuntime({
          environment: "development",
          flagDecision: { ...enabledFlag, enabled: false, reason },
          releaseGates: approvedReleaseGates,
          syntheticDataOnly: true,
        }),
      ).toMatchObject({ enabled: false, reason: expectedReason });
    },
  );

  it("fails closed when the runtime environment is unknown", () => {
    expect(
      evaluateCandidateInterviewRuntime({
        environment: "unknown",
        flagDecision: enabledFlag,
        releaseGates: approvedReleaseGates,
        syntheticDataOnly: false,
      }),
    ).toMatchObject({ enabled: false, reason: "unknown-environment" });
  });

  it.each([
    [{ nodeEnvironment: "development" }, "development"],
    [
      { nodeEnvironment: "production", vercelEnvironment: "preview" },
      "preview",
    ],
    [
      { nodeEnvironment: "production", vercelEnvironment: "production" },
      "production",
    ],
    [
      { nodeEnvironment: "development", vercelEnvironment: "production" },
      "production",
    ],
    [{ nodeEnvironment: "production" }, "unknown"],
  ] as const)("resolves runtime environment %#", (input, expected) => {
    expect(resolveCandidateInterviewEnvironment(input)).toBe(expected);
  });
});
