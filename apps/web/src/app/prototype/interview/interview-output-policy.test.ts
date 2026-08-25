import { describe, expect, it } from "vitest";

import {
  createFieldProposal,
  getInterviewQuestion,
  getStructuredInterviewQuestions,
  interviewGuide,
  type InterviewAnswer,
  type InterviewQuestion,
} from "./interview-guide";
import {
  assertFieldProposalOutput,
  assertInterviewQuestionOutput,
  createPolicyCompliantFieldProposal,
  getPolicyCompliantInterviewQuestion,
  getPolicyCompliantStructuredQuestions,
  validateFieldProposalOutput,
  validateInterviewQuestionOutput,
} from "./interview-output-policy";

describe("interview output policy", () => {
  it("accepts every fixed question from the versioned guide", () => {
    expect(getPolicyCompliantStructuredQuestions()).toEqual(
      getStructuredInterviewQuestions(),
    );
    for (const question of getStructuredInterviewQuestions()) {
      expect(validateInterviewQuestionOutput(question)).toEqual([]);
      expect(() => assertInterviewQuestionOutput(question)).not.toThrow();
    }
  });

  it("accepts every approved optional probe with candidate source provenance", () => {
    for (const probe of interviewGuide.approvedOptionalProbes) {
      const questionIndex = interviewGuide.requiredQuestionIds.indexOf(
        probe.questionId,
      );
      const sourceQuestionId = interviewGuide.requiredQuestionIds[0];
      const sourceMapping = interviewGuide.sourceToFieldMappings[0];
      const answers: InterviewAnswer[] = [
        {
          planningPermission: "candidate-confirmed",
          questionId: sourceQuestionId,
          revision: 1,
          sourceText: `Candidate said ${probe.sourceTerms[0]}.`,
          topic: sourceMapping.topic,
        },
      ];

      const question = getInterviewQuestion(questionIndex, answers);
      expect(question?.prompt).toBe(probe.prompt);
      expect(validateInterviewQuestionOutput(question)).toEqual([]);
    }
  });

  it("rejects a prompt outside the approved guide", () => {
    const question = getInterviewQuestion(0, []);
    expect(question).not.toBeNull();

    expect(
      validateInterviewQuestionOutput({
        ...question,
        prompt: "How wealthy are you, and should Argent admit you?",
      }),
    ).toContain("unapproved-prompt");
  });

  it("rejects hidden ranking or compatibility fields", () => {
    const question = getInterviewQuestion(0, []);
    expect(question).not.toBeNull();

    expect(
      validateInterviewQuestionOutput({
        ...question,
        compatibilityScore: 92,
        ranking: 1,
      }),
    ).toContain("unexpected-output-field");
  });

  it("accepts only exact-source field proposals on approved mappings", () => {
    const question = getInterviewQuestion(0, []) as InterviewQuestion;
    const proposal = createFieldProposal(question, "  Mutual curiosity.  ");

    expect(validateFieldProposalOutput(proposal)).toEqual([]);
    expect(() => assertFieldProposalOutput(proposal)).not.toThrow();
    expect(
      createPolicyCompliantFieldProposal(question, "  Mutual curiosity.  "),
    ).toEqual(proposal);
    expect(getPolicyCompliantInterviewQuestion(0, [])).toEqual(question);
  });

  it("rejects inferred profile values and extra decision fields", () => {
    const question = getInterviewQuestion(0, []) as InterviewQuestion;
    const proposal = createFieldProposal(question, "Mutual curiosity.");
    const violations = validateFieldProposalOutput({
      ...proposal,
      admissionDecision: "accept",
      value: "Affluent and highly compatible",
    });

    expect(violations).toContain("inferred-field-value");
    expect(violations).toContain("unexpected-output-field");
  });
});
