import { createHash } from "node:crypto";

export interface ReferenceValueFixture {
  readonly namespace: "data_classification";
  readonly key: "public" | "internal" | "confidential" | "restricted";
  readonly label: string;
}

export interface SyntheticFixturePack {
  readonly fixtureKey: string;
  readonly fixtureVersion: number;
  readonly description: string;
  readonly referenceValues: readonly ReferenceValueFixture[];
}

export const foundationFixturePack: SyntheticFixturePack = {
  fixtureKey: "foundation-reference-values",
  fixtureVersion: 1,
  description:
    "Non-personal reference values for local, test, and approved staging environments.",
  referenceValues: [
    {
      namespace: "data_classification",
      key: "public",
      label: "Public",
    },
    {
      namespace: "data_classification",
      key: "internal",
      label: "Internal",
    },
    {
      namespace: "data_classification",
      key: "confidential",
      label: "Confidential",
    },
    {
      namespace: "data_classification",
      key: "restricted",
      label: "Restricted",
    },
  ],
};

export function fixturePackChecksum(pack: SyntheticFixturePack): string {
  return createHash("sha256").update(JSON.stringify(pack)).digest("hex");
}
