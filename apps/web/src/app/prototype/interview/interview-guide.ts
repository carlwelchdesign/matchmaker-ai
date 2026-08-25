export type InterviewMode = "conversation" | "guided";

export type InterviewTopic =
  | "relationship-intention"
  | "introduction-pace"
  | "life-rhythm"
  | "personal-boundaries";

export type InterviewAnswer = {
  questionId: string;
  revision: number;
  sourceText: string;
  topic: InterviewTopic;
};

export type InterviewQuestion = {
  fieldLabel: string;
  id: string;
  prompt: string;
  purpose: string;
  selection: InterviewQuestionSelection;
  topic: InterviewTopic;
};

export type InterviewQuestionReasonCode =
  | "required-core"
  | "source-grounded-boundaries"
  | "source-grounded-pace"
  | "source-grounded-rhythm";

export type InterviewQuestionSelection = {
  explanation: string;
  guideVersion: string;
  model: null;
  planner: "deterministic-template";
  plannerVersion: string;
  reasonCode: InterviewQuestionReasonCode;
  sourceReferences: ReadonlyArray<{
    questionId: string;
    responseRevision: number;
  }>;
};

export type FieldProposal = {
  fieldLabel: string;
  sourceText: string;
  topic: InterviewTopic;
  value: string;
};

export const interviewGuideVersion = "argent-text-guide-2026-08-25";
export const interviewPlannerVersion = "argent-template-planner-2026-08-25";

type InterviewQuestionDefinition = Omit<InterviewQuestion, "selection">;

type ApprovedAdaptation = {
  displayTerm: string;
  prompt: string;
  reasonCode: Exclude<InterviewQuestionReasonCode, "required-core">;
  sourceTerms: readonly string[];
};

const questions: ReadonlyArray<InterviewQuestionDefinition> = [
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

const approvedAdaptations: Readonly<
  Partial<Record<InterviewQuestion["id"], readonly ApprovedAdaptation[]>>
> = {
  pace: [
    {
      displayTerm: "intentional",
      prompt:
        "You described an intentional beginning. What would that pace look like during the first few weeks?",
      reasonCode: "source-grounded-pace",
      sourceTerms: ["intentional"],
    },
    {
      displayTerm: "unhurried",
      prompt:
        "You described an unhurried beginning. What would that pace look like during the first few weeks?",
      reasonCode: "source-grounded-pace",
      sourceTerms: ["unhurried", "slow", "gradual"],
    },
  ],
  rhythm: [
    {
      displayTerm: "travel",
      prompt:
        "You mentioned travel. What rhythm around travel would you want a future partner to understand?",
      reasonCode: "source-grounded-rhythm",
      sourceTerms: ["travel", "traveling", "travelling"],
    },
    {
      displayTerm: "work",
      prompt:
        "You mentioned work. What balance around work would you want a future partner to understand?",
      reasonCode: "source-grounded-rhythm",
      sourceTerms: ["work", "career"],
    },
    {
      displayTerm: "weekends",
      prompt:
        "You mentioned weekends. What would an enjoyable shared weekly rhythm look like?",
      reasonCode: "source-grounded-rhythm",
      sourceTerms: ["weekend", "weekends"],
    },
    {
      displayTerm: "family",
      prompt:
        "You mentioned family. How would you want family life to fit into a shared weekly rhythm?",
      reasonCode: "source-grounded-rhythm",
      sourceTerms: ["family"],
    },
  ],
  boundaries: [
    {
      displayTerm: "communication",
      prompt:
        "You mentioned communication. What would respectful communication look like during an introduction?",
      reasonCode: "source-grounded-boundaries",
      sourceTerms: ["communication", "communicate"],
    },
    {
      displayTerm: "privacy",
      prompt:
        "You mentioned privacy. What privacy boundary would help an introduction feel considered?",
      reasonCode: "source-grounded-boundaries",
      sourceTerms: ["privacy", "private"],
    },
    {
      displayTerm: "honesty",
      prompt:
        "You mentioned honesty. What would candid, respectful communication look like at the beginning?",
      reasonCode: "source-grounded-boundaries",
      sourceTerms: ["honesty", "honest", "candid"],
    },
    {
      displayTerm: "space",
      prompt:
        "You mentioned space. What would having enough space look like during the introduction process?",
      reasonCode: "source-grounded-boundaries",
      sourceTerms: ["space"],
    },
  ],
};

export function getInterviewQuestion(
  index: number,
  answers: ReadonlyArray<InterviewAnswer>,
): InterviewQuestion | null {
  const question = questions[index];

  if (!question) {
    return null;
  }

  const groundedSelection = findApprovedAdaptation(question.id, answers);
  if (groundedSelection) {
    return {
      ...question,
      prompt: groundedSelection.adaptation.prompt,
      selection: {
        explanation: `This approved follow-up appeared because you mentioned “${groundedSelection.adaptation.displayTerm}.” It does not interpret anything beyond that word.`,
        guideVersion: interviewGuideVersion,
        model: null,
        planner: "deterministic-template",
        plannerVersion: interviewPlannerVersion,
        reasonCode: groundedSelection.adaptation.reasonCode,
        sourceReferences: [
          {
            questionId: groundedSelection.answer.questionId,
            responseRevision: groundedSelection.answer.revision,
          },
        ],
      },
    };
  }

  return {
    ...question,
    selection: {
      explanation:
        "This question is part of Argent’s fixed interview guide and does not rely on an inferred trait.",
      guideVersion: interviewGuideVersion,
      model: null,
      planner: "deterministic-template",
      plannerVersion: interviewPlannerVersion,
      reasonCode: "required-core",
      sourceReferences: [],
    },
  };
}

function findApprovedAdaptation(
  questionId: string,
  answers: ReadonlyArray<InterviewAnswer>,
): { adaptation: ApprovedAdaptation; answer: InterviewAnswer } | null {
  const adaptations = approvedAdaptations[questionId] ?? [];
  const eligibleAnswers = answers.filter(
    (answer) => answer.sourceText !== "Prefer not to answer",
  );

  for (const adaptation of adaptations) {
    for (const answer of eligibleAnswers.toReversed()) {
      const normalized = answer.sourceText.toLocaleLowerCase();
      if (
        adaptation.sourceTerms.some((term) => hasWholeTerm(normalized, term))
      ) {
        return { adaptation, answer };
      }
    }
  }

  return null;
}

function hasWholeTerm(source: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "u").test(source);
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
