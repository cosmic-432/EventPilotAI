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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADCE1]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Studio Portfolio
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#392832] tracking-tight mt-0.5">
            My Saved Celebrations
          </h2>
          <p className="text-sm text-[#74616B] mt-1">
            Browse and manage all active, confirmed, and upcoming celebrations in your studio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('history')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EADCE1] bg-white hover:bg-[#F8E1E8] text-xs font-semibold text-[#392832] transition-colors shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-[#B89555]" />
            <span>Full History Archive</span>
          </button>
          <button
            onClick={onNewEvent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Event</span>
          </button>
        </div>
      </div>

      {savedPlans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-[#EADCE1] space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] border border-[#EADCE1] mx-auto flex items-center justify-center text-[#B85F80]">
            <FolderHeart className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#392832]">No studio events saved yet</h3>
          <p className="text-xs text-[#74616B] max-w-sm mx-auto">
            Get started by launching our intelligent setup wizard to generate your first custom master event plan.
          </p>
          <button
            onClick={onNewEvent}
            className="px-4 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-bold transition-all shadow-xs"
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
                className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between hover:border-[#B85F80]/50 shadow-xs hover:shadow-md ${
                  isLoaded ? 'border-[#B85F80] ring-1 ring-[#B85F80]' : 'border-[#EADCE1]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#B89555] px-2 py-0.5 rounded-md bg-[#FFF8ED] border border-[#EADCE1] capitalize font-semibold">
                      {plan.category.replace('_', ' ')}
                    </span>
                    {isLoaded ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#477D60] bg-[#F0F7F4] px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Active Plan
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#74616B] font-medium">
                        {plan.status || 'Active'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-editorial text-xl font-bold text-[#392832] tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#74616B] mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B85F80] shrink-0" />
                      <span>{plan.location || 'Location Not Specified'}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FBF5F6] border border-[#EADCE1] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#998791] block">Date</span>
                      <span className="font-semibold text-[#392832]">{formatDisplayDate(plan.targetDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#998791] block">Budget</span>
                      <span className="font-semibold text-[#B89555] font-mono">
                        {plan.totalBudgetMinor
                          ? formatCurrency(plan.totalBudgetMinor, plan.currency || 'INR')
                          : 'Configured'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#EADCE1] flex items-center justify-between">
                  <span className="text-[11px] text-[#998791] flex items-center gap-1">
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
                        ? 'bg-[#FFF0F3] text-[#B85F80] border border-[#E9B9C9]'
                        : 'bg-[#B85F80] text-white hover:bg-[#984665]'
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
