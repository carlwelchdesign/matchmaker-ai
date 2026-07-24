import { execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const clientDirectory = resolve(
  repositoryRoot,
  "apps/mobile/packages/argent_api_client",
);
const runDart = (args) =>
  execFileSync("dart", args, {
    cwd: clientDirectory,
    stdio: "inherit",
  });

runDart(["pub", "get"]);
runDart(["run", "build_runner", "build"]);

// OpenAPI Generator 7.24 emits this import for operations without JsonObject
// parameters. Flutter treats the resulting warning as an analysis failure, so
// keep this narrow compatibility cleanup beside the generator invocation.
const systemApiPath = resolve(clientDirectory, "lib/src/api/system_api.dart");
const generatedSystemApi = await readFile(systemApiPath, "utf8");
const unusedJsonObjectImport =
  "import 'package:built_value/json_object.dart';\n";
await writeFile(
  systemApiPath,
  generatedSystemApi.replace(unusedJsonObjectImport, ""),
);

runDart(["format", "lib", "test"]);
