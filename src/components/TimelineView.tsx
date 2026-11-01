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
      timeline: {
        tasks: sortTasksByDateAndPriority(updatedTasks),
      },
    });

    setEditingTask(null);
    setIsAddingTask(false);
  };

  const handleDeleteTask = (id: string) => {
    const updated = plan.timeline.tasks.filter((t) => t.id !== id);
    onUpdatePlan({
      ...plan,
      timeline: {
        tasks: updated,
      },
    });
  };

  const filteredTasks = plan.timeline.tasks.filter((task) => {
    if (statusFilter === 'todo' && task.status !== 'todo') return false;
    if (statusFilter === 'in_progress' && task.status !== 'in_progress') return false;
    if (statusFilter === 'completed' && task.status !== 'completed') return false;
    if (statusFilter === 'overdue' && !scheduleValidation.overdueTaskIds.has(task.id)) return false;

    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADCE1]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Milestone Tracking
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#392832] tracking-tight mt-0.5">
            Preparation Timeline & Milestones
          </h2>
          <p className="text-sm text-[#74616B] mt-0.5">
            Date-aware checklist synchronized with event target date ({formatDisplayDate(plan.eventDetails.targetDate)}).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white text-[#B85F80] hover:bg-[#FFF0F3] border border-[#EADCE1] transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B85F80]" />
            <span>AI Re-schedule</span>
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                category: 'Planning',
                dueDate: calculateDateBeforeEvent(plan.eventDetails.targetDate, 14),
                priority: 'medium',
                status: 'todo',
                dependencies: [],
                notes: '',
              });
              setIsAddingTask(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white shadow-xs transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white" /> Add Task
          </button>
        </div>
      </div>

      {/* Progress & Validation Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-[#EADCE1] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#74616B]">Completion</span>
          <p className="text-2xl font-bold font-mono text-[#392832] mt-1 tabular-nums">
            {scheduleValidation.completionPercentage}%
          </p>
          <p className="text-[11px] text-[#998791] mt-0.5">
            {scheduleValidation.totalCompleted} of {scheduleValidation.totalTasks} tasks done
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EADCE1] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#74616B]">Pending Tasks</span>
          <p className="text-2xl font-bold font-mono text-[#B85F80] mt-1 tabular-nums">
            {scheduleValidation.totalPending}
          </p>
          <p className="text-[11px] text-[#998791] mt-0.5">Actionable milestones</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EADCE1] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#74616B]">Overdue Tasks</span>
          <p
            className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
              scheduleValidation.overdueTaskIds.size > 0 ? 'text-[#A87531]' : 'text-[#392832]'
            }`}
          >
            {scheduleValidation.overdueTaskIds.size}
          </p>
          <p className="text-[11px] text-[#998791] mt-0.5">Past due date</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#EADCE1] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#74616B]">Schedule Integrity</span>
          <p
            className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
              scheduleValidation.dependencyConflictTaskIds.size === 0 ? 'text-[#477D60]' : 'text-[#A87531]'
            }`}
          >
            {scheduleValidation.dependencyConflictTaskIds.size === 0 ? '100%' : 'Review'}
          </p>
          <p className="text-[11px] text-[#998791] mt-0.5">
            {scheduleValidation.dependencyConflictTaskIds.size === 0 ? 'No dependency conflicts' : `${scheduleValidation.dependencyConflictTaskIds.size} conflicts`}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'todo', label: 'To Do' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'overdue', label: 'Overdue' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === f.id
                  ? 'bg-[#B85F80] text-white font-bold shadow-xs'
                  : 'bg-white text-[#74616B] hover:bg-[#F8E1E8] hover:text-[#392832] border border-[#EADCE1]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#74616B] font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-xl border border-[#EADCE1] bg-white text-xs text-[#392832] focus:outline-none focus:ring-1 focus:ring-[#B85F80]"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-[#EADCE1] text-center text-xs text-[#74616B] shadow-xs">
            No milestones match your active filters.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isOverdue = scheduleValidation.overdueTaskIds.has(task.id);
            const hasConflict = scheduleValidation.dependencyConflictTaskIds.has(task.id);
            const isPostEvent = scheduleValidation.postEventTaskIds.has(task.id);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                  isCompleted
                    ? 'bg-[#FBF5F6]/70 border-[#EADCE1] opacity-75'
                    : isOverdue
                    ? 'bg-white border-[#A87531]/50 shadow-xs'
                    : 'bg-white border-[#EADCE1] hover:border-[#B85F80]/50 hover:bg-[#FFF0F3]/30'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => handleToggleStatus(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-[#477D60] border-[#477D60] text-white'
                        : 'border-[#EADCE1] bg-white hover:border-[#B85F80]'
                    }`}
                    aria-label={`Mark task ${task.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isCompleted ? 'line-through text-[#998791]' : 'text-[#392832]'
                        }`}
                      >
                        {task.title}
                      </h4>

                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FBF5F6] text-[#74616B] border border-[#EADCE1]">
                        {task.category}
                      </span>

                      {isOverdue && !isCompleted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8ED] text-[#A87531] border border-[#EADCE1]">
                          Overdue
                        </span>
                      )}

                      {hasConflict && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0F3] text-[#B94D5A] border border-[#B94D5A]/30">
                          Dependency Warning
                        </span>
                      )}

                      {isPostEvent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF8ED] text-[#B89555] border border-[#EADCE1]">
                          Post-Event Task
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-[#74616B] leading-relaxed">{task.description}</p>
                    )}

                    {task.notes && (
                      <p className="text-[11px] text-[#998791] italic">Note: {task.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EADCE1]">
                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-[#B89555] font-semibold block">
                      {formatDisplayDate(task.dueDate)}
                    </span>
                    <span className="text-[10px] text-[#998791] block">
                      {task.daysBeforeEvent > 0
                        ? `${task.daysBeforeEvent} days before`
                        : task.daysBeforeEvent === 0
                        ? 'Event Day'
                        : `${Math.abs(task.daysBeforeEvent)} days after`}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      task.priority === 'critical'
                        ? 'bg-[#FFF0F3] text-[#B94D5A] border border-[#B94D5A]/30'
                        : task.priority === 'high'
                        ? 'bg-[#FFF8ED] text-[#A87531] border border-[#A87531]/30'
                        : 'bg-[#FBF5F6] text-[#74616B] border border-[#EADCE1]'
                    }`}
                  >
                    {task.priority}
                  </span>

                  <div className="flex items-center gap-1">
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
                      className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
                      aria-label={`Edit task ${task.title}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-[#74616B] hover:text-[#B94D5A] hover:bg-[#FFF0F3]"
                      aria-label={`Delete task ${task.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EADCE1] space-y-4">
            <h3 className="font-editorial text-base font-bold text-[#392832]">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Schedule Cake Tasting, Confirm Sound Setup"
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific instructions, location, or deliverables..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Photography">Photography</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Invitations">Invitations</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Planning">Planning</option>
                    <option value="Legal & Permits">Legal & Permits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="nice_to_have">Nice to have</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Contact person, phone, reservation number..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADCE1]">
              <button
                type="button"
                onClick={() => {
                  setEditingTask(null);
                  setIsAddingTask(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTask}
                disabled={!formData.title.trim()}
                className="px-5 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] disabled:opacity-40 text-white text-xs font-bold shadow-xs active:scale-[0.98]"
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
