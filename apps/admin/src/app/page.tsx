import AdminHome from "./admin-home";
import { buildSyntheticCandidateDashboardPageData } from "./candidate-dashboard-data";
import { buildSyntheticCandidateInspectionPageData } from "./candidate-inspection-data";

export default function AdminPage() {
  return (
    <AdminHome
      candidateDashboardData={buildSyntheticCandidateDashboardPageData()}
      candidateInspectionData={buildSyntheticCandidateInspectionPageData()}
    />
  );
}
