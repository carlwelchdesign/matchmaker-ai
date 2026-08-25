import { getCandidateInterviewingFlagDecision } from "../../../../flag-evaluation";

export const dynamic = "force-dynamic";

export async function GET() {
  const decision = await getCandidateInterviewingFlagDecision();

  return Response.json(decision, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
