"use client";

import { useState, type ReactNode } from "react";

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
  "campaigns" | "discovery" | "overview" | "operations" | "review";

export default function AdminHome() {
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
        {view === "campaigns" ? <Campaigns /> : null}
        {view === "operations" ? <Operations /> : null}
      </section>
    </main>
  );
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
