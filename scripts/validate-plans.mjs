import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
const researchApprovalStatuses = new Set([
  "Not approved",
  "Approved",
  "Expired",
  "Superseded",
]);
const participantSystemStatuses = new Set(["Not selected", "Selected"]);
const researchOperationalStatuses = new Set(["Closed", "Open", "Paused"]);
const researchActivities = [
  "outreach",
  "notes",
  "shortQuotes",
  "audioRecording",
  "videoRecording",
  "humanTranscription",
  "automatedTranscription",
  "followUp",
  "researchReuse",
];
const requiredResearchDataClassIds = [
  "consentReceipts",
  "incentiveRecords",
  "recordingsAndTranscripts",
  "recruitmentContacts",
  "redactedNotes",
];
const sha256Pattern = /^[a-f0-9]{64}$/u;
const evidenceReferencePattern =
  /^(?:plans\/[A-Za-z0-9._/#-]+|asana:\d+\/\d+|github:(?:pull\/\d+|commit\/[a-f0-9]{7,40}))$/u;
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
  const researchAuthorization = JSON.parse(
    await readFile(
      resolve(plansRoot, "research/research-authorization.json"),
      "utf8",
    ),
  );
  const researchRegister = await readFile(
    resolve(plansRoot, "research/research-authorization-register.md"),
    "utf8",
  );

  const checkedTicketFiles = await validateTicketFiles(plansRoot, rowsById);
  validateDeliveryState(backlogRows, deliveryState);
  validateResearchAuthorization(backlogRows, researchAuthorization);
  validateResearchRegisterParity(researchAuthorization, researchRegister);
  await validateResearchAuthorizationArtifacts(
    repositoryRoot,
    researchAuthorization,
  );
  await validateBacklogChecklist(backlogMarkdownPath, backlogRows);
  await validateMarkdownLinks(plansRoot);

  return {
    ticketCount: ids.size,
    checkedTicketFiles,
  };
}

export function validateResearchAuthorization(
  rows,
  authorization,
  { asOf = new Date() } = {},
) {
  assert.equal(
    authorization.version,
    "2.0",
    "research authorization requires version 2.0",
  );
  assertMeaningfulString(authorization.owner, "research authorization owner");

  const operationalState = authorization.operationalState ?? {};
  assert(
    researchOperationalStatuses.has(operationalState.status),
    `research authorization has invalid operational state: ${operationalState.status}`,
  );
  assertValidTimestamp(
    operationalState.changedAt,
    "research operational state changedAt",
  );
  assertMeaningfulString(
    operationalState.changedBy,
    "research operational state changedBy",
  );
  assertMeaningfulString(
    operationalState.reason,
    "research operational state reason",
  );

  const controlsApproval = authorization.controlsApproval ?? {};
  assert(
    researchApprovalStatuses.has(controlsApproval.status),
    `research controls have invalid approval status: ${controlsApproval.status}`,
  );
  assertArtifactDescriptor(
    authorization.controlProcedure,
    "research control procedure",
  );
  assert(
    Array.isArray(authorization.supportingArtifacts) &&
      authorization.supportingArtifacts.length > 0,
    "research authorization requires supporting artifacts",
  );
  for (const [index, artifact] of authorization.supportingArtifacts.entries()) {
    assertArtifactDescriptor(
      artifact,
      `research supporting artifact ${index + 1}`,
    );
  }

  const operationalControls = authorization.operationalControls ?? {};
  const dataClasses = operationalControls.dataClasses ?? [];
  const dataClassIds = dataClasses.map((dataClass) => dataClass.id).sort();
  assert.deepEqual(
    dataClassIds,
    requiredResearchDataClassIds,
    "research data-class inventory is incomplete or duplicated",
  );
  for (const dataClass of dataClasses) {
    assertMeaningfulString(dataClass.purpose, `${dataClass.id} purpose`);
  }

  const rowsById = new Map(rows.map((row) => [row.id, row]));
  const governedTickets = authorization.governedTickets ?? [];
  const governedTicketIds = new Set(governedTickets);
  assert.equal(
    governedTicketIds.size,
    governedTickets.length,
    "research authorization has duplicate governed tickets",
  );
  for (const ticketId of governedTicketIds) {
    assert(
      rowsById.has(ticketId),
      `research authorization governs unknown ticket: ${ticketId}`,
    );
  }
  const channelIds = new Set();
  const approvedChannelIds = new Set();
  for (const channel of authorization.recruitmentChannels ?? []) {
    assertMeaningfulString(channel.id, "research recruitment channel id");
    assert(
      !channelIds.has(channel.id),
      `duplicate research recruitment channel: ${channel.id}`,
    );
    channelIds.add(channel.id);
    assertMeaningfulString(channel.label, `${channel.id} label`);
    assert(
      researchApprovalStatuses.has(channel.status),
      `${channel.id} has invalid approval status: ${channel.status}`,
    );
    if (channel.status === "Approved") {
      assertApprovalEvidence(channel.approval, `${channel.id} approval`, asOf);
      approvedChannelIds.add(channel.id);
    } else {
      assert.equal(
        channel.approval,
        null,
        `${channel.id} cannot retain approval evidence while ${channel.status}`,
      );
    }
  }

  const protocols = authorization.protocols ?? [];
  assert(protocols.length > 0, "research authorization requires protocols");
  const protocolIds = new Set();

  for (const protocol of protocols) {
    const row = rowsById.get(protocol.ticketId);
    assert(
      row !== undefined,
      `research authorization references unknown ticket: ${protocol.ticketId}`,
    );
    assert(
      governedTicketIds.has(protocol.ticketId),
      `${protocol.ticketId} has a protocol but is not in governedTickets`,
    );
    assert(
      !protocolIds.has(protocol.ticketId),
      `research authorization duplicates protocol: ${protocol.ticketId}`,
    );
    protocolIds.add(protocol.ticketId);
    assertMeaningfulString(protocol.purpose, `${protocol.ticketId} purpose`);
    assertMeaningfulString(protocol.owner, `${protocol.ticketId} owner`);
    assert(
      researchApprovalStatuses.has(protocol.status),
      `${protocol.ticketId} has invalid approval status: ${protocol.status}`,
    );
    assertArtifactDescriptor(
      protocol.artifact,
      `${protocol.ticketId} artifact`,
    );
    assert.equal(
      protocol.artifact.path,
      row.acceptance_artifact,
      `${protocol.ticketId} artifact does not match its backlog acceptance artifact`,
    );
    assertArtifactDescriptor(
      protocol.consentScript,
      `${protocol.ticketId} consent script`,
    );

    const permissions = protocol.permissions ?? {};
    for (const activity of researchActivities) {
      assert.equal(
        typeof permissions[activity],
        "boolean",
        `${protocol.ticketId} permission ${activity} must be boolean`,
      );
    }

    if (protocol.status !== "Approved") {
      assert(
        researchActivities.every((activity) => permissions[activity] === false),
        `${protocol.ticketId} cannot enable activities while ${protocol.status}`,
      );
      assert.equal(
        protocol.approvals?.projectOwner ?? null,
        null,
        `${protocol.ticketId} cannot retain project approval while ${protocol.status}`,
      );
      assert.equal(
        protocol.approvals?.privacyTrustReviewer ?? null,
        null,
        `${protocol.ticketId} cannot retain privacy approval while ${protocol.status}`,
      );
      continue;
    }

    assert.equal(
      controlsApproval.status,
      "Approved",
      `${protocol.ticketId} cannot be approved before shared controls`,
    );
    assertApprovalEvidence(
      protocol.approvals?.projectOwner,
      `${protocol.ticketId} project approval`,
      asOf,
    );
    assertApprovalEvidence(
      protocol.approvals?.privacyTrustReviewer,
      `${protocol.ticketId} privacy approval`,
      asOf,
    );
    assertNonEmptyMeaningfulStrings(
      protocol.cohorts,
      `${protocol.ticketId} cohorts`,
    );
    assertNonEmptyMeaningfulStrings(
      protocol.recruitmentChannelIds,
      `${protocol.ticketId} recruitment channels`,
    );
    for (const channelId of protocol.recruitmentChannelIds) {
      assert(
        approvedChannelIds.has(channelId),
        `${protocol.ticketId} references unapproved recruitment channel: ${channelId}`,
      );
    }

    const incentive = protocol.incentiveDecision ?? {};
    assert(
      incentive.status === "Approved" || incentive.status === "Not applicable",
      `${protocol.ticketId} requires an approved or not-applicable incentive decision`,
    );
    assertMeaningfulString(
      incentive.terms,
      `${protocol.ticketId} incentive terms`,
    );
    assertApprovalEvidence(
      incentive.approval,
      `${protocol.ticketId} incentive approval`,
      asOf,
    );

    if (permissions.automatedTranscription) {
      const processor = protocol.automatedTranscriptionProcessor ?? {};
      assertMeaningfulString(
        processor.name,
        `${protocol.ticketId} automated transcription processor`,
      );
      assertApprovalEvidence(
        processor.approval,
        `${protocol.ticketId} automated transcription processor approval`,
        asOf,
      );
    } else {
      assert.equal(
        protocol.automatedTranscriptionProcessor,
        null,
        `${protocol.ticketId} must not name an automated processor when transcription is denied`,
      );
    }
  }

  const controlsApproved = controlsApproval.status === "Approved";
  if (controlsApproved) {
    assertApprovalEvidence(
      controlsApproval.projectOwner,
      "research controls project-owner approval",
      asOf,
    );
    assertApprovalEvidence(
      controlsApproval.privacyTrustReviewer,
      "research controls privacy/trust approval",
      asOf,
    );
    const systemOfRecord = authorization.participantSystemOfRecord ?? {};
    assert.equal(
      systemOfRecord.status,
      "Selected",
      "approved research controls require a selected participant system of record",
    );
    assertMeaningfulString(
      systemOfRecord.reference,
      "participant system of record reference",
    );
    assertApprovalEvidence(
      systemOfRecord.approval,
      "participant system of record approval",
      asOf,
    );
    assert(
      approvedChannelIds.size > 0,
      "approved research controls require an approved recruitment channel",
    );

    const withdrawal = operationalControls.withdrawal ?? {};
    assertMeaningfulString(
      withdrawal.channelReference,
      "research withdrawal channel reference",
    );
    assertMeaningfulString(
      withdrawal.acknowledgementTarget,
      "research withdrawal acknowledgement target",
    );
    assertMeaningfulString(
      withdrawal.completionTarget,
      "research withdrawal completion target",
    );

    const safety = operationalControls.safety ?? {};
    assertMeaningfulString(safety.owner, "research safety owner");
    assertMeaningfulString(safety.deputy, "research safety deputy");
    assertMeaningfulString(
      safety.contactReference,
      "research safety contact reference",
    );

    const accessibility = operationalControls.accessibility ?? {};
    assertMeaningfulString(
      accessibility.accommodationChannelReference,
      "research accommodation channel reference",
    );
    assertMeaningfulString(
      accessibility.accessibleCommunicationProcedure,
      "research accessible communication procedure",
    );

    for (const dataClass of dataClasses) {
      assertMeaningfulString(
        dataClass.systemReference,
        `${dataClass.id} system reference`,
      );
      assertNonEmptyMeaningfulStrings(
        dataClass.minimumFields,
        `${dataClass.id} minimum fields`,
      );
      assertMeaningfulString(
        dataClass.collectionSource,
        `${dataClass.id} collection source`,
      );
      assertNonEmptyMeaningfulStrings(
        dataClass.allowedRoles,
        `${dataClass.id} allowed roles`,
      );
      assertMeaningfulString(
        dataClass.accessReviewOwner,
        `${dataClass.id} access review owner`,
      );
      assertMeaningfulString(
        dataClass.correctionExportRule,
        `${dataClass.id} correction/export rule`,
      );
      assertMeaningfulString(
        dataClass.retentionRule,
        `${dataClass.id} retention rule`,
      );
      assertMeaningfulString(
        dataClass.deletionRule,
        `${dataClass.id} deletion rule`,
      );
      assertMeaningfulString(
        dataClass.backupRule,
        `${dataClass.id} backup rule`,
      );
      assertMeaningfulString(
        dataClass.incidentReference,
        `${dataClass.id} incident reference`,
      );
      assertMeaningfulString(
        dataClass.offboardingRule,
        `${dataClass.id} offboarding rule`,
      );
    }
  } else {
    assert(
      participantSystemStatuses.has(
        authorization.participantSystemOfRecord?.status,
      ),
      `participant system of record has invalid status: ${authorization.participantSystemOfRecord?.status}`,
    );
    assert.notEqual(
      operationalState.status,
      "Open",
      "research operations cannot open before shared controls are approved",
    );
  }

  if (operationalState.status === "Open") {
    assert.equal(
      controlsApproval.status,
      "Approved",
      "research operations cannot open before shared controls are approved",
    );
    assert(
      protocols.some(
        (protocol) =>
          protocol.status === "Approved" &&
          protocol.permissions?.outreach === true,
      ),
      "open research operations require an approved outreach protocol",
    );
  }

  for (const row of rows) {
    if (
      (row.status === "Ready" || row.status === "In progress") &&
      governedTicketIds.has(row.id)
    ) {
      assert(
        protocolIds.has(row.id),
        `${row.id} cannot be ${row.status} without a registered research protocol`,
      );
      assert(
        isResearchActivityAuthorized(authorization, row.id, "outreach", asOf),
        `${row.id} cannot be ${row.status} while participant outreach is unauthorized`,
      );
    }
  }
}

export function isResearchActivityAuthorized(
  authorization,
  ticketId,
  activity,
  asOf = new Date(),
) {
  if (!researchActivities.includes(activity)) {
    return false;
  }
  if (
    authorization.controlsApproval?.status !== "Approved" ||
    authorization.operationalState?.status !== "Open"
  ) {
    return false;
  }
  const protocol = (authorization.protocols ?? []).find(
    (candidate) => candidate.ticketId === ticketId,
  );
  if (
    protocol?.status !== "Approved" ||
    protocol.permissions?.[activity] !== true
  ) {
    return false;
  }
  return [
    authorization.controlsApproval.projectOwner,
    authorization.controlsApproval.privacyTrustReviewer,
    authorization.participantSystemOfRecord?.approval,
    protocol.approvals?.projectOwner,
    protocol.approvals?.privacyTrustReviewer,
    protocol.incentiveDecision?.approval,
    ...(authorization.recruitmentChannels ?? [])
      .filter((channel) =>
        (protocol.recruitmentChannelIds ?? []).includes(channel.id),
      )
      .map((channel) => channel.approval),
    ...(activity === "automatedTranscription"
      ? [protocol.automatedTranscriptionProcessor?.approval]
      : []),
  ].every((approval) => approvalIsCurrent(approval, asOf));
}

export function validateResearchRegisterParity(authorization, markdown) {
  const owner = markdown.match(/^- \*\*Owner:\*\* ([^\n]+)$/mu)?.[1]?.trim();
  const status = markdown.match(/^- \*\*Status:\*\* ([^\n]+)$/mu)?.[1]?.trim();
  const version = markdown
    .match(/^- \*\*Version:\*\* ([^\n]+)$/mu)?.[1]
    ?.trim();
  assert.equal(owner, authorization.owner, "research register owner drift");
  assert.equal(
    version,
    authorization.version,
    "research register version drift",
  );
  assert.equal(
    status,
    `Controls ${authorization.controlsApproval.status.toLowerCase()}; operations ${authorization.operationalState.status.toLowerCase()}`,
    "research register status drift",
  );

  const tableRows = new Map();
  const rowPattern =
    /^\| (ARG-\d{3}) \| ([^|]+?) \| ([^|]+?) \| ([^|]+?) \|$/gmu;
  for (const match of markdown.matchAll(rowPattern)) {
    tableRows.set(match[1], {
      purpose: match[2].trim(),
      status: match[3].trim(),
      activities: match[4].trim(),
    });
  }

  assert.equal(
    tableRows.size,
    authorization.protocols.length,
    "research register protocol count does not match authorization JSON",
  );
  for (const protocol of authorization.protocols) {
    const tableRow = tableRows.get(protocol.ticketId);
    assert(tableRow, `${protocol.ticketId} missing from research register`);
    assert.equal(
      tableRow.purpose,
      protocol.purpose,
      `${protocol.ticketId} purpose drift between JSON and register`,
    );
    assert.equal(
      tableRow.status,
      protocol.status,
      `${protocol.ticketId} status drift between JSON and register`,
    );
    const activities = researchActivities
      .filter((activity) => protocol.permissions[activity])
      .join(", ");
    assert.equal(
      tableRow.activities,
      activities || "None",
      `${protocol.ticketId} activity drift between JSON and register`,
    );
  }
}

export async function validateResearchAuthorizationArtifacts(
  repositoryRoot,
  authorization,
) {
  const descriptors = [
    {
      label: "research control procedure",
      descriptor: authorization.controlProcedure,
      rejectPlaceholders: authorization.controlsApproval?.status === "Approved",
      requireApprovedMetadata:
        authorization.controlsApproval?.status === "Approved",
      expectedOwner: authorization.owner,
    },
  ];
  for (const [index, descriptor] of (
    authorization.supportingArtifacts ?? []
  ).entries()) {
    descriptors.push({
      label: `research supporting artifact ${index + 1}`,
      descriptor,
      rejectPlaceholders: false,
      requireApprovedMetadata:
        authorization.controlsApproval?.status === "Approved",
      expectedOwner: authorization.owner,
    });
  }
  for (const protocol of authorization.protocols ?? []) {
    descriptors.push({
      label: `${protocol.ticketId} artifact`,
      descriptor: protocol.artifact,
      rejectPlaceholders: false,
      requireApprovedMetadata: protocol.status === "Approved",
      expectedOwner: protocol.owner,
    });
    descriptors.push({
      label: `${protocol.ticketId} consent script`,
      descriptor: protocol.consentScript,
      rejectPlaceholders: protocol.status === "Approved",
      requireApprovedMetadata: protocol.status === "Approved",
      expectedOwner: authorization.owner,
    });
  }

  const artifactContents = new Map();
  for (const {
    label,
    descriptor,
    rejectPlaceholders,
    requireApprovedMetadata,
    expectedOwner,
  } of descriptors) {
    const absolutePath = resolve(repositoryRoot, descriptor.path);
    assert(
      absolutePath.startsWith(`${resolve(repositoryRoot)}/`),
      `${label} escapes the repository`,
    );
    const contents = await readFile(absolutePath);
    const digest = createHash("sha256").update(contents).digest("hex");
    assert.equal(digest, descriptor.sha256, `${label} revision hash drift`);
    const textContents = contents.toString("utf8");
    artifactContents.set(descriptor.path, textContents);
    assert(
      textContents.includes(`- **Version:** ${descriptor.version}`),
      `${label} does not declare pinned version ${descriptor.version}`,
    );
    if (rejectPlaceholders) {
      assert(
        !/\[APPROVED [^\]]+\]/u.test(textContents),
        `${label} contains unresolved approval placeholders`,
      );
    }
    if (requireApprovedMetadata) {
      assertApprovedArtifactMetadata(
        textContents,
        descriptor,
        expectedOwner,
        label,
      );
    }
  }

  const consentMarkers = {
    notes: "Redacted notes:",
    shortQuotes: "Short anonymized quotes:",
    audioRecording: "Audio recording:",
    videoRecording: "Video recording:",
    humanTranscription: "Human transcription:",
    followUp: "Follow-up contact for this protocol:",
    researchReuse: "Research reuse for ",
  };
  for (const protocol of authorization.protocols ?? []) {
    if (protocol.status !== "Approved") {
      continue;
    }
    const consent = artifactContents.get(protocol.consentScript.path) ?? "";
    for (const [activity, marker] of Object.entries(consentMarkers)) {
      if (protocol.permissions[activity]) {
        assert(
          consent.includes(marker),
          `${protocol.ticketId} consent script omits enabled ${activity}`,
        );
      }
    }
    if (protocol.permissions.automatedTranscription) {
      assert(
        consent.includes(
          `Automated transcription with ${protocol.automatedTranscriptionProcessor.name}:`,
        ),
        `${protocol.ticketId} consent script omits its automated transcription processor`,
      );
    }
  }

  const approvalEvidence = [
    authorization.controlsApproval?.projectOwner,
    authorization.controlsApproval?.privacyTrustReviewer,
    authorization.participantSystemOfRecord?.approval,
    ...(authorization.recruitmentChannels ?? []).map(
      (channel) => channel.approval,
    ),
    ...(authorization.protocols ?? []).flatMap((protocol) => [
      protocol.approvals?.projectOwner,
      protocol.approvals?.privacyTrustReviewer,
      protocol.incentiveDecision?.approval,
      protocol.automatedTranscriptionProcessor?.approval,
    ]),
  ].filter(Boolean);

  for (const approval of approvalEvidence) {
    if (!approval.evidenceRef.startsWith("plans/")) {
      continue;
    }
    const evidencePath = approval.evidenceRef.split("#")[0];
    const absolutePath = resolve(repositoryRoot, evidencePath);
    assert(
      absolutePath.startsWith(`${resolve(repositoryRoot)}/`),
      "research approval evidence escapes the repository",
    );
    await stat(absolutePath);
  }
}

function assertArtifactDescriptor(descriptor, label) {
  assert(
    /^plans\/(?:research|templates)\/[A-Za-z0-9._/-]+\.md$/u.test(
      descriptor?.path ?? "",
    ),
    `${label} requires a repository research artifact path`,
  );
  assert(
    /^\d+\.\d+$/u.test(descriptor?.version ?? ""),
    `${label} requires a numeric version`,
  );
  assert(
    sha256Pattern.test(descriptor?.sha256 ?? ""),
    `${label} requires a sha256 revision`,
  );
}

function assertApprovedArtifactMetadata(
  contents,
  descriptor,
  expectedOwner,
  label,
) {
  const owner = contents.match(/^- \*\*Owner:\*\* ([^\n]+)$/mu)?.[1]?.trim();
  const status = contents.match(/^- \*\*Status:\*\* ([^\n]+)$/mu)?.[1]?.trim();
  const effectiveDate = contents
    .match(/^- \*\*Effective date:\*\* ([^\n]+)$/mu)?.[1]
    ?.trim();
  assert.equal(owner, expectedOwner, `${label} owner does not match approval`);
  assert.equal(status, "Approved", `${label} must declare Approved status`);
  assertValidTimestamp(effectiveDate, `${label} effective date`);
  assert(
    contents.includes(`- **Version:** ${descriptor.version}`),
    `${label} version does not match approval`,
  );
}

function assertApprovalEvidence(approval, label, asOf) {
  assert.equal(approval?.decision, "Approved", `${label} must be Approved`);
  assertMeaningfulString(approval?.approvedBy, `${label} approvedBy`);
  assert(
    evidenceReferencePattern.test(approval?.evidenceRef ?? ""),
    `${label} requires a resolvable evidence reference`,
  );
  const approvedAt = assertValidTimestamp(
    approval?.approvedAt,
    `${label} approvedAt`,
  );
  const reviewAt = assertValidTimestamp(
    approval?.reviewAt,
    `${label} reviewAt`,
  );
  const expiresAt = assertValidTimestamp(
    approval?.expiresAt,
    `${label} expiresAt`,
  );
  assert(approvedAt <= asOf, `${label} approval cannot be future-dated`);
  assert(reviewAt > asOf, `${label} review is due or expired`);
  assert(expiresAt > asOf, `${label} is expired`);
  assert(reviewAt <= expiresAt, `${label} review must not follow expiry`);
}

function approvalIsCurrent(approval, asOf) {
  if (approval?.decision !== "Approved") {
    return false;
  }
  const reviewAt = new Date(approval.reviewAt);
  const expiresAt = new Date(approval.expiresAt);
  return (
    !Number.isNaN(reviewAt.getTime()) &&
    !Number.isNaN(expiresAt.getTime()) &&
    reviewAt > asOf &&
    expiresAt > asOf
  );
}

function assertValidTimestamp(value, label) {
  const timestamp = new Date(value ?? "");
  assert(
    typeof value === "string" && !Number.isNaN(timestamp.getTime()),
    `${label} must be an ISO timestamp`,
  );
  return timestamp;
}

function assertMeaningfulString(value, label) {
  assert(
    typeof value === "string" && value.trim() !== "",
    `${label} must be assigned`,
  );
  assert(
    !/\b(?:todo|tbd|pending|draft|unassigned|unapproved)\b/iu.test(value),
    `${label} contains a placeholder`,
  );
}

function assertNonEmptyMeaningfulStrings(value, label) {
  assert(
    Array.isArray(value) && value.length > 0,
    `${label} must not be empty`,
  );
  for (const entry of value) {
    assertMeaningfulString(entry, label);
  }
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
