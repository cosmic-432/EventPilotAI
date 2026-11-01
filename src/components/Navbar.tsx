import React from 'react';
import {
  Sparkles,
  Undo2,
  Redo2,
  Download,
  Printer,
  Plus,
  Calendar,
  Layers,
  ChevronDown,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { EventPlan } from '../types/event';
import { PlanIndexEntry } from '../storage/eventRepository';
import { formatCompactCurrency } from '../utils/currency';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPlan,
  savedPlans,
  onSelectPlan,
  onNewEvent,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onOpenExport,
  onOpenPrint,
  onOpenRegenerate,
  activeTab,
  onTabChange,
}) => {
  const [plansMenuOpen, setPlansMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0B0B10]/95 backdrop-blur-md border-b border-[#30303A] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#15151D] border border-[#30303A] flex items-center justify-center text-[#C8A96E] shadow-sm">
              <Sparkles className="w-5 h-5 text-[#C8A96E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#F3EBDD] tracking-tight text-lg">
                  EventPilot<span className="text-[#C8A96E] font-black">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#15151D] text-[#829879] border border-[#30303A]">
                  <ShieldCheck className="w-3 h-3 text-[#829879]" /> Local & Secure
                </span>
              </div>
              <p className="text-[11px] text-[#A5A3AD] hidden md:block">
                Intelligent Planning & Budget Optimization
              </p>
            </div>
          </div>

          {/* Active Event Switcher (when plan is loaded) */}
          {currentPlan && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setPlansMenuOpen(!plansMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#30303A] bg-[#15151D] hover:bg-[#1D1D27] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                aria-expanded={plansMenuOpen}
                aria-haspopup="true"
                aria-label="Switch active event plan"
              >
                <div className="w-2 h-2 rounded-full bg-[#829879] shrink-0" />
                <div className="max-w-[140px] sm:max-w-[220px] truncate">
                  <p className="text-xs font-semibold text-[#F3EBDD] truncate">
                    {currentPlan.eventDetails.name}
                  </p>
                  <p className="text-[10px] text-[#A5A3AD] capitalize">
                    {currentPlan.eventDetails.category.replace('_', ' ')} • {formatCompactCurrency(currentPlan.budget.totalBudgetMinor, currentPlan.budget.currency)}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-[#A5A3AD] shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {plansMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#15151D] rounded-2xl shadow-2xl border border-[#30303A] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#A5A3AD] border-b border-[#30303A]">
                    Your Saved Events ({savedPlans.length})
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {savedPlans.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onSelectPlan(p.id);
                          setPlansMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1D1D27] transition-colors ${
                          p.id === currentPlan.id ? 'bg-[#1D1D27] font-semibold text-[#C8A96E] border-l-2 border-[#C8A96E]' : 'text-[#F3EBDD]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="truncate">{p.name}</p>
                          <span className="text-[10px] text-[#A5A3AD] capitalize">{p.category.replace('_', ' ')}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#A5A3AD] shrink-0">
                          {p.targetDate}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-[#30303A] pt-1 px-2">
                    <button
                      onClick={() => {
                        setPlansMenuOpen(false);
                        onNewEvent();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#C8A96E] hover:bg-[#1D1D27] rounded-lg font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Create New Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentPlan && (
              <>
                {/* Undo / Redo */}
                <div className="hidden sm:flex items-center bg-[#15151D] rounded-lg p-0.5 border border-[#30303A]">
                  <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    aria-label="Undo change"
                    title="Undo (Ctrl+Z)"
                    className="p-1.5 rounded-md text-[#A5A3AD] hover:text-[#F3EBDD] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1D1D27] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    aria-label="Redo change"
                    title="Redo"
                    className="p-1.5 rounded-md text-[#A5A3AD] hover:text-[#F3EBDD] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1D1D27] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  >
                    <Redo2 className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Section Optimizer */}
                <button
                  onClick={onOpenRegenerate}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#15151D] text-[#C8A96E] hover:bg-[#1D1D27] border border-[#30303A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                  title="Optimize an individual section with AI"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#C8A96E]" />
                  <span>AI Refine</span>
                </button>

                {/* Print Master Plan */}
                <button
                  onClick={onOpenPrint}
                  aria-label="Print or export to PDF"
                  title="Print friendly report"
                  className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-[#30303A] bg-[#15151D] hover:bg-[#1D1D27] text-[#F3EBDD] text-xs font-medium inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                >
                  <Printer className="w-4 h-4 text-[#A5A3AD]" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Export Data */}
                <button
                  onClick={onOpenExport}
                  aria-label="Export event data"
                  title="Export budget and task spreadsheets"
                  className="p-2 sm:px-3 sm:py-1.5 rounded-lg border border-[#30303A] bg-[#15151D] hover:bg-[#1D1D27] text-[#F3EBDD] text-xs font-medium inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
                >
                  <Download className="w-4 h-4 text-[#A5A3AD]" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </>
            )}

            {/* New Event Button (Champagne Gold Primary) */}
            <button
              onClick={onNewEvent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] shadow-sm hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
            >
              <Plus className="w-4 h-4 text-[#0B0B10]" />
              <span>{currentPlan ? 'New Event' : 'Create Event'}</span>
            </button>
          </div>
        </div>

        {/* Workspace Navigation Tabs (when active plan loaded) */}
        {currentPlan && (
          <nav
            aria-label="Event workspace sections"
            className="flex items-center gap-1 overflow-x-auto py-2 border-t border-[#30303A] no-scrollbar"
          >
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'budget', label: 'Budget Planner', icon: Sparkles },
              { id: 'timeline', label: 'Timeline & Tasks', icon: Calendar },
              { id: 'vendors', label: 'Vendors & Quotes', icon: Layers },
              { id: 'ideas', label: 'Themes & Ideas', icon: Sparkles },
              { id: 'guests', label: 'Guest & Logistics', icon: Layers },
              { id: 'risks', label: 'Risks & Contingency', icon: ShieldCheck },
              { id: 'settings', label: 'Settings', icon: ChevronDown },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E] ${
                    isActive
                      ? 'bg-[#1D1D27] text-[#C8A96E] border border-[#30303A] shadow-xs'
                      : 'text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#15151D]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C8A96E]' : 'text-[#A5A3AD]'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
};
