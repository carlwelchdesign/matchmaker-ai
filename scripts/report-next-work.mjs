import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parseCsv } from "./validate-plans.mjs";

const implementationReleaseGates = new Set([
  "Campaign",
  "Consenting pilot",
  "Data",
  "Engineering",
  "Operational alpha",
  "Operations",
]);

const decisionMilestones = new Set(["Decision gate"]);

export function buildBacklogReadinessReport(rows) {
  const doneIds = new Set(
    rows.filter((row) => row.status === "Done").map((row) => row.id),
  );

  const candidates = rows.filter((row) =>
    ["Proposed", "Ready", "In progress", "In review", "Blocked"].includes(
      row.status,
    ),
  );

  const analyzed = candidates.map((row) => {
    const dependencies = parseDependencies(row.dependencies);
    const missingDependencies = dependencies.filter(
      (dependency) => !doneIds.has(dependency),
    );
    const dependenciesSatisfied = missingDependencies.length === 0;
    const decisionGated =
      decisionMilestones.has(row.milestone) ||
      row.acceptance_artifact === "Required at Ready" ||
      ["AI", "Architecture", "Privacy", "Product", "Security"].includes(
        row.release_gate,
      );
    const implementationSafe =
      dependenciesSatisfied &&
      !decisionGated &&
      implementationReleaseGates.has(row.release_gate);

    return {
      ...row,
      dependencies,
      missingDependencies,
      dependenciesSatisfied,
      decisionGated,
      implementationSafe,
    };
  });

  return {
    done: rows.filter((row) => row.status === "Done"),
    implementationReady: analyzed.filter((row) => row.implementationSafe),
    decisionReady: analyzed.filter(
      (row) => row.dependenciesSatisfied && row.decisionGated,
    ),
    blockedByDependencies: analyzed.filter((row) => !row.dependenciesSatisfied),
  };
}

export function formatBacklogReadinessReport(report) {
  const lines = [
    "Argent backlog readiness report",
    "",
    `Done tickets: ${report.done.length}`,
    "",
    "Implementation-ready tickets",
    ...formatRows(
      report.implementationReady,
      "No implementation-ready tickets.",
    ),
    "",
    "Decision-ready / gated tickets",
    ...formatRows(report.decisionReady, "No decision-ready tickets."),
    "",
    "Blocked by unfinished dependencies",
    ...formatRows(
      report.blockedByDependencies,
      "No dependency-blocked tickets.",
      (row) => `missing ${row.missingDependencies.join(", ")}`,
    ),
  ];

  return `${lines.join("\n")}\n`;
}

function formatRows(rows, emptyMessage, detailForRow = defaultDetailForRow) {
  if (rows.length === 0) {
    return [`- ${emptyMessage}`];
  }

  return rows
    .sort(compareTickets)
    .map((row) => `- ${row.id} ${row.outcome} (${detailForRow(row)})`);
}

function defaultDetailForRow(row) {
  const details = [row.status, row.release_gate].filter(Boolean);
  if (row.blocked_reason) {
    details.push(row.blocked_reason);
  }
  return details.join("; ");
}

function compareTickets(left, right) {
  return (
    priorityWeight(left.priority) - priorityWeight(right.priority) ||
    Number(left.phase) - Number(right.phase) ||
    left.id.localeCompare(right.id)
  );
}

function priorityWeight(priority) {
  const match = priority.match(/^P(\d+)$/u);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function parseDependencies(dependencies) {
  if (!dependencies || dependencies === "None") {
    return [];
  }

  return dependencies.split(";").filter(Boolean);
}

async function main() {
  const repositoryRoot = resolve(fileURLToPath(import.meta.url), "../..");
  const backlogPath = resolve(repositoryRoot, "plans/tickets/backlog.csv");
  const rows = parseCsv(await readFile(backlogPath, "utf8"));
  process.stdout.write(
    formatBacklogReadinessReport(buildBacklogReadinessReport(rows)),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
