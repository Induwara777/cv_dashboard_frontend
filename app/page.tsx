import DocumentUploader from "@/component/file_uploader";
import CandidateLeaderboard from "@/component/CandidateLeaderBoard";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* LEFT SIDE - Document Upload */}
      <aside className="w-1/3 p-6">
        <DocumentUploader />
      </aside>

      {/* RIGHT SIDE - Dashboard Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-slate-800">
          AI Screening Dashboard
        </h1>

        <div className="mt-6">
          <CandidateLeaderboard />
        </div>
      </main>
    </div>
  );
}