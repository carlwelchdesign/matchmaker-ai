import { describe, expect, it } from "vitest";

import { transitionInterviewAssistance } from "./interview-assistance-state";

describe("interview assistance state", () => {
  it("opens and closes the help menu deterministically", () => {
    expect(transitionInterviewAssistance("closed", "open")).toBe("menu");
    expect(transitionInterviewAssistance("menu", "open")).toBe("closed");
    expect(transitionInterviewAssistance("privacy", "close")).toBe("closed");
  });

  it("routes clarification and privacy back through one menu", () => {
    expect(transitionInterviewAssistance("menu", "show-clarification")).toBe(
      "clarification",
    );
    expect(transitionInterviewAssistance("clarification", "back-to-menu")).toBe(
      "menu",
    );
    expect(transitionInterviewAssistance("menu", "show-privacy")).toBe(
      "privacy",
    );
  });

  it("requires preview before a human-help request can be staged", () => {
    expect(
      transitionInterviewAssistance("human-overview", "stage-human-request"),
    ).toBe("human-overview");
    expect(
      transitionInterviewAssistance("human-overview", "preview-human-request"),
    ).toBe("human-preview");
    expect(
      transitionInterviewAssistance("human-preview", "stage-human-request"),
    ).toBe("human-staged");
    expect(
      transitionInterviewAssistance("human-staged", "keep-answering"),
    ).toBe("closed");
  });
});
