import React from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { EventPlan } from '../types/event';
import {
  exportBudgetToCsv,
  exportTimelineToCsv,
  exportVendorsToCsv,
  exportExecutiveSummaryText,
  downloadFile,
} from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [downloadedState, setDownloadedState] = React.useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const markDownloaded = (key: string) => {
    setDownloadedState((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setDownloadedState((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleExportBudget = () => {
    exportBudgetToCsv(plan);
    markDownloaded('budget');
  };

  const handleExportTimeline = () => {
    exportTimelineToCsv(plan);
    markDownloaded('timeline');
  };

  const handleExportVendors = () => {
    exportVendorsToCsv(plan);
    markDownloaded('vendors');
  };

  const handleExportSummary = () => {
    const text = exportExecutiveSummaryText(plan);
    const filename = `${plan.eventDetails.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_executive_summary.md`;
    downloadFile(text, filename, 'text/markdown;charset=utf-8;');
    markDownloaded('summary');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B10]/80 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-[#15151D] rounded-3xl p-6 shadow-2xl border border-[#30303A] space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#30303A]">
          <div>
            <h3 id="export-title" className="text-base font-bold text-[#F3EBDD] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#C8A96E]" /> Export Plan Data
            </h3>
            <p className="text-xs text-[#A5A3AD] mt-0.5">
              Download clean spreadsheet and document formats for your vendors and committee.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#1D1D27] transition-colors"
            aria-label="Close export modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Budget CSV */}
          <div className="p-4 rounded-2xl bg-[#1D1D27] border border-[#30303A] flex items-center justify-between gap-3 hover:border-[#C8A96E]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#15151D] text-[#C8A96E] border border-[#30303A] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3EBDD]">Budget Breakdown (CSV)</h4>
                <p className="text-[11px] text-[#A5A3AD]">
                  {plan.budget.items.length} line items with estimated, actual, unit cost & payment status
                </p>
              </div>
            </div>
            <button
              onClick={handleExportBudget}
              className="px-3.5 py-2 rounded-xl bg-[#15151D] hover:bg-[#252533] border border-[#30303A] text-xs font-semibold text-[#F3EBDD] shrink-0 transition-colors flex items-center gap-1.5"
            >
              {downloadedState['budget'] ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#829879]" /> Downloaded
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#C8A96E]" /> CSV
                </>
              )}
            </button>
          </div>

          {/* Timeline CSV */}
          <div className="p-4 rounded-2xl bg-[#1D1D27] border border-[#30303A] flex items-center justify-between gap-3 hover:border-[#C8A96E]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#15151D] text-[#C8A96E] border border-[#30303A] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3EBDD]">Preparation Timeline (CSV)</h4>
                <p className="text-[11px] text-[#A5A3AD]">
                  {plan.timeline.tasks.length} tasks with due dates, priorities, categories & notes
                </p>
              </div>
            </div>
            <button
              onClick={handleExportTimeline}
              className="px-3.5 py-2 rounded-xl bg-[#15151D] hover:bg-[#252533] border border-[#30303A] text-xs font-semibold text-[#F3EBDD] shrink-0 transition-colors flex items-center gap-1.5"
            >
              {downloadedState['timeline'] ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#829879]" /> Downloaded
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#C8A96E]" /> CSV
                </>
              )}
            </button>
          </div>

          {/* Vendors CSV */}
          <div className="p-4 rounded-2xl bg-[#1D1D27] border border-[#30303A] flex items-center justify-between gap-3 hover:border-[#C8A96E]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#15151D] text-[#829879] border border-[#30303A] flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3EBDD]">Vendors & Quotations (CSV)</h4>
                <p className="text-[11px] text-[#A5A3AD]">
                  {plan.vendors.items.length} category guides, lock dates, status & contacts
                </p>
              </div>
            </div>
            <button
              onClick={handleExportVendors}
              className="px-3.5 py-2 rounded-xl bg-[#15151D] hover:bg-[#252533] border border-[#30303A] text-xs font-semibold text-[#F3EBDD] shrink-0 transition-colors flex items-center gap-1.5"
            >
              {downloadedState['vendors'] ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#829879]" /> Downloaded
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#C8A96E]" /> CSV
                </>
              )}
            </button>
          </div>

          {/* Executive Summary Markdown */}
          <div className="p-4 rounded-2xl bg-[#1D1D27] border border-[#30303A] flex items-center justify-between gap-3 hover:border-[#C8A96E]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#15151D] text-[#E4B66A] border border-[#30303A] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#F3EBDD]">Executive Master Brief (Markdown)</h4>
                <p className="text-[11px] text-[#A5A3AD]">
                  Formatted comprehensive report suitable for documentation or sharing
                </p>
              </div>
            </div>
            <button
              onClick={handleExportSummary}
              className="px-3.5 py-2 rounded-xl bg-[#15151D] hover:bg-[#252533] border border-[#30303A] text-xs font-semibold text-[#F3EBDD] shrink-0 transition-colors flex items-center gap-1.5"
            >
              {downloadedState['summary'] ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#829879]" /> Downloaded
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#C8A96E]" /> Markdown
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
