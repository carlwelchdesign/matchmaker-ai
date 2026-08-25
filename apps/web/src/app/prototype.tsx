"use client";

import { useState } from "react";

import { prototypeCampaign, prototypeGuardrails } from "./prototype-data";
import { AdaptiveInterview } from "./prototype/interview/adaptive-interview";

type PrototypeView = "application" | "campaign";
type IntakeMode = "conversation" | "hybrid" | "structured";

const steps = ["Your approach", "What matters", "Review"] as const;

export function ConceptPrototype({
  interviewEnabled = false,
}: Readonly<{ interviewEnabled?: boolean }>) {
  const [applicationStep, setApplicationStep] = useState(0);
  const [view, setView] = useState<PrototypeView>("campaign");

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
        </nav>
      </header>

      <section className="prototype-content" id="prototype-content">
        {view === "campaign" ? (
          <Campaign onExplore={() => setView("application")} />
        ) : null}
        {view === "application" ? (
          <Application
            interviewEnabled={interviewEnabled}
            onStepChange={setApplicationStep}
            step={applicationStep}
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
  interviewEnabled,
  onStepChange,
  step,
}: Readonly<{
  onStepChange: (step: number) => void;
  step: number;
  interviewEnabled: boolean;
}>) {
  const [mode, setMode] = useState<IntakeMode>("structured");
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
                  active={mode === "structured"}
                  title="Structured"
                  detail="A concise, guided set of questions."
                  onSelect={() => setMode("structured")}
                />
                <Choice
                  active={mode === "conversation"}
                  title="Conversation"
                  detail="A paced text interview with review before anything is used."
                  onSelect={() => setMode("conversation")}
                />
                <Choice
                  active={mode === "hybrid"}
                  title="Hybrid"
                  detail="A paced combination of both approaches."
                  onSelect={() => setMode("hybrid")}
                />
              </div>
              <p className="mode-boundary">
                This local concept does not record audio, create a transcript,
                or collect information. Voice remains research-gated; typed and
                human-assisted paths remain available.
              </p>
            </>
          ) : null}
          {step === 1 ? (
            <IntakePreview interviewEnabled={interviewEnabled} mode={mode} />
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
                onClick={() => onStepChange(0)}
                type="button"
              >
                Restart preview <span aria-hidden="true">↺</span>
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
  active,
  detail,
  onSelect,
  title,
}: Readonly<{
  active: boolean;
  detail: string;
  onSelect: () => void;
  title: string;
}>) {
  return (
    <button
      aria-pressed={active}
      className="choice-card"
      onClick={onSelect}
      type="button"
    >
      <h3>{title}</h3>
      <p>{detail}</p>
    </button>
  );
}

function IntakePreview({
  interviewEnabled,
  mode,
}: Readonly<{ interviewEnabled: boolean; mode: IntakeMode }>) {
  const [approvedField, setApprovedField] = useState<
    "approved" | "not-approved" | null
  >(null);
  const isConversation = mode === "conversation";
  const isHybrid = mode === "hybrid";

  if (interviewEnabled && (isConversation || isHybrid)) {
    return (
      <AdaptiveInterview
        initialMode={isConversation ? "conversation" : "guided"}
      />
    );
  }

  return (
    <>
      <p className="detail-label">
        {isConversation ? "Conversation" : isHybrid ? "Hybrid" : "What matters"}
      </p>
      <h2>
        {isConversation
          ? "A calm question, answered in your own words."
          : isHybrid
            ? "A guided core, with room for your own words."
            : "Your application should make room for nuance."}
      </h2>
      <p className="panel-copy">
        {isConversation
          ? "A future text conversation uses bounded questions and lets you pause, switch modes, correct the text, or ask for human assistance."
          : isHybrid
            ? "A future hybrid path keeps required fields comparable while using short prompts for the context that matters to you."
            : "A future application would let you describe intentions, practical preferences, and boundaries in your own words—with clear review and correction before anything is considered."}
      </p>
      <div className="sample-response" aria-label="Illustrative response state">
        <span>Illustrative only · nothing is saved</span>
        {isConversation ? (
          <>
            <p className="conversation-prompt">
              Argent: What would make an introduction feel considered and
              worthwhile to you?
            </p>
            <p>
              You: “I want the process to feel intentional, candid, and
              unhurried.”
            </p>
            <p className="transcript-note">
              Future flow: review or edit the transcript, then approve each
              proposed profile field separately.
            </p>
            <div className="field-proposal" aria-label="Sample field approval">
              <p className="detail-label">Proposed profile field</p>
              <strong>
                Preferred introduction pace: intentional and unhurried
              </strong>
              <p>
                Derived only from the fictional excerpt above. This proposal is
                not saved in the local concept.
              </p>
              <div className="field-actions">
                <button
                  aria-pressed={approvedField === "approved"}
                  className="secondary-button"
                  onClick={() => setApprovedField("approved")}
                  type="button"
                >
                  Approve sample field
                </button>
                <button
                  aria-pressed={approvedField === "not-approved"}
                  className="secondary-button"
                  onClick={() => setApprovedField("not-approved")}
                  type="button"
                >
                  Leave it out
                </button>
              </div>
              {approvedField ? (
                <p className="approval-status" role="status">
                  {approvedField === "approved"
                    ? "Sample field approved locally. Nothing is saved or shared."
                    : "Sample field left out locally. Nothing is saved or shared."}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <p>
            “I want the process to feel intentional, candid, and unhurried.”
          </p>
        )}
      </div>
    </>
  );
}
