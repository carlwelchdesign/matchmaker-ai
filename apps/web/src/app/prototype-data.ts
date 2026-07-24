export const prototypeCampaign = {
  audience: "Adults exploring a high-touch, human-led introduction service.",
  isSynthetic: true,
  location: "Santa Barbara County",
  name: "First controlled campaign",
  regionBoundary:
    "Santa Barbara County is Argent's first test ground, not a boundary on who Argent may serve.",
  status: "Concept review only",
} as const;

export const prototypeApplicants = [
  {
    detail: "Introduced through a fictional local referral",
    id: "A-104",
    initials: "AV",
    name: "Aster Vale",
    state: "Ready for human review",
  },
  {
    detail: "A sample incomplete application",
    id: "A-118",
    initials: "RK",
    name: "Rowan Kent",
    state: "Needs information",
  },
  {
    detail: "A fictional waitlist scenario",
    id: "A-123",
    initials: "MI",
    name: "Mira Ives",
    state: "Waitlist review",
  },
] as const;

export const prototypeGuardrails = [
  "No information is sent or saved in this prototype.",
  "A person is never admitted, ranked, or matched automatically.",
  "Any future introduction requires independent human and participant approval.",
] as const;
