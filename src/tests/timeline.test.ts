import { describe, it, expect } from 'vitest';
import {
  daysBetween,
  calculateDateBeforeEvent,
  validateTaskSchedule,
  sortTasksByDateAndPriority,
} from '../utils/timeline';
import { TimelineTask } from '../types/event';

describe('Timeline Intelligence', () => {
  it('accurately computes days between two ISO dates', () => {
    expect(daysBetween('2026-11-01', '2026-11-15')).toBe(14);
    expect(daysBetween('2026-11-15', '2026-11-01')).toBe(-14);
    expect(daysBetween('2026-11-01', '2026-11-01')).toBe(0);
  });

  it('calculates target date prior to event correctly', () => {
    expect(calculateDateBeforeEvent('2026-12-31', 30)).toBe('2026-12-01');
    expect(calculateDateBeforeEvent('2026-10-15', 10)).toBe('2026-10-05');
  });

  it('detects overdue tasks, post-event tasks, and dependency conflicts', () => {
    const today = '2026-10-28';
    const eventDate = '2026-11-30';

    const tasks: TimelineTask[] = [
      {
        id: 'tsk_1',
        title: 'Overdue venue hunt',
        description: 'Should have happened last week',
        category: 'Venue',
        dueDate: '2026-10-20', // before today -> overdue
        daysBeforeEvent: 41,
        priority: 'critical',
        status: 'todo',
        dependencies: [],
        isAiGenerated: false,
      },
      {
        id: 'tsk_2',
        title: 'Completed early task',
        description: 'Done',
        category: 'Planning',
        dueDate: '2026-10-10', // before today, but completed -> NOT overdue
        daysBeforeEvent: 51,
        priority: 'high',
        status: 'completed',
        dependencies: [],
        isAiGenerated: false,
      },
      {
        id: 'tsk_3',
        title: 'Post event cleanup',
        description: 'After event date',
        category: 'Logistics',
        dueDate: '2026-12-05', // after eventDate -> post event
        daysBeforeEvent: -5,
        priority: 'low',
        status: 'todo',
        dependencies: [],
        isAiGenerated: false,
      },
      {
        id: 'tsk_parent',
        title: 'Parent task',
        description: 'Late parent',
        category: 'General',
        dueDate: '2026-11-20',
        daysBeforeEvent: 10,
        priority: 'medium',
        status: 'todo',
        dependencies: [],
        isAiGenerated: false,
      },
      {
        id: 'tsk_child',
        title: 'Child task depending on parent',
        description: 'Has impossible dependency deadline',
        category: 'General',
        dueDate: '2026-11-10', // Child due BEFORE parent!
        daysBeforeEvent: 20,
        priority: 'high',
        status: 'todo',
        dependencies: ['tsk_parent'],
        isAiGenerated: false,
      },
    ];

    const validation = validateTaskSchedule(tasks, eventDate, today);

    expect(validation.overdueTaskIds.has('tsk_1')).toBe(true);
    expect(validation.overdueTaskIds.has('tsk_2')).toBe(false);
    expect(validation.postEventTaskIds.has('tsk_3')).toBe(true);
    expect(validation.dependencyConflictTaskIds.has('tsk_child')).toBe(true);
    expect(validation.totalCompleted).toBe(1);
    expect(validation.totalTasks).toBe(5);
    expect(validation.completionPercentage).toBe(20);
  });

  it('sorts tasks chronologically and by priority weight', () => {
    const tasks: TimelineTask[] = [
      {
        id: 'tsk_b',
        title: 'Task B (Later date)',
        description: '',
        category: '',
        dueDate: '2026-11-15',
        daysBeforeEvent: 10,
        priority: 'low',
        status: 'todo',
        dependencies: [],
        isAiGenerated: false,
      },
      {
        id: 'tsk_a_low',
        title: 'Task A Low',
        description: '',
        category: '',
        dueDate: '2026-11-05',
        daysBeforeEvent: 20,
        priority: 'low',
        status: 'todo',
        dependencies: [],
        isAiGenerated: false,
      },
      {
        id: 'tsk_a_crit',
        title: 'Task A Critical',
        description: '',
        category: '',
        dueDate: '2026-11-05',
        daysBeforeEvent: 20,
        priority: 'critical',
        status: 'todo',
        dependencies: [],
        isAiGenerated: false,
      },
    ];

    const sorted = sortTasksByDateAndPriority(tasks);
    expect(sorted[0].id).toBe('tsk_a_crit');
    expect(sorted[1].id).toBe('tsk_a_low');
    expect(sorted[2].id).toBe('tsk_b');
  });
});
