/**
 * API Request, Response & AI Data Pipeline Types
 * Strict typing for server endpoints and Gemini model payloads.
 */

import { EventPlan, EventCategory, VenuePreference, PriorityLevel, RiskCategory, RiskSeverity, RiskProbability } from './event';

export interface RawAiAssumption {
  id?: string;
  category?: string;
  description?: string;
  isConfirmed?: boolean;
  userNote?: string;
}

export interface RawAiBudgetItem {
  id?: string;
  category?: string;
  description?: string;
  estimatedAmountMajor?: number;
  estimatedAmountMinor?: number;
  actualAmountMinor?: number;
  quantity?: number;
  unitCostMinor?: number;
  priority?: PriorityLevel;
  paymentStatus?: string;
  notes?: string;
}

export interface RawAiTimelineTask {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  dueDate?: string;
  daysBeforeEvent?: number;
  priority?: PriorityLevel;
  status?: string;
  dependencies?: string[];
  notes?: string;
}

export interface RawAiVendorItem {
  id?: string;
  category?: string;
  title?: string;
  selectionGuidance?: string;
  estimatedCostMajor?: number;
  estimatedCostMinor?: number;
  targetBookingDate?: string;
  bookingStatus?: string;
  selectionCriteria?: string[];
  notes?: string;
}

export interface RawAiThemeConcept {
  id?: string;
  title?: string;
  vibe?: string;
  description?: string;
  colorPalette?: string[];
  budgetImpact?: 'low' | 'medium' | 'high';
  culturalContext?: string;
}

export interface RawAiRiskItem {
  id?: string;
  title?: string;
  category?: RiskCategory;
  probability?: RiskProbability;
  severity?: RiskSeverity;
  mitigation?: string;
  contingencyAction?: string;
}

export interface RawAiGuestPlan {
  estimatedGuests?: number;
  cateringPerHeadMajor?: number;
  estimatedSpaceSqFt?: number;
  seatingStyle?: string;
  dietaryBreakdown?: Record<string, number>;
  accessibilityProvisions?: string[];
  logisticsNotes?: string[];
}

export interface RawAiGeneratedPlan {
  eventDetails?: {
    name?: string;
    category?: string;
    location?: string;
    styleTheme?: string;
  };
  assumptions?: RawAiAssumption[];
  budget?: {
    contingencyPercentage?: number;
    items?: RawAiBudgetItem[];
  };
  timeline?: {
    tasks?: RawAiTimelineTask[];
  };
  vendors?: {
    items?: RawAiVendorItem[];
  };
  guestPlan?: RawAiGuestPlan;
  ideas?: {
    themeConcepts?: RawAiThemeConcept[];
    sustainabilitySuggestions?: string[];
    costSavingAlternatives?: string[];
  };
  risks?: {
    items?: RawAiRiskItem[];
  };
}

export interface PlanGenerationSuccessResponse {
  plan: EventPlan | RawAiGeneratedPlan;
  source: 'gemini' | 'template_fallback' | 'benchmark_fallback';
  model?: string;
  notice?: string;
}

export interface PlanGenerationErrorResponse {
  error: string;
  details?: Record<string, string> | string;
  retryAfterSeconds?: number;
}

export interface RegenerateSectionSuccessResponse {
  sectionData: unknown;
}

export type PlanSectionName = 'budget' | 'timeline' | 'vendors' | 'ideas' | 'risks';

export interface EventContextPayload {
  name: string;
  category: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  targetDate: string;
}

export interface RegenerateSectionRequestBody {
  sectionName: PlanSectionName;
  eventContext: EventContextPayload;
  newConstraints: string;
}

/**
 * Universal Type Guards
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
