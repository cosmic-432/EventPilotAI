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

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      'Reduce catering spend by 15% and reallocate towards velvet rose floral installations.',
      'Cut overall budget by 10% to create a larger contingency buffer.',
      'Add dedicated line items for drone photography and personalized guest favors.',
    ],
    timeline: [
      'Compress timeline to 30 days with aggressive early vendor locking.',
      'Add dedicated tasks for custom menu tasting and digital RSVP follow-ups.',
      'Schedule a full rehearsal and sound-check 3 days before event.',
    ],
    vendors: [
      'Focus vendor selection on eco-friendly, luxury boutique verified suppliers.',
      'Include negotiation questions for corkage waivers and overtime penalties.',
    ],
    ideas: [
      'Generate romantic velvet rose & champagne themes with warm candle illumination.',
      'Suggest high-energy youth celebration ideas and interactive live food counters.',
    ],
    risks: [
      'Analyze sudden monsoon rain and outdoor lawn flooding contingencies.',
      'Add emergency medical and elderly heat comfort protocols.',
    ],
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EADCE1] space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADCE1]">
          <div>
            <h3 className="font-editorial text-base font-bold text-[#392832] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B85F80]" />
              Selective AI Section Re-Optimization
            </h3>
            <p className="text-xs text-[#74616B] mt-0.5">
              Targeted updates without regenerating or erasing your other sections.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#FFF0F3] border border-[#B94D5A]/40 text-[#B94D5A] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#B94D5A] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#74616B] mb-1">
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
                      ? 'bg-[#B85F80] text-white font-bold border-[#B85F80] shadow-xs'
                      : 'bg-[#FBF5F6] text-[#74616B] border-[#EADCE1] hover:bg-[#F8E1E8] hover:text-[#392832]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#74616B] mb-1">
              New Constraints or Guidance for Gemini AI
            </label>
            <textarea
              rows={3}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Trim catering budget by 15%, add drone shoot line item..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80] resize-none"
            />
          </div>

          {/* Quick suggestions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89555] block font-mono">
              Suggested prompts:
            </span>
            <div className="space-y-1">
              {(PROMPT_SUGGESTIONS[section] || []).map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setConstraints(sug)}
                  className="w-full text-left p-2 rounded-xl bg-[#FBF5F6] hover:bg-[#FFF0F3] border border-[#EADCE1] text-[11px] text-[#74616B] hover:text-[#392832] transition-colors"
                >
                  💡 {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADCE1]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !constraints.trim()}
              className="px-5 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] disabled:opacity-40 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Re-optimizing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-white" />
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
