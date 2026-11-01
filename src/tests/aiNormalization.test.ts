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
});
