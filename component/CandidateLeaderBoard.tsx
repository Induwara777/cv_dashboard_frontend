"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export interface CandidateScores {
  education: number; // out of 15
  experience: number; // out of 40
  tech: number; // out of 35
  softSkills: number; // out of 5
  impact: number; // out of 5
}

export interface Candidate {
  id: string;
  rank: number;
  name: string; // derived from the CV filename on the backend — never a real extracted name
  score: number; // out of 100
  status?: "pending" | "accepted" | "rejected";
  experience: number | null; // total years, derived from parsed CV date ranges (year + month)
  skill_match: number | null; // 0-100, computed from skill + tech skill scores

  // Everything below is only present on the detail endpoint
  // (GET /candidates/:id), not the leaderboard list (GET /candidates) —
  // see db.py's get_candidate_details() vs getting_details_from_db().
  scores?: CandidateScores;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  validation_status?: string;
  summary?: string | null;
}

interface CandidateLeaderboardProps {
  onViewAnalysis?: (candidate: Candidate) => void;
  /**
   * Bump this (e.g. refreshKey + 1) from the parent whenever new analysis
   * results have landed on the backend — after a successful /analyze call,
   * for example. This component has no other way of knowing new data
   * exists, since its own fetch only runs once on mount otherwise.
   */
  refreshKey?: number;
}

export default function CandidateLeaderboard({
  onViewAnalysis,
  refreshKey,
}: CandidateLeaderboardProps) {
  const router = useRouter();

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Filter bar state ----
  // minScore: text so the input can be empty while typing; parsed to a
  // number (defaulting to 0) only when actually filtering.
  const [minScoreInput, setMinScoreInput] = useState("");
  // showCount: text input for number of candidates to show
  const [showCountInput, setShowCountInput] = useState("10");

  // ---- Clear-data state ----
  // Two-step confirm (not a native confirm() dialog) so it fits the app's
  // own styling instead of a jarring browser popup.
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const loadCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/candidates`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data: Candidate[] = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error("Failed to load candidates", err);
      setError("Couldn't load candidates. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
    // Refetch whenever refreshKey changes (e.g. after a new /analyze run
    // completes), in addition to the initial mount fetch.
  }, [refreshKey]);

  const handleClearData = async () => {
    setClearing(true);
    setClearError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/clear-data`, { method: "POST" });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      setConfirmingClear(false);
      await loadCandidates(); // refresh the (now empty) list in place
    } catch (err) {
      console.error("Failed to clear candidate data", err);
      setClearError("Couldn't clear data. Is the API running?");
    } finally {
      setClearing(false);
    }
  };

  // Maps a decision status to its display label + badge styling.
  const getStatusMeta = (status: NonNullable<Candidate["status"]>) => {
    if (status === "accepted") {
      return { label: "Approved", className: "border-emerald-300 bg-emerald-50 text-emerald-700" };
    }
    if (status === "rejected") {
      return { label: "Not Approved", className: "border-red-300 bg-red-50 text-red-700" };
    }
    return { label: "Not Yet", className: "border-slate-300 bg-slate-50 text-slate-500" };
  };

  // Score badge color function
  const getScoreStyle = (score: number) => {
    if (score >= 85) {
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
    }
    if (score >= 70) {
      return "border-blue-300 bg-blue-50 text-blue-700";
    }
    if (score >= 50) {
      return "border-amber-300 bg-amber-50 text-amber-700";
    }
    return "border-red-300 bg-red-50 text-red-700";
  };

  // Navigates to the candidate's full analysis page. The detail page fetches
  // its own data from /candidates/:id, so nothing needs to be stashed here
  // anymore.
  const handleViewAnalysis = (candidate: Candidate) => {
    router.push(`/candidate/${candidate.id}`);
    onViewAnalysis?.(candidate);
  };

  // Parsed min-score threshold. Empty input means "no minimum" (0).
  const minScore = minScoreInput.trim() === "" ? 0 : Number(minScoreInput);
  
  // Parse show count. If invalid or empty, default to showing all.
  const showCount = showCountInput.trim() === "" ? "all" : Number(showCountInput);
  const shouldShowAll = showCountInput.trim() === "" || isNaN(Number(showCountInput)) || showCountInput === "all";

  // Apply the score floor first, then cap the result to the selected count.
  // The list from the API already arrives ordered best-score-first (see
  // db.py's ORDER BY full_score DESC), so slicing after filtering still
  // gives the top N *of the candidates that pass the score filter* — not
  // just the top N overall.
  const filteredCandidates = candidates.filter(
    (c) => !Number.isNaN(minScore) && c.score >= minScore
  );
  const visibleCandidates = shouldShowAll
    ? filteredCandidates
    : filteredCandidates.slice(0, Math.max(0, Number(showCount)));

  return (
    <div
      className="
      w-full 
      overflow-hidden 
      rounded-[28px] 
      bg-white 
      shadow-xl 
      shadow-slate-300/40 
      ring-1 
      ring-slate-200
    "
    >
      {/* Header */}
      <div
        className="
        flex
        items-center
        justify-between
        bg-slate-900 
        px-7 
        py-5
      "
      >
        <h2
          className="
          text-sm 
          font-bold 
          tracking-[0.14em] 
          text-white
        "
        >
          CANDIDATE LEADERBOARD
        </h2>

        {candidates.length > 0 && (
          confirmingClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-red-300">
                Clear all {candidates.length} candidates?
              </span>
              <button
                type="button"
                onClick={handleClearData}
                disabled={clearing}
                className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {clearing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                {clearing ? "Clearing…" : "Yes, clear"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                disabled={clearing}
                className="rounded-full border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="flex items-center gap-1.5 rounded-full border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Clear Data
            </button>
          )
        )}
      </div>

      {clearError && (
        <div className="border-b border-red-200 bg-red-50 px-7 py-2 text-center text-xs font-semibold text-red-600">
          {clearError}
        </div>
      )}

      {/* Filter bar: MINIMUM SCO + result count */}
      <div className="flex flex-wrap items-center gap-6 border-b border-slate-200 bg-slate-50 px-7 py-3">
        {/* Min Score Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="min-score-filter" className="text-xs font-bold tracking-wide text-slate-500">
            MINIMUM SCORE :
          </label>
          <input
            id="min-score-filter"
            type="number"
            min={0}
            max={100}
            placeholder="0"
            value={minScoreInput}
            onChange={(e) => setMinScoreInput(e.target.value)}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400"
          />
        </div>

        {/* Show Count Filter - UPDATED with number type and arrows */}
        <div className="flex items-center gap-2">
          <label htmlFor="show-count-filter" className="text-xs font-bold tracking-wide text-slate-500">
            SHOW :
          </label>
          <input
            id="show-count-filter"
            type="number"
            min={1}
            placeholder="10"
            value={showCountInput}
            onChange={(e) => setShowCountInput(e.target.value)}
            className="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-400"
          />
        </div>

        <span className="ml-auto text-xs font-medium text-slate-400">
          Showing {visibleCandidates.length} of {candidates.length}
        </span>
      </div>

      {/* Column headers - Reduced gap from gap-6 to gap-2 */}
      <div
        className="
        grid 
        grid-cols-[30px_1.2fr_0.7fr_0.8fr_1fr_0.8fr_0.7fr]
        gap-2 
        border-b 
        border-slate-200 
        px-7 
        py-3 
        text-xs 
        font-bold 
        tracking-wider 
        text-slate-400
      "
      >
        <span>#</span>
        <span>CANDIDATE</span>
        <span>SCORE</span>
        <span>EXPERIENCE</span>
        <span>SKILL MATCH</span>
        <span>STATUS</span>
        <span className="text-right">ANALYSIS</span>
      </div>

      {/* Body states: loading / error / empty / rows */}
      {loading ? (
        <div className="px-7 py-10 text-center text-sm text-slate-400">Loading candidates…</div>
      ) : error ? (
        <div className="px-7 py-10 text-center text-sm text-red-500">{error}</div>
      ) : candidates.length === 0 ? (
        <div
          className="
            px-7 
            py-10 
            text-center 
            text-sm 
            text-slate-400
          "
        >
          No candidates analyzed yet.
        </div>
      ) : visibleCandidates.length === 0 ? (
        <div className="px-7 py-10 text-center text-sm text-slate-400">
          No candidates match the current filters.
        </div>
      ) : (
        <div
          className="
            divide-y 
            divide-slate-100
          "
        >
          {visibleCandidates.map((c) => (
            <div
              key={c.id}
              className="
                  grid 
                  grid-cols-[30px_1.2fr_0.7fr_0.8fr_1fr_0.8fr_0.7fr]
                  items-center 
                  gap-2 
                  px-7 
                  py-4 
                  text-sm 
                  hover:bg-slate-50
                "
            >
              {/* Rank */}
              <span
                className="
                  flex 
                  h-8 
                  w-8 
                  items-center 
                  justify-center 
                  rounded-full 
                  bg-blue-100 
                  text-sm 
                  font-semibold 
                  text-blue-700
                "
              >
                {c.rank}
              </span>

              {/* Candidate name (derived from CV filename) */}
              <span
                className="
                  font-semibold 
                  text-slate-800
                  whitespace-nowrap
                "
              >
                {c.name}
              </span>

              {/* Score badge */}
              <span
                className={`
                    inline-flex
                    w-fit
                    items-center
                    justify-center
                    rounded-full
                    border
                    px-4
                    py-1.5
                    text-sm
                    font-bold
                    ${getScoreStyle(c.score)}
                  `}
              >
                {c.score}/100
              </span>

              {/* Experience (total years) */}
              <span className="
              inline-flex
              w-fit
              whitespace-nowrap
              items-center
              justify-center
              rounded-lg
              border
              border-amber-200
              bg-amber-50
              px-3
              py-1.5
              text-sm
              font-semibold
              text-amber-800
              "
              >
                {c.experience != null ? `${c.experience}` : "—"}
              </span>

              {/* Skill match percentage */}
              <div className="flex flex-col gap-1 -translate-y-1 whitespace-nowrap">
                <span className="text-xs font-bold text-slate-800">
                  {c.skill_match != null ? `${c.skill_match}% MATCHED` : "—"}
                </span>

                {c.skill_match != null && (
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${c.skill_match}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Status badge */}
              <span
                className={`
                    inline-flex
                    w-fit
                    whitespace-nowrap
                    items-center
                    justify-center
                    rounded-full
                    border
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    ${getStatusMeta(c.status ?? "pending").className}
                  `}
              >
                {getStatusMeta(c.status ?? "pending").label}
              </span>

              {/* Analysis button */}
              <button
                type="button"
                onClick={() => handleViewAnalysis(c)}
                className="
                    justify-self-end
                    rounded-full
                    whitespace-nowrap
                    border
                    border-slate-300
                    px-4
                    py-1.5
                    text-xs
                    font-semibold
                    text-slate-700
                    transition-colors
                    hover:bg-slate-100
                  "
              >
                View Analysis
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}