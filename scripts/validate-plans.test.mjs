import assert from "node:assert/strict";
import test from "node:test";

import {
  extractTicketStatus,
  parseCsv,
  validateBacklogRows,
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
