"use client";

import {
  buildCandidateInterviewReview,
  type CandidateFieldDisposition,
} from "@argent/domain";
import { useMemo, useState } from "react";

import {
  getInterviewQuestionCount,
  interviewGuideVersion,
  type InterviewAnswer,
  type InterviewMode,
} from "./interview-guide";
import { localInterviewBudgetPolicy } from "./interview-budget-policy";
import {
  createPolicyCompliantFieldProposal,
  getPolicyCompliantInterviewQuestion,
} from "./interview-output-policy";
import { InterviewAssistance } from "./interview-assistance";
import {
  createInterviewFallbackTransfer,
  createInterviewProgressSnapshot,
  type InterviewFallbackTransfer,
  type InterviewProgressSnapshot,
} from "./structured-interview-state";
import {
  proposeInterviewQuestion,
  proposeInterviewQuestionWithinBudget,
  reopenInterviewQuestionWithinBudget,
  settleInterviewQuestion,
  type InterviewQuestionDisposition,
  type InterviewQuestionRecord,
} from "./interview-question-record";

type FieldDisposition = Exclude<CandidateFieldDisposition, "declined">;

const dispositionLabels: Record<CandidateFieldDisposition, string> = {
  approved: "Approved for consideration",
  declined: "Question declined",
  private: "Kept private",
  rejected: "Rejected",
};

const localUsageSessionId = "local-interview-preview";

function createInitialQuestionRecords(
  mode: InterviewMode,
  proposedAt: string,
): InterviewQuestionRecord[] {
  const question = getPolicyCompliantInterviewQuestion(0, []);
  if (!question) throw new Error("The interview guide has no first question");
  return proposeInterviewQuestion([], question, {
    mode,
    proposedAt,
    sessionId: localUsageSessionId,
  });
}

export function AdaptiveInterview({
  initialMode,
  onProgressChange,
  onChooseApproach,
  onContinueToReview,
  onContinueWithoutInterview,
  onUseStructuredFallback,
}: Readonly<{
  initialMode: InterviewMode;
  onProgressChange: (progress: InterviewProgressSnapshot) => void;
  onChooseApproach: () => void;
  onContinueToReview: () => void;
  onContinueWithoutInterview: () => void;
  onUseStructuredFallback: (transfer: InterviewFallbackTransfer) => void;
}>) {
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [completed, setCompleted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dispositions, setDispositions] = useState<
    Record<string, FieldDisposition>
  >({});
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<InterviewMode>(initialMode);
  const [paused, setPaused] = useState(false);
  const [sessionStartedAt, setSessionStartedAt] = useState(() =>
    new Date().toISOString(),
  );
  const [questionRecords, setQuestionRecords] = useState<
    InterviewQuestionRecord[]
  >(() => createInitialQuestionRecords(initialMode, sessionStartedAt));
  const [reviewing, setReviewing] = useState(false);

  const questionCount = getInterviewQuestionCount();
  const currentQuestionRecord = questionRecords.at(-1);
  const currentQuestion =
    currentQuestionRecord?.disposition === "proposed"
      ? currentQuestionRecord.question
      : null;
  const proposals = useMemo(
    () =>
      answers.flatMap((answer, index) => {
        if (answer.sourceText === "Prefer not to answer") {
          return [];
        }

        const question = getPolicyCompliantInterviewQuestion(
          index,
          answers.slice(0, index),
        );
        return question
          ? [
              {
                answer,
                answerIndex: index,
                proposal: createPolicyCompliantFieldProposal(
                  question,
                  answer.sourceText,
                ),
              },
            ]
          : [];
      }),
    [answers],
  );
  const reviewedCount = Object.keys(dispositions).length;
  const allReviewed =
    answers.length === questionCount &&
    proposals.every(({ answer }) => Boolean(dispositions[answer.questionId]));
  const completedReview = useMemo(() => {
    if (!completed || answers.length === 0) return null;

    return buildCandidateInterviewReview({
      fields: answers.map((answer, index) => {
        const question = getPolicyCompliantInterviewQuestion(
          index,
          answers.slice(0, index),
        );
        if (!question) {
          throw new Error(
            `Missing interview question for ${answer.questionId}`,
          );
        }

        return {
          disposition:
            answer.sourceText === "Prefer not to answer"
              ? "declined"
              : (dispositions[answer.questionId] ?? "private"),
          fieldLabel: question.fieldLabel,
          questionId: answer.questionId,
          responseRevision: answer.revision,
          sourceText: answer.sourceText,
          topic: answer.topic,
        };
      }),
      guideVersion: interviewGuideVersion,
    });
  }, [answers, completed, dispositions]);

  function snapshotProgress(
    nextAnswers: readonly InterviewAnswer[] = answers,
    nextDraft: string = draft,
    draftQuestionId: string | undefined = currentQuestion?.id,
  ): InterviewProgressSnapshot {
    return createInterviewProgressSnapshot({
      answers: nextAnswers,
      declinedQuestionIds: nextAnswers
        .filter((answer) => answer.planningPermission === "declined")
        .map((answer) => answer.questionId),
      drafts:
        draftQuestionId && nextDraft.length > 0
          ? { [draftQuestionId]: nextDraft }
          : {},
    });
  }

  function recordAnswer(
    sourceText: string,
    questionDisposition: Extract<
      InterviewQuestionDisposition,
      "answered" | "declined"
    >,
  ) {
    if (!currentQuestion) return;
    if (!currentQuestionRecord) return;

    const existingIndex = answers.findIndex(
      (answer) => answer.questionId === currentQuestion.id,
    );
    const nextAnswer = {
      planningPermission:
        questionDisposition === "declined"
          ? ("declined" as const)
          : ("candidate-confirmed" as const),
      questionId: currentQuestion.id,
      revision:
        existingIndex === -1 ? 1 : (answers[existingIndex]?.revision ?? 0) + 1,
      sourceText,
      topic: currentQuestion.topic,
    };
    const nextAnswers =
      existingIndex === -1
        ? [...answers, nextAnswer]
        : answers.map((answer, index) =>
            index === existingIndex ? nextAnswer : answer,
          );
    setAnswers(nextAnswers);
    onProgressChange(snapshotProgress(nextAnswers, ""));
    let nextQuestionRecords = settleInterviewQuestion(
      questionRecords,
      currentQuestionRecord.recordId,
      questionDisposition,
    );
    setDraft("");
    setError(null);

    if (currentIndex === questionCount - 1) {
      setQuestionRecords(nextQuestionRecords);
      setReviewing(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    const nextQuestion = getPolicyCompliantInterviewQuestion(
      nextIndex,
      nextAnswers.slice(0, nextIndex),
    );
    if (!nextQuestion) {
      throw new Error(`Missing interview question at index ${nextIndex}`);
    }
    const proposedAt = new Date().toISOString();
    const proposal = proposeInterviewQuestionWithinBudget(
      nextQuestionRecords,
      nextQuestion,
      {
        mode,
        proposedAt,
        sessionId: localUsageSessionId,
      },
      {
        policy: localInterviewBudgetPolicy,
        sessionElapsedMs: elapsedSince(sessionStartedAt, proposedAt),
      },
    );
    if (proposal.decision.action === "structured-fallback") {
      setQuestionRecords(nextQuestionRecords);
      onUseStructuredFallback(
        createInterviewFallbackTransfer(
          snapshotProgress(nextAnswers, ""),
          proposal.decision.reason,
        ),
      );
      return;
    }
    setQuestionRecords(proposal.records);
    setCurrentIndex(nextIndex);
  }

  function saveAnswer() {
    const sourceText = draft.trim();
    if (sourceText.length < 8) {
      setError("Add a little more detail, or choose Prefer not to answer.");
      return;
    }

    recordAnswer(sourceText, "answered");
  }

  function preferNotToAnswer() {
    recordAnswer("Prefer not to answer", "declined");
  }

  function editAnswer(index: number) {
    const answer = answers[index];
    if (!answer) return;

    setCurrentIndex(index);
    setDraft(
      answer.sourceText === "Prefer not to answer" ? "" : answer.sourceText,
    );
    setReviewing(false);
    setCompleted(false);
    const reopenedQuestion = getPolicyCompliantInterviewQuestion(
      index,
      answers.slice(0, index),
    );
    if (!reopenedQuestion) {
      throw new Error(`Missing interview question at index ${index}`);
    }
    const proposedAt = new Date().toISOString();
    const proposal = reopenInterviewQuestionWithinBudget(
      questionRecords,
      reopenedQuestion,
      new Set(answers.slice(index).map((candidate) => candidate.questionId)),
      {
        mode,
        proposedAt,
        sessionId: localUsageSessionId,
      },
      {
        policy: localInterviewBudgetPolicy,
        sessionElapsedMs: elapsedSince(sessionStartedAt, proposedAt),
      },
    );
    if (proposal.decision.action === "structured-fallback") {
      onUseStructuredFallback(
        createInterviewFallbackTransfer(
          snapshotProgress(answers, answer.sourceText, answer.questionId),
          proposal.decision.reason,
        ),
      );
      return;
    }
    setQuestionRecords(proposal.records);
    setDispositions((current) => {
      const next = { ...current };
      for (const candidate of answers.slice(index)) {
        delete next[candidate.questionId];
      }
      return next;
    });
  }

  return (
    <div className="adaptive-interview">
      <div className="interview-introduction">
        <p className="detail-label">What matters</p>
        <h2 id="interview-panel-title">
          Tell your story in the way that feels natural.
        </h2>
        <p className="panel-copy">
          Choose a paced conversation or a guided question. You can switch at
          any time. For this development preview, use fictional details only;
          nothing is submitted, persisted, or sent to an AI provider.
        </p>
        <p className="interview-guide-version">
          Guide {interviewGuideVersion} · Human review only
        </p>
      </div>

      <section aria-labelledby="interview-panel-title">
        <div className="interview-toolbar">
          <div aria-label="Answer style" className="mode-switch">
            <button
              aria-pressed={mode === "conversation"}
              onClick={() => setMode("conversation")}
              type="button"
            >
              Conversation
            </button>
            <button
              aria-pressed={mode === "guided"}
              onClick={() => setMode("guided")}
              type="button"
            >
              Guided
            </button>
          </div>
          {!reviewing && !completed ? (
            <button
              className="interview-pause"
              onClick={() => setPaused((value) => !value)}
              type="button"
            >
              {paused ? "Resume" : "Pause"}
            </button>
          ) : null}
        </div>

        {!reviewing && !completed && !paused && currentQuestion ? (
          <InterviewAssistance
            onChooseApproach={onChooseApproach}
            onContinueWithoutInterview={onContinueWithoutInterview}
            onUseStructuredFallback={() =>
              onUseStructuredFallback(
                createInterviewFallbackTransfer(
                  snapshotProgress(),
                  "candidate-choice",
                ),
              )
            }
            question={currentQuestion}
          />
        ) : null}

        {paused ? (
          <div className="interview-paused" role="status">
            <p className="detail-label">Paused</p>
            <h2>Take all the time you need.</h2>
            <p>
              Your answers remain only in this open page. Closing or refreshing
              it clears the preview.
            </p>
            <button
              className="action-button"
              onClick={() => setPaused(false)}
              type="button"
            >
              Continue when ready
            </button>
          </div>
        ) : null}

        {!paused && !reviewing && !completed && currentQuestion ? (
          <div className={`interview-question is-${mode}`}>
            <div className="interview-progress">
              <span>
                Question {currentIndex + 1} of {questionCount}
              </span>
              <progress
                aria-label="Interview progress"
                max={questionCount}
                value={currentIndex + 1}
              />
            </div>
            <p className="detail-label">
              {mode === "conversation"
                ? "Argent asks"
                : currentQuestion.fieldLabel}
            </p>
            <h2>{currentQuestion.prompt}</h2>
            <p className="question-purpose">{currentQuestion.purpose}</p>
            <div className="question-rationale">
              <p className="detail-label">Why this question</p>
              <p>{currentQuestion.selection.explanation}</p>
            </div>
            <label className="answer-label" htmlFor="candidate-answer">
              {mode === "conversation" ? "Your response" : "Your answer"}
            </label>
            <textarea
              aria-describedby={
                error ? "answer-boundary answer-error" : "answer-boundary"
              }
              id="candidate-answer"
              maxLength={4000}
              onChange={(event) => {
                const nextDraft = event.target.value;
                setDraft(nextDraft);
                onProgressChange(snapshotProgress(answers, nextDraft));
                setError(null);
              }}
              placeholder={
                mode === "conversation"
                  ? "Answer in your own words…"
                  : "Add only what you want a matchmaker to consider…"
              }
              rows={6}
              value={draft}
            />
            <p className="answer-boundary" id="answer-boundary">
              Avoid names, addresses, financial information, or details about
              another person. Continuing confirms this response for local
              question planning only; you review profile use separately.
            </p>
            {error ? (
              <p className="answer-error" id="answer-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="interview-actions">
              <button
                className="secondary-button"
                onClick={preferNotToAnswer}
                type="button"
              >
                Prefer not to answer
              </button>
              <button
                className="action-button"
                onClick={saveAnswer}
                type="button"
              >
                {currentIndex === questionCount - 1
                  ? "Review my answers"
                  : "Continue"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}

        {!paused && reviewing && !completed ? (
          <div className="interview-review">
            <p className="detail-label">Your review</p>
            <h2>Decide what a matchmaker may consider.</h2>
            <p className="question-purpose">
              Each proposed field is the exact source you provided—nothing has
              been inferred. Approve it, keep it private, or reject it
              independently.
            </p>
            <div className="proposal-list">
              {proposals.map(({ answer, answerIndex, proposal }) => {
                const disposition = dispositions[answer.questionId];
                return (
                  <article className="proposal-card" key={proposal.topic}>
                    <p className="detail-label">{proposal.fieldLabel}</p>
                    <p className="proposal-value">“{proposal.value}”</p>
                    <p className="proposal-source">
                      Source: your response · No inference
                    </p>
                    <div className="proposal-actions">
                      <button
                        aria-pressed={disposition === "approved"}
                        className="secondary-button"
                        onClick={() => {
                          setDispositions((current) => ({
                            ...current,
                            [answer.questionId]: "approved",
                          }));
                        }}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        aria-pressed={disposition === "private"}
                        className="secondary-button"
                        onClick={() => {
                          setDispositions((current) => ({
                            ...current,
                            [answer.questionId]: "private",
                          }));
                        }}
                        type="button"
                      >
                        Keep private
                      </button>
                      <button
                        aria-pressed={disposition === "rejected"}
                        className="secondary-button"
                        onClick={() => {
                          setDispositions((current) => ({
                            ...current,
                            [answer.questionId]: "rejected",
                          }));
                        }}
                        type="button"
                      >
                        Reject
                      </button>
                      <button
                        className="text-button"
                        onClick={() => editAnswer(answerIndex)}
                        type="button"
                      >
                        Edit source
                      </button>
                    </div>
                    {disposition ? (
                      <p className="proposal-status" role="status">
                        {dispositionLabels[disposition]} for this local review.
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
            {proposals.length === 0 ? (
              <p className="question-purpose">
                You declined every question, so there are no proposed fields to
                review. You can continue without approving anything.
              </p>
            ) : null}
            <div className="interview-actions">
              <button
                className="secondary-button"
                onClick={() => editAnswer(0)}
                type="button"
              >
                Back to answers
              </button>
              <button
                className="action-button"
                disabled={!allReviewed}
                onClick={() => setCompleted(true)}
                type="button"
              >
                Complete local review
              </button>
            </div>
            {!allReviewed ? (
              <p className="review-count" role="status">
                Review every field to continue · {reviewedCount} of{" "}
                {proposals.length} complete
              </p>
            ) : null}
          </div>
        ) : null}

        {!paused && completed && completedReview ? (
          <div className="interview-complete" role="status">
            <p className="detail-label">Your final review</p>
            <h2>Review exactly what would move forward.</h2>
            <p className="question-purpose">
              Only approved fields are eligible for profile use or future
              analytics. Private, rejected, and declined responses remain
              excluded. This preview has not saved or shared any of them.
            </p>
            <div aria-label="Final interview review" className="proposal-list">
              {completedReview.fields.map((field) => (
                <article
                  className="proposal-card final-review-card"
                  key={field.provenance.questionId}
                >
                  <div className="final-review-heading">
                    <p className="detail-label">{field.fieldLabel}</p>
                    <span
                      className={`review-disposition is-${field.disposition}`}
                    >
                      {dispositionLabels[field.disposition]}
                    </span>
                  </div>
                  <p className="proposal-value">“{field.sourceText}”</p>
                  <p className="proposal-source">
                    Exact source · Revision {field.provenance.responseRevision}{" "}
                    · No inference
                  </p>
                </article>
              ))}
            </div>
            <p className="final-review-count">
              {completedReview.approvedFieldCount} of{" "}
              {completedReview.fields.length} fields approved for consideration
            </p>
            <div className="interview-actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setReviewing(true);
                  setCompleted(false);
                }}
                type="button"
              >
                Revisit review
              </button>
              <button
                className="text-button"
                onClick={() => {
                  const proposedAt = new Date().toISOString();
                  setAnswers([]);
                  onProgressChange(
                    createInterviewProgressSnapshot({
                      answers: [],
                      declinedQuestionIds: [],
                      drafts: {},
                    }),
                  );
                  setCompleted(false);
                  setCurrentIndex(0);
                  setDispositions({});
                  setDraft("");
                  setSessionStartedAt(proposedAt);
                  setQuestionRecords(
                    createInitialQuestionRecords(mode, proposedAt),
                  );
                  setReviewing(false);
                }}
                type="button"
              >
                Begin again
              </button>
              <button
                className="action-button"
                onClick={onContinueToReview}
                type="button"
              >
                Continue to application review
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {!completed ? (
        <div className="interview-route-actions">
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
      ) : null}
    </div>
  );
}

function elapsedSince(startedAt: string, occurredAt: string): number {
  return Math.max(0, Date.parse(occurredAt) - Date.parse(startedAt));
}
