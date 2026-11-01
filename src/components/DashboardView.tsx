import React from 'react';
import {
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Building2,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { EventPlan } from '../types/event';
import {
  calculateBudgetSummary,
  formatCurrency,
} from '../utils/currency';
import { validateTaskSchedule, formatDisplayDate } from '../utils/timeline';

interface DashboardViewProps {
  plan: EventPlan;
  onNavigateTab: (tab: string) => void;
  onToggleTask: (taskId: string) => void;
  onConfirmAssumption: (assumptionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  plan,
  onNavigateTab,
  onToggleTask,
  onConfirmAssumption,
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

  // Upcoming tasks (next 4 tasks due)
  const upcomingTasks = plan.timeline.tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Overdue tasks
  const overdueTasks = plan.timeline.tasks.filter((t) =>
    scheduleValidation.overdueTaskIds.has(t.id)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Budget Overrun exists */}
      {summary.isOverrun && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#15151D] border border-[#E47777]/50 text-[#F3EBDD] flex items-start justify-between gap-3 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#E47777] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-[#E47777]">
                Budget Allocation Exceeds Total Target by{' '}
                {formatCurrency(summary.overrunAmountMinor, currency)} (
                {summary.overrunPercentage}%)
              </h3>
              <p className="text-xs text-[#A5A3AD] mt-0.5">
                Total planned commitments (including {plan.budget.contingencyPercentage}% contingency reserve) exceed your {formatCurrency(summary.totalBudgetMinor, currency)} budget. Review cost-saving alternatives in the Budget Planner.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('budget')}
            className="px-3 py-1.5 rounded-xl bg-[#E47777] hover:bg-[#E47777]/80 text-[#0B0B10] text-xs font-bold shrink-0 transition-colors"
          >
            Adjust Budget
          </button>
        </div>
      )}

      {/* Overdue Task Banner */}
      {overdueTasks.length > 0 && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#15151D] border border-[#E4B66A]/50 text-[#F3EBDD] flex items-start justify-between gap-3 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#E4B66A] mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-[#E4B66A]">
                {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? 's' : ''} Need Attention
              </h3>
              <p className="text-xs text-[#A5A3AD] mt-0.5">
                Deadlines have passed for: {overdueTasks.slice(0, 2).map((t) => t.title).join(', ')}
                {overdueTasks.length > 2 ? ` and ${overdueTasks.length - 2} more` : ''}.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('timeline')}
            className="px-3 py-1.5 rounded-xl bg-[#E4B66A] hover:bg-[#DFC490] text-[#0B0B10] text-xs font-bold shrink-0 transition-colors"
          >
            Review Tasks
          </button>
        </div>
      )}

      {/* Main KPI Grid (Elevated Midnight Champagne Surfaces) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Budget */}
        <div className="p-5 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#A5A3AD] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Budget</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#1D1D27] font-semibold text-[#C8A96E] border border-[#30303A]">
                {currency}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#F3EBDD] tabular-nums">
              {formatCurrency(summary.totalBudgetMinor, currency)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#30303A] flex items-center justify-between text-xs text-[#A5A3AD]">
            <span>Contingency Reserve:</span>
            <span className="font-semibold text-[#C8A96E]">
              {formatCurrency(summary.contingencyReserveMinor, currency)} ({plan.budget.contingencyPercentage}%)
            </span>
          </div>
        </div>

        {/* KPI 2: Committed / Planned Spend */}
        <div className="p-5 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#A5A3AD] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Planned Allocations</span>
              <PieChart className="w-4 h-4 text-[#C8A96E]" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#F3EBDD] tabular-nums">
              {formatCurrency(summary.totalEstimatedSpendMinor, currency)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#30303A] flex items-center justify-between text-xs text-[#A5A3AD]">
            <span>Actual Spend To-date:</span>
            <span className="font-semibold text-[#829879]">
              {formatCurrency(summary.totalActualSpendMinor, currency)}
            </span>
          </div>
        </div>

        {/* KPI 3: Remaining Budget */}
        <div className="p-5 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#A5A3AD] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Remaining Buffer</span>
              <TrendingDown
                className={`w-4 h-4 ${summary.remainingEstimatedMinor < 0 ? 'text-[#E47777]' : 'text-[#829879]'}`}
              />
            </div>
            <p
              className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${
                summary.remainingEstimatedMinor < 0 ? 'text-[#E47777]' : 'text-[#F3EBDD]'
              }`}
            >
              {formatCurrency(summary.remainingEstimatedMinor, currency)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#30303A] flex items-center justify-between text-xs text-[#A5A3AD]">
            <span>Unspent Cash:</span>
            <span className="font-semibold text-[#F3EBDD]">
              {formatCurrency(summary.remainingActualMinor, currency)}
            </span>
          </div>
        </div>

        {/* KPI 4: Task Completion */}
        <div className="p-5 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#A5A3AD] mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Milestone Progress</span>
              <Calendar className="w-4 h-4 text-[#C8A96E]" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#F3EBDD] tabular-nums">
                {scheduleValidation.completionPercentage}%
              </p>
              <span className="text-xs text-[#A5A3AD]">
                ({scheduleValidation.totalCompleted}/{scheduleValidation.totalTasks} done)
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#30303A] flex items-center justify-between text-xs text-[#A5A3AD]">
            <span>Vendors Confirmed:</span>
            <span className="font-semibold text-[#C8A96E]">
              {confirmedVendors} of {totalVendors}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Upcoming Tasks & Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F3EBDD]">Immediate Preparation Tasks</h3>
              <p className="text-xs text-[#A5A3AD] mt-0.5">Chronologically ordered by upcoming due date</p>
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-semibold text-[#C8A96E] hover:text-[#DFC490] flex items-center gap-1 transition-colors"
            >
              All Tasks <ArrowRight className="w-3.5 h-3.5 text-[#C8A96E]" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-[#A5A3AD] py-6 text-center">All tasks completed! Great work.</p>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-3 rounded-xl bg-[#1D1D27] border border-[#30303A] hover:border-[#C8A96E]/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0 pr-3">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-[#A5A3AD] hover:text-[#C8A96E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E] rounded"
                      aria-label={`Mark task ${task.title} as completed`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#F3EBDD] truncate">{task.title}</p>
                      <p className="text-[11px] text-[#A5A3AD] mt-0.5">
                        Due: <span className="font-mono text-[#F3EBDD]">{formatDisplayDate(task.dueDate)}</span> ({task.daysBeforeEvent}d before event)
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      task.priority === 'critical'
                        ? 'bg-[rgba(228,119,119,0.15)] text-[#E47777] border border-[#E47777]/30'
                        : task.priority === 'high'
                        ? 'bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border border-[#E4B66A]/30'
                        : 'bg-[#15151D] text-[#829879] border border-[#30303A]'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Planning Assumptions & Critical Decisions */}
        <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#F3EBDD]">Planning Assumptions & Baseline</h3>
              <p className="text-xs text-[#A5A3AD] mt-0.5">
                Assumptions made during AI generation — confirm or edit
              </p>
            </div>
            <span className="text-xs text-[#A5A3AD] font-mono">
              {plan.assumptions.filter((a) => a.isConfirmed).length}/{plan.assumptions.length} Confirmed
            </span>
          </div>

          <div className="space-y-2.5">
            {plan.assumptions.map((asmp) => (
              <div
                key={asmp.id}
                className={`p-3 rounded-xl border transition-all ${
                  asmp.isConfirmed
                    ? 'bg-[#1D1D27] border-[#829879]/50 text-[#F3EBDD]'
                    : 'bg-[#1D1D27] border-[#30303A] text-[#A5A3AD]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96E] block mb-0.5">
                      {asmp.category}
                    </span>
                    <p className="text-xs leading-relaxed text-[#F3EBDD]">{asmp.description}</p>
                  </div>
                  <button
                    onClick={() => onConfirmAssumption(asmp.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      asmp.isConfirmed
                        ? 'bg-[#829879] text-[#0B0B10] font-bold'
                        : 'border border-[#30303A] hover:bg-[#252533] text-[#F3EBDD]'
                    }`}
                  >
                    {asmp.isConfirmed ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0B0B10]" /> Confirmed
                      </>
                    ) : (
                      'Confirm Assumption'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Cards to other workspace modules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('budget')}
          className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] hover:border-[#C8A96E] hover:bg-[#1D1D27] text-left transition-all group"
        >
          <PieChart className="w-5 h-5 text-[#C8A96E] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Budget Breakdown</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">{plan.budget.items.length} line items calculated</p>
        </button>

        <button
          onClick={() => onNavigateTab('vendors')}
          className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] hover:border-[#C8A96E] hover:bg-[#1D1D27] text-left transition-all group"
        >
          <Building2 className="w-5 h-5 text-[#C8A96E] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Vendor Checklist</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">{plan.vendors.items.length} category guides</p>
        </button>

        <button
          onClick={() => onNavigateTab('guests')}
          className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] hover:border-[#829879] hover:bg-[#1D1D27] text-left transition-all group"
        >
          <Users className="w-5 h-5 text-[#829879] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Guest Logistics</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">{plan.eventDetails.guestCount} guests estimated</p>
        </button>

        <button
          onClick={() => onNavigateTab('risks')}
          className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] hover:border-[#E4B66A] hover:bg-[#1D1D27] text-left transition-all group"
        >
          <ShieldAlert className="w-5 h-5 text-[#E4B66A] mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Risk & Contingency</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">{plan.risks.items.length} potential risk vectors</p>
        </button>
      </div>
    </div>
  );
};
