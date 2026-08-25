export type InterviewMode = "conversation" | "guided";

export type InterviewTopic =
  | "relationship-intention"
  | "introduction-pace"
  | "life-rhythm"
  | "personal-boundaries";

export type InterviewAnswer = {
  questionId: string;
  sourceText: string;
  topic: InterviewTopic;
};

export type InterviewQuestion = {
  fieldLabel: string;
  id: string;
  prompt: string;
  purpose: string;
  topic: InterviewTopic;
};

export type FieldProposal = {
  fieldLabel: string;
  sourceText: string;
  topic: InterviewTopic;
  value: string;
};

export const interviewGuideVersion = "argent-text-guide-2026-08-24";

const questions: ReadonlyArray<InterviewQuestion> = [
  {
    fieldLabel: "Relationship intentions",
    id: "intentions",
    prompt:
      "When you imagine a relationship worth making room for now, what feels most important?",
    purpose:
      "This helps a matchmaker understand what you hope to build, in your own words.",
    topic: "relationship-intention",
  },
  {
    fieldLabel: "Preferred introduction pace",
    id: "pace",
    prompt:
      "What pace would help a new introduction feel comfortable and considered?",
    purpose:
      "This helps a matchmaker plan an introduction without assuming how quickly you prefer to move.",
    topic: "introduction-pace",
  },
  {
    fieldLabel: "Life rhythm",
    id: "rhythm",
    prompt:
      "Which parts of your week or way of living would you most want a future partner to understand?",
    purpose:
      "This provides practical context without asking you to reduce your life to a checklist.",
    topic: "life-rhythm",
  },
  {
    fieldLabel: "Early boundaries",
    id: "boundaries",
    prompt:
      "What would help you feel respected and at ease during the introduction process?",
    purpose:
      "This gives you a place to name boundaries before a matchmaker considers an introduction.",
    topic: "personal-boundaries",
  },
];

export function getInterviewQuestion(
  index: number,
  answers: ReadonlyArray<InterviewAnswer>,
): InterviewQuestion | null {
  const question = questions[index];

  if (!question) {
    return null;
  }

  if (question.id !== "pace") {
    return question;
  }

  const intention = answers.find(
    (answer) => answer.questionId === "intentions",
  );
  if (!intention) {
    return question;
  }

  const normalized = intention.sourceText.toLocaleLowerCase();
  const paceLanguage = ["intentional", "unhurried", "slow", "gradual"].find(
    (term) => normalized.includes(term),
  );

  if (!paceLanguage) {
    return question;
  }

  return {
    ...question,
    prompt: `You described an ${paceLanguage === "intentional" ? "intentional" : "unhurried"} beginning. What would that pace look like during the first few weeks?`,
  };
}

export function getInterviewQuestionCount() {
  return questions.length;
}

export function createFieldProposal(
  question: InterviewQuestion,
  sourceText: string,
): FieldProposal {
  const reviewedSource = sourceText.trim();

  return {
    fieldLabel: question.fieldLabel,
    sourceText: reviewedSource,
    topic: question.topic,
    value: reviewedSource,
  };
}
