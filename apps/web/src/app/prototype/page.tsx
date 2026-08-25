import { ConceptPrototype } from "../prototype";
import { isCandidateInterviewingEnabled } from "../../flag-evaluation";

export default async function PrototypePage() {
  const interviewEnabled = await isCandidateInterviewingEnabled();

  return <ConceptPrototype interviewEnabled={interviewEnabled} />;
}
