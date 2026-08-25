import { vercelAdapter } from "@flags-sdk/vercel";
import { flag } from "flags/next";

const candidateInterviewDescription =
  "Gates the adaptive candidate interview and its structured fallback.";

export const candidateInterviewing = process.env.FLAGS
  ? flag<boolean>({
      key: "candidate-interviewing",
      adapter: vercelAdapter(),
      description: candidateInterviewDescription,
      options: [
        { value: false, label: "Off" },
        { value: true, label: "On" },
      ],
    })
  : flag<boolean>({
      key: "candidate-interviewing",
      decide: () => process.env.NODE_ENV === "development",
      description: candidateInterviewDescription,
      options: [
        { value: false, label: "Off" },
        { value: true, label: "On" },
      ],
    });
