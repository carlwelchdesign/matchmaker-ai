import { candidateInterviewing } from "./flags";
import {
  evaluateCandidateInterviewFlag,
  type CandidateInterviewFlagDecision,
} from "./candidate-interview-flag-policy";

export async function getCandidateInterviewingFlagDecision(): Promise<CandidateInterviewFlagDecision> {
  return evaluateCandidateInterviewFlag(candidateInterviewing);
}

export async function isCandidateInterviewingEnabled() {
  return (await getCandidateInterviewingFlagDecision()).enabled;
}
