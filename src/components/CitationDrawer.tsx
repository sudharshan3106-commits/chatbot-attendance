import React from 'react';
import { X, ExternalLink, BookOpen, ShieldCheck, CheckCircle2, Bookmark } from 'lucide-react';
import { Citation } from '../types';

interface CitationDrawerProps {
  citation: Citation | null;
  onClose: () => void;
  onOpenDocument?: (docId: string) => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({
  citation,
  onClose,
  onOpenDocument,
}) => {
  if (!citation) return null;

  const scorePct = Math.round(citation.similarityScore * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Verified Grounded Source Citation
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {citation.docTitle}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Metadata badges */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Section / Topic</span>
              <span className="text-xs font-semibold text-slate-800 break-words">{citation.heading}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Official Page Number</span>
              <span className="text-xs font-bold text-indigo-700">Page {citation.page}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Document Category</span>
              <span className="text-xs font-medium uppercase tracking-wide text-slate-700 capitalize">
                {citation.category}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Retrieval Confidence</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-700">{scorePct}% match</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>

          {/* Grounding Verification Alert */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800">100% Grounded Institutional Record</p>
              <p className="text-emerald-700 mt-0.5">
                This exact paragraph was retrieved from the university repository and passed directly to the Gemini LLM prompt.
              </p>
            </div>
          </div>

          {/* Excerpt with high-contrast callout */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Document Excerpt
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Chunk ID: {citation.sectionId}</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-slate-800 text-sm leading-relaxed font-sans shadow-inner whitespace-pre-wrap">
              <span className="font-semibold text-amber-900 block mb-1">
                “{citation.heading}”
              </span>
              {citation.excerpt}
            </div>
          </div>

          {/* Security & Audit note */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Anti-Hallucination Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              CampusIQ uses strict vector thresholding and zero-temperature prompt constraints. If a query does not match institutional citations, it is classified as Unknown and escalated to departmental advisors.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
          {onOpenDocument && (
            <button
              onClick={() => {
                onOpenDocument(citation.docId);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-200 transition cursor-pointer"
            >
              <span>View Full Document</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
