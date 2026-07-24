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
  return ids;
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

  const checkedTicketFiles = await validateTicketFiles(plansRoot, rowsById);
  await validateBacklogChecklist(backlogMarkdownPath, backlogRows);
  await validateMarkdownLinks(plansRoot);

  return {
    ticketCount: ids.size,
    checkedTicketFiles,
  };
}

async function validateTicketFiles(plansRoot, rowsById) {
  const ticketDirectory = resolve(plansRoot, "tickets");
  const ticketFiles = (await readdir(ticketDirectory))
    .filter((file) => /^ARG-\d{3}-.+\.md$/u.test(file))
    .sort();

  for (const ticketFile of ticketFiles) {
    const ticketId = ticketFile.match(/^(ARG-\d{3})-/u)?.[1];
    assert(ticketId !== undefined, `Cannot infer ticket id from ${ticketFile}`);
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
