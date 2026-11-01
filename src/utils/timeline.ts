/**
 * Timeline & Date Intelligence Utilities
 * Ensures date math is timezone-safe (date-only ISO strings) and validates
 * task dependencies, overdue status, and impossible scheduling.
 */

import { TimelineTask } from '../types/event';

/**
 * Returns today's date in YYYY-MM-DD
 */
export function getTodayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates days between two YYYY-MM-DD strings (date2 - date1)
 */
export function daysBetween(date1Iso: string, date2Iso: string): number {
  if (!date1Iso || !date2Iso) return 0;
  const d1 = new Date(`${date1Iso}T00:00:00Z`).getTime();
  const d2 = new Date(`${date2Iso}T00:00:00Z`).getTime();
  const diffMs = d2 - d1;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Computes a target date string given an event date and days before event
 */
export function calculateDateBeforeEvent(eventDateIso: string, daysBefore: number): string {
  if (!eventDateIso) return getTodayIso();
  const d = new Date(`${eventDateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - daysBefore);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string for display (e.g. "Sat, Nov 14, 2026")
 */
export function formatDisplayDate(dateIso: string): string {
  if (!dateIso) return 'Not set';
  try {
    const parts = dateIso.split('-');
    if (parts.length !== 3) return dateIso;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateIso;
  }
}

/**
 * Validates task schedule integrity:
 * 1. Checks if overdue (dueDate < today && not completed)
 * 2. Checks if due date is after the event date
 * 3. Checks if dependency dates conflict (dependency task due AFTER dependent task)
 */
export interface ScheduleValidationResult {
  overdueTaskIds: Set<string>;
  postEventTaskIds: Set<string>;
  dependencyConflictTaskIds: Set<string>;
  totalCompleted: number;
  totalPending: number;
  totalTasks: number;
  completionPercentage: number;
}

export function validateTaskSchedule(
  tasks: TimelineTask[],
  eventDateIso: string,
  todayIso: string = getTodayIso()
): ScheduleValidationResult {
  const overdueTaskIds = new Set<string>();
  const postEventTaskIds = new Set<string>();
  const dependencyConflictTaskIds = new Set<string>();

  const taskMap = new Map<string, TimelineTask>();
  for (const t of tasks) {
    taskMap.set(t.id, t);
  }

  let totalCompleted = 0;

  for (const task of tasks) {
    if (task.status === 'completed') {
      totalCompleted += 1;
    } else {
      // Check overdue
      if (task.dueDate && task.dueDate < todayIso) {
        overdueTaskIds.add(task.id);
      }
    }

    // Check if task is scheduled after event
    if (task.dueDate && eventDateIso && task.dueDate > eventDateIso) {
      postEventTaskIds.add(task.id);
    }

    // Check dependency conflicts
    if (task.dependencies && task.dependencies.length > 0) {
      for (const depId of task.dependencies) {
        const depTask = taskMap.get(depId);
        if (depTask && depTask.dueDate && task.dueDate) {
          if (depTask.dueDate > task.dueDate) {
            dependencyConflictTaskIds.add(task.id);
          }
        }
      }
    }
  }

  const totalTasks = tasks.length;
  const totalPending = totalTasks - totalCompleted;
  const completionPercentage =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return {
    overdueTaskIds,
    postEventTaskIds,
    dependencyConflictTaskIds,
    totalCompleted,
    totalPending,
    totalTasks,
    completionPercentage,
  };
}

/**
 * Sorts tasks chronologically by due date, then by priority
 */
const PRIORITY_WEIGHTS: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  nice_to_have: 0,
};

export function sortTasksByDateAndPriority(tasks: TimelineTask[]): TimelineTask[] {
  return [...tasks].sort((a, b) => {
    if (a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    const weightA = PRIORITY_WEIGHTS[a.priority] ?? 1;
    const weightB = PRIORITY_WEIGHTS[b.priority] ?? 1;
    return weightB - weightA;
  });
}
