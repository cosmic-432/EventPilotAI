import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventRepository } from '../storage/eventRepository';
import { EventPlan } from '../types/event';

// Mock localStorage for node environment
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((idx: number) => Object.keys(store)[idx] || null),
  };
};

function createSamplePlan(): EventPlan {
  return {
    id: 'plan_test_001',
    schemaVersion: 1,
    eventDetails: {
      id: 'evt_001',
      name: 'Royale Pune Wedding',
      category: 'wedding',
      targetDate: '2026-12-15',
      location: 'Pune',
      venueStatus: 'need_to_find',
      venuePreference: 'outdoor',
      guestCount: 200,
      totalBudgetMinor: 80000000,
      currency: 'INR',
      styleTheme: 'Light Velvet Rose',
      dietaryRequirements: ['Vegetarian'],
      accessibilityRequirements: ['Wheelchair Ramps'],
      priorities: ['Catering', 'Decor'],
      status: 'active',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    },
    assumptions: [],
    budget: {
      totalBudgetMinor: 80000000,
      contingencyPercentage: 10,
      contingencyReserveMinor: 8000000,
      currency: 'INR',
      items: [],
    },
    timeline: {
      tasks: [
        {
          id: 'tsk_1',
          title: 'Book Lawn Venue',
          description: '',
          category: 'Venue',
          dueDate: '2026-11-15',
          daysBeforeEvent: 30,
          priority: 'critical',
          status: 'todo',
          dependencies: [],
          isAiGenerated: true,
        },
      ],
    },
    vendors: { items: [] },
    guestPlan: {
      estimatedGuests: 200,
      cateringPerHeadMinor: 120000,
      estimatedSpaceSqFt: 5000,
      seatingStyle: 'Round tables',
      dietaryBreakdown: { Vegetarian: 150 },
      accessibilityProvisions: [],
      logisticsNotes: [],
    },
    ideas: { themeConcepts: [], sustainabilitySuggestions: [], costSavingAlternatives: [] },
    risks: { items: [] },
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  };
}

describe('EventRepository Storage Engine', () => {
  let repo: EventRepository;

  beforeEach(() => {
    const mockStorage = createMockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    vi.stubGlobal('window', { localStorage: mockStorage });
    repo = new EventRepository();
    repo.clearCache();
  });

  it('saves and retrieves an event plan via memory cache and localStorage', () => {
    const samplePlan = createSamplePlan();
    const saved = repo.savePlan(samplePlan);
    expect(saved).toBe(true);

    const loaded = repo.getPlanById('plan_test_001');
    expect(loaded).not.toBeNull();
    expect(loaded?.eventDetails.name).toBe('Royale Pune Wedding');

    // List plans index check
    const list = repo.listPlans();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('plan_test_001');
    expect(list[0].name).toBe('Royale Pune Wedding');
    expect(list[0].progressPercentage).toBe(0);
  });

  it('accurately calculates timeline progress percentage in index', () => {
    const samplePlan = createSamplePlan();
    const planWithCompletedTask: EventPlan = {
      ...samplePlan,
      timeline: {
        tasks: [
          { ...samplePlan.timeline.tasks[0], status: 'completed' },
          {
            id: 'tsk_2',
            title: 'Send Invitations',
            description: '',
            category: 'Invitations',
            dueDate: '2026-11-20',
            daysBeforeEvent: 25,
            priority: 'high',
            status: 'todo',
            dependencies: [],
            isAiGenerated: true,
          },
        ],
      },
    };

    repo.savePlan(planWithCompletedTask);
    const list = repo.listPlans();
    // 1 completed out of 2 tasks = 50%
    expect(list[0].progressPercentage).toBe(50);
  });

  it('creates a fresh plan with guaranteed unique ID without overwriting existing plans', () => {
    const samplePlan = createSamplePlan();
    repo.savePlan(samplePlan);
    const initialList = repo.listPlans();
    expect(initialList.length).toBe(1);

    const newPlan = repo.createNewPlan(samplePlan);
    expect(newPlan.id).not.toBe(samplePlan.id);
    expect(newPlan.id.startsWith('plan_')).toBe(true);

    const updatedList = repo.listPlans();
    expect(updatedList.length).toBe(2);
    expect(repo.getPlanById(samplePlan.id)).not.toBeNull();
    expect(repo.getPlanById(newPlan.id)).not.toBeNull();
  });

  it('duplicates an event plan creating an independent draft copy', () => {
    const samplePlan = createSamplePlan();
    repo.savePlan(samplePlan);
    const copy = repo.duplicatePlan('plan_test_001');
    expect(copy).not.toBeNull();
    expect(copy?.id).not.toBe('plan_test_001');
    expect(copy?.eventDetails.name).toBe('Royale Pune Wedding (Copy)');
    expect(copy?.eventDetails.status).toBe('draft');

    const all = repo.listPlans();
    expect(all.length).toBe(2);
  });

  it('renames an event plan and synchronizes the index entry', () => {
    const samplePlan = createSamplePlan();
    repo.savePlan(samplePlan);
    const ok = repo.renamePlan('plan_test_001', 'Ananya & Rohan Celebration');
    expect(ok).toBe(true);

    const loaded = repo.getPlanById('plan_test_001');
    expect(loaded?.eventDetails.name).toBe('Ananya & Rohan Celebration');

    const indexEntry = repo.listPlans().find((p) => p.id === 'plan_test_001');
    expect(indexEntry?.name).toBe('Ananya & Rohan Celebration');
  });

  it('toggles archive status and updates plan status safely', () => {
    const samplePlan = createSamplePlan();
    repo.savePlan(samplePlan);
    expect(repo.getPlanById('plan_test_001')?.eventDetails.status).toBe('active');

    repo.toggleArchivePlan('plan_test_001');
    expect(repo.getPlanById('plan_test_001')?.eventDetails.status).toBe('archived');

    repo.toggleArchivePlan('plan_test_001');
    expect(repo.getPlanById('plan_test_001')?.eventDetails.status).toBe('active');

    repo.updatePlanStatus('plan_test_001', 'confirmed');
    expect(repo.getPlanById('plan_test_001')?.eventDetails.status).toBe('confirmed');
  });

  it('deletes an event plan and auto-promotes remaining active plan in storage', () => {
    const samplePlan = createSamplePlan();
    repo.savePlan(samplePlan);
    const secondPlan = repo.createNewPlan({
      ...samplePlan,
      eventDetails: { ...samplePlan.eventDetails, name: 'Second Gala' },
    });

    repo.setActivePlanId('plan_test_001');
    expect(repo.getActivePlan()?.id).toBe('plan_test_001');

    const deleted = repo.deletePlan('plan_test_001');
    expect(deleted).toBe(true);
    expect(repo.getPlanById('plan_test_001')).toBeNull();

    // Active plan should fallback to the remaining plan
    const active = repo.getActivePlan();
    expect(active?.id).toBe(secondPlan.id);
  });

  it('supports undo and redo stacks with bounded history', () => {
    const initialPlan = createSamplePlan();
    repo.savePlan(initialPlan, false);
    expect(repo.canUndo()).toBe(false);

    // Mutation 1
    const modified1: EventPlan = {
      ...initialPlan,
      eventDetails: { ...initialPlan.eventDetails, name: 'Modified Name 1' },
    };
    repo.savePlan(modified1, true);
    expect(repo.canUndo()).toBe(true);
    expect(repo.canRedo()).toBe(false);

    // Undo
    const undone = repo.undo(modified1);
    expect(undone?.eventDetails.name).toBe('Royale Pune Wedding');
    expect(repo.canRedo()).toBe(true);

    // Redo
    const redone = repo.redo(undone!);
    expect(redone?.eventDetails.name).toBe('Modified Name 1');
  });

  it('exports and imports JSON plans accurately', () => {
    const samplePlan = createSamplePlan();
    const jsonStr = repo.exportPlanJson(samplePlan);
    expect(jsonStr).toContain('Royale Pune Wedding');

    const imported = repo.importPlanJson(jsonStr);
    expect(imported).not.toBeNull();
    expect(imported?.id).not.toBe(samplePlan.id); // Ensures unique imported ID
    expect(imported?.eventDetails.name).toBe('Royale Pune Wedding');

    // Invalid JSON handling
    const invalidImport = repo.importPlanJson('{"bad": "json"}');
    expect(invalidImport).toBeNull();
  });

  it('recovers gracefully from corrupted localStorage items without throwing uncaught errors', () => {
    localStorage.setItem('eventpilot_plans_index', '{not valid json');
    localStorage.setItem('eventpilot_plan_bad', 'undefined');

    const list = repo.listPlans();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);

    const badPlan = repo.getPlanById('bad');
    expect(badPlan).toBeNull();
  });

  it('handles localStorage quota exceeded simulation gracefully without crashing', () => {
    const originalSetItem = localStorage.setItem;
    // Simulate QuotaExceededError
    localStorage.setItem = () => {
      const quotaErr = new Error('The quota has been exceeded.');
      quotaErr.name = 'QuotaExceededError';
      throw quotaErr;
    };

    const samplePlan = createSamplePlan();
    expect(() => {
      // savePlan catches storage errors internally
      repo.savePlan(samplePlan);
    }).not.toThrow();

    // Restore original setItem
    localStorage.setItem = originalSetItem;
  });

  it('automatically sets next available plan as active when current active plan is deleted', () => {
    const plan1 = repo.createNewPlan(createSamplePlan());
    const plan2 = repo.createNewPlan({
      ...createSamplePlan(),
      eventDetails: { ...createSamplePlan().eventDetails, name: 'Second Gala' },
    });

    expect(repo.getActivePlan()?.id).toBe(plan2.id);

    // Delete active plan
    repo.deletePlan(plan2.id);

    // Active plan should automatically switch to plan1
    const activeAfterDelete = repo.getActivePlan();
    expect(activeAfterDelete?.id).toBe(plan1.id);
    expect(activeAfterDelete?.eventDetails.name).toBe('Royale Pune Wedding');
  });
});
