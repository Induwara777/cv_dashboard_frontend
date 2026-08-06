"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Adjust this if you already have a shared API base constant elsewhere
// (e.g. a lib/api.ts) — reuse that instead of duplicating it here.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface PersonalDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
}

export default function CandidateDirectory() {
  const [candidates, setCandidates] = useState<PersonalDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/candidates/personal-details`);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data: PersonalDetail[] = await res.json();
        if (!cancelled) setCandidates(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load candidates."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Full-width header with light background - matching dashboard */}
      <div className="border-b border-blue-300 bg-blue-100 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Left side - "Candidate Directory" title */}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-800">
              Candidate Directory
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

      <div className="p-6">
        {loading && (
          <div className="rounded-md border border-slate-300 bg-white p-6 text-center text-slate-500">
            Loading candidates...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && candidates.length === 0 && (
          <div className="rounded-md border border-slate-300 bg-white p-6 text-center text-slate-500">
            No candidates found.
          </div>
        )}

        {!loading && !error && candidates.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* CANDIDATE DETAILS header */}
            <div className="bg-slate-900 px-6 py-4">
              <h2 className="text-sm font-bold tracking-[0.14em] text-white">
                CANDIDATE DETAILS
              </h2>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((c) => (
                  <tr 
                    key={c.id} 
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {c.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.phone || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {c.location || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}