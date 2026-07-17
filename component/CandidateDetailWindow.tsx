"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Candidate } from "./CandidateLeaderBoard";

/**
 * CandidateDetailWindow
 * ----------------------
 * Renders on the page navigated to by "View Analysis" in CandidateLeaderboard.
 *
 * Route this component at: /candidate/[id] — it reads the id straight from
 * the URL path.
 *
 * DECISION FLOW:
 *   - Reject is immediate: status flips to "rejected" right away. A
 *     rejected candidate can still be Accepted later.
 *   - Accept is NOT immediate: it navigates to /candidate/[id]/email, where
 *     the reviewer edits an interview-invitation email and sends it. Status
 *     only becomes "accepted" once that email is actually sent — see
 *     EmailComposeWindow. Once accepted, both buttons lock (no further
 *     changes), since the email has already gone out.
 *
 * DATA FLOW (temporary, until backend is connected):
 *   CandidateLeaderboard stashes the clicked candidate into
 *   sessionStorage["candidate:<id>"] right before calling router.push().
 *   This page reads that on mount. EmailComposeWindow writes the "accepted"
 *   status (and a one-shot "email-sent" notice) back into the same key when
 *   the email is sent.
 *
 * SWAP-IN POINT FOR REAL BACKEND:
 *   Replace the sessionStorage read inside useEffect with:
 *
 *     const res = await fetch(`/api/candidates/${id}`);
 *     const data: Candidate = await res.json();
 *     setCandidate(data);
 *
 *   Replace the reject handler body with a real API call, e.g.:
 *
 *     await fetch(`/api/candidates/${id}/decision`, {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ decision: "rejected" }),
 *     });
 */

const SCORE_CARDS: { key: keyof NonNullable<Candidate["scores"]>; label: string; max: number }[] = [
  { key: "education", label: "Education", max: 15 },
  { key: "experience", label: "Experience", max: 40 },
  { key: "tech", label: "Tech", max: 35 },
  { key: "softSkills", label: "Soft Skills", max: 5 },
  { key: "impact", label: "Impact", max: 5 },
];

function getIdFromPath(): string | null {
  // Works whether the route is /candidate/123 or /candidate?id=123
  const path = window.location.pathname.split("/").filter(Boolean);
  const fromPath = path[path.length - 1];
  const fromQuery = new URLSearchParams(window.location.search).get("id");
  return fromQuery || fromPath || null;
}

export default function CandidateDetailWindow() {
  const router = useRouter();

  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [status, setStatus] = useState<NonNullable<Candidate["status"]>>("pending");
  const [loading, setLoading] = useState(true);
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  useEffect(() => {
    const id = getIdFromPath();
    setCandidateId(id);

    if (!id) {
      setLoading(false);
      return;
    }

    // ---- TEMP: read from sessionStorage. Swap for a fetch() later. ----
    try {
      const raw = sessionStorage.getItem(`candidate:${id}`);
      const data: Candidate | null = raw ? JSON.parse(raw) : null;
      setCandidate(data);
      setStatus(data?.status ?? "pending");
    } catch (err) {
      console.error("Failed to load candidate from sessionStorage", err);
    }

    // One-shot "email successfully sent" notice, set by EmailComposeWindow
    // right before it navigates back here. Read once, then clear it, so
    // it doesn't reappear on a later visit/refresh.
    const noticeKey = `candidate:${id}:notice`;
    if (sessionStorage.getItem(noticeKey) === "email-sent") {
      setEmailSentNotice(true);
      sessionStorage.removeItem(noticeKey);
    }

    setLoading(false);
  }, []);

  // Reject is immediate — no email involved. Can still be overridden by
  // Accept later (which is why this doesn't lock anything).
  const handleReject = () => {
    // TODO: replace with real API call — see comment block above
    if (!candidate) return;
    const updated: Candidate = { ...candidate, status: "rejected" };
    setStatus("rejected");
    setCandidate(updated);
    try {
      sessionStorage.setItem(`candidate:${candidate.id}`, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to persist candidate status", err);
    }
  };

  // Accept does NOT set status here. It hands off to the email screen —
  // status only becomes "accepted" once that email is actually sent.
  const handleAccept = () => {
    if (!candidateId) return;
    router.push(`/candidate/${candidateId}/email`);
  };

  const isLocked = status === "accepted"; // true once the email has been sent

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
        Loading candidate…
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center text-sm text-slate-400">
        <div>
          No candidate data found for this page.
          <br />
          (Expected data in sessionStorage under a "candidate:&lt;id&gt;" key)
        </div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          ← Back to Rankings
        </Link>
      </div>
    );
  }

  const { name, email, location, score, scores } = candidate;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto mb-4 w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Back to Rankings
        </Link>
      </div>

      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-300/40 ring-1 ring-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-7 py-5">
          <h2 className="text-sm font-bold tracking-[0.14em] text-white">
            CANDIDATE ANALYSIS
          </h2>
        </div>

        <div className="px-7 py-6">
          {/* Identity + score + decision buttons */}
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
              <div>
                <div className="text-lg font-bold text-slate-800">{name}</div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span>✉ {email ?? "—"}</span>
                  <span>📍 {location ?? "—"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-3xl font-extrabold text-blue-700">{score}</div>
                <div className="text-xs text-slate-400">/ 100</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={isLocked}
                  title={isLocked ? "Already approved — interview email sent" : undefined}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors ${
                    isLocked
                      ? "cursor-not-allowed bg-emerald-300"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  ✓ Accept
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isLocked || status === "rejected"}
                  title={isLocked ? "Already approved — interview email sent" : undefined}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors ${
                    isLocked || status === "rejected"
                      ? "cursor-not-allowed bg-red-300"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  ✕ Reject
                </button>
              </div>
            </div>
          </div>

          {/* Status / notice banners */}
          {emailSentNotice && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              ✅ Email successfully sent. {name} has been marked as Approved.
            </div>
          )}

          {!emailSentNotice && isLocked && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Approved — interview email already sent. This decision is locked.
            </div>
          )}

          {status === "rejected" && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
              Marked as rejected. You can still change this to Approved later.
            </div>
          )}

          <div className="my-6 border-t border-slate-200" />

          {/* Score cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {SCORE_CARDS.map((c) => (
              <div
                key={c.key}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center"
              >
                <div className="text-2xl font-extrabold text-blue-700">
                  {scores?.[c.key] ?? "–"}
                </div>
                <div className="mb-1.5 text-xs text-slate-400">/ {c.max}</div>
                <div className="text-[11px] font-bold tracking-wide text-slate-500">
                  {c.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
