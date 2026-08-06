"use client";

import { useEffect, useRef, useState, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { FilePlus2, FileText, X, Search, Check, Loader2 } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  file: File;
}

/* ---------- Single-file drop zone (used for Job Spec) ---------- */

interface SingleDropZoneProps {
  label: string;
  file: UploadedFile | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
  accept?: string;
}

function SingleDropZone({
  label,
  file,
  onFileSelected,
  onRemove,
  accept = "application/pdf",
}: SingleDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const dropped = e.dataTransfer.files?.[0];

    if (dropped) onFileSelected(dropped);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files?.[0];

    if (chosen) onFileSelected(chosen);

    e.target.value = "";
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={[
          "w-full flex flex-col items-center justify-center gap-3",
          "rounded-2xl border-2 border-dashed px-6 py-8",
          "transition-colors duration-150",
          isDragOver
            ? "border-slate-400 bg-slate-100"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100",
        ].join(" ")}
      >
        <FileText className="h-7 w-7 text-slate-500" strokeWidth={1.75} />

        <span className="text-[15px] font-semibold text-slate-800">
          {label}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      {file && (
        <>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <FileText
              className="h-4 w-4 shrink-0 text-rose-400"
              strokeWidth={2}
            />

            <span className="flex-1 truncate text-sm font-medium text-slate-700">
              {file.name}
            </span>

            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${file.name}`}
              className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="mt-4 border-t border-slate-200" />
        </>
      )}
    </div>
  );
}

/* ---------- Multi-file drop zone ---------- */

interface MultiDropZoneProps {
  label: string;
  files: UploadedFile[];
  onFilesSelected: (files: File[]) => void;
  onRemove: (id: string) => void;
}

function MultiDropZone({
  label,
  files,
  onFilesSelected,
  onRemove,
}: MultiDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const dropped = Array.from(e.dataTransfer.files ?? []);

    if (dropped.length) onFilesSelected(dropped);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(e.target.files ?? []);

    if (chosen.length) onFilesSelected(chosen);

    e.target.value = "";
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={[
          "w-full flex flex-col items-center justify-center gap-3",
          "rounded-2xl border-2 border-dashed px-6 py-8",
          "transition-colors duration-150",
          isDragOver
            ? "border-slate-400 bg-slate-100"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100",
        ].join(" ")}
      >
        <FilePlus2 className="h-7 w-7 text-slate-500" strokeWidth={1.75} />

        <span className="text-[15px] font-semibold text-slate-800">
          {label}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {files.length > 0 && (
        <>
          <div className="mt-3 space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
              >
                <FileText
                  className="h-4 w-4 shrink-0 text-rose-400"
                  strokeWidth={2}
                />

                <span className="flex-1 truncate text-sm font-medium text-slate-700">
                  {file.name}
                </span>

                <button
                  type="button"
                  onClick={() => onRemove(file.id)}
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-200" />
        </>
      )}
    </div>
  );
}

/* ---------- Full-screen blurred overlay: shown while analyzing, then success/failure ---------- */

interface AnalysisOverlayProps {
  status: "analyzing" | "completed" | "error";
  progress: { current: number; total: number; currentCv: string | null } | null;
  onClose: () => void;
}

function AnalysisOverlay({ status, progress, onClose }: AnalysisOverlayProps) {
  const pct =
    progress && progress.total > 0
      ? Math.min(100, (progress.current / progress.total) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
        {status === "analyzing" && (
          <>
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-rose-600" strokeWidth={2} />

            <p className="text-base font-bold text-slate-800">
              {progress && progress.total > 0
                ? `Analyzing CV ${Math.min(progress.current + 1, progress.total)} of ${progress.total}…`
                : "Starting analysis…"}
            </p>

            {progress && progress.total > 0 && (
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-rose-600 transition-all duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            <p className="mt-3 text-xs text-slate-400">
              This can take a few minutes for larger batches — please don&apos;t close this tab.
            </p>
          </>
        )}

        {status === "completed" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-6 w-6 text-emerald-600" strokeWidth={2.5} />
            </div>

            <p className="text-base font-bold text-slate-800">Analysis complete</p>

            <p className="mt-1 text-sm text-slate-500">
              {progress && progress.total > 0
                ? `${progress.total} CV${progress.total === 1 ? "" : "s"} processed.`
                : "All done."}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              View Results
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <X className="h-6 w-6 text-rose-600" strokeWidth={2.5} />
            </div>

            <p className="text-base font-bold text-slate-800">Something went wrong</p>
            <p className="mt-1 text-sm text-slate-500">Please try again.</p>

            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */

interface DocumentUploaderProps {
  /**
   * Called once POST /analyze resolves with { status: "completed" }.
   * The parent (page.tsx) uses this to bump a refreshKey it passes into
   * CandidateLeaderboard, since this component and the leaderboard are
   * siblings with no other way to talk to each other — without this call,
   * new results only show up after a manual page refresh.
   */
  onAnalysisComplete?: () => void;
}

export default function DocumentUploader({
  onAnalysisComplete,
}: DocumentUploaderProps) {
  const [resumes, setResumes] = useState<UploadedFile[]>([]);
  const [jobSpec, setJobSpec] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<
    "idle" | "analyzing" | "completed" | "error"
  >("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentCv: string | null;
  } | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop polling if the component unmounts mid-batch.
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, []);

  const canAnalyze = resumes.length > 0 && Boolean(jobSpec);

  const addResumes = (files: File[]) => {
    const next = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
    }));

    setResumes((prev) => [...prev, ...next]);
  };

  const removeResume = (id: string) => {
    setResumes((prev) => prev.filter((file) => file.id !== id));
  };

  const pollProgress = (id: string) => {
    const tick = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/analyze/${id}/progress`
        );

        if (!res.ok) throw new Error(`Progress check failed with ${res.status}`);

        const data = await res.json();

        setProgress({
          current: data.current ?? 0,
          total: data.total ?? 0,
          currentCv: data.current_cv ?? null,
        });

        if (data.status === "completed") {
          setStatus("completed");
          onAnalysisComplete?.();
          return;
        }

        if (data.status === "error") {
          setStatus("error");
          return;
        }

        // still "processing" — check again in 2s
        pollTimeoutRef.current = setTimeout(tick, 2000);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    tick();
  };

  const handleAnalyze = async () => {
    if (!canAnalyze || !jobSpec) return;

    setStatus("analyzing");
    setProgress({ current: 0, total: resumes.length, currentCv: null });
    setOverlayVisible(true);

    try {
      const formData = new FormData();
      resumes.forEach((resume) => formData.append("resumes", resume.file));
      formData.append("job_spec", jobSpec.file);

      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Request failed with ${res.status}`);

      const data = await res.json();

      // /analyze now returns immediately once Phase 0-3 are done and the
      // slow per-CV extraction+scoring loop has started in the background.
      // We poll GET /analyze/:session_id/progress from here to find out
      // when it's actually finished.
      if (data.status === "processing" && data.session_id) {
        setSessionId(data.session_id);
        setProgress({
          current: 0,
          total: data.total ?? resumes.length,
          currentCv: null,
        });
        pollProgress(data.session_id);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <>
      {overlayVisible &&
        (status === "analyzing" || status === "completed" || status === "error") && (
          <AnalysisOverlay
            status={status}
            progress={progress}
            onClose={() => setOverlayVisible(false)}
          />
        )}

      {/* REMOVED: min-h-screen, items-center, justify-center, bg-slate-100, p-6 */}
      {/* Now it's just a card that fits in the parent layout */}
      <div className="w-full overflow-hidden rounded-[28px] bg-white shadow-xl shadow-slate-300/40 ring-1 ring-slate-200">
      {/* Header */}
      <div className="bg-slate-900 px-7 py-5">
        <h2 className="text-sm font-bold tracking-[0.14em] text-white">
          DOCUMENTS
        </h2>
      </div>

      {/* Body */}
      <div className="p-7">
        <div className="space-y-2">
          <MultiDropZone
            label="Drop Resumes (PDF)"
            files={resumes}
            onFilesSelected={addResumes}
            onRemove={removeResume}
          />

          <SingleDropZone
            label="Target Job Spec (JSON)"
            file={jobSpec}
            accept="application/json"
            onFileSelected={(file) =>
              setJobSpec({
                id: crypto.randomUUID(),
                name: file.name,
                file,
              })
            }
            onRemove={() => setJobSpec(null)}
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze || status === "analyzing"}
          className={[
            "mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3.5",
            "text-[15px] font-bold text-white transition-opacity",
            "bg-gradient-to-b from-rose-600 to-rose-800 shadow-lg shadow-rose-900/20",
            canAnalyze && status !== "analyzing"
              ? "opacity-100 hover:opacity-90"
              : "cursor-not-allowed opacity-50",
          ].join(" ")}
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
          {status === "analyzing"
            ? progress && progress.total > 0
              ? `Analyzing CV ${Math.min(progress.current + 1, progress.total)} of ${progress.total}…`
              : "Analyzing…"
            : "Analyze Candidates"}
        </button>

        {status === "analyzing" && progress && progress.total > 0 && (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-rose-600 transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(
                    100,
                    (progress.current / progress.total) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="mt-2 text-center text-xs font-medium text-slate-500">
              {progress.current} of {progress.total} CVs completed
            </p>
          </div>
        )}

        {status === "completed" && sessionId && (
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold text-emerald-600">
              Data extraction completed
            </p>
            <Link
              href="/directory"
              className="mt-1 inline-block text-sm font-semibold text-slate-700 underline hover:text-slate-900"
            >
              View Candidate Directory
            </Link>
            <br />
            <a
              href={`http://localhost:8000/download/masked/${sessionId}`}
              download
              className="mt-1 inline-block text-xs font-medium text-slate-400 underline hover:text-slate-600"
            >
              Download masked data
            </a>
            <br />
            <a
              href={`http://localhost:8000/download/details/${sessionId}`}
              download
              className="mt-1 inline-block text-xs font-medium text-slate-400 underline hover:text-slate-600"
            >
              Download final CV details
            </a>
          </div>
        )}

        {status === "error" && (
          <p className="mt-3 text-center text-sm font-semibold text-rose-600">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </div>
    </>
  );
}