export type CandidateApprovedFactFreshness = "current" | "expires-soon";

export interface CandidateInspectionOption {
  readonly id: string;
  readonly label: string;
}

export interface CandidateApprovedFactView {
  readonly candidateId: string;
  readonly factId: string;
  readonly fieldLabel: string;
  readonly freshness: CandidateApprovedFactFreshness;
  readonly permission: {
    readonly consentGrantId: string;
    readonly freshUntil: string;
    readonly retainUntil: string;
  };
  readonly provenance: {
    readonly guideVersion: string;
    readonly questionId: string;
    readonly responseRevision: number;
    readonly reviewedAt: string;
  };
  readonly topic: string;
  readonly value: string;
}

export interface CandidateInspectionView {
  readonly approvedFactCount: number;
  readonly excludedFactCount: number;
  readonly facts: readonly CandidateApprovedFactView[];
  readonly fieldStateCounts: {
    readonly disputed: number;
    readonly private: number;
    readonly unknown: number;
  };
  readonly inspectedAt: string;
  readonly matchingFactCount: number;
  readonly sourcePurpose: "matchmaker-discovery";
  readonly sourceRole: "matchmaker";
}

export interface CandidateInspectionPageData {
  readonly candidates: readonly CandidateInspectionOption[];
  readonly freshnessOptions: readonly CandidateInspectionOption[];
  readonly inspection: CandidateInspectionView;
  readonly topics: readonly CandidateInspectionOption[];
}

export interface CandidateInspectionSelection {
  readonly candidateId?: string;
  readonly freshness?: CandidateApprovedFactFreshness;
  readonly topic?: string;
}

export function filterCandidateInspection(
  inspection: CandidateInspectionView,
  selection: CandidateInspectionSelection,
): CandidateInspectionView {
  const facts = inspection.facts.filter(
    (fact) =>
      (!selection.candidateId || fact.candidateId === selection.candidateId) &&
      (!selection.freshness || fact.freshness === selection.freshness) &&
      (!selection.topic || fact.topic === selection.topic),
  );

  return {
    ...inspection,
    facts,
    matchingFactCount: facts.length,
  };
}

export function candidateInspectionFilterLabels(
  data: CandidateInspectionPageData,
  selection: CandidateInspectionSelection,
): readonly string[] {
  const labels = [
    selection.candidateId
      ? `Candidate: ${optionLabel(data.candidates, selection.candidateId, "Unknown candidate")}`
      : undefined,
    selection.topic
      ? `Topic: ${optionLabel(data.topics, selection.topic, "Unknown topic")}`
      : undefined,
    selection.freshness
      ? `Freshness: ${optionLabel(
          data.freshnessOptions,
          selection.freshness,
          "Unknown freshness",
        )}`
      : undefined,
  ].filter((label): label is string => Boolean(label));

  return labels.length > 0 ? labels : ["All approved facts"];
}

export function candidateLabel(
  candidates: readonly CandidateInspectionOption[],
  candidateId: string,
): string {
  return (
    candidates.find(({ id }) => id === candidateId)?.label ??
    "Unknown candidate"
  );
}

function optionLabel(
  options: readonly CandidateInspectionOption[],
  id: string,
  fallback: string,
): string {
  return options.find((option) => option.id === id)?.label ?? fallback;
}
