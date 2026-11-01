import React from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { EventPlan, TimelineTask, PriorityLevel, TaskStatus } from '../types/event';
import {
  validateTaskSchedule,
  formatDisplayDate,
  sortTasksByDateAndPriority,
  calculateDateBeforeEvent,
  daysBetween,
  getTodayIso,
} from '../utils/timeline';
import { generateId } from '../utils/validation';

interface TimelineViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenRegenerate: () => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  plan,
  onUpdatePlan,
  onOpenRegenerate,
}) => {
  const scheduleValidation = validateTaskSchedule(
    plan.timeline.tasks,
    plan.eventDetails.targetDate
  );

  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [editingTask, setEditingTask] = React.useState<TimelineTask | null>(null);
  const [isAddingTask, setIsAddingTask] = React.useState(false);

  const [formData, setFormData] = React.useState<{
    title: string;
    description: string;
    category: string;
    dueDate: string;
    priority: PriorityLevel;
    status: TaskStatus;
    dependencies: string[];
    notes: string;
  }>({
    title: '',
    description: '',
    category: 'Planning',
    dueDate: calculateDateBeforeEvent(plan.eventDetails.targetDate, 14),
    priority: 'medium',
    status: 'todo',
    dependencies: [],
    notes: '',
  });

  const handleToggleStatus = (taskId: string) => {
    const updated = plan.timeline.tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    onUpdatePlan({
      ...plan,
      timeline: { tasks: updated },
    });
  };

  const handleSaveTask = () => {
    if (!formData.title.trim()) return;

    const daysBefore = daysBetween(formData.dueDate, plan.eventDetails.targetDate);
    let updatedTasks = [...plan.timeline.tasks];

    if (editingTask) {
      updatedTasks = updatedTasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: formData.title,
              description: formData.description,
              category: formData.category,
              dueDate: formData.dueDate,
              daysBeforeEvent: daysBefore,
              priority: formData.priority,
              status: formData.status,
              dependencies: formData.dependencies,
              notes: formData.notes,
              isAiGenerated: false,
            }
          : t
      );
    } else {
      const newTask: TimelineTask = {
        id: generateId('tsk_usr'),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dueDate: formData.dueDate,
        daysBeforeEvent: daysBefore,
        priority: formData.priority,
        status: formData.status,
        dependencies: formData.dependencies,
        notes: formData.notes,
        isAiGenerated: false,
      };
      updatedTasks.push(newTask);
    }

    onUpdatePlan({
      ...plan,
      timeline: { tasks: sortTasksByDateAndPriority(updatedTasks) },
    });

    setEditingTask(null);
    setIsAddingTask(false);
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = plan.timeline.tasks.filter((t) => t.id !== taskId);
    onUpdatePlan({
      ...plan,
      timeline: { tasks: updated },
    });
  };

  // Filter tasks
  const sortedTasks = sortTasksByDateAndPriority(plan.timeline.tasks);
  const filteredTasks = sortedTasks.filter((t) => {
    if (statusFilter === 'overdue') {
      return scheduleValidation.overdueTaskIds.has(t.id);
    }
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F3EBDD] tracking-tight">
            Preparation Timeline & Action Tasks
          </h2>
          <p className="text-xs text-[#A5A3AD] mt-0.5">
            Event Date: <span className="font-semibold text-[#C8A96E]">{formatDisplayDate(plan.eventDetails.targetDate)}</span> ({daysBetween(getTodayIso(), plan.eventDetails.targetDate)} days away).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#15151D] text-[#C8A96E] hover:bg-[#1D1D27] border border-[#30303A] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
            <span>AI Schedule Optimizer</span>
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                category: 'General',
                dueDate: calculateDateBeforeEvent(plan.eventDetails.targetDate, 14),
                priority: 'medium',
                status: 'todo',
                dependencies: [],
                notes: '',
              });
              setIsAddingTask(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#0B0B10]" /> Add Task
          </button>
        </div>
      </div>

      {/* Progress & Validation Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A3AD]">Completion</span>
          <p className="text-2xl font-extrabold text-[#F3EBDD] mt-1 tabular-nums">
            {scheduleValidation.completionPercentage}%
          </p>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">
            {scheduleValidation.totalCompleted} of {scheduleValidation.totalTasks} tasks done
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A3AD]">Pending Tasks</span>
          <p className="text-2xl font-extrabold text-[#C8A96E] mt-1 tabular-nums">
            {scheduleValidation.totalPending}
          </p>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">Actionable milestones</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A3AD]">Overdue Tasks</span>
          <p
            className={`text-2xl font-extrabold mt-1 tabular-nums ${
              scheduleValidation.overdueTaskIds.size > 0 ? 'text-[#E4B66A]' : 'text-[#F3EBDD]'
            }`}
          >
            {scheduleValidation.overdueTaskIds.size}
          </p>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">Past due date</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5A3AD]">Schedule Conflicts</span>
          <p
            className={`text-2xl font-extrabold mt-1 tabular-nums ${
              scheduleValidation.dependencyConflictTaskIds.size > 0 ? 'text-[#E47777]' : 'text-[#F3EBDD]'
            }`}
          >
            {scheduleValidation.dependencyConflictTaskIds.size}
          </p>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">Dependency mismatch</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: `All (${plan.timeline.tasks.length})` },
            { id: 'todo', label: 'To Do' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'overdue', label: `Overdue (${scheduleValidation.overdueTaskIds.size})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-[#C8A96E] text-[#0B0B10] font-bold shadow-xs'
                  : 'bg-[#15151D] text-[#A5A3AD] hover:bg-[#1D1D27] hover:text-[#F3EBDD] border border-[#30303A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#A5A3AD] font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[#30303A] bg-[#15151D] text-xs font-semibold text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-[#15151D] rounded-3xl border border-[#30303A] text-[#A5A3AD] text-xs">
            No tasks found matching filter criteria.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isOverdue = scheduleValidation.overdueTaskIds.has(task.id);
            const isConflict = scheduleValidation.dependencyConflictTaskIds.has(task.id);
            const isPostEvent = scheduleValidation.postEventTaskIds.has(task.id);
            const isCompleted = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-[#15151D] border transition-all ${
                  isCompleted
                    ? 'border-[#30303A] bg-[#15151D]/60 opacity-75'
                    : isOverdue
                    ? 'border-[#E4B66A]/60 bg-[#15151D] ring-1 ring-[#E4B66A]/30'
                    : 'border-[#30303A] hover:border-[#C8A96E]/50 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Checkbox + Title + Description */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleStatus(task.id)}
                      className={`mt-0.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E] ${
                        isCompleted
                          ? 'text-[#829879] hover:text-[#829879]/80'
                          : 'text-[#A5A3AD] hover:text-[#C8A96E]'
                      }`}
                      aria-label={`Toggle completion of ${task.title}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold ${
                            isCompleted ? 'line-through text-[#72707B]' : 'text-[#F3EBDD]'
                          }`}
                        >
                          {task.title}
                        </span>

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#1D1D27] text-[#A5A3AD] border border-[#30303A]">
                          {task.category}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            task.priority === 'critical'
                              ? 'bg-[rgba(228,119,119,0.15)] text-[#E47777] border border-[#E47777]/30'
                              : task.priority === 'high'
                              ? 'bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border border-[#E4B66A]/30'
                              : 'bg-[#1D1D27] text-[#829879] border border-[#30303A]'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {isOverdue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border border-[#E4B66A]/30 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#E4B66A]" /> Overdue
                          </span>
                        )}

                        {isConflict && (
                          <span
                            title="This task is scheduled earlier than a task it depends on!"
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(228,119,119,0.15)] text-[#E47777] border border-[#E47777]/30 flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" /> Dependency Conflict
                          </span>
                        )}

                        {isPostEvent && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1D1D27] text-[#C8A96E] border border-[#30303A]">
                            Post-Event
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-[#A5A3AD] leading-relaxed mb-2">
                          {task.description}
                        </p>
                      )}

                      {/* Meta Footer */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#72707B] font-mono">
                        <span>📅 Due: <strong className="text-[#F3EBDD] font-mono">{formatDisplayDate(task.dueDate)}</strong> ({task.daysBeforeEvent}d before event)</span>
                        {task.notes && <span className="text-[#A5A3AD] italic font-sans">📝 {task.notes}</span>}
                        {task.isAiGenerated && (
                          <span className="text-[#C8A96E] font-sans font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-[#C8A96E]" /> AI Generated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setFormData({
                          title: task.title,
                          description: task.description,
                          category: task.category,
                          dueDate: task.dueDate,
                          priority: task.priority,
                          status: task.status,
                          dependencies: task.dependencies || [],
                          notes: task.notes || '',
                        });
                        setIsAddingTask(true);
                      }}
                      className="p-1.5 rounded-lg text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#1D1D27]"
                      aria-label={`Edit task ${task.title}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-[#A5A3AD] hover:text-[#E47777] hover:bg-[rgba(228,119,119,0.1)]"
                      aria-label={`Delete task ${task.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isAddingTask && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B10]/80 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-[#15151D] rounded-3xl p-6 shadow-2xl border border-[#30303A] space-y-4">
            <h3 className="text-base font-bold text-[#F3EBDD]">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule final sound check, Confirm guest transport"
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Actionable Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific instructions or deliverables..."
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Venue, Catering, Decor"
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="nice_to_have">Nice to have</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dependencies, contact person, or vendor links..."
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30303A]">
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsAddingTask(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-semibold text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#252533]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={!formData.title.trim()}
                className="px-5 py-2 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 text-[#0B0B10] text-xs font-bold shadow-xs"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
