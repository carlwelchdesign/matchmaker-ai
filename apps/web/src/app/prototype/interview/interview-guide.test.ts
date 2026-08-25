import { describe, expect, it } from "vitest";

import {
  createFieldProposal,
  getInterviewQuestion,
  getInterviewQuestionCount,
  interviewGuideVersion,
} from "./interview-guide";

describe("adaptive interview guide", () => {
  it("keeps a fixed, versioned comparable core", () => {
    expect(interviewGuideVersion).toBe("argent-text-guide-2026-08-24");
    expect(getInterviewQuestionCount()).toBe(4);
    expect(getInterviewQuestion(0, [])?.topic).toBe("relationship-intention");
    expect(getInterviewQuestion(4, [])).toBeNull();
  });

  it("grounds the pace follow-up in the candidate's prior wording", () => {
    const question = getInterviewQuestion(1, [
      {
        questionId: "intentions",
        sourceText: "I would prefer something intentional and unhurried.",
        topic: "relationship-intention",
      },
    ]);

    expect(question?.prompt).toContain(
      "You described an intentional beginning",
    );
    expect(question?.prompt).toContain("first few weeks");
  });

  it("does not infer beyond the reviewed source when proposing a field", () => {
    const question = getInterviewQuestion(0, []);
    expect(question).not.toBeNull();

    const proposal = createFieldProposal(
      question!,
      "  Mutual curiosity and a generous sense of humor.  ",
    );

    expect(proposal.value).toBe(
      "Mutual curiosity and a generous sense of humor.",
    );
    expect(proposal.sourceText).toBe(proposal.value);
    expect(proposal.fieldLabel).toBe("Relationship intentions");
  });
});
