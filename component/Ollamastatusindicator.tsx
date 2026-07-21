"use client";

import { useEffect, useState } from "react";

/**
 * OllamaStatusIndicator
 * ----------------------
 * Small pill showing whether `ollama serve` is reachable, since the whole
 * pipeline (personal-data extraction, masking, CV extraction, scoring) is
 * dead in the water without it. Polls GET /health/ollama on an interval —
 * that endpoint pings Ollama's own serve address on the backend, since the
 * browser can't reach localhost:11434 on the user's machine directly (and
 * shouldn't need to, if the backend and Ollama aren't on the same host).
 *
 * States:
 *   null  -> still checking (first load, or a check in flight) — gray dot
 *   true  -> Ollama responded 200                              — green dot
 *   false -> request failed, timed out, or returned non-200     — red dot
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const POLL_INTERVAL_MS = 90_000;

export default function OllamaStatusIndicator() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      try {
        const res = await fetch(`${API_BASE_URL}/health/ollama`);
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        const data = await res.json();
        if (!cancelled) setOnline(Boolean(data.online));
      } catch (err) {
        console.error("Ollama health check failed", err);
        if (!cancelled) setOnline(false);
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const label = online === null ? "Checking…" : online ? "On" : "Off";
  const dotClassName =
    online === null ? "bg-slate-300" : online ? "bg-emerald-500" : "bg-red-500";
  const labelClassName =
    online === null ? "text-slate-400" : online ? "text-emerald-700" : "text-red-600";

  return (
    <div
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold shadow-sm"
      title={
        online === false
          ? "Ollama isn't responding. Run `ollama serve` and check OLLAMA_BASE_URL on the backend."
          : undefined
      }
    >
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClassName}`} />
      <span className="text-slate-500">Ollama Serve Engine :</span>
      <span className={labelClassName}>{label}</span>
    </div>
  );
}
