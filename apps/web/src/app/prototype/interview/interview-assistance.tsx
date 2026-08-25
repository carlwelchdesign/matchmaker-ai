"use client";

import { useMemo, useState } from "react";

import type { InterviewQuestion } from "./interview-guide";
import {
  transitionInterviewAssistance,
  type InterviewAssistanceAction,
  type InterviewAssistanceState,
} from "./interview-assistance-state";
import {
  createHumanAssistanceRequestPreview,
  stageHumanAssistanceRequestLocally,
  type LocallyStagedHumanAssistanceRequest,
} from "./interview-human-assistance";

export function InterviewAssistance({
  onChooseApproach,
  onContinueWithoutInterview,
  onUseStructuredFallback,
  question,
}: Readonly<{
  onChooseApproach: () => void;
  onContinueWithoutInterview: () => void;
  onUseStructuredFallback?: () => void;
  question?: Pick<InterviewQuestion, "fieldLabel" | "id" | "purpose" | "topic">;
}>) {
  const [view, setView] = useState<InterviewAssistanceState>("closed");
  const [stagedRequest, setStagedRequest] =
    useState<LocallyStagedHumanAssistanceRequest | null>(null);
  const requestPreview = useMemo(
    () => createHumanAssistanceRequestPreview(question),
    [question],
  );
  const isOpen = view !== "closed";

  function transition(action: InterviewAssistanceAction) {
    setView((current) => transitionInterviewAssistance(current, action));
  }

  function stageRequest() {
    setStagedRequest(stageHumanAssistanceRequestLocally(requestPreview));
    transition("stage-human-request");
  }

  return (
    <div className="interview-assistance-control">
      <button
        aria-controls="interview-assistance-panel"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close interview help" : "Open interview help"}
        className="interview-help-trigger"
        onClick={() => transition("open")}
        type="button"
      >
        {isOpen ? "Close help" : "Need help?"}
      </button>

      {isOpen ? (
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
                onClick={() => transition("show-clarification")}
                type="button"
              >
                Clarify the question
              </button>
              <button
                className="secondary-button"
                onClick={() => transition("show-privacy")}
                type="button"
              >
                Review what to leave out
              </button>
              <button
                className="secondary-button"
                onClick={() => transition("show-human-overview")}
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
              <AssistanceBack onClick={() => transition("back-to-menu")} />
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
              <AssistanceBack onClick={() => transition("back-to-menu")} />
            </div>
          ) : null}

          {view === "human-overview" ? (
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
                  onClick={() => transition("preview-human-request")}
                  type="button"
                >
                  Preview a help request
                </button>
                <button
                  className="secondary-button"
                  onClick={() => transition("keep-answering")}
                  type="button"
                >
                  Keep answering here
                </button>
                {onUseStructuredFallback ? (
                  <button
                    className="secondary-button"
                    onClick={onUseStructuredFallback}
                    type="button"
                  >
                    Use structured questions
                  </button>
                ) : (
                  <button
                    className="secondary-button"
                    onClick={onChooseApproach}
                    type="button"
                  >
                    Choose another approach
                  </button>
                )}
                <button
                  className="text-button"
                  onClick={onContinueWithoutInterview}
                  type="button"
                >
                  Continue without interview
                </button>
              </div>
              <AssistanceBack onClick={() => transition("back-to-menu")} />
            </div>
          ) : null}

          {view === "human-preview" ? (
            <div className="interview-assistance-copy">
              <p>
                <strong>Would share:</strong> a request for interview help and
                {requestPreview.context.kind === "current-topic"
                  ? ` the current topic, ${requestPreview.context.fieldLabel}.`
                  : " that you are using the structured guide."}
              </p>
              <p>
                <strong>Would not share:</strong> your draft response, prior
                answers, or proposed profile fields. Nothing is sent from this
                preview.
              </p>
              <div className="interview-assistance-actions">
                <button
                  className="secondary-button"
                  onClick={stageRequest}
                  type="button"
                >
                  Stage request locally
                </button>
                <button
                  className="text-button"
                  onClick={() => transition("show-human-overview")}
                  type="button"
                >
                  Back to human-help options
                </button>
              </div>
            </div>
          ) : null}

          {view === "human-staged" ? (
            <div className="interview-assistance-copy">
              <p role="status">
                <strong>Local request staged.</strong> Nobody was contacted and
                no answer was sent. A live service would still require your
                permission at the final send step.
              </p>
              {stagedRequest ? (
                <p className="detail-label">
                  {stagedRequest.contractVersion} ·{" "}
                  {stagedRequest.delivery.mode}
                  {stagedRequest.context.kind === "current-topic"
                    ? ` · ${stagedRequest.context.fieldLabel}`
                    : " · structured guide"}
                </p>
              ) : null}
              <div className="interview-assistance-actions">
                <button
                  className="secondary-button"
                  onClick={() => transition("keep-answering")}
                  type="button"
                >
                  Keep answering here
                </button>
                {onUseStructuredFallback ? (
                  <button
                    className="secondary-button"
                    onClick={onUseStructuredFallback}
                    type="button"
                  >
                    Use structured questions
                  </button>
                ) : null}
              </div>
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

function helpTitle(
  view: Exclude<InterviewAssistanceState, "closed" | "menu">,
): string {
  if (view === "clarification") return "A simpler way to read this question.";
  if (view === "privacy") return "Share less, not more.";
  if (view === "human-preview")
    return "Review the request before anything moves.";
  if (view === "human-staged") return "The request remains on this device.";
  return "A person should always be an option.";
}
