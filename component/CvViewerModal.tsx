"use client";

import { useState } from "react";
import { X, FileText, Loader2 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface CvViewerModalProps {
  candidateId: string;
}

/**
 * "View CV" button + modal. Click opens a full-screen overlay embedding
 * the candidate's PDF via GET /candidates/{candidateId}/cv, which serves
 * the file inline (no forced download — see api2.py's FileResponse call,
 * which omits `filename=` so no Content-Disposition: attachment header
 * is set).
 */
export default function CvViewerModal({ candidateId }: CvViewerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const cvUrl = `${API_BASE_URL}/candidates/${candidateId}/cv`;

  const openModal = () => {
    setIsLoading(true);
    setHasError(false);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
      >
        <FileText className="h-3.5 w-3.5" strokeWidth={2} />
        View CV
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-3">
              <h3 className="text-sm font-bold tracking-wide text-white">
                CANDIDATE CV
              </h3>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="rounded-full p-1.5 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Body */}
            <div className="relative flex-1 bg-slate-100">
              {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">Loading CV…</span>
                </div>
              )}

              {hasError && (
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-rose-600">
                  Could not load this candidate&apos;s CV.
                </div>
              )}

              <iframe
                src={cvUrl}
                title="Candidate CV"
                className="h-full w-full"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
