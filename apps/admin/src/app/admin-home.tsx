"use client";

import { Fragment, useState, type ReactNode } from "react";
import {
  candidateInspectionFilterLabels,
  candidateInspectionFilterStatus,
  filterCandidateInspection,
  candidateLabel,
  type CandidateApprovedFactFreshness,
  type CandidateInspectionPageData,
} from "./candidate-inspection-view-model";
import {
  candidateDashboardGroups,
  type CandidateDashboardPageData,
} from "./candidate-dashboard-view-model";

const applicants = [
  {
    detail: "Introduced through a fictional local referral",
    id: "A-104",
    initials: "AV",
    name: "Aster Vale",
    state: "Ready for human review",
  },
  {
    detail: "A sample incomplete application",
    id: "A-118",
    initials: "RK",
    name: "Rowan Kent",
    state: "Needs information",
  },
  {
    detail: "A fictional waitlist scenario",
    id: "A-123",
    initials: "MI",
    name: "Mira Ives",
    state: "Waitlist review",
  },
] as const;

const readiness = [
  [
    "Campaigns",
    "01",
    "One fictional campaign is available for layout review only.",
  ],
  [
    "Review queue",
    "03",
    "Example records are visible only in this local concept.",
  ],
  ["Pricing", "—", "No payment provider or price configuration is connected."],
] as const;

const operations = [
  [
    "Pricing is not connected",
    "Stripe configuration will be an admin responsibility in the production product; it is intentionally unavailable here.",
  ],
  [
    "Access is not connected",
    "This screen does not authenticate anyone or grant a real operational role.",
  ],
  [
    "Audit history is not connected",
    "No activity is recorded, exported, or retained by this local prototype.",
  ],
] as const;

type DiscoverySignal = {
  evidence: string;
  label: string;
  state: "Known concern" | "Passed" | "Unknown";
};

const discoveryCandidates = [
  {
    clientSignals: [
      {
        evidence: "Approved fictional profile · refreshed 6 days ago",
        label: "Long-term relationship intention",
        state: "Passed",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Preferred travel cadence",
        state: "Unknown",
      },
      {
        evidence: "Fictional staff note · needs a conversation",
        label: "Weekday availability overlap",
        state: "Known concern",
      },
    ],
    detail: "A fictional candidate with a small amount of reviewable context.",
    humanContext:
      "Not shortlisted. A matchmaker could decide to clarify availability before considering a private introduction.",
    id: "C-204",
    initials: "EL",
    mapPosition: "north",
    name: "Ember Lane",
    reverseSignals: [
      {
        evidence: "Approved fictional profile · refreshed 8 days ago",
        label: "Relationship intention is compatible",
        state: "Passed",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Interest in a first introduction",
        state: "Unknown",
      },
      {
        evidence: "Fictional staff note · verify directly",
        label: "Travel schedule fit",
        state: "Known concern",
      },
    ],
    shortlistState: "Not shortlisted",
  },
  {
    clientSignals: [
      {
        evidence: "Approved fictional profile · refreshed 3 days ago",
        label: "Coarse geography preference",
        state: "Passed",
      },
      {
        evidence: "Approved fictional profile · refreshed 3 days ago",
        label: "Interest in a thoughtful introduction",
        state: "Passed",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Family-planning preference",
        state: "Unknown",
      },
    ],
    detail:
      "A fictional candidate used to demonstrate a human-curated shortlist.",
    humanContext:
      "On a private fictional shortlist. This is an internal work state, not an approval or promise of an introduction.",
    id: "C-219",
    initials: "NS",
    mapPosition: "east",
    name: "Noor Sable",
    reverseSignals: [
      {
        evidence: "Approved fictional profile · refreshed 4 days ago",
        label: "Coarse geography preference",
        state: "Passed",
      },
      {
        evidence: "Approved fictional profile · refreshed 4 days ago",
        label: "Relationship intention is compatible",
        state: "Passed",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Family-planning preference",
        state: "Unknown",
      },
    ],
    shortlistState: "Private shortlist",
  },
  {
    clientSignals: [
      {
        evidence: "Approved fictional profile · refreshed 11 days ago",
        label: "Relationship intention",
        state: "Passed",
      },
      {
        evidence: "Fictional staff note · requires review",
        label: "Introduction timing",
        state: "Known concern",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Preferred social rhythm",
        state: "Unknown",
      },
    ],
    detail:
      "A fictional candidate showing that concerns and unknowns stay visible.",
    humanContext:
      "Held for matchmaker review. The map does not resolve the concern or make a recommendation.",
    id: "C-233",
    initials: "TV",
    mapPosition: "south",
    name: "Tarin Vale",
    reverseSignals: [
      {
        evidence: "Approved fictional profile · refreshed 12 days ago",
        label: "Relationship intention is compatible",
        state: "Passed",
      },
      {
        evidence: "Fictional staff note · requires review",
        label: "Current availability",
        state: "Known concern",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Preferred social rhythm",
        state: "Unknown",
      },
    ],
    shortlistState: "Held for review",
  },
  {
    clientSignals: [
      {
        evidence: "Approved fictional profile · refreshed 9 days ago",
        label: "Coarse geography preference",
        state: "Passed",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Preferred pace of connection",
        state: "Unknown",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Family-planning preference",
        state: "Unknown",
      },
    ],
    detail: "A fictional candidate with intentionally limited information.",
    humanContext:
      "Not shortlisted. A matchmaker may decide that there is not yet enough information to consider a private introduction.",
    id: "C-241",
    initials: "IS",
    mapPosition: "west",
    name: "Indigo Shore",
    reverseSignals: [
      {
        evidence: "Approved fictional profile · refreshed 10 days ago",
        label: "Coarse geography preference",
        state: "Passed",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Preferred pace of connection",
        state: "Unknown",
      },
      {
        evidence: "No fictional answer has been collected",
        label: "Family-planning preference",
        state: "Unknown",
      },
    ],
    shortlistState: "Not shortlisted",
  },
] as const satisfies readonly {
  clientSignals: readonly DiscoverySignal[];
  detail: string;
  humanContext: string;
  id: string;
  initials: string;
  mapPosition: "east" | "north" | "south" | "west";
  name: string;
  reverseSignals: readonly DiscoverySignal[];
  shortlistState: string;
}[];

type AdminView =
  | "campaigns"
  | "dashboard"
  | "discovery"
  | "facts"
  | "overview"
  | "operations"
  | "review";

const inspectionAccessLabels = {
  purpose: { "matchmaker-discovery": "Matchmaker discovery" },
  role: { matchmaker: "Matchmaker" },
} as const;

export default function AdminHome({
  candidateDashboardData,
  candidateInspectionData,
}: Readonly<{
  candidateDashboardData: CandidateDashboardPageData;
  candidateInspectionData: CandidateInspectionPageData;
}>) {
  const [view, setView] = useState<AdminView>("overview");
  const [selectedId, setSelectedId] = useState<string>(applicants[0].id);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>(
    discoveryCandidates[0].id,
  );
  const selected =
    applicants.find((applicant) => applicant.id === selectedId) ??
    applicants[0];
  const selectedCandidate =
    discoveryCandidates.find(
      (candidate) => candidate.id === selectedCandidateId,
    ) ?? discoveryCandidates[0];

  return (
    <main className="shell">
      <a className="skip-link" href="#admin-content">
        Skip to workspace content
      </a>
      <header className="header">
        <span className="wordmark">ARGENT</span>
        <p>Owner workspace · local concept only</p>
        <span>Jenny’s admin</span>
      </header>
      <nav aria-label="Jenny’s concept workspace" className="nav">
        <NavButton
          active={view === "overview"}
          onClick={() => setView("overview")}
        >
          Overview
        </NavButton>
        <NavButton active={view === "review"} onClick={() => setView("review")}>
          Review
        </NavButton>
        <NavButton
          active={view === "discovery"}
          onClick={() => setView("discovery")}
        >
          Discovery map
        </NavButton>
        <NavButton active={view === "facts"} onClick={() => setView("facts")}>
          Approved facts
        </NavButton>
        <NavButton
          active={view === "dashboard"}
          onClick={() => setView("dashboard")}
        >
          Analytics
        </NavButton>
        <NavButton
          active={view === "campaigns"}
          onClick={() => setView("campaigns")}
        >
          Campaigns
        </NavButton>
        <NavButton
          active={view === "operations"}
          onClick={() => setView("operations")}
        >
          Operations
        </NavButton>
      </nav>
      <section className="content" id="admin-content">
        {view === "overview" ? <Overview /> : null}
        {view === "review" ? (
          <Review
            selected={selected}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : null}
        {view === "discovery" ? (
          <DiscoveryMap
            onSelect={setSelectedCandidateId}
            selected={selectedCandidate}
            selectedId={selectedCandidateId}
          />
        ) : null}
        {view === "facts" ? (
          <ApprovedFacts data={candidateInspectionData} />
        ) : null}
        {view === "dashboard" ? (
          <CandidateDashboard data={candidateDashboardData} />
        ) : null}
        {view === "campaigns" ? <Campaigns /> : null}
        {view === "operations" ? <Operations /> : null}
      </section>
    </main>
  );
}

function CandidateDashboard({
  data,
}: Readonly<{ data: CandidateDashboardPageData }>) {
  return (
    <div className="view">
      <Intro
        eyebrow="Candidate analytics / synthetic dashboard"
        title="See the denominator. Keep the limits visible."
      >
        Review fictional operational measures with exact calculation lineage,
        explicit missing data, and no generalized candidate score.
      </Intro>
      <aside className="analytics-boundary" role="note">
        <span aria-hidden="true">●</span>
        <div>
          <strong>Synthetic product analytics</strong>
          <p>{data.separationNotice}</p>
        </div>
      </aside>
      <dl aria-label="Dashboard access context" className="dashboard-context">
        <div>
          <dt>Access role</dt>
          <dd>{data.accessContext.role}</dd>
        </div>
        <div>
          <dt>Audience</dt>
          <dd>{data.accessContext.audience}</dd>
        </div>
        <div>
          <dt>Cohort</dt>
          <dd>{data.accessContext.cohortLabel}</dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd>{data.accessContext.windowLabel}</dd>
        </div>
        <div>
          <dt>Generated</dt>
          <dd>{data.accessContext.generatedAtLabel}</dd>
        </div>
      </dl>
      {candidateDashboardGroups.map((group) => (
        <Fragment key={group}>
          <section
            aria-labelledby={`dashboard-${group.toLowerCase().replaceAll(" ", "-")}`}
            className="metric-section"
          >
            <div className="metric-section-heading">
              <p className="eyebrow">Governed metrics</p>
              <h2 id={`dashboard-${group.toLowerCase().replaceAll(" ", "-")}`}>
                {group}
              </h2>
            </div>
            {group === "Discovery coverage" ? (
              <dl
                aria-label="Discovery criteria context"
                className="search-coverage-context"
              >
                <div>
                  <dt>Approved criteria version</dt>
                  <dd>{data.searchCriteriaContext.criteriaVersionsLabel}</dd>
                </div>
                <div>
                  <dt>Search policy version</dt>
                  <dd>{data.searchCriteriaContext.policyVersionsLabel}</dd>
                </div>
                <div className="search-context-boundary">
                  <dt>Boundary</dt>
                  <dd>
                    Version identifiers only. Criteria contents, queries, and
                    candidate identities are not stored in this view.
                  </dd>
                </div>
              </dl>
            ) : null}
            {group === "Introduction outcomes" ? (
              <dl
                aria-label="Introduction workflow context"
                className="workflow-outcome-context"
              >
                <div>
                  <dt>Selection set version</dt>
                  <dd>
                    {data.workflowOutcomeContext.selectionSetVersionsLabel}
                  </dd>
                </div>
                <div>
                  <dt>Workflow policy version</dt>
                  <dd>{data.workflowOutcomeContext.policyVersionsLabel}</dd>
                </div>
                <div className="workflow-context-boundary">
                  <dt>Boundary</dt>
                  <dd>
                    Aggregate journey stages only. These measures do not score
                    candidates, predict relationship success, or replace
                    participant decisions.
                  </dd>
                </div>
              </dl>
            ) : null}
            <div className="metric-grid">
              {data.metrics
                .filter((metric) => metric.group === group)
                .map((metric) => (
                  <MetricCard key={metric.key} metric={metric} />
                ))}
            </div>
          </section>
          {group === "Intake operations" ? (
            <InterviewModeBreakdown data={data} />
          ) : null}
        </Fragment>
      ))}
      <p className="note">
        Missing sources remain unknown—not zero. This local view does not
        authenticate staff, read real candidate data, persist records, or
        replace human workflow review.
      </p>
    </div>
  );
}

function MetricCard({
  metric,
}: Readonly<{
  metric: CandidateDashboardPageData["metrics"][number];
}>) {
  return (
    <article className="metric-card">
      <div className="metric-card-heading">
        <div>
          <p className="eyebrow">{metric.label}</p>
          <strong>{metric.displayValue}</strong>
        </div>
        <span
          className={`metric-state metric-state-${metric.missingDataLabel.toLowerCase().replaceAll(" ", "-")}`}
        >
          {metric.missingDataLabel}
        </span>
      </div>
      <p>{metric.description}</p>
      <dl className="metric-lineage">
        <div>
          <dt>Calculation</dt>
          <dd>{metric.calculationLabel}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{metric.sourceLabel}</dd>
        </div>
        <div>
          <dt>Source as of</dt>
          <dd>{metric.sourceAsOfLabel}</dd>
        </div>
        <div>
          <dt>Freshness</dt>
          <dd>{metric.freshnessLabel}</dd>
        </div>
      </dl>
    </article>
  );
}

function InterviewModeBreakdown({
  data,
}: Readonly<{ data: CandidateDashboardPageData }>) {
  return (
    <section
      aria-labelledby="dashboard-interview-mode-breakdown"
      className="metric-section interview-mode-section"
    >
      <div className="metric-section-heading">
        <p className="eyebrow">Intake attribution</p>
        <h2 id="dashboard-interview-mode-breakdown">
          Interview mode breakdown
        </h2>
        <p>
          Operational counts only. These synthetic rows do not rank modes or
          establish that one interview experience performs better than another.
        </p>
      </div>
      <dl
        aria-label="Interview mode source context"
        className="interview-mode-source-context"
      >
        <div>
          <dt>Source</dt>
          <dd>{data.interviewModeSourceContext.sourceLabel}</dd>
        </div>
        <div>
          <dt>Source as of</dt>
          <dd>{data.interviewModeSourceContext.sourceAsOfLabel}</dd>
        </div>
        <div>
          <dt>Freshness</dt>
          <dd>{data.interviewModeSourceContext.freshnessLabel}</dd>
        </div>
      </dl>
      <div className="interview-mode-grid">
        {data.interviewModeBreakdown.map((breakdown) => (
          <article className="interview-mode-card" key={breakdown.mode}>
            <header>
              <p className="eyebrow">Attributed mode</p>
              <h3>{breakdown.label}</h3>
              {breakdown.attributionNote ? (
                <p>{breakdown.attributionNote}</p>
              ) : null}
            </header>
            <dl className="interview-mode-metrics">
              {breakdown.metrics.map((metric) => (
                <div key={metric.key}>
                  <dt>{metric.label}</dt>
                  <dd>
                    <strong>{metric.displayValue}</strong>
                    <span>{metric.calculationLabel}</span>
                    <span className="mode-metric-state">
                      {metric.missingDataLabel}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
      <p className="note">
        Mixed means a session switched modes. Unobserved means the source had no
        reliable mode evidence; neither category is guessed into another mode.
        Nonzero mode rows below {data.interviewModeMinimumCohortSize} starts are
        suppressed.
      </p>
    </section>
  );
}

function ApprovedFacts({
  data,
}: Readonly<{ data: CandidateInspectionPageData }>) {
  const [candidateId, setCandidateId] = useState("");
  const [freshness, setFreshness] = useState<
    CandidateApprovedFactFreshness | ""
  >("");
  const [topic, setTopic] = useState("");
  const inspection = filterCandidateInspection(data.inspection, {
    candidateId: candidateId || undefined,
    freshness: freshness || undefined,
    topic: topic || undefined,
  });
  const hiddenKnowledgeCount =
    inspection.fieldStateCounts.disputed +
    inspection.fieldStateCounts.private +
    inspection.fieldStateCounts.unknown;
  const activeFilterLabels = candidateInspectionFilterLabels(data, {
    candidateId: candidateId || undefined,
    freshness: freshness || undefined,
    topic: topic || undefined,
  });
  const filterStatus = candidateInspectionFilterStatus(
    inspection.matchingFactCount,
    activeFilterLabels,
  );

  return (
    <div className="view">
      <Intro
        eyebrow="Approved facts / synthetic inspection"
        title="Evidence first. Judgment stays human."
      >
        Filter a fictional, access-time projection of candidate-approved facts.
        This local concept has no authentication, real candidate access, or
        operational connection.
      </Intro>
      <aside className="inspection-boundary" role="note">
        <span aria-hidden="true">●</span>
        <div>
          <strong>Synthetic local inspection</strong>
          <p>
            Exact approved facts only. Raw interviews, compatibility scores,
            predictions, and automatic recommendations are unavailable.
          </p>
        </div>
      </aside>
      <section aria-labelledby="fact-filter-title" className="filter-panel">
        <div className="filter-heading">
          <div>
            <p className="eyebrow">Inspect the projection</p>
            <h2 id="fact-filter-title">Narrow the evidence</h2>
          </div>
          <button
            className="clear-filters"
            disabled={!candidateId && !freshness && !topic}
            onClick={() => {
              setCandidateId("");
              setFreshness("");
              setTopic("");
            }}
            type="button"
          >
            Clear filters
          </button>
        </div>
        <div className="fact-filters">
          <label>
            Candidate
            <select
              onChange={(event) => setCandidateId(event.target.value)}
              value={candidateId}
            >
              <option value="">All fictional candidates</option>
              {data.candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Topic
            <select
              onChange={(event) => setTopic(event.target.value)}
              value={topic}
            >
              <option value="">All topics</option>
              {data.topics.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Freshness
            <select
              onChange={(event) =>
                setFreshness(
                  event.target.value as CandidateApprovedFactFreshness | "",
                )
              }
              value={freshness}
            >
              <option value="">Any freshness</option>
              {data.freshnessOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      <section aria-label="Inspection summary" className="inspection-summary">
        <article>
          <span>{inspection.matchingFactCount}</span>
          <p>Matching approved facts</p>
          <small>Current filters</small>
        </article>
        <article>
          <span>{inspection.excludedFactCount}</span>
          <p>Assertions excluded at access time</p>
          <small>Full access-time projection</small>
        </article>
        <article>
          <span>{hiddenKnowledgeCount}</span>
          <p>Knowledge gaps in projection</p>
          <dl
            aria-label="Knowledge-state breakdown"
            className="knowledge-state-breakdown"
          >
            <div>
              <dt>Unknown</dt>
              <dd>{inspection.fieldStateCounts.unknown}</dd>
            </div>
            <div>
              <dt>Disputed</dt>
              <dd>{inspection.fieldStateCounts.disputed}</dd>
            </div>
            <div>
              <dt>Private</dt>
              <dd>{inspection.fieldStateCounts.private}</dd>
            </div>
          </dl>
          <small>Full access-time projection</small>
        </article>
      </section>
      <p aria-atomic="true" className="visually-hidden" role="status">
        {filterStatus}
      </p>
      <section className="fact-results">
        <div className="results-heading">
          <div>
            <p className="eyebrow">Reviewable evidence</p>
            <h2>
              {inspection.matchingFactCount === 1
                ? "1 approved fact"
                : `${inspection.matchingFactCount} approved facts`}
            </h2>
          </div>
          <dl aria-label="Inspection access context" className="access-context">
            <div>
              <dt>Access role</dt>
              <dd>{inspectionAccessLabels.role[inspection.sourceRole]}</dd>
            </div>
            <div>
              <dt>Purpose</dt>
              <dd>
                {inspectionAccessLabels.purpose[inspection.sourcePurpose]}
              </dd>
            </div>
            <div>
              <dt>Evaluated</dt>
              <dd>{formatUtc(inspection.inspectedAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="active-filter-context">
          <p className="eyebrow">Current evidence filters</p>
          <ul aria-label="Active evidence filters">
            {activeFilterLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
        {inspection.facts.length === 0 ? (
          <div className="empty-facts">
            <p className="eyebrow">No approved evidence</p>
            <h2>No facts match these filters.</h2>
            <p>
              Broaden the filters or ask the candidate directly. The workspace
              will not infer or manufacture an answer.
            </p>
          </div>
        ) : (
          <div className="fact-list">
            {inspection.facts.map((fact) => (
              <article className="fact-card" key={fact.factId}>
                <div className="fact-card-heading">
                  <div>
                    <p className="eyebrow">
                      {candidateLabel(data.candidates, fact.candidateId)}
                    </p>
                    <h2>{fact.fieldLabel}</h2>
                  </div>
                  <span className={`freshness freshness-${fact.freshness}`}>
                    {fact.freshness === "expires-soon"
                      ? "Expires soon"
                      : "Current"}
                  </span>
                </div>
                <p className="fact-value">{fact.value}</p>
                <dl className="fact-lineage">
                  <div>
                    <dt>Source</dt>
                    <dd>
                      Source exact · {fact.provenance.questionId} · revision{" "}
                      {fact.provenance.responseRevision}
                    </dd>
                  </div>
                  <div>
                    <dt>Guide</dt>
                    <dd>{fact.provenance.guideVersion}</dd>
                  </div>
                  <div>
                    <dt>Human review</dt>
                    <dd>{formatUtc(fact.provenance.reviewedAt)}</dd>
                  </div>
                  <div>
                    <dt>Consent</dt>
                    <dd>{fact.permission.consentGrantId}</dd>
                  </div>
                  <div>
                    <dt>Fresh until</dt>
                    <dd>{formatUtc(fact.permission.freshUntil)}</dd>
                  </div>
                  <div>
                    <dt>Retain until</dt>
                    <dd>{formatUtc(fact.permission.retainUntil)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatUtc(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function DiscoveryMap({
  onSelect,
  selected,
  selectedId,
}: Readonly<{
  onSelect: (id: string) => void;
  selected: (typeof discoveryCandidates)[number];
  selectedId: string;
}>) {
  return (
    <div className="view">
      <Intro
        eyebrow="Candidate discovery / synthetic map"
        title="Explore context. Keep judgment human."
      >
        This map is a private way to orient to fictional records around one
        fictional client engagement. It is not a score, a prediction, or a
        recommendation.
      </Intro>
      <section
        aria-label="Synthetic candidate discovery map"
        className="map-panel"
      >
        <div className="map-canvas">
          <div className="map-client" role="note">
            <p className="eyebrow">Fictional client engagement</p>
            <strong>Sol Ardent</strong>
            <span>Review context only</span>
          </div>
          {discoveryCandidates.map((candidate) => (
            <button
              aria-pressed={selectedId === candidate.id}
              className={`map-node map-node-${candidate.mapPosition}`}
              key={candidate.id}
              onClick={() => onSelect(candidate.id)}
              type="button"
            >
              <span className="initials">{candidate.initials}</span>
              <span>
                <strong>{candidate.name}</strong>
                <small>{candidate.shortlistState}</small>
              </span>
            </button>
          ))}
        </div>
        <p className="note">
          The arrangement is only a visual grouping for a small fictional set.
          Nearness does not mean a better fit, and the map never decides who is
          appropriate to shortlist or introduce.
        </p>
      </section>
      <section
        aria-label="Selected candidate evidence"
        className="discovery-briefing"
      >
        <div className="discovery-heading">
          <div>
            <p className="eyebrow">Selected fictional candidate</p>
            <h2>{selected.name}</h2>
            <p>{selected.detail}</p>
          </div>
          <span className="shortlist-state">{selected.shortlistState}</span>
        </div>
        <div className="signal-grid">
          <SignalList
            heading="From client criteria"
            signals={selected.clientSignals}
          />
          <SignalList
            heading="From candidate criteria"
            signals={selected.reverseSignals}
          />
        </div>
        <aside className="human-context">
          <p className="eyebrow">Matchmaker context</p>
          <p>{selected.humanContext}</p>
          <p className="note">
            A matchmaker decides whether to clarify information, curate a
            shortlist, or seek separate permission for an introduction.
          </p>
        </aside>
      </section>
    </div>
  );
}

function SignalList({
  heading,
  signals,
}: Readonly<{ heading: string; signals: readonly DiscoverySignal[] }>) {
  return (
    <section className="signal-list">
      <p className="eyebrow">{heading}</p>
      <ul>
        {signals.map((signal) => (
          <li key={signal.label}>
            <span
              className={`signal-state signal-${signal.state.toLowerCase().replaceAll(" ", "-")}`}
            >
              {signal.state}
            </span>
            <strong>{signal.label}</strong>
            <small>{signal.evidence}</small>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NavButton({
  active,
  children,
  onClick,
}: Readonly<{ active: boolean; children: string; onClick: () => void }>) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      className="nav-button"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function Intro({
  eyebrow,
  title,
  children,
}: Readonly<{ eyebrow: string; title: string; children: ReactNode }>) {
  return (
    <section className="intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <p>{children}</p>
    </section>
  );
}

function Overview() {
  return (
    <div className="view">
      <Intro
        eyebrow="Owner overview / local concept"
        title="A calm place to begin the work."
      >
        A future owner workspace should make its boundaries visible: what is
        ready to review, what still needs a human decision, and what is not
        connected yet.
      </Intro>
      <section aria-label="Concept readiness" className="readiness-grid">
        {readiness.map(([label, value, detail]) => (
          <article className="card" key={label}>
            <p className="eyebrow">{label}</p>
            <strong>{value}</strong>
            <p>{detail}</p>
          </article>
        ))}
      </section>
      <section className="boundary">
        <p className="eyebrow">This is intentionally incomplete</p>
        <h2>No live work can happen here.</h2>
        <p>
          There are no accounts, invitations, applications, prices, payments,
          notifications, or permissions behind these screens. They are a
          product-review aid, not an operational tool.
        </p>
      </section>
    </div>
  );
}

function Campaigns() {
  return (
    <div className="view">
      <Intro
        eyebrow="Campaigns / local concept"
        title="Controlled campaigns, clearly bounded."
      >
        Santa Barbara County is a first test ground for this concept, not a
        permanent service boundary or a live recruitment campaign.
      </Intro>
      <article className="campaign-card">
        <div>
          <p className="eyebrow">Concept review only</p>
          <h2>First controlled campaign</h2>
          <p>Adults exploring a high-touch, human-led introduction service.</p>
        </div>
        <dl>
          <div>
            <dt>Test ground</dt>
            <dd>Santa Barbara County</dd>
          </div>
          <div>
            <dt>Invite codes</dt>
            <dd>Not generated or connected</dd>
          </div>
          <div>
            <dt>Geofence</dt>
            <dd>Not configured or enforced</dd>
          </div>
        </dl>
        <p className="note">
          Santa Barbara County is Argent&apos;s first test ground, not a
          boundary on who Argent may serve.
        </p>
      </article>
    </div>
  );
}

function Review({
  onSelect,
  selected,
  selectedId,
}: Readonly<{
  onSelect: (id: string) => void;
  selected: (typeof applicants)[number];
  selectedId: string;
}>) {
  return (
    <div className="view">
      <Intro
        eyebrow="Operational view / synthetic examples"
        title="Review with judgment, not a score."
      >
        The workspace is a concept for how a matchmaker might orient to a queue.
        It does not decide who belongs, who matches, or what happens next.
      </Intro>
      <div className="review-grid">
        <section className="panel">
          <div className="panel-title">
            <div>
              <p className="eyebrow">Review queue</p>
              <h2>Three fictional records</h2>
            </div>
            <span>03</span>
          </div>
          <div className="queue">
            {applicants.map((applicant) => (
              <button
                aria-pressed={selectedId === applicant.id}
                className={selectedId === applicant.id ? "selected" : ""}
                key={applicant.id}
                onClick={() => onSelect(applicant.id)}
                type="button"
              >
                <span className="initials">{applicant.initials}</span>
                <span>
                  <strong>{applicant.name}</strong>
                  <small>{applicant.detail}</small>
                </span>
                <span className="state">{applicant.state}</span>
              </button>
            ))}
          </div>
        </section>
        <aside className="panel">
          <p className="eyebrow">Human review briefing</p>
          <h2>{selected.name}</h2>
          <dl>
            <div>
              <dt>Current state</dt>
              <dd>{selected.state}</dd>
            </div>
            <div>
              <dt>What is known</dt>
              <dd>
                Only source-grounded information, if a person has approved it.
              </dd>
            </div>
            <div>
              <dt>Next decision</dt>
              <dd>A matchmaker decides whether more information is needed.</dd>
            </div>
          </dl>
          <p className="note">
            No compatibility score. No automatic recommendation. No introduction
            without separate permission.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Operations() {
  return (
    <div className="view">
      <Intro
        eyebrow="Operations / local concept"
        title="Make readiness visible before control."
      >
        This is where Jenny would eventually manage operational systems. In the
        concept, each system states its disconnected state plainly.
      </Intro>
      <section
        aria-label="Disconnected operational systems"
        className="operations"
      >
        {operations.map(([title, detail], index) => (
          <article key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{title}</h2>
              <p>{detail}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
