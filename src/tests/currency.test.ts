import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  toMajorUnits,
  formatIndianNumber,
  formatCurrency,
  formatCompactCurrency,
  calculateBudgetSummary,
  getCategoryBreakdown,
} from '../utils/currency';
import { BudgetState } from '../types/event';

describe('Currency and Budget Math', () => {
  it('converts between major and minor units accurately', () => {
    expect(toMinorUnits(800000, 'INR')).toBe(80000000);
    expect(toMajorUnits(80000000, 'INR')).toBe(800000);
    expect(toMinorUnits(150.5, 'USD')).toBe(15050);
    expect(toMajorUnits(15050, 'USD')).toBe(150.5);
  });

  it('formats numbers using Indian numbering convention', () => {
    expect(formatIndianNumber(800000)).toBe('8,00,000');
    expect(formatIndianNumber(12500000)).toBe('1,25,00,000');
    expect(formatIndianNumber(5000)).toBe('5,000');
    expect(formatIndianNumber(250)).toBe('250');
  });

  it('formats currency correctly in INR and international symbols', () => {
    expect(formatCurrency(80000000, 'INR')).toBe('₹8,00,000');
    expect(formatCurrency(80000000, 'INR', true)).toBe('₹8,00,000.00');
    expect(formatCompactCurrency(80000000, 'INR')).toBe('₹8 L');
    expect(formatCompactCurrency(1500000000, 'INR')).toBe('₹1.5 Cr');
  });

  it('calculates budget allocations, remaining amounts, and contingency reserve without double counting', () => {
    const sampleBudget: BudgetState = {
      totalBudgetMinor: 80000000, // ₹8,00,000 in paise
      contingencyPercentage: 10,   // ₹80,000 reserve
      contingencyReserveMinor: 8000000,
      currency: 'INR',
      items: [
        {
          id: '1',
          category: 'Venue',
          description: 'Lawn rental',
          estimatedAmountMinor: 24000000, // ₹2,40,000
          actualAmountMinor: 22000000,    // ₹2,20,000
          quantity: 1,
          unitCostMinor: 24000000,
          priority: 'critical',
          paymentStatus: 'paid_in_full',
          isAiEstimated: false,
        },
        {
          id: '2',
          category: 'Catering',
          description: 'Buffet',
          estimatedAmountMinor: 32000000, // ₹3,20,000
          actualAmountMinor: 31000000,    // ₹3,10,000
          quantity: 250,
          unitCostMinor: 128000,
          priority: 'critical',
          paymentStatus: 'deposit_paid',
          isAiEstimated: false,
        },
      ],
    };

    const summary = calculateBudgetSummary(sampleBudget);
    expect(summary.totalBudgetMinor).toBe(80000000);
    // Estimated items: 24000000 + 32000000 = 56000000 (₹5,60,000)
    expect(summary.totalEstimatedSpendMinor).toBe(56000000);
    // Contingency: 10% of 80000000 = 8000000 (₹80,000)
    expect(summary.contingencyReserveMinor).toBe(8000000);
    // Committed spend = 56000000 + 8000000 = 64000000 (₹6,40,000)
    expect(summary.totalCommittedSpendMinor).toBe(64000000);
    // Remaining estimated = 80000000 - 64000000 = 16000000 (₹1,60,000)
    expect(summary.remainingEstimatedMinor).toBe(16000000);
    // Actual spend = 22000000 + 31000000 = 53000000 (₹5,30,000)
    expect(summary.totalActualSpendMinor).toBe(53000000);
    // Remaining actual = 80000000 - 53000000 = 27000000 (₹2,70,000)
    expect(summary.remainingActualMinor).toBe(27000000);
    expect(summary.isOverrun).toBe(false);
  });

  it('correctly detects budget overrun and calculates percentage', () => {
    const overrunBudget: BudgetState = {
      totalBudgetMinor: 50000000, // ₹5,00,000
      contingencyPercentage: 10,   // ₹50,000
      contingencyReserveMinor: 5000000,
      currency: 'INR',
      items: [
        {
          id: '1',
          category: 'Venue',
          description: 'Luxury hall',
          estimatedAmountMinor: 48000000, // ₹4,80,000
          actualAmountMinor: 0,
          quantity: 1,
          unitCostMinor: 48000000,
          priority: 'critical',
          paymentStatus: 'unpaid',
          isAiEstimated: false,
        },
        {
          id: '2',
          category: 'Catering',
          description: 'Menu',
          estimatedAmountMinor: 10000000, // ₹1,00,000
          actualAmountMinor: 0,
          quantity: 1,
          unitCostMinor: 10000000,
          priority: 'high',
          paymentStatus: 'unpaid',
          isAiEstimated: false,
        },
      ],
    };

    const summary = calculateBudgetSummary(overrunBudget);
    // Planned: 48000000 + 10000000 = 58000000
    // + contingency reserve 5000000 = 63000000 committed
    // Overrun = 63000000 - 50000000 = 13000000 (₹1,30,000)
    expect(summary.isOverrun).toBe(true);
    expect(summary.overrunAmountMinor).toBe(13000000);
    expect(summary.overrunPercentage).toBe(26);
  });

  it('groups items into categories and sorts by estimated spend descending', () => {
    const budget: BudgetState = {
      totalBudgetMinor: 10000000,
      contingencyPercentage: 5,
      contingencyReserveMinor: 500000,
      currency: 'INR',
      items: [
        {
          id: '1',
          category: 'Catering',
          description: 'Dinner',
          estimatedAmountMinor: 3000000,
          actualAmountMinor: 0,
          quantity: 1,
          unitCostMinor: 3000000,
          priority: 'critical',
          paymentStatus: 'unpaid',
          isAiEstimated: false,
        },
        {
          id: '2',
          category: 'Venue',
          description: 'Hall',
          estimatedAmountMinor: 5000000,
          actualAmountMinor: 0,
          quantity: 1,
          unitCostMinor: 5000000,
          priority: 'critical',
          paymentStatus: 'unpaid',
          isAiEstimated: false,
        },
      ],
    };

    const breakdown = getCategoryBreakdown(budget);
    expect(breakdown[0].category).toBe('Venue');
    expect(breakdown[0].estimatedMinor).toBe(5000000);
    expect(breakdown[1].category).toBe('Catering');
  });
});
