import assert from "node:assert/strict";
import test from "node:test";

import {
  extractTicketStatus,
  parseCsv,
  validateBacklogRows,
  validateDeliveryState,
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
