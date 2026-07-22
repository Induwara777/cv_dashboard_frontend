"use client";

import { useEffect, useState } from "react";

interface Stats {
  total: number;
  passed: number;
  failed: number;
}

interface CandidateStatsCardsProps {
  refreshKey?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function CandidateStatsCards({ refreshKey }: CandidateStatsCardsProps) {
  const [stats, setStats] = useState<Stats>({ total: 0, passed: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/candidates`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          const total = data.length;
          const passed = data.filter((c: any) => c.validation_status === "CORRECT").length;
          const failed = data.filter((c: any) => c.validation_status === "INCORRECT").length;
          setStats({ total, passed, failed });
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-300/40 ring-1 ring-slate-200">
      {/* Header */}
      <div className="bg-slate-900 px-7 py-5">
        <h2 className="text-sm font-bold tracking-[0.14em] text-white">
          CV COUNTS
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="px-7 py-6">
        {loading ? (
          <div className="flex justify-center py-4 text-sm text-slate-400">
            Loading stats...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {/* Total Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
              <div className="text-3xl font-extrabold text-slate-800">
                {stats.total}
              </div>
              <div className="mt-1 text-xs font-bold tracking-wide text-slate-500">
                TOTAL
              </div>
            </div>

            {/* Passed Card */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-center">
              <div className="text-3xl font-extrabold text-emerald-700">
                {stats.passed}
              </div>
              <div className="mt-1 text-xs font-bold tracking-wide text-emerald-600">
                PASSED
              </div>
            </div>

            {/* Failed Card */}
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-center">
              <div className="text-3xl font-extrabold text-red-700">
                {stats.failed}
              </div>
              <div className="mt-1 text-xs font-bold tracking-wide text-red-600">
                FAILED
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}