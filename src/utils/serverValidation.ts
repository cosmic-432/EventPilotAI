/**
 * Server-Side Security & Validation Utilities
 * Enforces strict input validation, bounds checks, sanitization,
 * prompt-injection protection, and rate limiting algorithms.
 */

export const ALLOWED_CATEGORIES = [
  'wedding',
  'birthday',
  'anniversary',
  'college_festival',
  'community',
  'fundraiser',
  'corporate',
  'custom',
] as const;

export const ALLOWED_VENUE_PREFERENCES = [
  'indoor',
  'outdoor',
  'flexible',
  'hybrid',
] as const;

export const ALLOWED_CURRENCIES = [
  'INR',
  'USD',
  'EUR',
  'GBP',
  'AED',
  'AUD',
  'CAD',
  'SGD',
  'JPY',
] as const;

export const ALLOWED_SECTIONS = [
  'budget',
  'timeline',
  'vendors',
  'ideas',
  'risks',
] as const;

export interface PlanGenerationInput {
  name: string;
  category: string;
  targetDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency?: string;
  venuePreference?: string;
  styleTheme?: string;
  dietaryRequirements?: string[];
  accessibilityRequirements?: string[];
  priorities?: string[];
  naturalLanguagePrompt?: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: T;
}

/**
 * Sanitizes text to prevent script injection and prompt escape exploits
 */
export function sanitizePromptString(input: unknown, maxLength = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Neutralize prompt instruction override delimiters
    .replace(/<\/?[a-zA-Z_][a-zA-Z0-9_-]*>/g, '')
    .replace(/(system\s*instruction|override\s*rules|ignore\s*previous)/gi, '[sanitized]')
    .trim();
}

/**
 * Validates request payload for /api/plan/generate
 */
export function validatePlanGenerationInput(
  raw: any
): ValidationResult<PlanGenerationInput> {
  const errors: Record<string, string> = {};

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: { body: 'Request body must be a valid JSON object.' },
    };
  }

  // Name
  const rawName = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!rawName || rawName.length < 2) {
    errors.name = 'Event name must be at least 2 characters.';
  } else if (rawName.length > 120) {
    errors.name = 'Event name cannot exceed 120 characters.';
  }

  // Category
  const rawCategory = typeof raw.category === 'string' ? raw.category.trim() : '';
  if (!ALLOWED_CATEGORIES.includes(rawCategory as any)) {
    errors.category = `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}`;
  }

  // Target Date
  const rawDate = typeof raw.targetDate === 'string' ? raw.targetDate.trim() : '';
  if (!rawDate) {
    errors.targetDate = 'Target date is required.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    errors.targetDate = 'Target date must follow YYYY-MM-DD format.';
  } else {
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) {
      errors.targetDate = 'Target date is not a valid calendar date.';
    }
  }

  // Location
  const rawLocation = typeof raw.location === 'string' ? raw.location.trim() : '';
  if (!rawLocation || rawLocation.length < 2) {
    errors.location = 'Location is required (at least 2 characters).';
  } else if (rawLocation.length > 100) {
    errors.location = 'Location cannot exceed 100 characters.';
  }

  // Guest Count
  const guestNum = Number(raw.guestCount);
  if (raw.guestCount === undefined || raw.guestCount === null || isNaN(guestNum)) {
    errors.guestCount = 'Guest count is required and must be numeric.';
  } else if (!Number.isInteger(guestNum) || guestNum < 1) {
    errors.guestCount = 'Guest count must be an integer of at least 1.';
  } else if (guestNum > 100000) {
    errors.guestCount = 'Guest count cannot exceed 100,000.';
  }

  // Total Budget
  const budgetNum = Number(raw.totalBudget);
  if (raw.totalBudget === undefined || raw.totalBudget === null || isNaN(budgetNum)) {
    errors.totalBudget = 'Total budget is required and must be numeric.';
  } else if (budgetNum <= 0) {
    errors.totalBudget = 'Total budget must be strictly greater than 0.';
  } else if (budgetNum > 1000000000) {
    errors.totalBudget = 'Total budget exceeds allowable maximum (1 Billion).';
  }

  // Currency
  const rawCurrency = (typeof raw.currency === 'string' ? raw.currency.trim().toUpperCase() : 'INR');
  if (!ALLOWED_CURRENCIES.includes(rawCurrency as any)) {
    errors.currency = `Unsupported currency. Allowed: ${ALLOWED_CURRENCIES.join(', ')}`;
  }

  // Venue Preference
  const rawVenue = typeof raw.venuePreference === 'string' ? raw.venuePreference.trim() : 'flexible';
  if (!ALLOWED_VENUE_PREFERENCES.includes(rawVenue as any)) {
    errors.venuePreference = `Invalid venue preference. Allowed: ${ALLOWED_VENUE_PREFERENCES.join(', ')}`;
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return { isValid, errors };
  }

  const sanitized: PlanGenerationInput = {
    name: sanitizePromptString(rawName, 120),
    category: rawCategory,
    targetDate: rawDate,
    location: sanitizePromptString(rawLocation, 100),
    guestCount: Math.floor(guestNum),
    totalBudget: budgetNum,
    currency: rawCurrency,
    venuePreference: rawVenue,
    styleTheme: sanitizePromptString(raw.styleTheme, 150) || 'Elegant & Modern',
    dietaryRequirements: Array.isArray(raw.dietaryRequirements)
      ? raw.dietaryRequirements.map((d: any) => sanitizePromptString(String(d), 50)).filter(Boolean)
      : [],
    accessibilityRequirements: Array.isArray(raw.accessibilityRequirements)
      ? raw.accessibilityRequirements.map((a: any) => sanitizePromptString(String(a), 50)).filter(Boolean)
      : [],
    priorities: Array.isArray(raw.priorities)
      ? raw.priorities.map((p: any) => sanitizePromptString(String(p), 80)).filter(Boolean)
      : [],
    naturalLanguagePrompt: sanitizePromptString(raw.naturalLanguagePrompt, 2000),
  };

  return { isValid: true, errors: {}, sanitized };
}

/**
 * Validates request payload for /api/plan/regenerate-section
 */
export function validateRegenerateSectionInput(raw: any): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: {
    sectionName: string;
    newConstraints: string;
    eventContext: any;
  };
} {
  const errors: Record<string, string> = {};

  if (!raw || typeof raw !== 'object') {
    return { isValid: false, errors: { body: 'Invalid JSON request body.' } };
  }

  if (!raw.sectionName || !ALLOWED_SECTIONS.includes(raw.sectionName)) {
    errors.sectionName = `Invalid section. Allowed: ${ALLOWED_SECTIONS.join(', ')}`;
  }

  if (!raw.eventContext || typeof raw.eventContext !== 'object') {
    errors.eventContext = 'Event context is required for section regeneration.';
  }

  const newConstraints = sanitizePromptString(raw.newConstraints || '', 1000);

  const isValid = Object.keys(errors).length === 0;
  if (!isValid) {
    return { isValid, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      sectionName: raw.sectionName,
      newConstraints,
      eventContext: raw.eventContext,
    },
  };
}

/**
 * Sliding Window Rate Limiter
 */
interface RateLimitRecord {
  timestamps: number[];
}

export class MemoryRateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 20) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if IP address is within rate limit
   */
  public check(ip: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfterSeconds: number;
  } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.store.get(ip);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(ip, record);
    }

    // Filter out old timestamps outside current sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    const count = record.timestamps.length;
    const allowed = count < this.maxRequests;

    if (allowed) {
      record.timestamps.push(now);
    }

    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = Math.ceil((oldestTimestamp + this.windowMs) / 1000);
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestTimestamp + this.windowMs - now) / 1000));
    const remaining = Math.max(0, this.maxRequests - record.timestamps.length);

    return {
      allowed,
      remaining,
      resetTime,
      retryAfterSeconds,
    };
  }

  /**
   * Prune stale records periodically
   */
  public pruneStale(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    for (const [ip, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.store.delete(ip);
      }
    }
  }

  public clear(): void {
    this.store.clear();
  }
}
