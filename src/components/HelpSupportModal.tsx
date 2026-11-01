import React, { useEffect } from 'react';
import { X, HelpCircle, BookOpen, Command, Mail } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-3xl bg-white border border-[#EADCE1] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADCE1]">
          <div>
            <h3 id="help-modal-title" className="font-editorial text-lg font-bold text-[#392832] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#B85F80]" />
              EventPilot Studio Guide & Support
            </h3>
            <p className="text-xs text-[#74616B] mt-0.5">
              Everything you need to orchestrate flawless luxury celebrations.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close help modal"
            className="p-1.5 rounded-xl text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
          {/* Section 1: Keyboard Shortcuts */}
          <div className="p-4 rounded-2xl bg-[#FBF5F6] border border-[#EADCE1] space-y-2">
            <h4 className="font-editorial text-sm font-bold text-[#B89555] flex items-center gap-2">
              <Command className="w-4 h-4 text-[#B89555]" /> Studio Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#74616B]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EADCE1]">
                <span>Undo Last Change</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#FBF5F6] text-[#392832] font-mono text-[10px] border border-[#EADCE1]">
                  ⌘ + Z
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EADCE1]">
                <span>Redo Action</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#FBF5F6] text-[#392832] font-mono text-[10px] border border-[#EADCE1]">
                  ⌘ + Shift + Z
                </kbd>
              </div>
            </div>
          </div>

          {/* Section 2: Studio Workflow Tips */}
          <div className="p-4 rounded-2xl bg-[#FBF5F6] border border-[#EADCE1] space-y-2.5">
            <h4 className="font-editorial text-sm font-bold text-[#392832] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#B85F80]" /> Studio Planning Best Practices
            </h4>
            <ul className="space-y-2 text-[#74616B] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#B85F80] font-bold">·</span>
                <span>
                  <strong>Multi-Event Integrity:</strong> Every time you click &ldquo;+ New Event&rdquo;, a fresh plan is generated without overwriting any previous plans. Find all past projects under &ldquo;Planning History&rdquo;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#B85F80] font-bold">·</span>
                <span>
                  <strong>Selective AI Re-Optimization:</strong> Want to cut catering by 15% or add drone photography without erasing your whole plan? Click &ldquo;AI Re-Optimize&rdquo; in the top navigation or any section header.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#B85F80] font-bold">·</span>
                <span>
                  <strong>Contingency Reserve:</strong> We allocate an untouchable 10% safety buffer to protect your event from last-minute vendor surge pricing and weather emergencies.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#B85F80] font-bold">·</span>
                <span>
                  <strong>Export & Print:</strong> Share clean spreadsheets (CSV) with vendors and produce master dossiers for committees anytime from the top bar.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 3: Contact & Support */}
          <div className="p-4 rounded-2xl bg-[#FBF5F6] border border-[#EADCE1] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#B89555] border border-[#EADCE1] flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#392832]">Studio Director Support</p>
                <p className="text-[11px] text-[#74616B]">support@eventpilot.local</p>
              </div>
            </div>

            <a
              href="mailto:support@eventpilot.local"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8E1E8] text-xs font-semibold text-[#B85F80] border border-[#EADCE1] transition-colors shadow-2xs"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
