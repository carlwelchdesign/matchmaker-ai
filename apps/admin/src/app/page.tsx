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

type AdminView = "campaigns" | "overview" | "operations" | "review";

export default function AdminHome() {
  const [view, setView] = useState<AdminView>("overview");
  const [selectedId, setSelectedId] = useState<string>(applicants[0].id);
  const selected =
    applicants.find((applicant) => applicant.id === selectedId) ??
    applicants[0];

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
        {view === "campaigns" ? <Campaigns /> : null}
        {view === "operations" ? <Operations /> : null}
      </section>
    </main>
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
