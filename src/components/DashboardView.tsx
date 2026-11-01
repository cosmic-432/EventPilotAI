import React from 'react';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Building2,
  Users,
  Sparkles,
  PlusCircle,
  Wallet,
  CheckSquare,
  Lightbulb,
  ArrowUpRight,
  FolderHeart,
  History,
} from 'lucide-react';
import { EventPlan } from '../types/event';
import { PlanIndexEntry } from '../storage/eventRepository';
import {
  calculateBudgetSummary,
  formatCurrency,
} from '../utils/currency';
import { validateTaskSchedule, formatDisplayDate } from '../utils/timeline';

interface DashboardViewProps {
  plan: EventPlan;
  savedPlans?: PlanIndexEntry[];
  onNavigateTab: (tab: string) => void;
  onToggleTask: (taskId: string) => void;
  onConfirmAssumption: (assumptionId: string) => void;
  onNewEvent?: () => void;
  onSelectPlan?: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  plan,
  savedPlans = [],
  onNavigateTab,
  onToggleTask,
  onConfirmAssumption,
  onNewEvent,
  onSelectPlan,
}) => {
  const currency = plan.budget.currency || 'INR';

  const summary = React.useMemo(() => calculateBudgetSummary(plan.budget), [plan.budget]);

  const scheduleValidation = React.useMemo(
    () => validateTaskSchedule(plan.timeline.tasks, plan.eventDetails.targetDate),
    [plan.timeline.tasks, plan.eventDetails.targetDate]
  );

  // Vendor statistics
  const totalVendors = plan.vendors.items.length;
  const confirmedVendors = React.useMemo(
    () => plan.vendors.items.filter((v) => v.bookingStatus === 'confirmed').length,
    [plan.vendors.items]
  );

  // Upcoming tasks
  const upcomingTasks = React.useMemo(
    () =>
      plan.timeline.tasks
        .filter((t) => t.status !== 'completed')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 4),
    [plan.timeline.tasks]
  );

  // Overdue tasks
  const overdueTasks = React.useMemo(
    () => plan.timeline.tasks.filter((t) => scheduleValidation.overdueTaskIds.has(t.id)),
    [plan.timeline.tasks, scheduleValidation.overdueTaskIds]
  );

  // Multi-event overview statistics
  const totalSavedEvents = savedPlans.length > 0 ? savedPlans.length : 1;
  const activeEventsCount = React.useMemo(
    () => savedPlans.filter((p) => p.status !== 'archived').length || 1,
    [savedPlans]
  );
  const totalManagedBudget = React.useMemo(
    () =>
      savedPlans.reduce((acc, p) => acc + (p.totalBudgetMinor || 0), 0) || summary.totalBudgetMinor,
    [savedPlans, summary.totalBudgetMinor]
  );

  // Days until active event
  const daysLeft = React.useMemo(() => {
    const target = new Date(plan.eventDetails.targetDate).getTime();
    const today = new Date().getTime();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  }, [plan.eventDetails.targetDate]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcoming Editorial Header (Warm Blush on White) */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFF0F3] via-white to-[#F8E1E8] border border-[#EADCE1] overflow-hidden shadow-xs">
        {/* Subtle decorative rose/gold blush aura */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#E9B9C9]/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#B89555]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#B85F80] border border-[#EADCE1] text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B85F80]" />
              <span>EventPilot Studio • Production Suite</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#392832] tracking-tight leading-tight">
              Let&apos;s create something unforgettable.
            </h1>

            <p className="text-sm text-[#74616B] leading-relaxed">
              Curate timeless celebrations with precision financial allocation, date-aware production timelines, and bespoke AI design recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNewEvent && (
              <button
                onClick={onNewEvent}
                className="px-5 py-3 rounded-2xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 group active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
                <span>+ New Event</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('history')}
              className="px-4 py-3 rounded-2xl border border-[#EADCE1] bg-white hover:bg-[#F8E1E8] text-xs font-semibold text-[#392832] transition-colors flex items-center gap-2 shadow-2xs"
            >
              <History className="w-4 h-4 text-[#B89555]" />
              <span>Planning History ({savedPlans.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner Alerts (Overrun or Overdue) */}
      {summary.isOverrun && (
        <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#B94D5A]/40 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-[#B94D5A] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#392832]">
              Budget Overrun Detected ({summary.overrunPercentage.toFixed(1)}% above total target)
            </p>
            <p className="text-[#74616B] mt-0.5">
              Planned commitments exceed total allocated funds by{' '}
              <strong className="text-[#B94D5A] font-mono">
                {formatCurrency(summary.overrunAmountMinor, currency)}
              </strong>
              . Review budget items or use AI Re-Optimization to rebalance.
            </p>
          </div>
        </div>
      )}

      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#FFF8ED] border border-[#A87531]/40 flex items-start gap-3 shadow-xs">
          <Clock className="w-5 h-5 text-[#A87531] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#392832]">
              {overdueTasks.length} Overdue Production {overdueTasks.length === 1 ? 'Task' : 'Tasks'}
            </p>
            <p className="text-[#74616B] mt-0.5">
              Several milestones have passed their target dates. Open the Preparation Timeline to reschedule or mark complete.
            </p>
          </div>
        </div>
      )}

      {/* 2. Overview Statistics Based on Actual Saved Events */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Managed Budget */}
        <div className="p-5 rounded-2xl bg-white border border-[#EADCE1] relative overflow-hidden group hover:border-[#B85F80]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#74616B] text-xs mb-2">
            <span>Managed Budget</span>
            <span className="p-1.5 rounded-lg bg-[#FFF0F3] text-[#B89555]">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#392832] tracking-tight">
            {formatCurrency(totalManagedBudget, currency)}
          </div>
          <p className="text-[11px] text-[#998791] mt-1 truncate">
            Across {totalSavedEvents} studio {totalSavedEvents === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* Metric 2: Active Events & Status */}
        <div className="p-5 rounded-2xl bg-white border border-[#EADCE1] relative overflow-hidden group hover:border-[#B85F80]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#74616B] text-xs mb-2">
            <span>Active Productions</span>
            <span className="p-1.5 rounded-lg bg-[#FFF0F3] text-[#B85F80]">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#392832] tracking-tight">
            {activeEventsCount}
          </div>
          <p className="text-[11px] text-[#998791] mt-1">
            {savedPlans.length} total saved in studio records
          </p>
        </div>

        {/* Metric 3: Confirmed Vendors */}
        <div className="p-5 rounded-2xl bg-white border border-[#EADCE1] relative overflow-hidden group hover:border-[#B85F80]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#74616B] text-xs mb-2">
            <span>Service Partners</span>
            <span className="p-1.5 rounded-lg bg-[#F0F7F4] text-[#477D60]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#392832] tracking-tight">
            {confirmedVendors} / {totalVendors}
          </div>
          <p className="text-[11px] text-[#477D60] mt-1 font-medium">
            {totalVendors > 0 ? `${Math.round((confirmedVendors / totalVendors) * 100)}% contracts locked` : 'No vendors registered'}
          </p>
        </div>

        {/* Metric 4: Countdown to Event */}
        <div className="p-5 rounded-2xl bg-white border border-[#EADCE1] relative overflow-hidden group hover:border-[#B85F80]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#74616B] text-xs mb-2">
            <span>Countdown</span>
            <span className="p-1.5 rounded-lg bg-[#FFF8ED] text-[#A87531]">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#392832] tracking-tight">
            {daysLeft > 0 ? `${daysLeft} Days` : daysLeft === 0 ? 'Today!' : 'Completed'}
          </div>
          <p className="text-[11px] text-[#B89555] mt-1 truncate font-medium">
            {formatDisplayDate(plan.eventDetails.targetDate)}
          </p>
        </div>
      </div>

      {/* 3. Quick-Access Cards: Budget Planner, Inspiration, Vendor Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Budget Planner */}
        <div
          onClick={() => onNavigateTab('budget')}
          className="p-5 rounded-2xl bg-white border border-[#EADCE1] hover:border-[#B85F80]/60 hover:bg-[#FFF0F3]/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8ED] border border-[#EADCE1] text-[#B89555] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#392832] tracking-tight">
              Budget Planner
            </h3>
            <p className="text-xs text-[#74616B] leading-relaxed">
              Track allocated spend, manage vendor line items, unit costs, and protect your 10% contingency reserve.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#EADCE1] flex items-center justify-between text-xs font-semibold text-[#B89555]">
            <span>
              {formatCurrency(summary.totalEstimatedSpendMinor, currency)} Planned
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 2: Inspiration & Themes */}
        <div
          onClick={() => onNavigateTab('ideas')}
          className="p-5 rounded-2xl bg-white border border-[#EADCE1] hover:border-[#B85F80]/60 hover:bg-[#FFF0F3]/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] border border-[#EADCE1] text-[#B85F80] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#392832] tracking-tight">
              Design Inspiration
            </h3>
            <p className="text-xs text-[#74616B] leading-relaxed">
              Explore bespoke color palettes, architectural floral concepts, sustainability suggestions, and cultural nuances.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#EADCE1] flex items-center justify-between text-xs font-semibold text-[#B85F80]">
            <span>{plan.ideas.themeConcepts.length} Curated Concepts</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 3: Vendor Checklist */}
        <div
          onClick={() => onNavigateTab('vendors')}
          className="p-5 rounded-2xl bg-white border border-[#EADCE1] hover:border-[#B85F80]/60 hover:bg-[#FFF0F3]/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#F0F7F4] border border-[#EADCE1] text-[#477D60] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#392832] tracking-tight">
              Vendor Checklist
            </h3>
            <p className="text-xs text-[#74616B] leading-relaxed">
              Manage partner quotations, contract deliverables, contact phonebooks, and target booking lock dates.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#EADCE1] flex items-center justify-between text-xs font-semibold text-[#477D60]">
            <span>{confirmedVendors} of {totalVendors} Confirmed</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* 4. Asymmetrical Layout: Recent Events & Upcoming Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Events in Studio (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-[#EADCE1] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADCE1]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#392832]">
                Recent Studio Events
              </h3>
              <p className="text-xs text-[#74616B]">Switch active celebration anytime</p>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-[#B85F80] hover:text-[#984665] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View All History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {savedPlans.slice(0, 4).map((p) => {
              const isSelected = p.id === plan.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPlan && onSelectPlan(p.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#FFF0F3] border-[#B85F80] shadow-2xs'
                      : 'bg-white border-[#EADCE1] hover:border-[#B85F80]/50 hover:bg-[#FBF5F6]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#392832] truncate">
                        {p.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#477D60] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#74616B] mt-0.5 truncate capitalize">
                      {p.category.replace('_', ' ')} • {formatDisplayDate(p.targetDate)}
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#B89555] shrink-0">
                    {p.totalBudgetMinor
                      ? formatCurrency(p.totalBudgetMinor, p.currency || 'INR')
                      : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Upcoming Event Timeline (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-white border border-[#EADCE1] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EADCE1]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#392832]">
                Upcoming Event Timeline
              </h3>
              <p className="text-xs text-[#74616B]">
                Critical milestones for {plan.eventDetails.name}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs text-[#B85F80] hover:text-[#984665] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Full Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#74616B]">
              <CheckCircle2 className="w-8 h-8 text-[#477D60] mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-[#392832]">All upcoming tasks completed!</p>
              <p className="text-[#998791] mt-0.5">Your production schedule is running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-[#FBF5F6] border border-[#EADCE1] hover:border-[#B85F80]/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-[#B85F80]/50 hover:bg-[#FFF0F3] flex items-center justify-center shrink-0 transition-colors"
                      aria-label={`Mark ${task.title} complete`}
                    >
                      {task.status === 'completed' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#477D60]" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#392832] truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-[#74616B] mt-0.5 capitalize">
                        {task.category} • Due {formatDisplayDate(task.dueDate)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold shrink-0 ${
                      task.priority === 'critical'
                        ? 'bg-[#FFF0F3] text-[#B94D5A] border border-[#B94D5A]/30'
                        : task.priority === 'high'
                        ? 'bg-[#FFF8ED] text-[#A87531] border border-[#A87531]/30'
                        : 'bg-white text-[#74616B] border border-[#EADCE1]'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Tasteful AI Inspiration Section with Event-Specific Recommendations */}
      <div className="p-6 rounded-3xl bg-white border border-[#EADCE1] space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EADCE1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F3] text-[#B85F80] border border-[#E9B9C9] flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#392832]">
                AI Inspiration & Studio Highlights
              </h3>
              <p className="text-xs text-[#74616B]">
                Tailored for {plan.eventDetails.styleTheme} ({plan.eventDetails.location})
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('ideas')}
            className="text-xs font-semibold text-[#B89555] hover:text-[#98783d] flex items-center gap-1 transition-colors"
          >
            <span>Explore All Concepts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plan.ideas.themeConcepts.slice(0, 3).map((concept, idx) => (
            <div
              key={concept.id || idx}
              className="p-4 rounded-2xl bg-[#FBF5F6] border border-[#EADCE1] hover:border-[#B85F80]/50 transition-colors flex flex-col justify-between space-y-3 shadow-2xs"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#B89555] font-bold">
                  Concept 0{idx + 1} • {concept.vibe}
                </span>
                <h4 className="font-editorial text-base font-bold text-[#392832]">
                  {concept.title}
                </h4>
                <p className="text-xs text-[#74616B] leading-relaxed line-clamp-3">
                  {concept.description}
                </p>
              </div>

              {/* Color Swatches */}
              <div className="pt-2 border-t border-[#EADCE1] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(concept.colorPalette || ['#B85F80', '#B89555', '#FFF0F3', '#392832']).map((hex, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#998791] capitalize font-medium">
                  {concept.budgetImpact} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
