"use client";

import { useState } from "react";

import type { InterviewQuestion } from "./interview-guide";

type AssistanceView = "clarification" | "human" | "menu" | "privacy";

export function InterviewAssistance({
  onChooseApproach,
  onContinueWithoutInterview,
  question,
}: Readonly<{
  onChooseApproach: () => void;
  onContinueWithoutInterview: () => void;
  question?: Pick<InterviewQuestion, "fieldLabel" | "purpose">;
}>) {
  const [view, setView] = useState<AssistanceView | null>(null);

  return (
    <div className="interview-assistance-control">
      <button
        aria-controls="interview-assistance-panel"
        aria-expanded={Boolean(view)}
        aria-label={view ? "Close interview help" : "Open interview help"}
        className="interview-help-trigger"
        onClick={() => setView((current) => (current ? null : "menu"))}
        type="button"
      >
        {view ? "Close help" : "Need help?"}
      </button>

      {view ? (
        <aside
          aria-labelledby="interview-assistance-title"
          className="interview-assistance"
          id="interview-assistance-panel"
        >
          <div className="interview-assistance-heading">
            <div>
              <p className="detail-label">Interview help</p>
              <h3 id="interview-assistance-title">
                {view === "menu"
                  ? "What would make this easier?"
                  : helpTitle(view)}
              </h3>
            </div>
          </div>

          {view === "menu" ? (
            <div className="interview-assistance-options">
              <button
                className="secondary-button"
                onClick={() => setView("clarification")}
                type="button"
              >
                Clarify the question
              </button>
              <button
                className="secondary-button"
                onClick={() => setView("privacy")}
                type="button"
              >
                Review what to leave out
              </button>
              <button
                className="secondary-button"
                onClick={() => setView("human")}
                type="button"
              >
                How human help would work
              </button>
            </div>
          ) : null}

          {view === "clarification" ? (
            <div className="interview-assistance-copy">
              <p>
                {question
                  ? `${question.fieldLabel} is optional. ${question.purpose}`
                  : "Every structured question is optional and exists to give a matchmaker context in your own words."}
              </p>
              <p>
                You do not need to sound polished or share a complete history.
                Add only what you would want considered, or choose Prefer not to
                answer.
              </p>
              <AssistanceBack onClick={() => setView("menu")} />
            </div>
          ) : null}

          {view === "privacy" ? (
            <div className="interview-assistance-copy">
              <p>
                Leave out names, addresses, financial details, health
                information, and private information about another person. You
                can decline any question and review every source response before
                it is considered.
              </p>
              <p>
                This local preview does not save, submit, or send what you type.
              </p>
              <AssistanceBack onClick={() => setView("menu")} />
            </div>
          ) : null}

          {view === "human" ? (
            <div className="interview-assistance-copy">
              <p>
                Human handoff is not active in this local preview. Nobody has
                been contacted, and none of your answers have been sent.
              </p>
              <p>
                A live assisted path would pause first, explain what context a
                staff member could see, and ask your permission before sending a
                request.
              </p>
              <div className="interview-assistance-actions">
                <button
                  className="secondary-button"
                  onClick={() => setView(null)}
                  type="button"
                >
                  Keep answering here
                </button>
                <button
                  className="secondary-button"
                  onClick={onChooseApproach}
                  type="button"
                >
                  Choose another approach
                </button>
                <button
                  className="text-button"
                  onClick={onContinueWithoutInterview}
                  type="button"
                >
                  Continue without interview
                </button>
              </div>
              <AssistanceBack onClick={() => setView("menu")} />
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}

function AssistanceBack({ onClick }: Readonly<{ onClick: () => void }>) {
  return (
    <button className="text-button" onClick={onClick} type="button">
      Back to help choices
    </button>
  );
}

function helpTitle(view: Exclude<AssistanceView, "menu">): string {
  if (view === "clarification") return "A simpler way to read this question.";
  if (view === "privacy") return "Share less, not more.";
  return "A person should always be an option.";
}
