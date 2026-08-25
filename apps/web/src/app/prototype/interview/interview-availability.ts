import type { InterviewAnswer } from "./interview-guide";
import {
  createInterviewFallbackTransfer,
  type InterviewFallbackTransfer,
} from "./structured-interview-state";

export type InterviewAvailabilityTransition =
  | { action: "continue" }
  | {
      action: "structured-fallback";
      transfer: InterviewFallbackTransfer;
    };

export function resolveInterviewAvailabilityTransition({
  answers,
  interviewEnabled,
  previouslyEnabled,
}: Readonly<{
  answers: readonly InterviewAnswer[];
  interviewEnabled: boolean;
  previouslyEnabled: boolean;
}>): InterviewAvailabilityTransition {
  if (!previouslyEnabled || interviewEnabled) return { action: "continue" };

  return {
    action: "structured-fallback",
    transfer: createInterviewFallbackTransfer(answers, "feature-kill-switch"),
  };
}
