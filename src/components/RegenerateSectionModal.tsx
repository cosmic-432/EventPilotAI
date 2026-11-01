import React from 'react';
import { X, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { EventPlan } from '../types/event';

interface RegenerateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onSectionRegenerated: (sectionName: string, updatedSectionData: any) => void;
  isLoading: boolean;
  onSubmitRegenerate: (sectionName: 'budget' | 'timeline' | 'vendors' | 'ideas' | 'risks', constraints: string) => Promise<void>;
}

export const RegenerateSectionModal: React.FC<RegenerateSectionModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  onSubmitRegenerate,
}) => {
  const [section, setSection] = React.useState<'budget' | 'timeline' | 'vendors' | 'ideas' | 'risks'>('budget');
  const [constraints, setConstraints] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!constraints.trim()) return;
    setErrorMsg('');
    try {
      await onSubmitRegenerate(section, constraints.trim());
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to re-optimize section. Please try again.');
    }
  };

  const PROMPT_SUGGESTIONS: Record<string, string[]> = {
    budget: [
      'Reduce catering spend by 15% and reallocate towards premium ambient stage lighting.',
      'Cut overall budget by 10% to create a larger contingency buffer.',
      'Add dedicated line items for drone photography and guest welcome gifts.',
    ],
    timeline: [
      'Compress timeline to 30 days with aggressive early vendor locking.',
      'Add dedicated tasks for custom menu tasting and digital RSVP follow-ups.',
      'Schedule a full rehearsal and sound-check 3 days before event.',
    ],
    vendors: [
      'Focus vendor selection on eco-friendly, zero-plastic verified suppliers.',
      'Include negotiation questions for corkage waivers and overtime penalties.',
    ],
    ideas: [
      'Generate royal vintage themes with brass, marigold, and warm candle illumination.',
      'Suggest high-energy youth celebration ideas and interactive live food stalls.',
    ],
    risks: [
      'Analyze severe monsoon rain and outdoor lawn flooding contingencies.',
      'Add emergency medical and elderly heat exhaustion protocols.',
    ],
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B10]/80 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-[#15151D] rounded-3xl p-6 shadow-2xl border border-[#30303A] space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#30303A]">
          <div>
            <h3 className="text-base font-bold text-[#F3EBDD] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C8A96E]" />
              Selective AI Section Re-Optimization
            </h3>
            <p className="text-xs text-[#A5A3AD] mt-0.5">
              Targeted updates without regenerating or erasing your other sections.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#1D1D27] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[rgba(228,119,119,0.15)] border border-[#E47777]/40 text-[#E47777] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#E47777] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">
              Select Section to Re-Optimize
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'budget', label: '💰 Budget' },
                { id: 'timeline', label: '📅 Timeline' },
                { id: 'vendors', label: '🤝 Vendors' },
                { id: 'ideas', label: '✨ Themes & Ideas' },
                { id: 'risks', label: '🛡️ Risks' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSection(s.id as any);
                    setConstraints('');
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    section === s.id
                      ? 'bg-[#C8A96E] text-[#0B0B10] font-bold border-[#C8A96E] shadow-xs'
                      : 'bg-[#1D1D27] text-[#A5A3AD] border-[#30303A] hover:bg-[#252533] hover:text-[#F3EBDD]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">
              New Constraints or Guidance for Gemini AI
            </label>
            <textarea
              rows={3}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Trim catering budget by 15%, add drone shoot line item..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] resize-none"
            />
          </div>

          {/* Quick suggestions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A3AD] block">
              Suggested prompts:
            </span>
            <div className="space-y-1">
              {(PROMPT_SUGGESTIONS[section] || []).map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setConstraints(sug)}
                  className="w-full text-left p-2 rounded-xl bg-[#1D1D27] hover:bg-[#252533] border border-[#30303A] text-[11px] text-[#A5A3AD] hover:text-[#F3EBDD] transition-colors"
                >
                  💡 {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30303A]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-semibold text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#252533]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !constraints.trim()}
              className="px-5 py-2 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 text-[#0B0B10] text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0B0B10]/30 border-t-[#0B0B10] rounded-full animate-spin" />
                  <span>Re-optimizing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#0B0B10]" />
                  <span>Update Section</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
