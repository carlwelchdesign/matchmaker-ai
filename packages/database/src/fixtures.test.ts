import { describe, expect, it } from "vitest";

import { fixturePackChecksum, foundationFixturePack } from "./fixtures.js";

describe("foundation fixtures", () => {
  it("contains only the documented non-personal classification keys", () => {
    expect(foundationFixturePack.referenceValues.map(({ key }) => key)).toEqual(
      ["public", "internal", "confidential", "restricted"],
    );
  });

  it("has a stable SHA-256 checksum", () => {
    expect(fixturePackChecksum(foundationFixturePack)).toMatch(
      /^[0-9a-f]{64}$/u,
    );
    expect(fixturePackChecksum(foundationFixturePack)).toBe(
      fixturePackChecksum(foundationFixturePack),
    );
  });
});
