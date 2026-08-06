"use client";

import { useCallback, useState } from "react";
import DocumentUploader from "@/component/file_uploader";
import CandidateLeaderboard from "@/component/CandidateLeaderBoard";
import CandidateStatsCards from "@/component/Candidatestatscards";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const pathname = usePathname();

  const handleAnalysisComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Full-width header with light background */}
      <div className="border-b border-blue-300 bg-blue-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side - "CV Analyzing Dashboard" title */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-800">
              CV Analyzing Dashboard
            </h1>
          </div>
          
          {/* Right side - Navigation links with light background */}
          <div className="flex items-center gap-6 bg-white shadow-sm rounded-lg px-4 py-2">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                pathname === "/" 
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/directory" 
              className={`text-sm font-medium transition-colors ${
                pathname === "/directory" 
                  ? "text-blue-600 border-b-2 border-blue-600 pb-1" 
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Candidate Directory
            </Link>
          </div>
        </div>
      </div>

      {/* Main content - flex row with left and right sections */}
      <div className="flex flex-col md:flex-row">
        {/* LEFT SIDE - Document Upload */}
        <aside className="w-full md:w-[30%] p-6">
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