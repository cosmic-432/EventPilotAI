import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventRepository } from '../storage/eventRepository';
import { EventPlan } from '../types/event';
import { normalizeAiPlan } from '../utils/validation';
import { calculateBudgetSummary, toMinorUnits } from '../utils/currency';
import { exportBudgetToCsv, exportExecutiveSummaryText } from '../utils/export';
import { validateTaskSchedule } from '../utils/timeline';

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

describe('End-to-End User Journeys', () => {
  let repo: EventRepository;

  beforeEach(() => {
    const mockStorage = createMockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
    vi.stubGlobal('window', { localStorage: mockStorage });
    repo = new EventRepository();
    repo.clearCache();
  });

  it('Journey 1: Full Financial Planning Lifecycle with zero rounding errors', () => {
    // 1. User inputs requirements
    const userInputs = {
      name: 'Pune Heritage Wedding',
      category: 'wedding' as const,
      targetDate: '2026-12-25',
      location: 'Pune',
      guestCount: 250,
      totalBudgetMinor: toMinorUnits(800000, 'INR'), // 80,000,000 paise
      currency: 'INR',
    };

    // 2. AI generates raw items
    const rawAi = {
      budget: {
        contingencyPercentage: 10,
        items: [
          {
            id: 'b1',
            category: 'Venue',
            description: 'Lawn & Hall',
            estimatedAmountMajor: 240000,
            quantity: 1,
            priority: 'critical',
          },
          {
            id: 'b2',
            category: 'Catering',
            description: 'Vegetarian Buffet',
            estimatedAmountMajor: 320000,
            quantity: 250,
            priority: 'critical',
          },
        ],
      },
    };

    const plan = normalizeAiPlan(rawAi, userInputs);
    repo.savePlan(plan);

    // Initial summary check
    let summary = calculateBudgetSummary(plan.budget);
    expect(summary.totalBudgetMinor).toBe(80000000);
    expect(summary.contingencyReserveMinor).toBe(8000000); // 10%
    expect(summary.totalEstimatedSpendMinor).toBe(56000000);
    expect(summary.remainingEstimatedMinor).toBe(16000000); // 80L - (56L + 8L)
    expect(summary.isOverrun).toBe(false);

    // 3. User logs actual paid receipts
    plan.budget.items[0].actualAmountMinor = 22000000; // Venue came in ₹20,000 under budget
    plan.budget.items[0].paymentStatus = 'paid_in_full';
    plan.budget.items[1].actualAmountMinor = 33000000; // Catering had small extra guest addon
    plan.budget.items[1].paymentStatus = 'deposit_paid';
    repo.savePlan(plan);

    summary = calculateBudgetSummary(plan.budget);
    expect(summary.totalActualSpendMinor).toBe(55000000); // 22L + 33L
    expect(summary.remainingActualMinor).toBe(25000000); // 80L - 55L
    expect(summary.isOverrun).toBe(false);

    // 4. Export CSV check
    const csv = exportBudgetToCsv(plan);
    expect(csv).toContain('Estimated Amount (INR)');
    expect(csv).toContain('Lawn & Hall');
    expect(csv).toContain('Vegetarian Buffet');
  });

  it('Journey 2: Milestone Timeline Progression & Overdue Detection', () => {
    const userInputs = {
      name: 'Tech Fest',
      category: 'college_festival' as const,
      targetDate: '2026-12-01',
      location: 'Bangalore',
      guestCount: 1000,
      totalBudgetMinor: toMinorUnits(500000, 'INR'),
      currency: 'INR',
    };

    const rawAi = {
      timeline: {
        tasks: [
          {
            id: 't1',
            title: 'Book Auditorium',
            daysBeforeEvent: 60,
            priority: 'critical',
          },
          {
            id: 't2',
            title: 'Publish Schedule',
            daysBeforeEvent: 14,
            priority: 'high',
          },
        ],
      },
    };

    const plan = normalizeAiPlan(rawAi, userInputs);
    repo.savePlan(plan);

    // Check task dates scheduled backward from Dec 1, 2026
    const taskAuditorium = plan.timeline.tasks.find((t) => t.id === 't1')!;
    expect(taskAuditorium.dueDate).toBe('2026-10-02');

    // Toggle completion
    taskAuditorium.status = 'completed';
    repo.savePlan(plan);

    const indexEntry = repo.listPlans().find((p) => p.id === plan.id);
    // 1 completed out of 2 = 50%
    expect(indexEntry?.progressPercentage).toBe(50);
  });

  it('Journey 3: Multi-Event Portfolio Lifecycle (Create, Duplicate, Switch, Archive)', () => {
    // 1. Create Event 1
    const event1 = repo.createNewPlan(
      normalizeAiPlan({}, {
        name: 'Wedding Gala',
        category: 'wedding',
        targetDate: '2026-11-20',
        location: 'Mumbai',
        guestCount: 150,
        totalBudgetMinor: 50000000,
        currency: 'INR',
      })
    );

    // 2. Create Event 2
    const event2 = repo.createNewPlan(
      normalizeAiPlan({}, {
        name: 'Charity Dinner',
        category: 'fundraiser',
        targetDate: '2026-12-10',
        location: 'Delhi',
        guestCount: 100,
        totalBudgetMinor: 30000000,
        currency: 'INR',
      })
    );

    expect(repo.listPlans().length).toBe(2);

    // 3. Duplicate Event 1
    const duplicate = repo.duplicatePlan(event1.id);
    expect(duplicate?.eventDetails.name).toBe('Wedding Gala (Copy)');
    expect(repo.listPlans().length).toBe(3);

    // 4. Switch Active Plan to Event 2
    repo.setActivePlanId(event2.id);
    expect(repo.getActivePlan()?.id).toBe(event2.id);

    // 5. Archive duplicate
    repo.toggleArchivePlan(duplicate!.id);
    const updatedDuplicate = repo.getPlanById(duplicate!.id);
    expect(updatedDuplicate?.eventDetails.status).toBe('archived');
  });

  it('Journey 4: Executive Dossier Generation & JSON Portability', () => {
    const plan = normalizeAiPlan(
      {
        eventDetails: { name: 'Golden Jubilee Celebration' },
        budget: { items: [{ description: 'Grand Hall', estimatedAmountMajor: 100000 }] },
      },
      {
        name: 'Golden Jubilee Celebration',
        category: 'anniversary',
        targetDate: '2026-12-30',
        location: 'Goa',
        guestCount: 80,
        totalBudgetMinor: 35000000,
        currency: 'INR',
      }
    );

    // Executive summary text export
    const textReport = exportExecutiveSummaryText(plan);
    expect(textReport).toContain('Event Executive Master Plan');
    expect(textReport).toContain('Golden Jubilee Celebration');

    // JSON Export & Re-Import
    const jsonStr = repo.exportPlanJson(plan);
    const imported = repo.importPlanJson(jsonStr);
    expect(imported).not.toBeNull();
    expect(imported?.eventDetails.name).toBe('Golden Jubilee Celebration');
  });
});
