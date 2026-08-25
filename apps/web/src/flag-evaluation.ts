import { candidateInterviewing } from "./flags";
import {
  evaluateCandidateInterviewFlag,
  type CandidateInterviewFlagDecision,
} from "./candidate-interview-flag-policy";
import {
  evaluateCandidateInterviewRuntime,
  resolveCandidateInterviewEnvironment,
  unapprovedCandidateInterviewReleaseGates,
  type CandidateInterviewRuntimeDecision,
} from "./candidate-interview-runtime-policy";

export async function getCandidateInterviewingFlagDecision(): Promise<CandidateInterviewFlagDecision> {
  return evaluateCandidateInterviewFlag(candidateInterviewing);
}

export async function isCandidateInterviewingEnabled() {
  return (await getCandidateInterviewingRuntimeDecision()).enabled;
}

export async function getCandidateInterviewingRuntimeDecision(): Promise<CandidateInterviewRuntimeDecision> {
  const environment = resolveCandidateInterviewEnvironment({
    nodeEnvironment: process.env.NODE_ENV,
    vercelEnvironment: process.env.VERCEL_ENV,
  });

  return evaluateCandidateInterviewRuntime({
    environment,
    flagDecision: await getCandidateInterviewingFlagDecision(),
    releaseGates: unapprovedCandidateInterviewReleaseGates,
    syntheticDataOnly: environment === "development",
  });
}
