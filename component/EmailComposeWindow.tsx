"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Candidate } from "./CandidateLeaderBoard";

/**
 * EmailComposeWindow
 * -------------------
 * Renders at /candidate/[id]/email — reached by clicking "Accept" on
 * CandidateDetailWindow. Lets the reviewer edit an interview-invitation
 * email before it goes out. Nothing is marked "accepted" until Send Email
 * is actually clicked.
 *
 * AUTOSAVE:
 *   Subject/body edits are written into sessionStorage on every change
 *   (`email-draft:<id>`), so navigating away and back keeps the draft.
 *
 * ON SEND (temporary, until backend/email service is connected):
 *   - candidate:<id>            → status set to "accepted"
 *   - candidate:<id>:notice     → "email-sent" (one-shot banner flag read
 *                                  by CandidateDetailWindow)
 *   - email-draft:<id>          → cleared
 *   Then navigates back to /candidate/<id>.
 *
 * SWAP-IN POINT FOR REAL BACKEND:
 *   Replace the setTimeout "fake send" in handleSend with something like:
 *
 *     await fetch(`/api/candidates/${id}/send-invitation`, {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify({ subject, body }),
 *     });
 *
 *   and let the API be the one that flips the candidate's status server-side.
 */

const SIGNATURE =
  "Best regards,\nInduwara Dilshan,\nSenior HR Manager,\nCitizens Development Business Finance PLC.\ninduwara@gmail.com";

function buildDefaultSubject(): string {
  return "Interview Invitation – [Job Title]";
}

function buildDefaultBody(candidateName: string): string {
  return `Dear ${candidateName},

Thank you for applying for the [Job Title] position at Citizens Development Business Finance PLC. We are pleased to invite you to the first interview stage.

Interview details:
- Date: [Date]
- Time: [Time]
- Format: [Online/In-person/Phone]
- Location/Link: [Address or meeting link]

Please reply to confirm your availability. If you need to reschedule, let us know as soon as possible.

We look forward to speaking with you.

${SIGNATURE}`;
}

function getIdFromPath(): string | null {
  // Route is /candidate/[id]/email — id is the second-to-last segment.
  const segments = window.location.pathname.split("/").filter(Boolean);
  const emailIdx = segments.indexOf("email");
  if (emailIdx > 0) return segments[emailIdx - 1];
  return new URLSearchParams(window.location.search).get("id");
}

export default function EmailComposeWindow() {
  const router = useRouter();

  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const id = getIdFromPath();
    setCandidateId(id);

    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const raw = sessionStorage.getItem(`candidate:${id}`);
      const data: Candidate | null = raw ? JSON.parse(raw) : null;
      setCandidate(data);

      // Resume a draft if one exists, otherwise start from the template.
      const draftRaw = sessionStorage.getItem(`email-draft:${id}`);
      const draft = draftRaw ? JSON.parse(draftRaw) : null;

      setToEmail(draft?.toEmail ?? data?.email ?? "");
      setSubject(draft?.subject ?? buildDefaultSubject());
      setBody(draft?.body ?? buildDefaultBody(data?.name ?? "[Candidate Name]"));
    } catch (err) {
      console.error("Failed to load candidate/draft from sessionStorage", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Autosave on every edit.
  useEffect(() => {
    if (!candidateId || loading) return;
    try {
      sessionStorage.setItem(
        `email-draft:${candidateId}`,
        JSON.stringify({ toEmail, subject, body })
      );
    } catch (err) {
      console.error("Failed to autosave email draft", err);
    }
  }, [toEmail, subject, body, candidateId, loading]);

  const handleCancel = () => {
    if (!candidateId) return;
    router.push(`/candidate/${candidateId}`);
  };

  const handleSend = () => {
    if (!candidateId || !candidate) return;
    if (!toEmail.trim()) return; // require a recipient before sending
    setSending(true);

    // TODO: replace with a real API call — see comment block above.
    // Faked delay so the "Sending…" state is visible.
    setTimeout(() => {
      try {
        const updated: Candidate = { ...candidate, status: "accepted" };
        sessionStorage.setItem(`candidate:${candidateId}`, JSON.stringify(updated));
        sessionStorage.setItem(`candidate:${candidateId}:notice`, "email-sent");
        sessionStorage.removeItem(`email-draft:${candidateId}`);
      } catch (err) {
        console.error("Failed to finalize email send", err);
      }

      router.push(`/candidate/${candidateId}`);
    }, 500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  if (!candidate || !candidateId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center text-sm text-slate-400">
        <div>No candidate data found for this page.</div>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          ← Back to Rankings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto mb-4 w-full max-w-2xl">
        <Link
          href={`/candidate/${candidateId}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Back to Analysis
        </Link>
      </div>

      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-300/40 ring-1 ring-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-7 py-5">
          <h2 className="text-sm font-bold tracking-[0.14em] text-white">
            INTERVIEW INVITATION EMAIL
          </h2>
        </div>

        <div className="px-7 py-6">
          <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-500">
            TO
          </label>
          <input
            type="email"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
            placeholder="candidate@email.com"
            className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white"
          />

          <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-500">
            SUBJECT
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white"
          />

          <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-500">
            BODY
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={16}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none focus:border-blue-400 focus:bg-white"
          />
          <p className="mt-2 text-xs text-slate-400">
            Edits save automatically. Fill in the bracketed placeholders (job
            title, date, time, format, location) before sending.
          </p>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={sending}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !toEmail.trim()}
              title={!toEmail.trim() ? "Enter a recipient email first" : undefined}
              className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
