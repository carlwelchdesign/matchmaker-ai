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

test("validateResearchAuthorization blocks an unregistered governed ticket from Done", () => {
  assert.throws(
    () =>
      validateResearchAuthorization(
        [
          researchRow(),
          completeRow({
            id: "ARG-809",
            epic: "Usability beta",
            status: "Done",
          }),
        ],
        researchAuthorization({ governedTickets: ["ARG-002", "ARG-809"] }),
        validationTime(),
      ),
    /cannot be Done without a registered research protocol/u,
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

test("registered ARG-031 remains blocked from In progress without outreach approval", () => {
  const buyerRow = completeRow({
    id: "ARG-031",
    epic: "Buyer discovery",
    status: "In progress",
    owner: "Carl Welch",
    reviewer: "Project owner",
    acceptance_artifact: "plans/research/ARG-031-buyer-discovery-protocol.md",
    risk_decision_links: "R-021;R-023",
  });
  const buyerProtocol = protocol({
    ticketId: "ARG-031",
    purpose: "Buyer problem intensity, authority, and commitment",
    owner: "Carl Welch",
    artifact: artifact("plans/research/ARG-031-buyer-discovery-protocol.md"),
  });

  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow(), buyerRow],
        researchAuthorization({
          governedTickets: ["ARG-002", "ARG-031"],
          protocols: [protocol(), buyerProtocol],
        }),
        validationTime(),
      ),
    /ARG-031 cannot be In progress while participant outreach is unauthorized/u,
  );
});

test("governed research cannot be Done without immutable completion evidence", () => {
  const authorization = researchAuthorization();

  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow({ status: "Done" })],
        authorization,
        validationTime(),
      ),
    /Done research requires immutable completion evidence/u,
  );

  authorization.protocols[0].completionEvidence = completionEvidence(
    authorization.protocols[0],
  );
  assert.doesNotThrow(() =>
    validateResearchAuthorization(
      [researchRow({ status: "Done" })],
      authorization,
      validationTime(),
    ),
  );

  authorization.protocols[0].completionRequirements.minimumIncludedSessions = 9;
  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow({ status: "Done" })],
        authorization,
        validationTime(),
      ),
    /fewer included sessions than its predeclared minimum/u,
  );
});

test("commitment completion requires follow-up and pinned stimulus revisions", () => {
  const authorization = approvedResearchAuthorization();
  const researchProtocol = authorization.protocols[0];
  researchProtocol.completionRequirements.requiresCommitmentStimulus = true;

  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        authorization,
        validationTime(),
      ),
    /commitment measurement requires follow-up authorization/u,
  );

  researchProtocol.permissions.followUp = true;
  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow()],
        authorization,
        validationTime(),
      ),
    /commitment offer artifact requires a repository research artifact path/u,
  );

  researchProtocol.commitmentStimulus = {
    offerArtifact: artifact("plans/research/commitment-offer.md"),
    reviewScript: artifact("plans/research/commitment-review.md"),
  };
  researchProtocol.completionEvidence = completionEvidence(researchProtocol);
  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow({ status: "Done" })],
        authorization,
        validationTime(),
      ),
    /completion snapshot must include followUp/u,
  );

  researchProtocol.completionEvidence.authorizationSnapshot.allowedActivities.push(
    "followUp",
  );
  researchProtocol.completionEvidence.commitmentOfferSha256 =
    researchProtocol.commitmentStimulus.offerArtifact.sha256;
  researchProtocol.completionEvidence.commitmentReviewScriptSha256 =
    researchProtocol.commitmentStimulus.reviewScript.sha256;
  assert.doesNotThrow(() =>
    validateResearchAuthorization(
      [researchRow({ status: "Done" })],
      authorization,
      validationTime(),
    ),
  );

  researchProtocol.completionEvidence.commitmentOfferSha256 = "b".repeat(64);
  assert.throws(
    () =>
      validateResearchAuthorization(
        [researchRow({ status: "Done" })],
        authorization,
        validationTime(),
      ),
    /completion commitment offer revision drift/u,
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

test("validateResearchAuthorizationArtifacts enforces completion synthesis parity", async () => {
  const repositoryRoot = await mkdtemp(join(tmpdir(), "argent-completion-"));
  try {
    const researchRoot = join(repositoryRoot, "plans/research");
    await mkdir(researchRoot, { recursive: true });
    const draft =
      "- **Owner:** Carl Welch\n- **Status:** Draft\n- **Version:** 1.0\n- **Effective date:** Not approved\nDraft artifact\n";
    const approved = (body) =>
      "- **Owner:** Carl Welch\n" +
      "- **Status:** Approved\n" +
      "- **Version:** 1.0\n" +
      "- **Effective date:** 2026-08-20T00:00:00Z\n" +
      body;
    const snapshot = approved("Authorization snapshot\n");
    const protocolDigest = createHash("sha256").update(draft).digest("hex");
    const evidenceRows = Array.from({ length: 8 }, (_, index) => {
      const participant = String(index + 1).padStart(4, "0");
      return `| EVD-${participant} | PRT-${participant} | Primary | Direct matchmaking | Buyer decision boundary | Structured observation ${participant} | asana:1217966825442195/1217967000000000 | Counterevidence reviewed ${participant} | High | Supports |`;
    }).join("\n");
    const ledgerRows = Array.from({ length: 8 }, (_, index) => {
      const day = String(20 + index).padStart(2, "0");
      const participant = String(index + 1).padStart(4, "0");
      return `| PRT-${participant} | 2026-08-${day}T10:00:00Z | 1.0/${protocolDigest} | asana:1217966825442195/1217967000000000 | CONSENT-${participant} | Yes | Yes | Direct matchmaking | Concrete | Action | Unresolved | Concrete | Sole | Observable | Concrete | 2 | None observed |`;
    }).join("\n");
    const ledger = approved(
      "| Evidence ID | Opaque participant ref | Cohort | Direct or analogous | Claim tested | Observation/paraphrase | Evidence source | Counterevidence | Confidence | Decision effect |\n" +
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n" +
        `${evidenceRows}\n\n` +
        "## Per-primary-session coding\n\n" +
        "| Opaque participant ref | Session time | Protocol version/hash | Authorization evidence ref | Consent receipt ref | Authorization verified | Eligible primary | Market evidence | Recent problem | Current alternative | Alternative outcome | Unresolved cost | Purchase authority | Switching trigger | Trust constraint | Commitment level | Disconfirming evidence |\n" +
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | --- |\n" +
        `${ledgerRows}\n`,
    );
    const disposition = approved("Withdrawal and exclusion disposition\n");
    const synthesis = approved(
      "- **Protocol version:** 1.0\n" +
        "- **Primary sessions completed:** 8\n" +
        "- **Decision status:** Pass\n" +
        "| Criterion | Observed | Result |\n" +
        "| --- | ---: | --- |\n" +
        "| Concrete recent problem and action | 8 / 8 | Pass |\n" +
        "| Material unresolved cost and switching trigger | 8 / 8 | Pass |\n" +
        "| Sole or joint purchase authority | 8 / 8 | Pass |\n" +
        "| Commitment level 2 | 8 / 8 | Pass |\n" +
        "| Existing alternative resolves problem | 0 / 8 | Pass |\n" +
        "| Credible demand depends on prohibited guarantees, surveillance, discriminatory selection, undisclosed sharing, or pay-to-rank | No | None |\n" +
        "| Required privacy, safety, or service burden is incompatible with the bounded pilot | No | None |\n" +
        "| Evidence splits materially by cohort | No | None |\n" +
        "| Buying process is unclear | No | None |\n" +
        "| Participants require a materially different service promise | No | None |\n",
    );
    const artifacts = {
      "control.md": draft,
      "runbook.md": draft,
      "protocol.md": draft,
      "consent.md": draft,
      "snapshot.md": snapshot,
      "ledger.md": ledger,
      "disposition.md": disposition,
      "synthesis.md": synthesis,
    };
    for (const [fileName, contents] of Object.entries(artifacts)) {
      await writeFile(join(researchRoot, fileName), contents);
    }

    const authorization = researchAuthorization({
      controlProcedure: hashedArtifact("plans/research/control.md", draft),
      supportingArtifacts: [hashedArtifact("plans/research/runbook.md", draft)],
      protocols: [
        protocol({
          owner: "Carl Welch",
          artifact: hashedArtifact("plans/research/protocol.md", draft),
          consentScript: hashedArtifact("plans/research/consent.md", draft),
        }),
      ],
    });
    authorization.protocols[0].completionEvidence = completionEvidence(
      authorization.protocols[0],
    );
    authorization.protocols[0].completionEvidence.ownerDecision.decision =
      "Pass";
    authorization.protocols[0].completionEvidence.authorizationSnapshot.artifact =
      hashedArtifact("plans/research/snapshot.md", snapshot);
    authorization.protocols[0].completionEvidence.evidenceLedgerArtifact =
      hashedArtifact("plans/research/ledger.md", ledger);
    authorization.protocols[0].completionEvidence.withdrawalAndExclusionDispositionArtifact =
      hashedArtifact("plans/research/disposition.md", disposition);
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", synthesis);

    await assert.doesNotReject(() =>
      validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
    );

    const missingLocalSourceLedger = ledger.replace(
      "asana:1217966825442195/1217967000000000",
      "plans/research/missing-evidence.md",
    );
    await writeFile(join(researchRoot, "ledger.md"), missingLocalSourceLedger);
    authorization.protocols[0].completionEvidence.evidenceLedgerArtifact =
      hashedArtifact("plans/research/ledger.md", missingLocalSourceLedger);
    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /ENOENT/u,
    );

    for (const invalidConsent of ["", "None", "receipt one"]) {
      const invalidLedger = ledger.replace("CONSENT-0001", invalidConsent);
      await writeFile(join(researchRoot, "ledger.md"), invalidLedger);
      authorization.protocols[0].completionEvidence.evidenceLedgerArtifact =
        hashedArtifact("plans/research/ledger.md", invalidLedger);
      await assert.rejects(
        () =>
          validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
        /invalid consent receipt evidence/u,
      );
    }

    const duplicateConsentLedger = ledger.replace(
      "CONSENT-0002",
      "CONSENT-0001",
    );
    await writeFile(join(researchRoot, "ledger.md"), duplicateConsentLedger);
    authorization.protocols[0].completionEvidence.evidenceLedgerArtifact =
      hashedArtifact("plans/research/ledger.md", duplicateConsentLedger);
    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /duplicates CONSENT-0001/u,
    );

    const contradictoryAlternativeLedger = ledger.replace(
      "| Concrete | Action | Unresolved |",
      "| Concrete | Absent | Resolves |",
    );
    await writeFile(
      join(researchRoot, "ledger.md"),
      contradictoryAlternativeLedger,
    );
    authorization.protocols[0].completionEvidence.evidenceLedgerArtifact =
      hashedArtifact(
        "plans/research/ledger.md",
        contradictoryAlternativeLedger,
      );
    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /contradictory alternative coding/u,
    );

    await writeFile(join(researchRoot, "ledger.md"), ledger);
    authorization.protocols[0].completionEvidence.evidenceLedgerArtifact =
      hashedArtifact("plans/research/ledger.md", ledger);

    const countDriftSynthesis = synthesis.replace(
      "| Concrete recent problem and action | 8 / 8 |",
      "| Concrete recent problem and action | 7 / 8 |",
    );
    await writeFile(join(researchRoot, "synthesis.md"), countDriftSynthesis);
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", countDriftSynthesis);
    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /Concrete recent problem and action count drift/u,
    );

    const resultDriftSynthesis = synthesis.replace(
      "| Commitment level 2 | 8 / 8 | Pass |",
      "| Commitment level 2 | 8 / 8 | Miss |",
    );
    await writeFile(join(researchRoot, "synthesis.md"), resultDriftSynthesis);
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", resultDriftSynthesis);
    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /Commitment level 2 result drift/u,
    );

    const falsePassSynthesis = synthesis.replace(
      "| Credible demand depends on prohibited guarantees, surveillance, discriminatory selection, undisclosed sharing, or pay-to-rank | No | None |",
      "| Credible demand depends on prohibited guarantees, surveillance, discriminatory selection, undisclosed sharing, or pay-to-rank | Yes | EVD-0001 |",
    );
    await writeFile(join(researchRoot, "synthesis.md"), falsePassSynthesis);
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", falsePassSynthesis);
    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /Pass contradicts ledger thresholds/u,
    );

    const unknownEvidenceSynthesis = falsePassSynthesis.replace(
      "EVD-0001",
      "EVD-9999",
    );
    await writeFile(
      join(researchRoot, "synthesis.md"),
      unknownEvidenceSynthesis,
    );
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", unknownEvidenceSynthesis);
    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /lacks valid ledger evidence IDs/u,
    );

    const qualitativeStopSynthesis = falsePassSynthesis.replace(
      "- **Decision status:** Pass",
      "- **Decision status:** Stop",
    );
    await writeFile(
      join(researchRoot, "synthesis.md"),
      qualitativeStopSynthesis,
    );
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", qualitativeStopSynthesis);
    authorization.protocols[0].completionEvidence.ownerDecision.decision =
      "Stop";
    await assert.doesNotReject(() =>
      validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
    );

    const qualitativeReviseSynthesis = synthesis
      .replace("- **Decision status:** Pass", "- **Decision status:** Revise")
      .replace(
        "| Evidence splits materially by cohort | No | None |",
        "| Evidence splits materially by cohort | Yes | EVD-0002 |",
      );
    await writeFile(
      join(researchRoot, "synthesis.md"),
      qualitativeReviseSynthesis,
    );
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", qualitativeReviseSynthesis);
    authorization.protocols[0].completionEvidence.ownerDecision.decision =
      "Revise";
    await assert.doesNotReject(() =>
      validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
    );

    const contradictorySynthesis = synthesis.replace(
      "- **Decision status:** Pass",
      "- **Decision status:** Stop",
    );
    await writeFile(join(researchRoot, "synthesis.md"), contradictorySynthesis);
    authorization.protocols[0].completionEvidence.synthesisArtifact =
      hashedArtifact("plans/research/synthesis.md", contradictorySynthesis);
    authorization.protocols[0].completionEvidence.ownerDecision.decision =
      "Pass";

    await assert.rejects(
      () =>
        validateResearchAuthorizationArtifacts(repositoryRoot, authorization),
      /completion synthesis decision drift/u,
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
    evidenceArtifacts: [],
    completionRequirements: {
      minimumIncludedSessions: 1,
    },
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
    completionEvidence: null,
    ...overrides,
  };
}

function completionEvidence(researchProtocol) {
  return {
    completedAt: "2026-08-28T11:00:00Z",
    completedBy: "Research Owner",
    protocolArtifactSha256: researchProtocol.artifact.sha256,
    consentScriptSha256: researchProtocol.consentScript.sha256,
    authorizationEvidenceRefs: ["asana:1217966825442195/1217967000000000"],
    includedSessionCount: 8,
    firstIncludedSessionAt: "2026-08-20T10:00:00Z",
    lastIncludedSessionAt: "2026-08-27T10:00:00Z",
    authorizationSnapshot: {
      artifact: artifact("plans/research/authorization-snapshot.md"),
      operationalState: "Open",
      protocolStatus: "Approved",
      allowedActivities: ["outreach", "notes"],
      effectiveFrom: "2026-08-19T00:00:00Z",
      effectiveUntil: "2026-08-28T00:00:00Z",
      approvalEvidenceRefs: ["asana:1217966825442195/1217967000000000"],
    },
    evidenceLedgerArtifact: artifact("plans/research/evidence-ledger.md"),
    withdrawalAndExclusionDispositionArtifact: artifact(
      "plans/research/completion-disposition.md",
    ),
    synthesisArtifact: artifact("plans/research/research-synthesis.md"),
    ownerDecision: {
      decision: "Revise",
      decidedBy: "Project Owner",
      decidedAt: "2026-08-28T11:30:00Z",
      evidenceRef: "github:pull/90",
    },
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
