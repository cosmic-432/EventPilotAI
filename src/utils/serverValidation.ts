/**
 * Server-Side Security & Validation Utilities
 * Enforces strict input validation, bounds checks, sanitization,
 * prompt-injection protection, and rate limiting algorithms.
 */

import { isRecord, PlanSectionName, EventContextPayload, RegenerateSectionRequestBody } from '../types/api';
import { EventCategory, VenuePreference } from '../types/event';

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

export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];
export type AllowedVenuePreference = (typeof ALLOWED_VENUE_PREFERENCES)[number];
export type AllowedCurrency = (typeof ALLOWED_CURRENCIES)[number];

export function isAllowedCategory(value: string): value is AllowedCategory {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(value);
}

export function isAllowedVenuePreference(value: string): value is AllowedVenuePreference {
  return (ALLOWED_VENUE_PREFERENCES as readonly string[]).includes(value);
}

export function isAllowedCurrency(value: string): value is AllowedCurrency {
  return (ALLOWED_CURRENCIES as readonly string[]).includes(value);
}

export function isAllowedSection(value: string): value is PlanSectionName {
  return (ALLOWED_SECTIONS as readonly string[]).includes(value);
}

export interface PlanGenerationInput {
  name: string;
  category: EventCategory;
  targetDate: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  venuePreference: VenuePreference;
  styleTheme: string;
  dietaryRequirements: string[];
  accessibilityRequirements: string[];
  priorities: string[];
  naturalLanguagePrompt: string;
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
 * Validates request payload for /api/plan/generate with strict type checking
 */
export function validatePlanGenerationInput(
  raw: unknown
): ValidationResult<PlanGenerationInput> {
  const errors: Record<string, string> = {};

  if (!isRecord(raw)) {
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
  if (!isAllowedCategory(rawCategory)) {
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
  const guestNum = typeof raw.guestCount === 'number' ? raw.guestCount : Number(raw.guestCount);
  if (raw.guestCount === undefined || raw.guestCount === null || isNaN(guestNum)) {
    errors.guestCount = 'Guest count is required and must be numeric.';
  } else if (!Number.isInteger(guestNum) || guestNum < 1) {
    errors.guestCount = 'Guest count must be an integer of at least 1.';
  } else if (guestNum > 100000) {
    errors.guestCount = 'Guest count cannot exceed 100,000.';
  }

  // Total Budget
  const budgetNum = typeof raw.totalBudget === 'number' ? raw.totalBudget : Number(raw.totalBudget);
  if (raw.totalBudget === undefined || raw.totalBudget === null || isNaN(budgetNum)) {
    errors.totalBudget = 'Total budget is required and must be numeric.';
  } else if (budgetNum <= 0) {
    errors.totalBudget = 'Total budget must be strictly greater than 0.';
  } else if (budgetNum > 1000000000) {
    errors.totalBudget = 'Total budget exceeds allowable maximum (1 Billion).';
  }

  // Currency
  const rawCurrency = (typeof raw.currency === 'string' ? raw.currency.trim().toUpperCase() : 'INR');
  if (!isAllowedCurrency(rawCurrency)) {
    errors.currency = `Unsupported currency. Allowed: ${ALLOWED_CURRENCIES.join(', ')}`;
  }

  // Venue Preference
  const rawVenue = typeof raw.venuePreference === 'string' ? raw.venuePreference.trim() : 'flexible';
  if (!isAllowedVenuePreference(rawVenue)) {
    errors.venuePreference = `Invalid venue preference. Allowed: ${ALLOWED_VENUE_PREFERENCES.join(', ')}`;
  }

  const isValid = Object.keys(errors).length === 0;

  if (!isValid || !isAllowedCategory(rawCategory) || !isAllowedVenuePreference(rawVenue) || !isAllowedCurrency(rawCurrency)) {
    return { isValid: false, errors };
  }

  const dietaryRequirements = Array.isArray(raw.dietaryRequirements)
    ? raw.dietaryRequirements
        .map((d: unknown) => sanitizePromptString(String(d), 50))
        .filter((d: string) => d.length > 0)
    : [];

  const accessibilityRequirements = Array.isArray(raw.accessibilityRequirements)
    ? raw.accessibilityRequirements
        .map((a: unknown) => sanitizePromptString(String(a), 50))
        .filter((a: string) => a.length > 0)
    : [];

  const priorities = Array.isArray(raw.priorities)
    ? raw.priorities
        .map((p: unknown) => sanitizePromptString(String(p), 80))
        .filter((p: string) => p.length > 0)
    : [];

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
    dietaryRequirements,
    accessibilityRequirements,
    priorities,
    naturalLanguagePrompt: sanitizePromptString(raw.naturalLanguagePrompt, 2000),
  };

  return { isValid: true, errors: {}, sanitized };
}

/**
 * Validates request payload for /api/plan/regenerate-section
 */
export function validateRegenerateSectionInput(raw: unknown): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: RegenerateSectionRequestBody;
} {
  const errors: Record<string, string> = {};

  if (!isRecord(raw)) {
    return { isValid: false, errors: { body: 'Invalid JSON request body.' } };
  }

  const sectionName = typeof raw.sectionName === 'string' ? raw.sectionName.trim() : '';
  if (!isAllowedSection(sectionName)) {
    errors.sectionName = `Invalid section. Allowed: ${ALLOWED_SECTIONS.join(', ')}`;
  }

  if (!isRecord(raw.eventContext)) {
    errors.eventContext = 'Event context is required for section regeneration.';
  }

  const rawConstraints = typeof raw.newConstraints === 'string' ? raw.newConstraints.trim() : '';
  if (!rawConstraints) {
    errors.newConstraints = 'New constraints or instructions are required.';
  }

  const newConstraints = sanitizePromptString(rawConstraints, 1000);

  if (Object.keys(errors).length > 0 || !isAllowedSection(sectionName) || !isRecord(raw.eventContext)) {
    return { isValid: false, errors };
  }

  const rawCtx = raw.eventContext;
  const eventContext: EventContextPayload = {
    name: sanitizePromptString(rawCtx.name, 120) || 'Signature Celebration',
    category: typeof rawCtx.category === 'string' ? rawCtx.category : 'custom',
    location: sanitizePromptString(rawCtx.location, 100) || 'Local Area',
    guestCount: typeof rawCtx.guestCount === 'number' ? rawCtx.guestCount : 100,
    totalBudget: typeof rawCtx.totalBudget === 'number' ? rawCtx.totalBudget : 500000,
    currency: typeof rawCtx.currency === 'string' ? rawCtx.currency : 'INR',
    targetDate: typeof rawCtx.targetDate === 'string' ? rawCtx.targetDate : '2026-12-31',
  };

  return {
    isValid: true,
    errors: {},
    sanitized: {
      sectionName,
      newConstraints,
      eventContext,
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
