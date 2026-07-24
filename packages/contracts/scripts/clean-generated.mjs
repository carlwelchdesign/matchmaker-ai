import { rm } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const generatedTargets = [
  resolve(repositoryRoot, "packages/contracts/generated/typescript"),
  resolve(repositoryRoot, "apps/mobile/packages/argent_api_client"),
];

for (const target of generatedTargets) {
  if (!target.startsWith(`${repositoryRoot}${sep}`)) {
    throw new Error(`Refusing to remove path outside repository: ${target}`);
  }

  await rm(target, { force: true, recursive: true });
}
