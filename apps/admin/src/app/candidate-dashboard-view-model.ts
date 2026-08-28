export type CandidateDashboardMetricGroup =
  | "Candidate supply"
  | "Discovery coverage"
  | "Intake operations"
  | "Introduction outcomes";

export interface CandidateDashboardMetricView {
  readonly calculationLabel: string;
  readonly description: string;
  readonly displayValue: string;
  readonly freshnessLabel: string;
  readonly group: CandidateDashboardMetricGroup;
  readonly key: string;
  readonly label: string;
  readonly missingDataLabel: string;
  readonly sourceAsOfLabel: string;
  readonly sourceLabel: string;
}

export interface CandidateDashboardInterviewModeView {
  readonly attributionNote: string | null;
  readonly label: string;
  readonly metrics: readonly CandidateDashboardMetricView[];
  readonly mode: string;
}

export interface CandidateDashboardPageData {
  readonly accessContext: {
    readonly audience: "Internal staff";
    readonly cohortLabel: string;
    readonly generatedAtLabel: string;
    readonly role: "Matchmaker";
    readonly windowLabel: string;
  };
  readonly interviewModeBreakdown: readonly CandidateDashboardInterviewModeView[];
  readonly interviewModeMinimumCohortSize: number;
  readonly interviewModeSourceContext: {
    readonly freshnessLabel: string;
    readonly sourceAsOfLabel: string;
    readonly sourceLabel: string;
  };
  readonly metrics: readonly CandidateDashboardMetricView[];
  readonly separationNotice: string;
}

export const candidateDashboardGroups = [
  "Candidate supply",
  "Intake operations",
  "Discovery coverage",
  "Introduction outcomes",
] as const satisfies readonly CandidateDashboardMetricGroup[];
