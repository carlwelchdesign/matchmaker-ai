export const prototypeCampaign = {
  audience: "Adults exploring a high-touch, human-led introduction service.",
  isSynthetic: true,
  location: "Santa Barbara County",
  name: "First controlled campaign",
  regionBoundary:
    "Santa Barbara County is Argent's first test ground, not a boundary on who Argent may serve.",
  status: "Concept review only",
} as const;

export const prototypeAdminReadiness = [
  {
    detail: "One fictional campaign is available for layout review only.",
    label: "Campaigns",
    value: "01",
  },
  {
    detail: "Example records are visible only in this local concept.",
    label: "Review queue",
    value: "03",
  },
  {
    detail: "No payment provider or price configuration is connected.",
    label: "Pricing",
    value: "—",
  },
] as const;

export const prototypeOperations = [
  {
    detail:
      "Stripe configuration will be an admin responsibility in the production product; it is intentionally unavailable here.",
    title: "Pricing is not connected",
  },
  {
    detail:
      "This screen does not authenticate anyone or grant a real operational role.",
    title: "Access is not connected",
  },
  {
    detail:
      "No activity is recorded, exported, or retained by this local prototype.",
    title: "Audit history is not connected",
  },
] as const;

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
