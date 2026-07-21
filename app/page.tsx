"use client";

import { useCallback, useState } from "react";
import DocumentUploader from "@/component/file_uploader";
import CandidateLeaderboard from "@/component/CandidateLeaderBoard";
import OllamaStatusIndicator from "@/component/Ollamastatusindicator";
import CandidateStatsCards from "@/component/Candidatestatscards "

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAnalysisComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Full-width header with border */}
      <div className="border-b border-slate-300 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800">
            AI Screening Dashboard
          </h1>
          <OllamaStatusIndicator />
        </div>
      </div>

      {/* Main content - flex row with left and right sections */}
      <div className="flex flex-col md:flex-row">
        {/* LEFT SIDE - Document Upload */}
        <aside className="w-full md:w-1/3 p-6">
          <DocumentUploader onAnalysisComplete={handleAnalysisComplete} />
        </aside>

        {/* RIGHT SIDE - Dashboard Content */}
        <main className="w-full md:flex-1 p-6">
          {/* Stats Cards - now with "CV COUNTS" header */}
          <div>
            <CandidateStatsCards refreshKey={refreshKey} />
          </div>
          
          {/* Leaderboard - below stats cards */}
          <div className="mt-6">
            <CandidateLeaderboard refreshKey={refreshKey} />
          </div>
        </main>
      </div>
    </div>
  );
}