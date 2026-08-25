export type InterviewAssistanceState =
  | "clarification"
  | "closed"
  | "human-overview"
  | "human-preview"
  | "human-staged"
  | "menu"
  | "privacy";

export type InterviewAssistanceAction =
  | "back-to-menu"
  | "close"
  | "keep-answering"
  | "open"
  | "preview-human-request"
  | "show-clarification"
  | "show-human-overview"
  | "show-privacy"
  | "stage-human-request";

export function transitionInterviewAssistance(
  state: InterviewAssistanceState,
  action: InterviewAssistanceAction,
): InterviewAssistanceState {
  if (action === "close" || action === "keep-answering") return "closed";
  if (action === "open") return state === "closed" ? "menu" : "closed";
  if (action === "back-to-menu") return "menu";
  if (action === "show-clarification") return "clarification";
  if (action === "show-privacy") return "privacy";
  if (action === "show-human-overview") return "human-overview";
  if (action === "preview-human-request") {
    return state === "human-overview" ? "human-preview" : state;
  }
  if (action === "stage-human-request") {
    return state === "human-preview" ? "human-staged" : state;
  }

  return state;
}
