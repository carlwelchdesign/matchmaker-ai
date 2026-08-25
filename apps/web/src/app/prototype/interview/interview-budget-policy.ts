import type { InterviewBudgetPolicy } from "@argent/domain";

export const localInterviewBudgetPolicy: InterviewBudgetPolicy = {
  featureEnabled: true,
  maxAudioMsPerExecution: 60_000,
  maxAudioMsPerSession: 300_000,
  maxEstimatedCostMicrousdPerSession: 50_000,
  maxExecutionsPerSession: 12,
  maxInputTokensPerExecution: 8_000,
  maxInputTokensPerSession: 32_000,
  maxLatencyMsPerExecution: 30_000,
  maxOutputTokensPerExecution: 2_000,
  maxOutputTokensPerSession: 8_000,
  maxSessionElapsedMs: 60 * 60 * 1000,
  maxTurnsPerSession: 8,
  providerEnabled: false,
};
