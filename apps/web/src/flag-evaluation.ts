import { candidateInterviewing } from "./flags";

export async function isCandidateInterviewingEnabled() {
  try {
    return await candidateInterviewing();
  } catch {
    return false;
  }
}
