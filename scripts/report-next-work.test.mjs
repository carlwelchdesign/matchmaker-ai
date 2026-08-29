import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBacklogReadinessReport,
  formatBacklogReadinessReport,
} from "./report-next-work.mjs";

test("separates implementation-ready work from decision-gated work", () => {
  const report = buildBacklogReadinessReport([
    row({ id: "ARG-000", status: "Done" }),
    row({
      id: "ARG-001",
      dependencies: "ARG-000",
      release_gate: "Product",
      milestone: "Decision gate",
      outcome: "Approve product direction",
    }),
    row({
      id: "ARG-119",
      status: "Ready",
      dependencies: "ARG-000",
      release_gate: "Engineering",
      milestone: "Operational alpha",
      acceptance_artifact: "plans/tickets/ARG-119-backlog-readiness-report.md",
      outcome: "Report next safe development work",
    }),
  ]);

  assert.deepEqual(
    report.decisionReady.map((ticket) => ticket.id),
    ["ARG-001"],
  );
  assert.deepEqual(
    report.implementationReady.map((ticket) => ticket.id),
    ["ARG-119"],
  );
});

test("excludes every non-Ready workflow state from implementation-ready work", () => {
  const report = buildBacklogReadinessReport([
    row({ id: "ARG-001", status: "Proposed" }),
    row({ id: "ARG-002", status: "Blocked" }),
    row({ id: "ARG-003", status: "In review" }),
  ]);

  assert.deepEqual(report.implementationReady, []);
});

test("requires ownership, review, evidence, risk linkage, and WIP capacity", () => {
  const invalidReadyRows = [
    row({ id: "ARG-101", status: "Ready", owner: "Unassigned" }),
    row({ id: "ARG-102", status: "Ready", reviewer: "Unassigned" }),
    row({
      id: "ARG-103",
      status: "Ready",
      acceptance_artifact: "Required at Ready",
    }),
    row({ id: "ARG-104", status: "Ready", risk_decision_links: "" }),
  ];

  for (const invalidRow of invalidReadyRows) {
    const report = buildBacklogReadinessReport([invalidRow]);
    assert.deepEqual(
      report.implementationReady,
      [],
      `${invalidRow.id} must not be implementation-ready`,
    );
  }

  const reportWithActiveWip = buildBacklogReadinessReport([
    row({ id: "ARG-105", status: "Ready" }),
    row({ id: "ARG-106", status: "In progress" }),
  ]);
  assert.deepEqual(reportWithActiveWip.implementationReady, []);
});

test("accepts only a structured approved dependency waiver", () => {
  const report = buildBacklogReadinessReport([
    row({ id: "ARG-000", status: "Proposed" }),
    row({
      id: "ARG-119",
      status: "Ready",
      dependencies: "ARG-000",
      blocked_reason:
        "Approved dependency waiver (2026-08-28; approver: Project owner; scope: planning report only)",
    }),
  ]);

  assert.deepEqual(
    report.implementationReady.map((ticket) => ticket.id),
    ["ARG-119"],
  );
});

test("reports unfinished dependencies for blocked tickets", () => {
  const report = buildBacklogReadinessReport([
    row({ id: "ARG-000", status: "Done" }),
    row({
      id: "ARG-105",
      dependencies: "ARG-000;ARG-116",
      release_gate: "Operations",
      outcome: "Select deployment approach",
    }),
  ]);

  assert.equal(report.blockedByDependencies[0].id, "ARG-105");
  assert.deepEqual(report.blockedByDependencies[0].missingDependencies, [
    "ARG-116",
  ]);
});

test("formats an operator-readable report", () => {
  const formatted = formatBacklogReadinessReport(
    buildBacklogReadinessReport([
      row({ id: "ARG-000", status: "Done" }),
      row({
        id: "ARG-001",
        dependencies: "ARG-000",
        release_gate: "Product",
        milestone: "Decision gate",
        outcome: "Approve product direction",
      }),
    ]),
  );

  assert.match(formatted, /Argent backlog readiness report/u);
  assert.match(formatted, /Active WIP/u);
  assert.match(formatted, /Decision-ready \/ gated tickets/u);
  assert.match(formatted, /ARG-001 Approve product direction/u);
});

function row(overrides = {}) {
  return {
    id: "ARG-999",
    epic: "Planning",
    phase: "1",
    priority: "P0",
    status: "Proposed",
    outcome: "Outcome",
    dependencies: "None",
    release_gate: "Engineering",
    milestone: "Operational alpha",
    epic_id: "EPIC-1",
    owner: "Codex",
    reviewer: "Project owner",
    estimate_band: "S",
    acceptance_artifact: "plans/tickets/ARG-999-example.md",
    risk_decision_links: "R-001",
    blocked_reason: "",
    ...overrides,
  };
}
