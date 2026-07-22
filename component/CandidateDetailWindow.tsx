"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, MapPin, ShieldCheck, ShieldAlert, ShieldQuestion } from "lucide-react";
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
 *   - Reject is immediate: status flips to "rejected" right away via
 *     POST /candidates/:id/decision. A rejected candidate can still be
 *     Accepted later.
 *   - Accept is NOT immediate: it navigates to /candidate/[id]/email, where
 *     the reviewer edits an interview-invitation email and sends it. Status
 *     only becomes "accepted" once EmailComposeWindow posts that decision
 *     after a successful send. Once accepted, both buttons lock (no further
 *     changes), since the email has already gone out.
 *
 * DATA FLOW:
 *   This page fetches its own data from GET /candidates/:id on mount.
 *   EmailComposeWindow is expected to pass a notice flag back via the
 *   `notice` query param (?notice=invitation-sent or ?notice=rejection-sent)
 *   when it redirects here, since there's no shared client state between
 *   the two routes.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

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

function getNoticeFromQuery(): string | null {
  return new URLSearchParams(window.location.search).get("notice");
}

// validation_status comes from score2CLOUD.py's result_val() check during
// scoring — it reflects whether the LLM scoring output passed validation,
// not whether the CV text was successfully PII-masked.
function getValidationMeta(validationStatus?: string) {
  if (validationStatus === "CORRECT") {
    return {
      label: "Validated",
      icon: ShieldCheck,
      className: "border-emerald-300 bg-emerald-50 text-emerald-700",
    };
  }
  if (validationStatus === "INCORRECT") {
    return {
      label: "Validation Failed",
      icon: ShieldAlert,
      className: "border-red-300 bg-red-50 text-red-700",
    };
  }
  if (validationStatus === "SKIPPED VALIDATION PROCESS") {
    return {
      label: "Validation Skipped",
      icon: ShieldQuestion,
      className: "border-amber-300 bg-amber-50 text-amber-700",
    };
  }
  return {
    label: "Validation Unknown",
    icon: ShieldQuestion,
    className: "border-slate-300 bg-slate-50 text-slate-500",
  };
}

export default function CandidateDetailWindow() {
  const router = useRouter();

  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [status, setStatus] = useState<NonNullable<Candidate["status"]>>("pending");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  useEffect(() => {
    const id = getIdFromPath();
    setCandidateId(id);
    setEmailSentNotice(getNoticeFromQuery());

    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCandidate(candidateId: string) {
      try {
        const res = await fetch(`${API_BASE_URL}/candidates/${candidateId}`);
        if (res.status === 404) {
          if (!cancelled) setCandidate(null);
          return;
        }
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data: Candidate = await res.json();
        if (!cancelled) {
          setCandidate(data);
          setStatus(data.status ?? "pending");
        }
      } catch (err) {
        console.error("Failed to load candidate", err);
        if (!cancelled) setLoadError("Couldn't load this candidate. Is the API running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCandidate(id);
    return () => {
      cancelled = true;
    };
  }, []);

  // Reject now goes through the same compose-then-send flow as Accept, so a
  // rejection email can be reviewed/edited before the decision is recorded.
  // Status only becomes "rejected" once EmailComposeWindow posts that
  // decision after Send is clicked — same pattern as handleAccept below.
  // Still reversible: a rejected candidate can be Accepted later.
  const handleReject = () => {
    if (!candidateId) return;
    router.push(`/candidate/${candidateId}/email?type=reject`);
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

  if (loadError || !candidate) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center text-sm text-slate-400">
        <div>{loadError ?? "No candidate found for this page."}</div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          ← Back to Rankings
        </Link>
      </div>
    );
  }

  const { name, score, scores, summary } = candidate;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto mb-4 w-full max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Back to Rankings
        </Link>
      </div>

      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-300/40 ring-1 ring-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-7 py-5">
          <h2 className="text-sm font-bold tracking-[0.14em] text-white">
            CANDIDATE ANALYSIS
          </h2>
        </div>

        <div className="px-7 py-6">
          {/* Identity + score */}
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                {name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
              <div>
                <div className="text-lg font-bold text-slate-800">{name}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-blue-700">{score}</div>
              <div className="text-xs text-slate-400">/ 100</div>
            </div>
          </div>

          {/* Email · Location · Validation · Accept/Reject — one line */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                {candidate.email ?? "No email found"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                {candidate.location ?? "No location found"}
              </span>
              {(() => {
                const v = getValidationMeta(candidate.validation_status);
                const VIcon = v.icon;
                return (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${v.className}`}
                  >
                    <VIcon className="h-3.5 w-3.5" strokeWidth={2} />
                    {v.label}
                  </span>
                );
              })()}
            </div>

            <div className="flex shrink-0 gap-2">
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

          {/* Status / notice banners */}
          {emailSentNotice === "invitation-sent" && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              ✅ Email successfully sent. {name} has been marked as Approved.
            </div>
          )}

          {emailSentNotice === "rejection-sent" && (
            <div className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
              ✅ Rejection email sent. {name} has been marked as Not Approved.
            </div>
          )}

          {emailSentNotice !== "invitation-sent" && isLocked && (
            <div className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Approved — interview email already sent. This decision is locked.
            </div>
          )}

          {emailSentNotice !== "rejection-sent" && status === "rejected" && (
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

          {summary && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="mb-1.5 text-[11px] font-bold tracking-wide text-slate-500">
                SUMMARY OF CANDIDATE
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{summary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}