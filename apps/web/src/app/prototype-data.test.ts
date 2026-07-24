import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  prototypeAdminReadiness,
  prototypeApplicants,
  prototypeCampaign,
  prototypeGuardrails,
  prototypeOperations,
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

  test("keeps owner operations visibly disconnected", () => {
    expect(prototypeAdminReadiness).toHaveLength(3);
    expect(prototypeOperations).toHaveLength(3);
    expect(prototypeOperations.map((operation) => operation.title)).toContain(
      "Pricing is not connected",
    );
  });

  test("keeps the review experience client-local", () => {
    const prototypeSource = readFileSync(
      fileURLToPath(new URL("./prototype.tsx", import.meta.url)),
      "utf8",
    );

    expect(prototypeSource).not.toContain("fetch(");
    expect(prototypeSource).not.toContain("localStorage");
    expect(prototypeSource).not.toContain("<form");
  });
});
