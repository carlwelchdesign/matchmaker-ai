import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  extractTicketStatus,
  isResearchActivityAuthorized,
  parseCsv,
  validateBacklogRows,
  validateDeliveryState,
  validateResearchAuthorization,
  validateResearchAuthorizationArtifacts,
  validateResearchRegisterParity,
} from "./validate-plans.mjs";

test("parseCsv handles quoted fields with commas", () => {
  const rows = parseCsv(
    'id,status,blocked_reason\nARG-001,Proposed,"Needs owner, legal, and design"\n',
  );

  assert.deepEqual(rows, [
    {
      id: "ARG-001",
      status: "Proposed",
      blocked_reason: "Needs owner, legal, and design",
    },
  ]);
});

test("validateBacklogRows rejects unknown dependencies", () => {
  assert.throws(
    () =>
      validateBacklogRows([
        completeRow({ id: "ARG-001", dependencies: "ARG-999" }),
      ]),
    /unknown ticket/u,
  );
});

test("validateBacklogRows rejects dependency cycles", () => {
  assert.throws(
    () =>
      validateBacklogRows([
        completeRow({ id: "ARG-001", dependencies: "ARG-002" }),
        completeRow({ id: "ARG-002", dependencies: "ARG-001" }),
      ]),
    /Dependency cycle/u,
  );
});

test("extractTicketStatus supports standard and legacy ticket formats", () => {
  assert.equal(extractTicketStatus("- **Status:** In review\n"), "In review");
  assert.equal(
    extractTicketStatus("## Status\n\n`In progress`\n"),
    "In progress",
  );
});

test("validateBacklogRows rejects invalid estimate bands", () => {
  assert.throws(
    () => validateBacklogRows([completeRow({ estimate_band: "2026-08-28" })]),
    /invalid estimate band/u,
  );
});

test("validateBacklogRows rejects multiple in-progress tickets", () => {
  assert.throws(
    () =>
      validateBacklogRows([
        readyRow({ id: "ARG-001", status: "In progress" }),
        readyRow({ id: "ARG-002", status: "In progress" }),
      ]),
    /Single-WIP violation/u,
  );
});

test("validateBacklogRows requires blocked owner, review date, and fallback", () => {
  assert.throws(
    () =>
      validateBacklogRows([
        completeRow({
          status: "Blocked",
          owner: "Carl Welch",
          reviewer: "Project owner",
          blocked_reason: "Waiting for a decision",
        }),
      ]),
    /without owner, review date, and fallback metadata/u,
  );
});

test("validateBacklogRows requires a waiver for active unfinished dependencies", () => {
  assert.throws(
    () =>
      validateBacklogRows([
        completeRow({ id: "ARG-001" }),
        readyRow({ id: "ARG-002", dependencies: "ARG-001" }),
      ]),
    /unfinished dependencies and no approved waiver/u,
  );
});

test("validateBacklogRows requires a scoped waiver for Done work with open dependencies", () => {
  assert.throws(
    () =>
      validateBacklogRows([
        completeRow({ id: "ARG-001" }),
        completeRow({
          id: "ARG-002",
          status: "Done",
          dependencies: "ARG-001",
          owner: "Carl Welch",
          reviewer: "Project owner",
          acceptance_artifact: "plans/tickets/ARG-002-example.md",
        }),
      ]),
    /Done with unfinished dependencies and no approved waiver/u,
  );
});

test("validateDeliveryState matches the single active backlog ticket", () => {
  const rows = [readyRow({ id: "ARG-029", status: "In progress" })];
  const deliveryState = state({
    activeTickets: [
      {
        id: "ARG-029",
        workflowTaskRef: "1234567890123",
        deliveryStatus: "In progress",
        artifactMaturity: "Planning control implementation",
      },
    ],
  });

  assert.doesNotThrow(() => validateDeliveryState(rows, deliveryState));
});

test("validateDeliveryState rejects backlog and snapshot drift", () => {
  assert.throws(
    () =>
      validateDeliveryState(
        [readyRow({ id: "ARG-029", status: "In progress" })],
        state({ activeTickets: [] }),
      ),
    /active tickets do not match/u,
  );
});

test("validateResearchAuthorization accepts the fail-closed draft", () => {
  assert.doesNotThrow(() =>
    validateResearchAuthorization(
      [researchRow()],
      researchAuthorization(),
      validationTime(),
    ),
  );
});

test("validateResearchAuthorization rejects open operations before approval", () => {
  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        researchAuthorization({
          operationalState: operationalState({ status: "Open" }),
        }),
        validationTime(),
      ),
    /cannot open before shared controls are approved/u,
  );
});

test("validateResearchAuthorization rejects placeholder approval evidence", () => {
  const authorization = approvedResearchAuthorization();
  authorization.controlsApproval.projectOwner.approvedBy = "TODO";

  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        authorization,
        validationTime(),
      ),
    /contains a placeholder/u,
  );
});

test("validateResearchAuthorization accepts complete evidence-backed approval", () => {
  assert.doesNotThrow(() =>
    validateResearchAuthorization(
      [researchRow()],
      approvedResearchAuthorization(),
      validationTime(),
    ),
  );
});

test("research activity authorization is protocol and activity specific", () => {
  const authorization = approvedResearchAuthorization();
  assert.equal(
    isResearchActivityAuthorized(
      authorization,
      "ARG-002",
      "outreach",
      validationTime().asOf,
    ),
    true,
  );
  assert.equal(
    isResearchActivityAuthorized(
      authorization,
      "ARG-002",
      "audioRecording",
      validationTime().asOf,
    ),
    false,
  );
  assert.equal(
    isResearchActivityAuthorized(
      authorization,
      "ARG-999",
      "outreach",
      validationTime().asOf,
    ),
    false,
  );
});

test("paused operations preserve approvals but authorize no activity", () => {
  const authorization = approvedResearchAuthorization({
    operationalState: operationalState({ status: "Paused" }),
  });

  assert.doesNotThrow(() =>
    validateResearchAuthorization(
      [researchRow()],
      authorization,
      validationTime(),
    ),
  );
  assert.equal(
    isResearchActivityAuthorized(
      authorization,
      "ARG-002",
      "outreach",
      validationTime().asOf,
    ),
    false,
  );
});

test("validateResearchAuthorization rejects expired evidence", () => {
  const authorization = approvedResearchAuthorization();
  authorization.protocols[0].approvals.projectOwner.expiresAt =
    "2026-08-27T00:00:00Z";

  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        authorization,
        validationTime(),
      ),
    /is expired/u,
  );
});

test("validateResearchAuthorization rejects automated transcription without a processor", () => {
  const authorization = approvedResearchAuthorization();
  authorization.protocols[0].permissions.automatedTranscription = true;

  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        authorization,
        validationTime(),
      ),
    /automated transcription processor must be assigned/u,
  );
});

test("validateResearchAuthorization rejects unknown and ungoverned protocols", () => {
  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        researchAuthorization({
          protocols: [
            protocol({
              ticketId: "ARG-999",
              artifact: artifact("plans/research/ARG-999.md"),
            }),
          ],
        }),
        validationTime(),
      ),
    /unknown ticket/u,
  );

  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        researchAuthorization({ governedTickets: [] }),
        validationTime(),
      ),
    /protocol but is not in governedTickets/u,
  );
});

test("validateResearchAuthorization blocks an unregistered governed ticket from Ready", () => {
  assert.throws(
    () =>
      validateResearchAuthorization(
        [
          researchRow(),
          completeRow({
            id: "ARG-031",
            epic: "Buyer discovery",
            status: "Ready",
          }),
        ],
        researchAuthorization({ governedTickets: ["ARG-002", "ARG-031"] }),
        validationTime(),
      ),
    /without a registered research protocol/u,
  );
});

test("validateResearchAuthorization blocks Ready research without outreach approval", () => {
  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow({ status: "Ready" })],
        researchAuthorization(),
        validationTime(),
      ),
    /participant outreach is unauthorized/u,
  );
});

test("validateResearchRegisterParity rejects human and machine drift", () => {
  const authorization = researchAuthorization();
  const register =
    "- **Owner:** Carl Welch\n" +
    "- **Status:** Controls not approved; operations closed\n" +
    "- **Version:** 2.0\n\n" +
    "| Ticket | Purpose | Approval | Allowed activities |\n" +
    "| --- | --- | --- | --- |\n" +
    "| ARG-002 | Different purpose | Not approved | None |\n";

  assert.throws(
    () => validateResearchRegisterParity(authorization, register),
    /purpose drift/u,
  );
});

test("validateResearchAuthorizationArtifacts rejects placeholders and draft metadata", async () => {
  const repositoryRoot = await mkdtemp(join(tmpdir(), "argent-research-"));
  try {
    const researchRoot = join(repositoryRoot, "plans/research");
    await mkdir(researchRoot, { recursive: true });
    const control =
      "- **Owner:** Carl Welch\n- **Status:** Approved\n- **Version:** 1.0\n- **Effective date:** 2026-08-20\nApproved procedure\n";
    const protocolText =
      "- **Owner:** Project owner\n- **Status:** Approved\n- **Version:** 1.0\n- **Effective date:** 2026-08-20\nApproved protocol\n";
    const consent =
      "- **Owner:** Carl Welch\n- **Status:** Approved\n- **Version:** 1.0\n- **Effective date:** 2026-08-20\nContact [APPROVED WITHDRAWAL CHANNEL]\n";
    await writeFile(join(researchRoot, "controls.md"), control);
    await writeFile(join(researchRoot, "protocol.md"), protocolText);
    await writeFile(join(researchRoot, "consent.md"), consent);

    const authorization = approvedResearchAuthorization({
      controlProcedure: hashedArtifact("plans/research/controls.md", control),
      supportingArtifacts: [
        hashedArtifact("plans/research/controls.md", control),
      ],
      protocols: [
        protocol({
          status: "Approved",
          artifact: hashedArtifact("plans/research/protocol.md", protocolText),
          consentScript: hashedArtifact("plans/research/consent.md", consent),
          approvals: {
            projectOwner: approval("Project Owner"),
            privacyTrustReviewer: approval("Privacy Reviewer"),
          },
          cohorts: ["Founder/operator"],
          recruitmentChannelIds: ["direct-email"],
          incentiveDecision: {
            status: "Not applicable",
            terms: "No incentive for this protocol",
            approval: approval("Project Owner"),
          },
          permissions: permissions({ outreach: true }),
        }),
      ],
    });

    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /unresolved approval placeholders/u,
    );

    const draftControl = control.replace(
      "- **Status:** Approved",
      "- **Status:** Draft",
    );
    const resolvedConsent = consent.replace(
      "Contact [APPROVED WITHDRAWAL CHANNEL]",
      "Approved withdrawal channel",
    );
    await writeFile(join(researchRoot, "controls.md"), draftControl);
    await writeFile(join(researchRoot, "consent.md"), resolvedConsent);
    authorization.controlProcedure = hashedArtifact(
      "plans/research/controls.md",
      draftControl,
    );
    authorization.supportingArtifacts = [
      hashedArtifact("plans/research/controls.md", draftControl),
    ];
    authorization.protocols[0].consentScript = hashedArtifact(
      "plans/research/consent.md",
      resolvedConsent,
    );

    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /must declare Approved status/u,
    );
  } finally {
    await rm(repositoryRoot, { recursive: true, force: true });
  }
});
function completeRow(overrides) {
  return {
    id: "ARG-000",
    epic: "Planning",
    phase: "0",
    priority: "P0",
    status: "Proposed",
    outcome: "Outcome",
    dependencies: "None",
    release_gate: "Planning",
    milestone: "Decision gate",
    epic_id: "EPIC-0",
    owner: "Unassigned",
    reviewer: "Unassigned",
    estimate_band: "S",
    acceptance_artifact: "Required at Ready",
    risk_decision_links: "",
    blocked_reason: "",
    ...overrides,
  };
}

function readyRow(overrides = {}) {
  return completeRow({
    status: "Ready",
    owner: "Carl Welch",
    reviewer: "Project owner",
    acceptance_artifact: "plans/tickets/ARG-999-example.md",
    risk_decision_links: "R-020",
    ...overrides,
  });
}

function state(overrides = {}) {
  return {
    workflowAuthority: {
      system: "Asana",
      projectId: "1217038055360286",
      inProgressSectionId: "1216473233375598",
      wipLimit: 1,
    },
    evidenceAuthority: "repository",
    activeTickets: [],
    reconciledTickets: [],
    ...overrides,
  };
}

function researchAuthorization(overrides = {}) {
  return {
    version: "2.0",
    controlsApproval: {
      status: "Not approved",
      projectOwner: null,
      privacyTrustReviewer: null,
    },
    operationalState: operationalState(),
    owner: "Carl Welch",
    governedTickets: ["ARG-002"],
    participantSystemOfRecord: {
      status: "Not selected",
      reference: null,
      approval: null,
    },
    recruitmentChannels: [],
    controlProcedure: artifact("plans/research/research-control-procedures.md"),
    supportingArtifacts: [artifact("plans/research/research-runbook.md")],
    operationalControls: operationalControls(),
    protocols: [protocol()],
    ...overrides,
  };
}

function approvedResearchAuthorization(overrides = {}) {
  return researchAuthorization({
    controlsApproval: {
      status: "Approved",
      projectOwner: approval("Project Owner"),
      privacyTrustReviewer: approval("Privacy Reviewer"),
    },
    operationalState: operationalState({ status: "Open" }),
    participantSystemOfRecord: {
      status: "Selected",
      reference: "approved-research-system",
      approval: approval("Privacy Reviewer"),
    },
    recruitmentChannels: [
      {
        id: "direct-email",
        label: "Approved direct email",
        status: "Approved",
        approval: approval("Privacy Reviewer"),
      },
    ],
    operationalControls: operationalControls({ approved: true }),
    protocols: [
      protocol({
        status: "Approved",
        approvals: {
          projectOwner: approval("Project Owner"),
          privacyTrustReviewer: approval("Privacy Reviewer"),
        },
        cohorts: ["Founder/operator"],
        recruitmentChannelIds: ["direct-email"],
        incentiveDecision: {
          status: "Not applicable",
          terms: "No incentive for this protocol",
          approval: approval("Project Owner"),
        },
        permissions: permissions({ outreach: true, notes: true }),
      }),
    ],
    ...overrides,
  });
}

function researchRow(overrides = {}) {
  return completeRow({
    id: "ARG-002",
    epic: "Research",
    owner: "Project owner",
    reviewer: "Project owner",
    acceptance_artifact:
      "plans/research/ARG-002-founder-matchmaker-workflow.md",
    risk_decision_links: "R-040",
    ...overrides,
  });
}

function protocol(overrides = {}) {
  return {
    ticketId: "ARG-002",
    purpose: "Service operations and matchmaker workflow",
    owner: "Project owner",
    status: "Not approved",
    artifact: artifact("plans/research/ARG-002-founder-matchmaker-workflow.md"),
    consentScript: artifact("plans/research/consent-and-session-script.md"),
    approvals: {
      projectOwner: null,
      privacyTrustReviewer: null,
    },
    cohorts: [],
    recruitmentChannelIds: [],
    incentiveDecision: {
      status: "Not approved",
      terms: null,
      approval: null,
    },
    permissions: permissions(),
    automatedTranscriptionProcessor: null,
    ...overrides,
  };
}

function permissions(overrides = {}) {
  return {
    outreach: false,
    notes: false,
    shortQuotes: false,
    audioRecording: false,
    videoRecording: false,
    humanTranscription: false,
    automatedTranscription: false,
    followUp: false,
    researchReuse: false,
    ...overrides,
  };
}

function artifact(path) {
  return {
    path,
    version: "1.0",
    sha256: "a".repeat(64),
  };
}

function hashedArtifact(path, contents) {
  return {
    path,
    version: "1.0",
    sha256: createHash("sha256").update(contents).digest("hex"),
  };
}

function approval(approvedBy) {
  return {
    decision: "Approved",
    approvedBy,
    approvedAt: "2026-08-20T00:00:00Z",
    evidenceRef: "asana:1217966825442195/1217967000000000",
    reviewAt: "2026-09-15T00:00:00Z",
    expiresAt: "2026-12-31T00:00:00Z",
  };
}

function operationalState(overrides = {}) {
  return {
    status: "Closed",
    changedAt: "2026-08-28T00:00:00Z",
    changedBy: "Carl Welch",
    reason: "Human approval is required",
    ...overrides,
  };
}

function operationalControls({ approved = false } = {}) {
  const dataClass = (id, purpose) => ({
    id,
    purpose,
    systemReference: approved ? "approved research system" : null,
    minimumFields: approved ? ["Opaque participant reference"] : [],
    collectionSource: approved ? "Approved participant intake" : null,
    allowedRoles: approved ? ["Research owner"] : [],
    accessReviewOwner: approved ? "Privacy Reviewer" : null,
    correctionExportRule: approved ? "Approved correction/export rule" : null,
    retentionRule: approved ? "Approved bounded retention" : null,
    deletionRule: approved ? "Approved deletion procedure" : null,
    backupRule: approved ? "Approved backup deletion rule" : null,
    incidentReference: approved ? "plans/research/incident-procedure" : null,
    offboardingRule: approved ? "Approved export and deletion rule" : null,
  });
  return {
    withdrawal: {
      channelReference: approved ? "approved withdrawal channel" : null,
      acknowledgementTarget: approved ? "Two business days" : null,
      completionTarget: approved ? "Thirty days" : null,
    },
    safety: {
      owner: approved ? "Safety Owner" : null,
      deputy: approved ? "Safety Deputy" : null,
      contactReference: approved ? "approved safety contact" : null,
    },
    accessibility: {
      accommodationChannelReference: approved
        ? "approved accommodation channel"
        : null,
      accessibleCommunicationProcedure: approved
        ? "approved accessible communication procedure"
        : null,
    },
    dataClasses: [
      dataClass("recruitmentContacts", "Recruitment and scheduling"),
      dataClass("consentReceipts", "Permission and withdrawal evidence"),
      dataClass("redactedNotes", "Research synthesis and traceability"),
      dataClass(
        "recordingsAndTranscripts",
        "Separately approved source evidence",
      ),
      dataClass(
        "incentiveRecords",
        "Approved participant compensation evidence",
      ),
    ],
  };
}

function validationTime() {
  return { asOf: new Date("2026-08-28T12:00:00Z") };
}
