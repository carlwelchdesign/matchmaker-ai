"use client";

import { useState } from "react";

import {
  prototypeApplicants,
  prototypeCampaign,
  prototypeGuardrails,
} from "./prototype-data";

type PrototypeView = "application" | "campaign" | "matchmaker";

const steps = ["Your approach", "What matters", "Review"] as const;

export function ConceptPrototype() {
  const [applicationStep, setApplicationStep] = useState(0);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>(
    prototypeApplicants[0].id,
  );
  const [view, setView] = useState<PrototypeView>("campaign");

  const selectedApplicant =
    prototypeApplicants.find(
      (applicant) => applicant.id === selectedApplicantId,
    ) ?? prototypeApplicants[0];

  return (
    <main className="prototype-shell">
      <a className="skip-link" href="#prototype-content">
        Skip to prototype content
      </a>
      <header className="prototype-header">
        <a className="wordmark" href="#prototype-content">
          ARGENT
        </a>
        <p className="prototype-notice" role="status">
          Concept prototype · fictional data · nothing is submitted
        </p>
        <nav aria-label="Prototype views" className="prototype-nav">
          <ViewButton
            active={view === "campaign"}
            onClick={() => setView("campaign")}
          >
            Campaign
          </ViewButton>
          <ViewButton
            active={view === "application"}
            onClick={() => setView("application")}
          >
            Application
          </ViewButton>
          <ViewButton
            active={view === "matchmaker"}
            onClick={() => setView("matchmaker")}
          >
            Matchmaker
          </ViewButton>
        </nav>
      </header>

      <section className="prototype-content" id="prototype-content">
        {view === "campaign" ? (
          <Campaign onExplore={() => setView("application")} />
        ) : null}
        {view === "application" ? (
          <Application
            onExploreWorkspace={() => setView("matchmaker")}
            onStepChange={setApplicationStep}
            step={applicationStep}
          />
        ) : null}
        {view === "matchmaker" ? (
          <Matchmaker
            onSelect={setSelectedApplicantId}
            selectedApplicant={selectedApplicant}
            selectedApplicantId={selectedApplicantId}
          />
        ) : null}
      </section>
    </main>
  );
}

function ViewButton({
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

function Campaign({ onExplore }: Readonly<{ onExplore: () => void }>) {
  return (
    <div className="campaign-view">
      <section className="campaign-hero" aria-labelledby="campaign-title">
        <p className="eyebrow">{prototypeCampaign.status}</p>
        <h1 id="campaign-title">A more considered way to begin.</h1>
        <p className="hero-copy">
          Argent is designing a human-led service for people who value
          discretion, clarity, and a genuinely personal introduction process.
        </p>
        <button className="action-button" onClick={onExplore} type="button">
          Explore the application preview <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section className="campaign-brief" aria-label="Campaign brief">
        <p className="eyebrow">01 / First campaign</p>
        <div className="brief-grid">
          <div>
            <p className="detail-label">Test ground</p>
            <p className="detail-value">{prototypeCampaign.location}</p>
          </div>
          <div>
            <p className="detail-label">Approach</p>
            <p className="detail-value">Human review, then a conversation</p>
          </div>
          <div>
            <p className="detail-label">Status</p>
            <p className="detail-value">No live applications</p>
          </div>
        </div>
        <p className="boundary-note">{prototypeCampaign.regionBoundary}</p>
      </section>

      <section className="guardrail-list" aria-label="Prototype guardrails">
        {prototypeGuardrails.map((guardrail, index) => (
          <p key={guardrail}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {guardrail}
          </p>
        ))}
      </section>
    </div>
  );
}

function Application({
  onExploreWorkspace,
  onStepChange,
  step,
}: Readonly<{
  onExploreWorkspace: () => void;
  onStepChange: (step: number) => void;
  step: number;
}>) {
  const isReview = step === steps.length - 1;

  return (
    <div className="application-view">
      <section
        className="application-intro"
        aria-labelledby="application-title"
      >
        <p className="eyebrow">Application preview / no submission</p>
        <h1 id="application-title">A short, considered starting point.</h1>
        <p>
          This demonstrates the pace and explanation of an application. It does
          not ask for or retain personal information.
        </p>
      </section>

      <div className="application-layout">
        <ol aria-label="Application preview steps" className="step-list">
          {steps.map((label, index) => (
            <li className={index === step ? "is-current" : ""} key={label}>
              <button onClick={() => onStepChange(index)} type="button">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {label}
              </button>
            </li>
          ))}
        </ol>

        <section className="application-panel" aria-live="polite">
          {step === 0 ? (
            <>
              <p className="detail-label">Your approach</p>
              <h2>Choose the way you would prefer to begin.</h2>
              <div className="choice-grid">
                <Choice
                  title="Structured"
                  detail="A concise, guided set of questions."
                />
                <Choice
                  title="Conversation"
                  detail="A future optional path; not enabled here."
                />
                <Choice
                  title="Hybrid"
                  detail="A paced combination of both approaches."
                />
              </div>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <p className="detail-label">What matters</p>
              <h2>Your application should make room for nuance.</h2>
              <p className="panel-copy">
                A future application would let you describe intentions,
                practical preferences, and boundaries in your own words—with
                clear review and correction before anything is considered.
              </p>
              <div
                className="sample-response"
                aria-label="Illustrative response state"
              >
                <span>Illustrative only</span>
                <p>
                  “I want the process to feel intentional, candid, and
                  unhurried.”
                </p>
              </div>
            </>
          ) : null}
          {isReview ? (
            <>
              <p className="detail-label">Review</p>
              <h2>Nothing leaves this device.</h2>
              <p className="panel-copy">
                In a live product, review would precede submission and make
                clear what is shared, who sees it, and how a person can correct
                or withdraw it. This prototype has no form submission or
                storage.
              </p>
              <div className="status-sample">
                <span>Sample status</span>
                <strong>Received for human review</strong>
                <p>Not an admission decision or promise of an introduction.</p>
              </div>
            </>
          ) : null}

          <div className="panel-actions">
            <button
              className="secondary-button"
              disabled={step === 0}
              onClick={() => onStepChange(Math.max(0, step - 1))}
              type="button"
            >
              Back
            </button>
            {isReview ? (
              <button
                className="action-button"
                onClick={onExploreWorkspace}
                type="button"
              >
                View matchmaker workspace <span aria-hidden="true">↗</span>
              </button>
            ) : (
              <button
                className="action-button"
                onClick={() => onStepChange(step + 1)}
                type="button"
              >
                Continue <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Choice({
  detail,
  title,
}: Readonly<{ detail: string; title: string }>) {
  return (
    <article className="choice-card">
      <h3>{title}</h3>
      <p>{detail}</p>
    </article>
  );
}

function Matchmaker({
  onSelect,
  selectedApplicant,
  selectedApplicantId,
}: Readonly<{
  onSelect: (id: string) => void;
  selectedApplicant: (typeof prototypeApplicants)[number];
  selectedApplicantId: string;
}>) {
  return (
    <div className="workspace-view">
      <section className="workspace-heading" aria-labelledby="workspace-title">
        <div>
          <p className="eyebrow">Operational view / synthetic examples</p>
          <h1 id="workspace-title">Review with judgment, not a score.</h1>
        </div>
        <p>
          The workspace is a concept for how a matchmaker might orient to a
          queue. It does not decide who belongs, who matches, or what happens
          next.
        </p>
      </section>

      <div className="workspace-grid">
        <section className="queue-panel" aria-labelledby="queue-title">
          <div className="panel-heading">
            <div>
              <p className="detail-label">Review queue</p>
              <h2 id="queue-title">Three fictional records</h2>
            </div>
            <span className="count-badge">03</span>
          </div>
          <div className="queue-list">
            {prototypeApplicants.map((applicant) => (
              <button
                aria-pressed={selectedApplicantId === applicant.id}
                className={`queue-item ${selectedApplicantId === applicant.id ? "is-selected" : ""}`}
                key={applicant.id}
                onClick={() => onSelect(applicant.id)}
                type="button"
              >
                <span className="initials" aria-hidden="true">
                  {applicant.initials}
                </span>
                <span>
                  <strong>{applicant.name}</strong>
                  <small>{applicant.detail}</small>
                </span>
                <span className="queue-state">{applicant.state}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="briefing-panel" aria-labelledby="briefing-title">
          <p className="detail-label">Human review briefing</p>
          <h2 id="briefing-title">{selectedApplicant.name}</h2>
          <dl>
            <div>
              <dt>Current state</dt>
              <dd>{selectedApplicant.state}</dd>
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
          <p className="workspace-note">
            No compatibility score. No automatic recommendation. No introduction
            without separate permission.
          </p>
        </aside>
      </div>
    </div>
  );
}
