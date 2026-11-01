import React from 'react';
import { X, HelpCircle, BookOpen, Command, Mail } from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-3xl bg-white border border-[#EEDCD7] p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD7]">
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#1C1917] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#FF6F61]" />
              EventPilot Studio Guide & Support
            </h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              Everything you need to orchestrate flawless luxury celebrations.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close help modal"
            className="p-1.5 rounded-xl text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
          {/* Section 1: Keyboard Shortcuts */}
          <div className="p-4 rounded-2xl bg-[#FCF8F7] border border-[#EEDCD7] space-y-2">
            <h4 className="font-editorial text-sm font-bold text-[#B89555] flex items-center gap-2">
              <Command className="w-4 h-4 text-[#B89555]" /> Studio Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#57534E]">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EEDCD7]">
                <span>Undo Last Change</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#FCF8F7] text-[#1C1917] font-mono text-[10px] border border-[#EEDCD7]">
                  ⌘ + Z
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EEDCD7]">
                <span>Redo Action</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#FCF8F7] text-[#1C1917] font-mono text-[10px] border border-[#EEDCD7]">
                  ⌘ + Shift + Z
                </kbd>
              </div>
            </div>
          </div>

          {/* Section 2: Studio Workflow Tips */}
          <div className="p-4 rounded-2xl bg-[#FCF8F7] border border-[#EEDCD7] space-y-2.5">
            <h4 className="font-editorial text-sm font-bold text-[#1C1917] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#FF6F61]" /> Studio Planning Best Practices
            </h4>
            <ul className="space-y-2 text-[#57534E] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#FF6F61] font-bold">·</span>
                <span>
                  <strong>Multi-Event Integrity:</strong> Every time you click &ldquo;+ New Event&rdquo;, a fresh plan is generated without overwriting any previous plans. Find all past projects under &ldquo;Planning History&rdquo;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6F61] font-bold">·</span>
                <span>
                  <strong>Selective AI Re-Optimization:</strong> Want to cut catering by 15% or add drone photography without erasing your whole plan? Click &ldquo;AI Re-Optimize&rdquo; in the top navigation or any section header.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6F61] font-bold">·</span>
                <span>
                  <strong>Contingency Reserve:</strong> We allocate an untouchable 10% safety buffer to protect your event from last-minute vendor surge pricing and weather emergencies.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF6F61] font-bold">·</span>
                <span>
                  <strong>Export & Print:</strong> Share clean spreadsheets (CSV) with vendors and produce master dossiers for committees anytime from the top bar.
                </span>
              </li>
            </ul>
          </div>

          {/* Section 3: Contact & Support */}
          <div className="p-4 rounded-2xl bg-[#FCF8F7] border border-[#EEDCD7] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#B89555] border border-[#EEDCD7] flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#1C1917]">Studio Director Support</p>
                <p className="text-[11px] text-[#57534E]">432omjadhav@gmail.com</p>
              </div>
            </div>

            <a
              href="mailto:432omjadhav@gmail.com"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FDE8E3] text-xs font-semibold text-[#FF6F61] border border-[#EEDCD7] transition-colors shadow-2xs"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
