import React from 'react';
import {
  Menu,
  Undo2,
  Redo2,
  Download,
  Printer,
  Sparkles,
  Plus,
} from 'lucide-react';
import { EventPlan } from '../types/event';
import { PlanIndexEntry } from '../storage/eventRepository';
import { formatDisplayDate } from '../utils/timeline';

interface NavbarProps {
  currentPlan: EventPlan | null;
  savedPlans: PlanIndexEntry[];
  onSelectPlan: (id: string) => void;
  onNewEvent: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onOpenExport: () => void;
  onOpenPrint: () => void;
  onOpenRegenerate: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPlan,
  onNewEvent,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenExport,
  onOpenPrint,
  onOpenRegenerate,
  onToggleMobileMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#EADCE1] no-print shadow-2xs">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Mobile Drawer Trigger + Active Context Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open navigation sidebar"
            className="md:hidden p-2 rounded-xl text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] border border-[#EADCE1] transition-colors focus-visible:ring-2 focus-visible:ring-[#B85F80]"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 min-w-0 text-xs">
            <span className="font-editorial text-sm font-semibold text-[#B89555] hidden sm:inline">
              Studio
            </span>
            <span className="text-[#998791] hidden sm:inline">/</span>
            {currentPlan ? (
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-[#392832] truncate">
                  {currentPlan.eventDetails.name}
                </span>
                <span className="text-[10px] font-mono text-[#74616B] hidden md:inline">
                  • {formatDisplayDate(currentPlan.eventDetails.targetDate)}
                </span>
              </div>
            ) : (
              <span className="text-[#998791] italic">No active event selected</span>
            )}
          </div>
        </div>

        {/* Right: Master Actions (Undo/Redo, Re-Optimize, Export, Print, + New Event) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center bg-[#F5E9ED] rounded-xl border border-[#EADCE1] p-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo last change (Ctrl+Z)"
              title="Undo last change (Ctrl+Z)"
              className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-[#EADCE1]" />
            <button
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo last change (Ctrl+Shift+Z)"
              title="Redo last change (Ctrl+Shift+Z)"
              className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Re-Optimize Section */}
          {currentPlan && (
            <button
              onClick={onOpenRegenerate}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EADCE1] bg-white hover:bg-[#FFF0F3] text-xs font-semibold text-[#392832] transition-colors shadow-2xs"
              title="Re-optimize budget or milestones with AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B85F80]" />
              <span>AI Re-Optimize</span>
            </button>
          )}

          {/* Export */}
          {currentPlan && (
            <button
              onClick={onOpenExport}
              aria-label="Export Plan as CSV or Markdown"
              title="Export Plan as CSV or Markdown"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#EADCE1] bg-white hover:bg-[#F8E1E8] text-xs font-medium text-[#74616B] hover:text-[#392832] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Print Report */}
          {currentPlan && (
            <button
              onClick={onOpenPrint}
              aria-label="Print Production Dossier"
              title="Print Production Dossier"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-[#EADCE1] bg-white hover:bg-[#F8E1E8] text-xs font-medium text-[#74616B] hover:text-[#392832] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          )}

          {/* Prominent Quick + New Event button in Header */}
          <button
            onClick={onNewEvent}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
            title="Create a new event plan"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline">New Event</span>
          </button>
        </div>
      </div>
    </header>
  );
};
