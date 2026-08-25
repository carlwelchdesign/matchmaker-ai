import {
  createInterviewFallbackTransfer,
  type InterviewFallbackTransfer,
  type InterviewProgressSnapshot,
} from "./structured-interview-state";

export type InterviewAvailabilityTransition =
  | { action: "continue" }
  | {
      action: "structured-fallback";
      transfer: InterviewFallbackTransfer;
    };

export function resolveInterviewAvailabilityTransition({
  interviewEnabled,
  progress,
  previouslyEnabled,
}: Readonly<{
  interviewEnabled: boolean;
  progress: InterviewProgressSnapshot;
  previouslyEnabled: boolean;
}>): InterviewAvailabilityTransition {
  if (!previouslyEnabled || interviewEnabled) return { action: "continue" };

  return {
    action: "structured-fallback",
    transfer: createInterviewFallbackTransfer(progress, "feature-kill-switch"),
  };
}
