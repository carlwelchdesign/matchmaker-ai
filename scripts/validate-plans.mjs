import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, isAbsolute, normalize, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const validStatuses = new Set([
  "Proposed",
  "Ready",
  "In progress",
  "In review",
  "Done",
  "Blocked",
  "Deferred",
  "Cancelled",
]);

const validEstimateBands = new Set(["XS", "S", "M", "L", "XL", "TBD"]);
const activeStatuses = new Set(["Ready", "In progress"]);
const approvedDependencyWaiverPattern =
  /^Approved dependency waiver \(\d{4}-\d{2}-\d{2}; approver: [^;()]+; scope: [^)]+\)$/u;
const blockedReasonPattern =
  /^owner: [^;]+; review: \d{4}-\d{2}-\d{2}; fallback: .+$/u;

const requiredBacklogColumns = [
  "id",
  "epic",
  "phase",
  "priority",
  "status",
  "outcome",
  "dependencies",
  "release_gate",
  "milestone",
  "epic_id",
  "owner",
  "reviewer",
  "estimate_band",
  "acceptance_artifact",
  "risk_decision_links",
  "blocked_reason",
];

export function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (inQuotes && character === '"' && nextCharacter === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (!inQuotes && (character === "\n" || character === "\r")) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...dataRows] = rows.filter((csvRow) =>
    csvRow.some((value) => value.length > 0),
  );

  if (header === undefined) {
    throw new Error("CSV is empty");
  }

  return dataRows.map((csvRow, rowIndex) => {
    if (csvRow.length !== header.length) {
      throw new Error(
        `CSV row ${rowIndex + 2} has ${csvRow.length} fields; expected ${header.length}`,
      );
    }

    return Object.fromEntries(
      header.map((column, index) => [column, csvRow[index] ?? ""]),
    );
  });
}

export function validateBacklogRows(rows) {
  const columns = Object.keys(rows[0] ?? {});
  for (const column of requiredBacklogColumns) {
    assert(
      columns.includes(column),
      `backlog.csv missing required column: ${column}`,
    );
  }

  const ids = new Set();
  for (const row of rows) {
    assert(/^ARG-\d{3}$/u.test(row.id), `Invalid ticket id: ${row.id}`);
    assert(!ids.has(row.id), `Duplicate ticket id: ${row.id}`);
    ids.add(row.id);
    assert(
      validStatuses.has(row.status),
      `${row.id} has invalid status: ${row.status}`,
    );
    assert(
      validEstimateBands.has(row.estimate_band),
      `${row.id} has invalid estimate band: ${row.estimate_band}`,
    );
  }

  for (const row of rows) {
    if (row.dependencies === "None" || row.dependencies === "") {
      continue;
    }

    for (const dependency of row.dependencies.split(";")) {
      assert(
        ids.has(dependency),
        `${row.id} depends on unknown ticket: ${dependency}`,
      );
      assert(dependency !== row.id, `${row.id} depends on itself`);
    }
  }

  assertDependencyGraphIsAcyclic(rows);

  const doneIds = new Set(
    rows.filter((row) => row.status === "Done").map((row) => row.id),
  );
  const inProgressRows = rows.filter((row) => row.status === "In progress");
  assert(
    inProgressRows.length <= 1,
    `Single-WIP violation: ${inProgressRows.map((row) => row.id).join(", ")}`,
  );

  for (const row of rows) {
    const missingDependencies = parseDependencies(row.dependencies).filter(
      (dependency) => !doneIds.has(dependency),
    );

    if (activeStatuses.has(row.status)) {
      assertAssigned(row, "owner");
      assertAssigned(row, "reviewer");
      assert(
        row.acceptance_artifact !== "" &&
          row.acceptance_artifact !== "Required at Ready",
        `${row.id} is ${row.status} without a concrete acceptance artifact`,
      );
      assert(
        row.risk_decision_links !== "",
        `${row.id} is ${row.status} without risk or decision linkage`,
      );
      assert(
        missingDependencies.length === 0 ||
          hasApprovedDependencyWaiver(row.blocked_reason),
        `${row.id} is ${row.status} with unfinished dependencies and no approved waiver: ${missingDependencies.join(", ")}`,
      );
    }

    if (row.status === "Blocked") {
      assertAssigned(row, "owner");
      assertAssigned(row, "reviewer");
      assert(
        blockedReasonPattern.test(row.blocked_reason),
        `${row.id} is Blocked without owner, review date, and fallback metadata`,
      );
    }

    if (row.status === "Done" && missingDependencies.length > 0) {
      assert(
        hasApprovedDependencyWaiver(row.blocked_reason),
        `${row.id} is Done with unfinished dependencies and no approved waiver: ${missingDependencies.join(", ")}`,
      );
    }
  }

  return ids;
}

function assertAssigned(row, field) {
  assert(
    row[field] !== "" && row[field] !== "Unassigned",
    `${row.id} is ${row.status} with an unassigned ${field}`,
  );
}

export function hasApprovedDependencyWaiver(value) {
  return approvedDependencyWaiverPattern.test(value);
}

function parseDependencies(dependencies) {
  if (!dependencies || dependencies === "None") {
    return [];
  }

  return dependencies.split(";").filter(Boolean);
}

function assertDependencyGraphIsAcyclic(rows) {
  const dependenciesById = new Map(
    rows.map((row) => [
      row.id,
      row.dependencies && row.dependencies !== "None"
        ? row.dependencies.split(";").filter(Boolean)
        : [],
    ]),
  );
  const visiting = new Set();
  const visited = new Set();

  function visit(ticketId, stack = []) {
    if (visited.has(ticketId)) {
      return;
    }
    if (visiting.has(ticketId)) {
      throw new Error(
        `Dependency cycle detected: ${[...stack, ticketId].join(" -> ")}`,
      );
    }

    visiting.add(ticketId);
    for (const dependency of dependenciesById.get(ticketId) ?? []) {
      visit(dependency, [...stack, ticketId]);
    }
    visiting.delete(ticketId);
    visited.add(ticketId);
  }

  for (const ticketId of dependenciesById.keys()) {
    visit(ticketId);
  }
}

export function extractTicketStatus(markdownText) {
  const inlineStatus = markdownText.match(/^- \*\*Status:\*\* ([^\n]+)$/mu);
  if (inlineStatus?.[1]) {
    return inlineStatus[1].trim();
  }

  const statusSection = markdownText.match(/^## Status\s*\n\s*`([^`]+)`/mu);
  return statusSection?.[1]?.trim();
}

export async function validatePlans(repositoryRoot) {
  const plansRoot = resolve(repositoryRoot, "plans");
  const backlogCsvPath = resolve(plansRoot, "tickets/backlog.csv");
  const backlogMarkdownPath = resolve(plansRoot, "tickets/backlog.md");
  const backlogRows = parseCsv(await readFile(backlogCsvPath, "utf8"));
  const ids = validateBacklogRows(backlogRows);
  const rowsById = new Map(backlogRows.map((row) => [row.id, row]));
  const deliveryState = JSON.parse(
    await readFile(resolve(plansRoot, "delivery-state.json"), "utf8"),
  );

  const checkedTicketFiles = await validateTicketFiles(plansRoot, rowsById);
  validateDeliveryState(backlogRows, deliveryState);
  await validateBacklogChecklist(backlogMarkdownPath, backlogRows);
  await validateMarkdownLinks(plansRoot);

  return {
    ticketCount: ids.size,
    checkedTicketFiles,
  };
}

export function validateDeliveryState(rows, deliveryState) {
  assert.equal(
    deliveryState.workflowAuthority?.system,
    "Asana",
    "delivery-state workflow authority must be Asana",
  );
  assert.equal(
    deliveryState.workflowAuthority?.wipLimit,
    1,
    "delivery-state WIP limit must be one parent ticket",
  );
  assert(
    /^\d+$/u.test(deliveryState.workflowAuthority?.projectId ?? ""),
    "delivery-state requires an Asana project id",
  );
  assert(
    /^\d+$/u.test(deliveryState.workflowAuthority?.inProgressSectionId ?? ""),
    "delivery-state requires an Asana In progress section id",
  );
  assert.equal(
    deliveryState.evidenceAuthority,
    "repository",
    "delivery-state evidence authority must be the repository",
  );

  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const activeTickets = deliveryState.activeTickets ?? [];
  assert(
    activeTickets.length <= deliveryState.workflowAuthority.wipLimit,
    "delivery-state exceeds the configured WIP limit",
  );

  const backlogActiveIds = rows
    .filter((row) => row.status === "In progress")
    .map((row) => row.id)
    .sort();
  const snapshotActiveIds = activeTickets.map((ticket) => ticket.id).sort();
  assert.deepEqual(
    snapshotActiveIds,
    backlogActiveIds,
    "delivery-state active tickets do not match backlog In progress tickets",
  );

  for (const ticket of activeTickets) {
    assert.equal(
      ticket.deliveryStatus,
      "In progress",
      `${ticket.id} has invalid active delivery status`,
    );
    assert(
      /^\d+$/u.test(ticket.workflowTaskRef ?? ""),
      `${ticket.id} is missing a workflow task reference`,
    );
    assert(
      typeof ticket.artifactMaturity === "string" &&
        ticket.artifactMaturity.trim() !== "",
      `${ticket.id} is missing artifact maturity`,
    );
  }

  const reconciledTickets = deliveryState.reconciledTickets ?? [];
  const snapshotIds = new Set(snapshotActiveIds);
  for (const ticket of reconciledTickets) {
    assert(
      !snapshotIds.has(ticket.id),
      `${ticket.id} is duplicated in delivery-state`,
    );
    snapshotIds.add(ticket.id);
    const backlogRow = rowsById.get(ticket.id);
    assert(backlogRow !== undefined, `${ticket.id} is not in backlog.csv`);
    assert.equal(
      ticket.deliveryStatus,
      backlogRow.status,
      `${ticket.id} reconciliation status does not match backlog.csv`,
    );
    assert(
      typeof ticket.artifactMaturity === "string" &&
        ticket.artifactMaturity.trim() !== "",
      `${ticket.id} is missing artifact maturity`,
    );
  }
}

async function validateTicketFiles(plansRoot, rowsById) {
  const ticketDirectory = resolve(plansRoot, "tickets");
  const ticketFiles = (await readdir(ticketDirectory))
    .filter((file) => /^ARG-\d{3}-.+\.md$/u.test(file))
    .sort();

  const ticketIdsWithFiles = new Set();
  for (const ticketFile of ticketFiles) {
    const ticketId = ticketFile.match(/^(ARG-\d{3})-/u)?.[1];
    assert(ticketId !== undefined, `Cannot infer ticket id from ${ticketFile}`);
    ticketIdsWithFiles.add(ticketId);
    const backlogRow = rowsById.get(ticketId);
    assert(backlogRow !== undefined, `${ticketFile} has no backlog.csv row`);

    const markdown = await readFile(
      resolve(ticketDirectory, ticketFile),
      "utf8",
    );
    const status = extractTicketStatus(markdown);
    assert(status !== undefined, `${ticketFile} does not declare a status`);
    assert(
      status === backlogRow.status,
      `${ticketId} status drift: ticket file is "${status}", backlog.csv is "${backlogRow.status}"`,
    );
  }

  for (const row of rowsById.values()) {
    if (activeStatuses.has(row.status)) {
      assert(
        ticketIdsWithFiles.has(row.id),
        `${row.id} is ${row.status} without a detailed ticket file`,
      );
    }
  }

  return ticketFiles.length;
}

async function validateBacklogChecklist(backlogMarkdownPath, backlogRows) {
  const backlogMarkdown = await readFile(backlogMarkdownPath, "utf8");

  for (const row of backlogRows) {
    const escapedId = row.id;
    const checklistPattern = new RegExp(
      `^- \\[[ x]\\] \`${escapedId}\` `,
      "mu",
    );
    assert(
      checklistPattern.test(backlogMarkdown),
      `${row.id} missing from backlog.md`,
    );

    if (row.status === "Done") {
      const donePattern = new RegExp(`^- \\[x\\] \`${escapedId}\` `, "mu");
      assert(
        donePattern.test(backlogMarkdown),
        `${row.id} is Done but not checked in backlog.md`,
      );
    }
  }
}

async function validateMarkdownLinks(plansRoot) {
  const markdownFiles = await listMarkdownFiles(plansRoot);
  const missingLinks = [];

  for (const markdownFile of markdownFiles) {
    const markdown = await readFile(markdownFile, "utf8");
    for (const link of extractLocalMarkdownLinks(markdown)) {
      const withoutAnchor = link.split("#")[0];
      if (
        withoutAnchor === "" ||
        withoutAnchor.startsWith("http://") ||
        withoutAnchor.startsWith("https://") ||
        withoutAnchor.startsWith("mailto:")
      ) {
        continue;
      }

      const candidate = normalize(
        isAbsolute(withoutAnchor)
          ? withoutAnchor
          : resolve(dirname(markdownFile), withoutAnchor),
      );

      try {
        await stat(candidate);
      } catch {
        missingLinks.push(
          `${relativePath(plansRoot, markdownFile)} -> ${link}`,
        );
      }
    }
  }

  assert(
    missingLinks.length === 0,
    `Missing local Markdown links:\n${missingLinks.join("\n")}`,
  );
}

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(fullPath)));
    } else if (entry.isFile() && extname(entry.name) === ".md") {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function extractLocalMarkdownLinks(markdown) {
  const links = [];
  const markdownLink = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gmu;

  for (const match of markdown.matchAll(markdownLink)) {
    if (match[1] !== undefined) {
      links.push(match[1]);
    }
  }

  return links;
}

function relativePath(root, path) {
  return normalize(path).replace(`${normalize(root)}/`, "");
}

const executedDirectly =
  process.argv[1] !== undefined &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (executedDirectly) {
  const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const result = await validatePlans(repositoryRoot);
  process.stdout.write(
    `Planning package validated: ${result.ticketCount} backlog tickets, ${result.checkedTicketFiles} ticket files, local links resolved.\n`,
  );
}
