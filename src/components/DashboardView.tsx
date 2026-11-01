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
  const summary = calculateBudgetSummary(plan.budget);
  const scheduleValidation = validateTaskSchedule(
    plan.timeline.tasks,
    plan.eventDetails.targetDate
  );

  // Vendor statistics
  const totalVendors = plan.vendors.items.length;
  const confirmedVendors = plan.vendors.items.filter(
    (v) => v.bookingStatus === 'confirmed'
  ).length;

  // Upcoming tasks
  const upcomingTasks = plan.timeline.tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Overdue tasks
  const overdueTasks = plan.timeline.tasks.filter((t) =>
    scheduleValidation.overdueTaskIds.has(t.id)
  );

  // Multi-event overview statistics
  const totalSavedEvents = savedPlans.length > 0 ? savedPlans.length : 1;
  const activeEventsCount = savedPlans.filter((p) => p.status !== 'archived').length || 1;
  const totalManagedBudget = savedPlans.reduce(
    (acc, p) => acc + (p.totalBudgetMinor || 0),
    0
  ) || summary.totalBudgetMinor;

  // Days until active event
  const calculateDaysLeft = (targetIso: string) => {
    const target = new Date(targetIso).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const daysLeft = calculateDaysLeft(plan.eventDetails.targetDate);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcoming Editorial Header (Warm Blush on White) */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFF2EF] via-white to-[#FDE8E3] border border-[#EEDCD7] overflow-hidden shadow-xs">
        {/* Subtle decorative rose/gold blush aura */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#FF9A8B]/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#B89555]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[#FF6F61] border border-[#EEDCD7] text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6F61]" />
              <span>EventPilot Studio • Production Suite</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] tracking-tight leading-tight">
              Let&apos;s create something unforgettable.
            </h1>

            <p className="text-sm text-[#57534E] leading-relaxed">
              Curate timeless celebrations with precision financial allocation, date-aware production timelines, and bespoke AI design recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onNewEvent && (
              <button
                onClick={onNewEvent}
                className="px-5 py-3 rounded-2xl bg-[#FF6F61] hover:bg-[#E05345] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 group active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
                <span>+ New Event</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('history')}
              className="px-4 py-3 rounded-2xl border border-[#EEDCD7] bg-white hover:bg-[#FDE8E3] text-xs font-semibold text-[#1C1917] transition-colors flex items-center gap-2 shadow-2xs"
            >
              <History className="w-4 h-4 text-[#B89555]" />
              <span>Planning History ({savedPlans.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner Alerts (Overrun or Overdue) */}
      {summary.isOverrun && (
        <div className="p-4 rounded-2xl bg-[#FFF2EF] border border-[#B94D5A]/40 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-[#B94D5A] shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#1C1917]">
              Budget Overrun Detected ({summary.overrunPercentage.toFixed(1)}% above total target)
            </p>
            <p className="text-[#57534E] mt-0.5">
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
            <p className="font-bold text-[#1C1917]">
              {overdueTasks.length} Overdue Production {overdueTasks.length === 1 ? 'Task' : 'Tasks'}
            </p>
            <p className="text-[#57534E] mt-0.5">
              Several milestones have passed their target dates. Open the Preparation Timeline to reschedule or mark complete.
            </p>
          </div>
        </div>
      )}

      {/* 2. Overview Statistics Based on Actual Saved Events */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Managed Budget */}
        <div className="p-5 rounded-2xl bg-white border border-[#EEDCD7] relative overflow-hidden group hover:border-[#FF6F61]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] text-xs mb-2">
            <span>Managed Budget</span>
            <span className="p-1.5 rounded-lg bg-[#FFF2EF] text-[#B89555]">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
            {formatCurrency(totalManagedBudget, currency)}
          </div>
          <p className="text-[11px] text-[#8A827D] mt-1 truncate">
            Across {totalSavedEvents} studio {totalSavedEvents === 1 ? 'event' : 'events'}
          </p>
        </div>

        {/* Metric 2: Active Events & Status */}
        <div className="p-5 rounded-2xl bg-white border border-[#EEDCD7] relative overflow-hidden group hover:border-[#FF6F61]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] text-xs mb-2">
            <span>Active Productions</span>
            <span className="p-1.5 rounded-lg bg-[#FFF2EF] text-[#FF6F61]">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
            {activeEventsCount}
          </div>
          <p className="text-[11px] text-[#8A827D] mt-1">
            {savedPlans.length} total saved in studio records
          </p>
        </div>

        {/* Metric 3: Confirmed Vendors */}
        <div className="p-5 rounded-2xl bg-white border border-[#EEDCD7] relative overflow-hidden group hover:border-[#FF6F61]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] text-xs mb-2">
            <span>Service Partners</span>
            <span className="p-1.5 rounded-lg bg-[#F0F7F4] text-[#477D60]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
            {confirmedVendors} / {totalVendors}
          </div>
          <p className="text-[11px] text-[#477D60] mt-1 font-medium">
            {totalVendors > 0 ? `${Math.round((confirmedVendors / totalVendors) * 100)}% contracts locked` : 'No vendors registered'}
          </p>
        </div>

        {/* Metric 4: Countdown to Event */}
        <div className="p-5 rounded-2xl bg-white border border-[#EEDCD7] relative overflow-hidden group hover:border-[#FF6F61]/50 transition-colors shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] text-xs mb-2">
            <span>Countdown</span>
            <span className="p-1.5 rounded-lg bg-[#FFF8ED] text-[#A87531]">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold text-[#1C1917] tracking-tight">
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
          className="p-5 rounded-2xl bg-white border border-[#EEDCD7] hover:border-[#FF6F61]/60 hover:bg-[#FFF2EF]/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFF8ED] border border-[#EEDCD7] text-[#B89555] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#1C1917] tracking-tight">
              Budget Planner
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Track allocated spend, manage vendor line items, unit costs, and protect your 10% contingency reserve.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#EEDCD7] flex items-center justify-between text-xs font-semibold text-[#B89555]">
            <span>
              {formatCurrency(summary.totalEstimatedSpendMinor, currency)} Planned
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 2: Inspiration & Themes */}
        <div
          onClick={() => onNavigateTab('ideas')}
          className="p-5 rounded-2xl bg-white border border-[#EEDCD7] hover:border-[#FF6F61]/60 hover:bg-[#FFF2EF]/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#FFF2EF] border border-[#EEDCD7] text-[#FF6F61] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#1C1917] tracking-tight">
              Design Inspiration
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Explore bespoke color palettes, architectural floral concepts, sustainability suggestions, and cultural nuances.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#EEDCD7] flex items-center justify-between text-xs font-semibold text-[#FF6F61]">
            <span>{plan.ideas.themeConcepts.length} Curated Concepts</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        {/* Card 3: Vendor Checklist */}
        <div
          onClick={() => onNavigateTab('vendors')}
          className="p-5 rounded-2xl bg-white border border-[#EEDCD7] hover:border-[#FF6F61]/60 hover:bg-[#FFF2EF]/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-xs"
        >
          <div className="space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#F0F7F4] border border-[#EEDCD7] text-[#477D60] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-editorial text-lg font-bold text-[#1C1917] tracking-tight">
              Vendor Checklist
            </h3>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Manage partner quotations, contract deliverables, contact phonebooks, and target booking lock dates.
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-[#EEDCD7] flex items-center justify-between text-xs font-semibold text-[#477D60]">
            <span>{confirmedVendors} of {totalVendors} Confirmed</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* 4. Asymmetrical Layout: Recent Events & Upcoming Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Events in Studio (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-[#EEDCD7] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD7]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                Recent Studio Events
              </h3>
              <p className="text-xs text-[#57534E]">Switch active celebration anytime</p>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs text-[#FF6F61] hover:text-[#E05345] font-semibold flex items-center gap-1 transition-colors"
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
                      ? 'bg-[#FFF2EF] border-[#FF6F61] shadow-2xs'
                      : 'bg-white border-[#EEDCD7] hover:border-[#FF6F61]/50 hover:bg-[#FCF8F7]'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[#1C1917] truncate">
                        {p.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#477D60] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#57534E] mt-0.5 truncate capitalize">
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
        <div className="lg:col-span-7 p-5 rounded-3xl bg-white border border-[#EEDCD7] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD7]">
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                Upcoming Event Timeline
              </h3>
              <p className="text-xs text-[#57534E]">
                Critical milestones for {plan.eventDetails.name}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs text-[#FF6F61] hover:text-[#E05345] font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Full Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingTasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#57534E]">
              <CheckCircle2 className="w-8 h-8 text-[#477D60] mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-[#1C1917]">All upcoming tasks completed!</p>
              <p className="text-[#8A827D] mt-0.5">Your production schedule is running smoothly.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-2xl bg-[#FCF8F7] border border-[#EEDCD7] hover:border-[#FF6F61]/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 w-4 h-4 rounded border border-[#FF6F61]/50 hover:bg-[#FFF2EF] flex items-center justify-center shrink-0 transition-colors"
                      aria-label={`Mark ${task.title} complete`}
                    >
                      {task.status === 'completed' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#477D60]" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1C1917] truncate">
                        {task.title}
                      </p>
                      <p className="text-[11px] text-[#57534E] mt-0.5 capitalize">
                        {task.category} • Due {formatDisplayDate(task.dueDate)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold shrink-0 ${
                      task.priority === 'critical'
                        ? 'bg-[#FFF2EF] text-[#B94D5A] border border-[#B94D5A]/30'
                        : task.priority === 'high'
                        ? 'bg-[#FFF8ED] text-[#A87531] border border-[#A87531]/30'
                        : 'bg-white text-[#57534E] border border-[#EEDCD7]'
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
      <div className="p-6 rounded-3xl bg-white border border-[#EEDCD7] space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF2EF] text-[#FF6F61] border border-[#FF9A8B] flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                AI Inspiration & Studio Highlights
              </h3>
              <p className="text-xs text-[#57534E]">
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
              className="p-4 rounded-2xl bg-[#FCF8F7] border border-[#EEDCD7] hover:border-[#FF6F61]/50 transition-colors flex flex-col justify-between space-y-3 shadow-2xs"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#B89555] font-bold">
                  Concept 0{idx + 1} • {concept.vibe}
                </span>
                <h4 className="font-editorial text-base font-bold text-[#1C1917]">
                  {concept.title}
                </h4>
                <p className="text-xs text-[#57534E] leading-relaxed line-clamp-3">
                  {concept.description}
                </p>
              </div>

              {/* Color Swatches */}
              <div className="pt-2 border-t border-[#EEDCD7] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {(concept.colorPalette || ['#FF6F61', '#B89555', '#FFF2EF', '#1C1917']).map((hex, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-[#8A827D] capitalize font-medium">
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
