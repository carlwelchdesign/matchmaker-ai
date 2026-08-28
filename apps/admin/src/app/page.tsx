import AdminHome from "./admin-home";
import { buildSyntheticCandidateInspectionPageData } from "./candidate-inspection-data";

export default function AdminPage() {
  return (
    <AdminHome
      candidateInspectionData={buildSyntheticCandidateInspectionPageData()}
    />
  );
}
