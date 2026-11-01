import { describe, it, expect } from 'vitest';
import {
  validateEventInput,
  sanitizeText,
  normalizeAiPlan,
} from '../utils/validation';

describe('Validation and Data Sanitization', () => {
  it('validates event input boundary conditions', () => {
    // Missing required fields
    const res1 = validateEventInput({});
    expect(res1.isValid).toBe(false);
    expect(res1.errors.name).toBeDefined();
    expect(res1.errors.targetDate).toBeDefined();

    // Past date rejection
    const res2 = validateEventInput({
      name: 'Test Event',
      targetDate: '2020-01-01',
      guestCount: 50,
      totalBudget: 100000,
      location: 'Pune',
    });
    expect(res2.isValid).toBe(false);
    expect(res2.errors.targetDate).toContain('future');

    // Valid inputs
    const res3 = validateEventInput({
      name: 'Ananya & Rohan Wedding',
      targetDate: '2026-12-25',
      guestCount: 250,
      totalBudget: 800000,
      location: 'Pune, Maharashtra',
    });
    expect(res3.isValid).toBe(true);
  });

  it('sanitizes script tags from untrusted text', () => {
    const malicious = 'Hello <script>alert("hack")</script> World';
    expect(sanitizeText(malicious)).toBe('Hello  World');
  });

  it('defensively normalizes malformed AI data into valid EventPlan', () => {
    const rawMalformedData = {
      eventDetails: { name: 'Untrusted Name' },
      budget: { items: 'not-an-array' }, // malformed
      timeline: null, // malformed
    };

    const plan = normalizeAiPlan(rawMalformedData, {
      name: 'Safe Name',
      category: 'wedding',
      targetDate: '2026-11-20',
      location: 'Pune',
      guestCount: 200,
      totalBudgetMinor: 50000000,
      currency: 'INR',
    });

    expect(plan.id).toBeDefined();
    expect(plan.schemaVersion).toBe(1);
    expect(Array.isArray(plan.budget.items)).toBe(true);
    expect(Array.isArray(plan.timeline.tasks)).toBe(true);
    expect(plan.guestPlan.estimatedGuests).toBe(200);
  });
});
