export type InterviewMode = "conversation" | "guided";

export type InterviewTopic =
  | "relationship-intention"
  | "introduction-pace"
  | "life-rhythm"
  | "personal-boundaries";

export type InterviewAnswer = {
  planningPermission: "candidate-confirmed" | "declined";
  questionId: string;
  revision: number;
  sourceText: string;
  topic: InterviewTopic;
};

export type InterviewPlanningInput =
  | {
      kind: "candidate-confirmed-fact";
      questionId: string;
      responseRevision: number;
      sourceText: string;
      topic: InterviewTopic;
    }
  | {
      kind: "explicit-unknown";
      questionId: string;
      responseRevision: number;
      topic: InterviewTopic;
    }
  | {
      kind: "documented-contradiction";
      questionIds: readonly [string, string];
      sourceReferences: ReadonlyArray<{
        questionId: string;
        responseRevision: number;
      }>;
    }
  | {
      kind: "uncovered-required-topic";
      questionId: string;
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

export type InterviewGuide = {
  approvedOptionalProbes: ReadonlyArray<
    ApprovedAdaptation & { questionId: string }
  >;
  requiredQuestionIds: ReadonlyArray<string>;
  sensitiveTopicBoundaries: ReadonlyArray<{
    code: "no-prohibited-inference" | "no-sensitive-identifiers";
    guidance: string;
  }>;
  sourceToFieldMappings: ReadonlyArray<{
    fieldLabel: string;
    questionId: string;
    topic: InterviewTopic;
  }>;
  stopConditions: ReadonlyArray<{
    code:
      | "candidate-continues-without-interview"
      | "human-assistance-requested"
      | "required-topics-covered";
    guidance: string;
  }>;
  version: string;
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

export const interviewGuide: InterviewGuide = {
  approvedOptionalProbes: Object.entries(approvedAdaptations).flatMap(
    ([questionId, adaptations]) =>
      (adaptations ?? []).map((adaptation) => ({
        ...adaptation,
        questionId,
      })),
  ),
  requiredQuestionIds: questions.map((question) => question.id),
  sensitiveTopicBoundaries: [
    {
      code: "no-sensitive-identifiers",
      guidance:
        "Do not ask for names, addresses, financial information, or details about another person.",
    },
    {
      code: "no-prohibited-inference",
      guidance:
        "Do not infer protected traits, health, sexual behavior, emotion, accent, deception, attractiveness, wealth, diagnosis, personality, or compatibility.",
    },
  ],
  sourceToFieldMappings: questions.map((question) => ({
    fieldLabel: question.fieldLabel,
    questionId: question.id,
    topic: question.topic,
  })),
  stopConditions: [
    {
      code: "required-topics-covered",
      guidance: "Stop after every required question is answered or declined.",
    },
    {
      code: "candidate-continues-without-interview",
      guidance:
        "Stop immediately when the candidate chooses to continue without the interview.",
    },
    {
      code: "human-assistance-requested",
      guidance:
        "Pause question planning when the candidate requests human assistance.",
    },
  ],
  version: interviewGuideVersion,
};

export function getInterviewQuestion(
  index: number,
  answers: ReadonlyArray<InterviewAnswer>,
): InterviewQuestion | null {
  const question = questions[index];

  if (!question) {
    return null;
  }

  const planningInputs = getInterviewPlanningInputs(index, answers);
  const groundedSelection = findApprovedAdaptation(question.id, planningInputs);
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
            questionId: groundedSelection.input.questionId,
            responseRevision: groundedSelection.input.responseRevision,
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

export function getInterviewPlanningInputs(
  index: number,
  answers: ReadonlyArray<InterviewAnswer>,
): ReadonlyArray<InterviewPlanningInput> {
  const question = questions[index];
  if (!question) return [];

  const priorQuestionIds = new Set(
    questions.slice(0, index).map((candidate) => candidate.id),
  );
  const answerInputs: InterviewPlanningInput[] = [];
  for (const answer of answers) {
    if (!priorQuestionIds.has(answer.questionId)) continue;
    if (answer.planningPermission === "declined") {
      answerInputs.push({
        kind: "explicit-unknown",
        questionId: answer.questionId,
        responseRevision: answer.revision,
        topic: answer.topic,
      });
      continue;
    }

    answerInputs.push({
      kind: "candidate-confirmed-fact",
      questionId: answer.questionId,
      responseRevision: answer.revision,
      sourceText: answer.sourceText,
      topic: answer.topic,
    });
  }

  return [
    ...answerInputs,
    {
      kind: "uncovered-required-topic",
      questionId: question.id,
      topic: question.topic,
    },
  ];
}

function findApprovedAdaptation(
  questionId: string,
  planningInputs: ReadonlyArray<InterviewPlanningInput>,
): {
  adaptation: ApprovedAdaptation;
  input: Extract<InterviewPlanningInput, { kind: "candidate-confirmed-fact" }>;
} | null {
  const adaptations = approvedAdaptations[questionId] ?? [];
  const eligibleInputs = planningInputs.filter(
    (
      input,
    ): input is Extract<
      InterviewPlanningInput,
      { kind: "candidate-confirmed-fact" }
    > => input.kind === "candidate-confirmed-fact",
  );

  for (const adaptation of adaptations) {
    for (const input of eligibleInputs.toReversed()) {
      const normalized = input.sourceText.toLocaleLowerCase();
      if (
        adaptation.sourceTerms.some((term) => hasWholeTerm(normalized, term))
      ) {
        return { adaptation, input };
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

export function getStructuredInterviewQuestions(): ReadonlyArray<InterviewQuestion> {
  return questions.map((_, index) => {
    const question = getInterviewQuestion(index, []);

    if (!question) {
      throw new Error(
        `Missing structured interview question at index ${index}`,
      );
    }

    return question;
  });
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
