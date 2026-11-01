/**
 * Precision Money Math and Formatting
 * Using integer minor currency units (e.g., paise for INR, cents for USD)
 * to avoid floating-point rounding errors in financial computations.
 */

import { BudgetItem, BudgetState, CalculatedBudgetSummary } from '../types/event';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  minorUnitName: string;
  decimals: number;
  useIndianNumbering: boolean;
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    minorUnitName: 'paise',
    decimals: 2,
    useIndianNumbering: true,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    minorUnitName: 'cents',
    decimals: 2,
    useIndianNumbering: false,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    minorUnitName: 'cents',
    decimals: 2,
    useIndianNumbering: false,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    minorUnitName: 'pence',
    decimals: 2,
    useIndianNumbering: false,
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    minorUnitName: 'fils',
    decimals: 2,
    useIndianNumbering: false,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    minorUnitName: 'cents',
    decimals: 2,
    useIndianNumbering: false,
  },
  AUD: {
    code: 'AUD',
    symbol: 'AU$',
    minorUnitName: 'cents',
    decimals: 2,
    useIndianNumbering: false,
  },
  SGD: {
    code: 'SGD',
    symbol: 'SG$',
    minorUnitName: 'cents',
    decimals: 2,
    useIndianNumbering: false,
  },
};

/**
 * Converts a standard unit amount (e.g. 800000) to minor units (e.g. 80000000 paise)
 */
export function toMinorUnits(majorAmount: number, currency = 'INR'): number {
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const multiplier = Math.pow(10, config.decimals);
  return Math.round(Number(majorAmount || 0) * multiplier);
}

/**
 * Converts minor units (paise/cents) to major units (rupees/dollars)
 */
export function toMajorUnits(minorAmount: number, currency = 'INR'): number {
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const divisor = Math.pow(10, config.decimals);
  return Number(minorAmount || 0) / divisor;
}

/**
 * Formats a major unit integer using the Indian numbering system:
 * e.g., 800000 -> "8,00,000", 12500000 -> "1,25,00,000"
 */
export function formatIndianNumber(value: number): string {
  const isNegative = value < 0;
  const absVal = Math.abs(Math.round(value));
  const s = absVal.toString();

  if (s.length <= 3) {
    return (isNegative ? '-' : '') + s;
  }

  const lastThree = s.substring(s.length - 3);
  const rest = s.substring(0, s.length - 3);
  const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return (isNegative ? '-' : '') + formattedRest + ',' + lastThree;
}

/**
 * Formats a minor amount (paise/cents) into human-readable currency with symbol
 * e.g. 80000000 minor in INR -> "₹8,00,000"
 */
export function formatCurrency(minorAmount: number, currency = 'INR', includeDecimals = false): string {
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const major = toMajorUnits(minorAmount, currency);

  if (config.useIndianNumbering) {
    const whole = Math.floor(Math.abs(major));
    const formattedWhole = formatIndianNumber(whole);
    const sign = minorAmount < 0 ? '-' : '';

    if (includeDecimals) {
      const remainder = Math.abs(minorAmount) % 100;
      const decStr = remainder.toString().padStart(2, '0');
      return `${sign}${config.symbol}${formattedWhole}.${decStr}`;
    }

    return `${sign}${config.symbol}${formattedWhole}`;
  }

  // International standard formatting
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: includeDecimals ? config.decimals : 0,
      maximumFractionDigits: includeDecimals ? config.decimals : 0,
    }).format(major);
  } catch {
    return `${config.symbol}${major.toLocaleString()}`;
  }
}

/**
 * Compact format for badges and metric tiles (e.g. ₹8L, ₹1.5Cr, $120K)
 */
export function formatCompactCurrency(minorAmount: number, currency = 'INR'): string {
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const major = toMajorUnits(minorAmount, currency);
  const sign = major < 0 ? '-' : '';
  const abs = Math.abs(major);

  if (config.useIndianNumbering) {
    if (abs >= 10000000) {
      // Crores (1 Cr = 1,00,00,000)
      const cr = abs / 10000000;
      return `${sign}${config.symbol}${parseFloat(cr.toFixed(2))} Cr`;
    }
    if (abs >= 100000) {
      // Lakhs (1 Lakh = 1,00,000)
      const lk = abs / 100000;
      return `${sign}${config.symbol}${parseFloat(lk.toFixed(2))} L`;
    }
    if (abs >= 1000) {
      const k = abs / 1000;
      return `${sign}${config.symbol}${parseFloat(k.toFixed(1))} k`;
    }
    return `${sign}${config.symbol}${formatIndianNumber(abs)}`;
  }

  if (abs >= 1000000) {
    return `${sign}${config.symbol}${(abs / 1000000).toFixed(1)}M`;
  }
  if (abs >= 1000) {
    return `${sign}${config.symbol}${(abs / 1000).toFixed(1)}K`;
  }
  return `${sign}${config.symbol}${abs.toLocaleString()}`;
}

/**
 * Deterministic business logic calculation for budget state
 */
export function calculateBudgetSummary(budget: BudgetState): CalculatedBudgetSummary {
  const totalBudgetMinor = Math.max(0, Math.round(budget.totalBudgetMinor || 0));
  const contingencyPercentage = Math.max(0, Math.min(50, budget.contingencyPercentage || 0));

  // Compute contingency reserve amount from total budget
  const contingencyReserveMinor = Math.round((totalBudgetMinor * contingencyPercentage) / 100);

  let totalEstimatedSpendMinor = 0;
  let totalActualSpendMinor = 0;
  let actualPaidMinor = 0;
  let actualPendingMinor = 0;

  for (const item of budget.items || []) {
    const est = Math.max(0, Math.round(item.estimatedAmountMinor || 0));
    const act = Math.max(0, Math.round(item.actualAmountMinor || 0));

    totalEstimatedSpendMinor += est;
    totalActualSpendMinor += act;

    if (item.paymentStatus === 'paid_in_full') {
      actualPaidMinor += act > 0 ? act : est;
    } else if (item.paymentStatus === 'deposit_paid') {
      actualPaidMinor += act > 0 ? Math.round(act * 0.5) : Math.round(est * 0.5);
      actualPendingMinor += act > 0 ? Math.round(act * 0.5) : Math.round(est * 0.5);
    } else if (item.paymentStatus === 'unpaid') {
      actualPendingMinor += act > 0 ? act : est;
    }
  }

  // Committed spend = planned items + contingency reserve (not double-counted)
  const totalCommittedSpendMinor = totalEstimatedSpendMinor + contingencyReserveMinor;

  // Remaining vs estimated budget
  const remainingEstimatedMinor = totalBudgetMinor - totalCommittedSpendMinor;

  // Remaining vs actual spend
  const remainingActualMinor = totalBudgetMinor - totalActualSpendMinor;

  const isOverrun = totalCommittedSpendMinor > totalBudgetMinor;
  const overrunAmountMinor = isOverrun ? totalCommittedSpendMinor - totalBudgetMinor : 0;
  const overrunPercentage =
    totalBudgetMinor > 0 && isOverrun ? (overrunAmountMinor / totalBudgetMinor) * 100 : 0;

  return {
    totalBudgetMinor,
    totalEstimatedSpendMinor,
    totalActualSpendMinor,
    contingencyReserveMinor,
    totalCommittedSpendMinor,
    remainingEstimatedMinor,
    remainingActualMinor,
    isOverrun,
    overrunAmountMinor,
    overrunPercentage: Math.round(overrunPercentage * 10) / 10,
    actualPaidMinor,
    actualPendingMinor,
  };
}

/**
 * Computes category breakdown and percentage of total spend
 */
export interface CategorySpendBreakdown {
  category: string;
  estimatedMinor: number;
  actualMinor: number;
  percentageOfBudget: number;
  itemCount: number;
}

export function getCategoryBreakdown(budget: BudgetState): CategorySpendBreakdown[] {
  const map = new Map<string, { est: number; act: number; count: number }>();

  for (const item of budget.items || []) {
    const cat = item.category || 'General';
    const current = map.get(cat) || { est: 0, act: 0, count: 0 };
    current.est += Math.max(0, Math.round(item.estimatedAmountMinor || 0));
    current.act += Math.max(0, Math.round(item.actualAmountMinor || 0));
    current.count += 1;
    map.set(cat, current);
  }

  const total = budget.totalBudgetMinor || 1;
  const result: CategorySpendBreakdown[] = [];

  for (const [cat, data] of map.entries()) {
    result.push({
      category: cat,
      estimatedMinor: data.est,
      actualMinor: data.act,
      percentageOfBudget: Math.round((data.est / total) * 1000) / 10,
      itemCount: data.count,
    });
  }

  // Sort descending by estimated spend
  return result.sort((a, b) => b.estimatedMinor - a.estimatedMinor);
}
