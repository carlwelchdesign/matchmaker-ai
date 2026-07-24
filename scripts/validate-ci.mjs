import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const workflowDirectory = resolve(repositoryRoot, ".github/workflows");
const requiredWorkflows = new Set([
  "containers.yml",
  "quality.yml",
  "security.yml",
  "secrets.yml",
]);
const shaPinnedAction = /^[^@\s]+@[0-9a-f]{40}$/u;

const workflowFiles = (await readdir(workflowDirectory))
  .filter((file) => file.endsWith(".yml"))
  .sort();

for (const requiredWorkflow of requiredWorkflows) {
  if (!workflowFiles.includes(requiredWorkflow)) {
    throw new Error(`Missing required workflow: ${requiredWorkflow}`);
  }
}

for (const workflowFile of workflowFiles) {
  const workflow = await readFile(
    resolve(workflowDirectory, workflowFile),
    "utf8",
  );

  if (!/^permissions:\s*$/mu.test(workflow)) {
    throw new Error(`${workflowFile} must declare top-level permissions`);
  }
  if (/pull_request_target\s*:/u.test(workflow)) {
    throw new Error(`${workflowFile} must not use pull_request_target`);
  }

  for (const match of workflow.matchAll(/^\s*uses:\s*(\S+)\s*(?:#.*)?$/gmu)) {
    const action = match[1];
    if (action === undefined || !shaPinnedAction.test(action)) {
      throw new Error(
        `${workflowFile} contains an action that is not pinned to a full commit SHA: ${action}`,
      );
    }
  }
}

const dockerfile = await readFile(
  resolve(repositoryRoot, "infra/docker/Dockerfile"),
  "utf8",
);
if (!/^# syntax=\S+@sha256:[0-9a-f]{64}$/mu.test(dockerfile)) {
  throw new Error("Dockerfile frontend must be pinned by digest");
}
if (!/^ARG BUILD_NODE_IMAGE=\S+@sha256:[0-9a-f]{64}$/mu.test(dockerfile)) {
  throw new Error("Application build image must be pinned by digest");
}
if (!/^ARG RUNTIME_NODE_IMAGE=\S+@sha256:[0-9a-f]{64}$/mu.test(dockerfile)) {
  throw new Error("Application runtime image must be pinned by digest");
}

const compose = await readFile(resolve(repositoryRoot, "compose.yaml"), "utf8");
for (const service of ["postgres", "redis"]) {
  const servicePattern = new RegExp(
    `^  ${service}:[\\s\\S]*?^    image: \\S+@sha256:[0-9a-f]{64}$`,
    "mu",
  );
  if (!servicePattern.test(compose)) {
    throw new Error(`${service} image must be pinned by digest`);
  }
}

process.stdout.write(
  `CI policy validated across ${workflowFiles.length} workflows.\n`,
);
