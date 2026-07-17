import CandidateDetailWindow from "@/component/CandidateDetailWindow";

export default function CandidatePage() {
  // CandidateDetailWindow reads the id straight from the browser URL
  // (window.location) on the client, so no props need passing here.
  return <CandidateDetailWindow />;
}
