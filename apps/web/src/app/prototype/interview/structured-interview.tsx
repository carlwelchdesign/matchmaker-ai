"use client";

import {
  buildCandidateInterviewReview,
  type CandidateFieldDisposition,
} from "@argent/domain";
import { useMemo, useState } from "react";

import {
  createFieldProposal,
  getStructuredInterviewQuestions,
  interviewGuideVersion,
  type InterviewAnswer,
} from "./interview-guide";
import { buildStructuredAnswers } from "./structured-interview-state";

type FieldDisposition = Exclude<CandidateFieldDisposition, "declined">;
type StructuredStage = "complete" | "review" | "worksheet";

const dispositionLabels: Record<CandidateFieldDisposition, string> = {
  approved: "Approved for consideration",
  declined: "Question declined",
  private: "Kept private",
  rejected: "Rejected",
};

const questions = getStructuredInterviewQuestions();

export function StructuredInterview({
  onChooseApproach,
  onContinueToReview,
  onContinueWithoutInterview,
}: Readonly<{
  onChooseApproach: () => void;
  onContinueToReview: () => void;
  onContinueWithoutInterview: () => void;
}>) {
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [declinedQuestionIds, setDeclinedQuestionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [dispositions, setDispositions] = useState<
    Record<string, FieldDisposition>
  >({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<StructuredStage>("worksheet");

  const proposals = useMemo(
    () =>
      answers.flatMap((answer) => {
        if (answer.sourceText === "Prefer not to answer") return [];

        const question = questions.find(
          (candidate) => candidate.id === answer.questionId,
        );
        return question
          ? [
              {
                answer,
                proposal: createFieldProposal(question, answer.sourceText),
              },
            ]
          : [];
      }),
    [answers],
  );
  const allReviewed = proposals.every(({ answer }) =>
    Boolean(dispositions[answer.questionId]),
  );
  const reviewedCount = proposals.filter(({ answer }) =>
    Boolean(dispositions[answer.questionId]),
  ).length;
  const completedReview = useMemo(() => {
    if (stage !== "complete" || answers.length !== questions.length)
      return null;

    return buildCandidateInterviewReview({
      fields: answers.map((answer) => {
        const question = questions.find(
          (candidate) => candidate.id === answer.questionId,
        );
        if (!question) {
          throw new Error(
            `Missing structured question for ${answer.questionId}`,
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
  }, [answers, dispositions, stage]);

  function reviewAnswers() {
    const result = buildStructuredAnswers({
      declinedQuestionIds,
      drafts,
      previousAnswers: answers,
      questions,
    });
    setErrors(result.errors);

    if (Object.keys(result.errors).length > 0) return;

    setDispositions((current) => {
      const next = { ...current };
      for (const answer of result.answers) {
        const previous = answers.find(
          (candidate) => candidate.questionId === answer.questionId,
        );
        if (!previous || previous.sourceText !== answer.sourceText) {
          delete next[answer.questionId];
        }
      }
      return next;
    });
    setAnswers(result.answers);
    setStage("review");
  }

  function toggleDeclined(questionId: string) {
    setDeclinedQuestionIds((current) => {
      const next = new Set(current);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
    setErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  }

  function beginAgain() {
    setAnswers([]);
    setDeclinedQuestionIds(new Set());
    setDispositions({});
    setDrafts({});
    setErrors({});
    setStage("worksheet");
  }

  return (
    <div className="adaptive-interview structured-interview">
      <div className="interview-introduction">
        <p className="detail-label">What matters · Structured</p>
        <h2 id="structured-interview-title">Write at your own pace.</h2>
        <p className="panel-copy">
          See the complete guide, answer in any order, and review exactly what a
          matchmaker may consider. For this development preview, use fictional
          details only; nothing is submitted, persisted, or sent to an AI
          provider.
        </p>
        <p className="interview-guide-version">
          Guide {interviewGuideVersion} · Fixed questions · Human review only
        </p>
      </div>

      <section aria-labelledby="structured-interview-title">
        {stage === "worksheet" ? (
          <div className="structured-worksheet">
            <div className="interview-progress">
              <span>Four questions · Answer in any order</span>
              <span>
                {
                  questions.filter(
                    (question) =>
                      declinedQuestionIds.has(question.id) ||
                      (drafts[question.id] ?? "").trim().length >= 8,
                  ).length
                }{" "}
                of {questions.length} ready
              </span>
            </div>
            <p className="answer-boundary">
              Avoid names, addresses, financial information, or details about
              another person. Every answer remains editable before local review.
            </p>

            <div className="structured-question-list">
              {questions.map((question, index) => {
                const declined = declinedQuestionIds.has(question.id);
                const error = errors[question.id];
                const boundaryId = `${question.id}-boundary`;
                const errorId = `${question.id}-error`;

                return (
                  <article className="structured-question" key={question.id}>
                    <div className="structured-question-heading">
                      <p className="detail-label">
                        {String(index + 1).padStart(2, "0")} ·{" "}
                        {question.fieldLabel}
                      </p>
                      <button
                        aria-pressed={declined}
                        className="text-button"
                        onClick={() => toggleDeclined(question.id)}
                        type="button"
                      >
                        {declined
                          ? "Answer this question"
                          : "Prefer not to answer"}
                      </button>
                    </div>
                    <h3>{question.prompt}</h3>
                    <p className="question-purpose">{question.purpose}</p>
                    <div className="question-rationale">
                      <p className="detail-label">Why this question</p>
                      <p>{question.selection.explanation}</p>
                    </div>
                    <label className="answer-label" htmlFor={question.id}>
                      {question.fieldLabel}:
                      {declined ? " question declined" : " your answer"}
                    </label>
                    <textarea
                      aria-describedby={
                        error ? `${boundaryId} ${errorId}` : boundaryId
                      }
                      aria-invalid={Boolean(error)}
                      disabled={declined}
                      id={question.id}
                      maxLength={4000}
                      onChange={(event) => {
                        setDrafts((current) => ({
                          ...current,
                          [question.id]: event.target.value,
                        }));
                        setErrors((current) => {
                          const next = { ...current };
                          delete next[question.id];
                          return next;
                        });
                      }}
                      placeholder="Add only what you want a matchmaker to consider…"
                      rows={5}
                      value={drafts[question.id] ?? ""}
                    />
                    <p className="answer-boundary" id={boundaryId}>
                      {declined
                        ? "This question will appear as declined in your final review."
                        : `${(drafts[question.id] ?? "").length} of 4000 characters`}
                    </p>
                    {error ? (
                      <p className="answer-error" id={errorId} role="alert">
                        {error}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>

            {Object.keys(errors).length > 0 ? (
              <p className="answer-error" role="alert">
                Review the highlighted questions before continuing.
              </p>
            ) : null}
            <div className="interview-actions">
              <span />
              <button
                className="action-button"
                onClick={reviewAnswers}
                type="button"
              >
                Review my answers <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}

        {stage === "review" ? (
          <div className="interview-review">
            <p className="detail-label">Your review</p>
            <h2>Decide what a matchmaker may consider.</h2>
            <p className="question-purpose">
              Each proposed field is the exact source you provided—nothing has
              been inferred. Approve it, keep it private, or reject it
              independently.
            </p>
            <div className="proposal-list">
              {proposals.map(({ answer, proposal }) => {
                const disposition = dispositions[answer.questionId];
                return (
                  <article className="proposal-card" key={proposal.topic}>
                    <p className="detail-label">{proposal.fieldLabel}</p>
                    <p className="proposal-value">“{proposal.value}”</p>
                    <p className="proposal-source">
                      Source: your written answer · Revision {answer.revision} ·
                      No inference
                    </p>
                    <div className="proposal-actions">
                      {(["approved", "private", "rejected"] as const).map(
                        (nextDisposition) => (
                          <button
                            aria-pressed={disposition === nextDisposition}
                            className="secondary-button"
                            key={nextDisposition}
                            onClick={() =>
                              setDispositions((current) => ({
                                ...current,
                                [answer.questionId]: nextDisposition,
                              }))
                            }
                            type="button"
                          >
                            {nextDisposition === "approved"
                              ? "Approve"
                              : nextDisposition === "private"
                                ? "Keep private"
                                : "Reject"}
                          </button>
                        ),
                      )}
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
                onClick={() => setStage("worksheet")}
                type="button"
              >
                Back to answers
              </button>
              <button
                className="action-button"
                disabled={!allReviewed}
                onClick={() => setStage("complete")}
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

        {stage === "complete" && completedReview ? (
          <div className="interview-complete" role="status">
            <p className="detail-label">Your final review</p>
            <h2>Review exactly what would move forward.</h2>
            <p className="question-purpose">
              Only approved fields are eligible for profile use or future
              analytics. Private, rejected, and declined responses remain
              excluded. This preview has not saved or shared any of them.
            </p>
            <div
              aria-label="Final structured interview review"
              className="proposal-list"
            >
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
                onClick={() => setStage("review")}
                type="button"
              >
                Revisit review
              </button>
              <button
                className="text-button"
                onClick={beginAgain}
                type="button"
              >
                Begin again
              </button>
              <button
                className="action-button"
                onClick={onContinueToReview}
                type="button"
              >
                Continue to application review <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}
      </section>

      {stage !== "complete" ? (
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
            Continue without structured questions
          </button>
        </div>
      ) : null}
    </div>
  );
}
