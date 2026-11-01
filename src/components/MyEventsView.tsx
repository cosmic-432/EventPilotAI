import React from 'react';
import {
  FolderHeart,
  PlusCircle,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  History,
  CheckCircle2,
} from 'lucide-react';
import { EventPlan } from '../types/event';
import { PlanIndexEntry } from '../storage/eventRepository';
import { formatCurrency } from '../utils/currency';
import { formatDisplayDate } from '../utils/timeline';

interface MyEventsViewProps {
  currentPlan: EventPlan | null;
  savedPlans: PlanIndexEntry[];
  onSelectPlan: (id: string) => void;
  onNewEvent: () => void;
  onNavigateTab: (tab: string) => void;
}

export const MyEventsView: React.FC<MyEventsViewProps> = ({
  currentPlan,
  savedPlans,
  onSelectPlan,
  onNewEvent,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEDCD7]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Studio Portfolio
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight mt-0.5">
            My Saved Celebrations
          </h2>
          <p className="text-sm text-[#57534E] mt-1">
            Browse and manage all active, confirmed, and upcoming celebrations in your studio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('history')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EEDCD7] bg-white hover:bg-[#FDE8E3] text-xs font-semibold text-[#1C1917] transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-[#B89555]" />
            <span>Full History Archive</span>
          </button>
          <button
            onClick={onNewEvent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Event</span>
          </button>
        </div>
      </div>

      {savedPlans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#EEDCD7] space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2EF] border border-[#EEDCD7] mx-auto flex items-center justify-center text-[#FF6F61]">
            <FolderHeart className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#1C1917]">No studio events saved yet</h3>
          <p className="text-xs text-[#57534E] max-w-sm mx-auto">
            Get started by launching our intelligent setup wizard to generate your first custom master event plan.
          </p>
          <button
            onClick={onNewEvent}
            className="px-4 py-2 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] text-white text-xs font-bold transition-all shadow-xs"
          >
            Start Event Wizard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedPlans.map((plan) => {
            const isLoaded = currentPlan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between hover:border-[#FF6F61]/50 shadow-xs hover:shadow-md ${
                  isLoaded ? 'border-[#FF6F61] ring-1 ring-[#FF6F61]' : 'border-[#EEDCD7]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B89555] px-2 py-0.5 rounded-md bg-[#FFF8ED] border border-[#EEDCD7] capitalize font-semibold">
                      {plan.category.replace('_', ' ')}
                    </span>
                    {isLoaded ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#477D60] bg-[#F0F7F4] px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Active Plan
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#57534E] font-medium">
                        {plan.status || 'Active'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-editorial text-xl font-bold text-[#1C1917] tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#57534E] mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6F61] shrink-0" />
                      <span>{plan.location || 'Location Not Specified'}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FCF8F7] border border-[#EEDCD7] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#8A827D] block">Date</span>
                      <span className="font-semibold text-[#1C1917]">{formatDisplayDate(plan.targetDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#8A827D] block">Budget</span>
                      <span className="font-semibold text-[#B89555] font-mono">
                        {plan.totalBudgetMinor
                          ? formatCurrency(plan.totalBudgetMinor, plan.currency || 'INR')
                          : 'Configured'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EEDCD7] flex items-center justify-between">
                  <span className="text-[11px] text-[#8A827D] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(plan.updatedAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      onSelectPlan(plan.id);
                      onNavigateTab('dashboard');
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-2xs active:scale-[0.98] ${
                      isLoaded
                        ? 'bg-[#FFF2EF] text-[#FF6F61] border border-[#FF9A8B]'
                        : 'bg-[#FF6F61] text-white hover:bg-[#E05345]'
                    }`}
                  >
                    <span>{isLoaded ? 'Open Studio' : 'Switch To Event'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
