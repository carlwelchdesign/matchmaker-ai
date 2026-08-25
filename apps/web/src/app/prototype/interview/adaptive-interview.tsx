"use client";

import { useMemo, useState } from "react";

import {
  createFieldProposal,
  getInterviewQuestion,
  getInterviewQuestionCount,
  interviewGuideVersion,
  type InterviewAnswer,
  type InterviewMode,
} from "./interview-guide";

type FieldDisposition = "approved" | "left-out";

export function AdaptiveInterview({
  initialMode,
}: Readonly<{ initialMode: InterviewMode }>) {
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
  const [reviewing, setReviewing] = useState(false);

  const questionCount = getInterviewQuestionCount();
  const currentQuestion = getInterviewQuestion(currentIndex, answers);
  const proposals = useMemo(
    () =>
      answers.flatMap((answer, index) => {
        if (answer.sourceText === "Prefer not to answer") {
          return [];
        }

        const question = getInterviewQuestion(index, answers.slice(0, index));
        return question
          ? [
              {
                answer,
                answerIndex: index,
                proposal: createFieldProposal(question, answer.sourceText),
              },
            ]
          : [];
      }),
    [answers],
  );
  const reviewedCount = Object.keys(dispositions).length;
  const allReviewed =
    proposals.length > 0 && reviewedCount === proposals.length;

  function saveAnswer() {
    if (!currentQuestion) return;

    const sourceText = draft.trim();
    if (sourceText.length < 8) {
      setError("Add a little more detail, or choose Prefer not to answer.");
      return;
    }

    const nextAnswer = {
      questionId: currentQuestion.id,
      sourceText,
      topic: currentQuestion.topic,
    };
    const existingIndex = answers.findIndex(
      (answer) => answer.questionId === currentQuestion.id,
    );
    const nextAnswers =
      existingIndex === -1
        ? [...answers, nextAnswer]
        : answers.map((answer, index) =>
            index === existingIndex ? nextAnswer : answer,
          );
    setAnswers(nextAnswers);
    setDraft("");
    setError(null);

    if (currentIndex === questionCount - 1) {
      setReviewing(true);
      return;
    }

    setCurrentIndex(currentIndex + 1);
  }

  function preferNotToAnswer() {
    if (!currentQuestion) return;

    const nextAnswer = {
      questionId: currentQuestion.id,
      sourceText: "Prefer not to answer",
      topic: currentQuestion.topic,
    };
    const existingIndex = answers.findIndex(
      (answer) => answer.questionId === currentQuestion.id,
    );
    const nextAnswers =
      existingIndex === -1
        ? [...answers, nextAnswer]
        : answers.map((answer, index) =>
            index === existingIndex ? nextAnswer : answer,
          );
    setAnswers(nextAnswers);
    setDraft("");
    setError(null);

    if (currentIndex === questionCount - 1) {
      setReviewing(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
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
    setDispositions((current) => {
      const next = { ...current };
      delete next[answer.questionId];
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
            <label className="answer-label" htmlFor="candidate-answer">
              {mode === "conversation" ? "Your response" : "Your answer"}
            </label>
            <textarea
              aria-describedby={
                error ? "answer-boundary answer-error" : "answer-boundary"
              }
              id="candidate-answer"
              onChange={(event) => {
                setDraft(event.target.value);
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
              another person. You will review this before it is considered.
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
              been inferred. Approve it or leave it out independently.
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
                        aria-pressed={disposition === "left-out"}
                        className="secondary-button"
                        onClick={() => {
                          setDispositions((current) => ({
                            ...current,
                            [answer.questionId]: "left-out",
                          }));
                        }}
                        type="button"
                      >
                        Leave out
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
                        {disposition === "approved"
                          ? "Approved for this local review."
                          : "Left out of this local review."}
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
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

        {!paused && completed ? (
          <div className="interview-complete" role="status">
            <p className="detail-label">Local review complete</p>
            <h2>You remain in control.</h2>
            <p>
              {
                Object.values(dispositions).filter(
                  (value) => value === "approved",
                ).length
              }{" "}
              fields were approved and{" "}
              {
                Object.values(dispositions).filter(
                  (value) => value === "left-out",
                ).length
              }{" "}
              were left out. This preview has not saved or shared either.
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
                className="action-button"
                onClick={() => {
                  setAnswers([]);
                  setCompleted(false);
                  setCurrentIndex(0);
                  setDispositions({});
                  setDraft("");
                  setReviewing(false);
                }}
                type="button"
              >
                Begin again
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
