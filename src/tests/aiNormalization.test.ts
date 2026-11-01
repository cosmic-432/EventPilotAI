import { describe, it, expect } from 'vitest';
import { normalizeAiPlan, sanitizeText } from '../utils/validation';

describe('AI Plan Normalization & Defensive Parsing', () => {
  const defaultInputs = {
    name: 'Ananya & Rohan Wedding',
    category: 'wedding' as const,
    targetDate: '2026-12-31',
    location: 'Pune',
    guestCount: 200,
    totalBudgetMinor: 80000000, // ₹8,00,000
    currency: 'INR',
    venuePreference: 'outdoor' as const,
  };

  it('normalizes valid raw AI output into a fully typed EventPlan', () => {
    const rawAi = {
      eventDetails: {
        name: 'Grand Pune Wedding',
        category: 'wedding',
        location: 'Pune, Maharashtra',
        styleTheme: 'Light Velvet Rose & Brass Urns',
      },
      budget: {
        contingencyPercentage: 10,
        items: [
          {
            id: 'b_1',
            category: 'Venue',
            description: 'Lawn rental',
            estimatedAmountMajor: 240000,
            quantity: 1,
            priority: 'critical',
          },
          {
            id: 'b_2',
            category: 'Catering',
            description: 'Buffet lunch',
            estimatedAmountMajor: 300000,
            quantity: 200,
            priority: 'critical',
          },
        ],
      },
      timeline: {
        tasks: [
          {
            id: 't_1',
            title: 'Book Photographer',
            daysBeforeEvent: 45,
            priority: 'high',
          },
        ],
      },
      vendors: {
        items: [
          {
            id: 'v_1',
            title: 'Lead Cinematographer',
            estimatedCostMajor: 60000,
          },
        ],
      },
    };

    const plan = normalizeAiPlan(rawAi, defaultInputs);
    expect(plan.id).toBeDefined();
    expect(plan.eventDetails.name).toBe('Grand Pune Wedding');
    expect(plan.budget.totalBudgetMinor).toBe(80000000);

    // Minor unit conversion verification
    expect(plan.budget.items[0].estimatedAmountMinor).toBe(24000000); // 240000 * 100 paise
    expect(plan.budget.items[1].estimatedAmountMinor).toBe(30000000); // 300000 * 100 paise

    // Contingency reserve: 10% of 80000000 = 8000000
    expect(plan.budget.contingencyPercentage).toBe(10);
    expect(plan.budget.contingencyReserveMinor).toBe(8000000);

    // Timeline calculation
    expect(plan.timeline.tasks[0].daysBeforeEvent).toBe(45);
    expect(plan.timeline.tasks[0].dueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('clamps invalid contingency percentage safely within 0% to 30%', () => {
    const rawWithExcessContingency = {
      budget: { contingencyPercentage: 75, items: [] },
    };
    const plan1 = normalizeAiPlan(rawWithExcessContingency, defaultInputs);
    expect(plan1.budget.contingencyPercentage).toBe(30);

    const rawWithNegativeContingency = {
      budget: { contingencyPercentage: -15, items: [] },
    };
    const plan2 = normalizeAiPlan(rawWithNegativeContingency, defaultInputs);
    expect(plan2.budget.contingencyPercentage).toBe(0);
  });

  it('fills comprehensive fallback defaults when AI response is partial or empty', () => {
    const plan = normalizeAiPlan({}, defaultInputs);

    expect(plan.eventDetails.name).toBe('Ananya & Rohan Wedding');
    expect(plan.eventDetails.location).toBe('Pune');
    expect(plan.assumptions.length).toBeGreaterThan(0);
    expect(plan.guestPlan.estimatedGuests).toBe(200);
    expect(plan.guestPlan.cateringPerHeadMinor).toBeGreaterThan(0);
    expect(plan.ideas.sustainabilitySuggestions.length).toBeGreaterThan(0);
  });

  it('strips script tags and malicious HTML payloads during sanitization', () => {
    const maliciousInput = '<script>alert("xss")</script>Traditional Palace Gala';
    const sanitized = sanitizeText(maliciousInput);
    expect(sanitized).toBe('Traditional Palace Gala');
    expect(sanitized).not.toContain('<script>');
  });

  it('correctly handles non-INR currencies like USD and EUR', () => {
    const usdInputs = {
      name: 'Austin Tech Summit',
      category: 'corporate' as const,
      targetDate: '2026-10-10',
      location: 'Austin, TX',
      guestCount: 500,
      totalBudgetMinor: 5000000, // $50,000 in cents
      currency: 'USD',
    };

    const rawAi = {
      budget: {
        items: [
          {
            description: 'Keynote Stage',
            estimatedAmountMajor: 15000,
          },
        ],
      },
    };

    const plan = normalizeAiPlan(rawAi, usdInputs);
    expect(plan.budget.currency).toBe('USD');
    expect(plan.budget.items[0].estimatedAmountMinor).toBe(1500000); // 15000 * 100 cents
  });

  it('handles completely malformed raw AI payload gracefully (null, numbers, strings)', () => {
    // Passing null as raw AI data
    const planNull = normalizeAiPlan(null, defaultInputs);
    expect(planNull).toBeDefined();
    expect(planNull.eventDetails.name).toBe(defaultInputs.name);
    expect(planNull.budget.items.length).toBeGreaterThan(0);

    // Passing primitive number
    const planNum = normalizeAiPlan(42, defaultInputs);
    expect(planNum).toBeDefined();
    expect(planNum.budget.totalBudgetMinor).toBe(defaultInputs.totalBudgetMinor);

    // Passing string
    const planStr = normalizeAiPlan("invalid string response", defaultInputs);
    expect(planStr).toBeDefined();
    expect(planStr.timeline.tasks.length).toBeGreaterThan(0);
  });

  it('sanitizes and clamps negative or zero quantities and costs in budget items', () => {
    const rawAiWithInvalidBudget = {
      budget: {
        items: [
          {
            description: 'Item with negative quantity',
            quantity: -5,
            estimatedAmountMajor: -1000,
          },
          {
            description: 'Item with NaN amount',
            quantity: 0,
            estimatedAmountMajor: 'invalid_number' as unknown as number,
          },
        ],
      },
    };

    const plan = normalizeAiPlan(rawAiWithInvalidBudget, defaultInputs);
    // Quantity should be clamped to at least 1
    expect(plan.budget.items[0].quantity).toBe(1);
    expect(plan.budget.items[1].quantity).toBe(1);
    // Negative or non-numeric amount should default to positive fallback
    expect(plan.budget.items[0].estimatedAmountMinor).toBeGreaterThan(0);
    expect(plan.budget.items[1].estimatedAmountMinor).toBeGreaterThan(0);
  });

  it('handles date boundary calculations accurately including leap years and same-day events', () => {
    // Leap year target date: Feb 29, 2028
    const leapYearInputs = {
      ...defaultInputs,
      targetDate: '2028-02-29',
    };

    const rawAi = {
      timeline: {
        tasks: [
          {
            id: 'leap_task_1',
            title: 'Leap Year Task 10 days before',
            daysBeforeEvent: 10,
          },
          {
            id: 'leap_task_2',
            title: 'Day of event task',
            daysBeforeEvent: 0,
          },
          {
            id: 'leap_task_3',
            title: 'Far in advance task',
            daysBeforeEvent: 365,
          },
        ],
      },
    };

    const plan = normalizeAiPlan(rawAi, leapYearInputs);
    expect(plan.timeline.tasks[0].dueDate).toBe('2028-02-19');
    expect(plan.timeline.tasks[1].dueDate).toBe('2028-02-29');
    expect(plan.timeline.tasks[2].dueDate).toMatch(/^2027-/);
  });

  it('normalizes risk matrix with extreme or invalid enum values to safe defaults', () => {
    const rawAiWithBadRisks = {
      risks: {
        items: [
          {
            id: 'r_1',
            title: 'Custom Risk Factor',
            category: 'unrecognized_category',
            probability: 'extreme_probability',
            severity: 'lethal',
          },
        ],
      },
    };

    const plan = normalizeAiPlan(rawAiWithBadRisks, defaultInputs);
    expect(plan.risks.items[0].category).toBe('logistics'); // default safe category
    expect(plan.risks.items[0].probability).toBe('medium'); // default safe probability
    expect(plan.risks.items[0].severity).toBe('medium'); // default safe severity
  });
});
