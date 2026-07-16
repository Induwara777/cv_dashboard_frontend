"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import { FilePlus2, FileText, X, Search } from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
}

/* ---------- Single-file drop zone (used for Job Spec) ---------- */

interface SingleDropZoneProps {
  label: string;
  file: UploadedFile | null;
  onFileSelected: (file: File) => void;
  onRemove: () => void;
}

function SingleDropZone({ label, file, onFileSelected, onRemove }: SingleDropZoneProps) {
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
        <span className="text-[15px] font-semibold text-slate-800">{label}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {file && (
        <>
          <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <FileText className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={2} />
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

/* ---------- Multi-file drop zone (used for Resumes / CVs) ---------- */

interface MultiDropZoneProps {
  label: string;
  files: UploadedFile[];
  onFilesSelected: (files: File[]) => void;
  onRemove: (id: string) => void;
}

function MultiDropZone({ label, files, onFilesSelected, onRemove }: MultiDropZoneProps) {
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
        <span className="text-[15px] font-semibold text-slate-800">{label}</span>
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
                <FileText className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={2} />
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

/* ---------- Main component ---------- */

export default function DocumentUploader() {
  const [resumes, setResumes] = useState<UploadedFile[]>([]);
  const [jobSpec, setJobSpec] = useState<UploadedFile | null>(null);

  const canAnalyze = resumes.length > 0 && Boolean(jobSpec);

  const addResumes = (files: File[]) => {
    const next = files.map((f) => ({ id: crypto.randomUUID(), name: f.name }));
    setResumes((prev) => [...prev, ...next]);
  };

  const removeResume = (id: string) => {
    setResumes((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    // Wire this up to your analysis logic / API call.
    console.log("Analyzing candidates with:", { resumes, jobSpec });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-sm rounded-[28px] bg-white p-7 shadow-xl shadow-slate-300/40 ring-1 ring-slate-200">
        <h2 className="mb-4 text-xs font-bold tracking-[0.14em] text-slate-800">
          DOCUMENTS
        </h2>

        <div className="space-y-2">
          <MultiDropZone
            label="Drop Resumes (PDF)"
            files={resumes}
            onFilesSelected={addResumes}
            onRemove={removeResume}
          />

          <SingleDropZone
            label="Target Job Spec (PDF)"
            file={jobSpec}
            onFileSelected={(f) => setJobSpec({ id: crypto.randomUUID(), name: f.name })}
            onRemove={() => setJobSpec(null)}
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={[
            "mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5",
            "text-[15px] font-bold text-white transition-opacity",
            "bg-gradient-to-b from-rose-600 to-rose-800 shadow-lg shadow-rose-900/20",
            canAnalyze ? "opacity-100 hover:opacity-90" : "opacity-50 cursor-not-allowed",
          ].join(" ")}
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
          Analyze Candidates
        </button>
      </div>
    </div>
  );
}
