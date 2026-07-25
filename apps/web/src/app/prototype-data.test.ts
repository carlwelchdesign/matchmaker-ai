import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  prototypeApplicants,
  prototypeCampaign,
  prototypeGuardrails,
} from "./prototype-data";

describe("synthetic concept prototype data", () => {
  test("labels the campaign as synthetic and local-only", () => {
    expect(prototypeCampaign.isSynthetic).toBe(true);
    expect(prototypeCampaign.status).toBe("Concept review only");
    expect(prototypeGuardrails).toContain(
      "No information is sent or saved in this prototype.",
    );
  });

  test("does not frame the first campaign geography as Argent's market boundary", () => {
    expect(prototypeCampaign.regionBoundary).toContain("first test ground");
    expect(prototypeCampaign.regionBoundary).toContain("not a boundary");
  });

  test("uses fictional review records rather than applicant data", () => {
    expect(prototypeApplicants).toHaveLength(3);
    expect(
      prototypeApplicants.every((applicant) => applicant.id.startsWith("A-")),
    ).toBe(true);
  });

  test("keeps the review experience client-local", () => {
    const prototypeSource = readFileSync(
      fileURLToPath(new URL("./prototype.tsx", import.meta.url)),
      "utf8",
    );

    expect(prototypeSource).not.toContain("fetch(");
    expect(prototypeSource).not.toContain("localStorage");
    expect(prototypeSource).not.toContain("<form");
    expect(prototypeSource).toContain("Voice remains research-gated");
    expect(prototypeSource).toContain("review or edit the transcript");
    expect(prototypeSource).toContain("proposed profile field separately");
  });
});
