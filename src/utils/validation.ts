/**
 * Validation and Data Sanitization Utilities
 * Validates user input and AI structured responses defensively before state updates.
 */

import {
  EventPlan,
  EventDetails,
  BudgetItem,
  TimelineTask,
  VendorItem,
  AssumptionItem,
  EventCategory,
  VenuePreference,
  PriorityLevel,
  PaymentStatus,
  BookingStatus,
  RiskCategory,
  RiskProbability,
  RiskSeverity,
} from '../types/event';
import { RawAiGeneratedPlan, isRecord } from '../types/api';
import { toMinorUnits } from './currency';
import { getTodayIso, calculateDateBeforeEvent } from './timeline';

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

export function toPriorityLevel(val: unknown, fallback: PriorityLevel = 'medium'): PriorityLevel {
  if (val === 'critical' || val === 'high' || val === 'medium' || val === 'low' || val === 'nice_to_have') {
    return val;
  }
  return fallback;
}

export function toPaymentStatus(val: unknown): PaymentStatus {
  if (val === 'unpaid' || val === 'deposit_paid' || val === 'paid_in_full' || val === 'waived') {
    return val;
  }
  return 'unpaid';
}

export function toBookingStatus(val: unknown): BookingStatus {
  if (
    val === 'not_started' ||
    val === 'contacted' ||
    val === 'quotation_received' ||
    val === 'negotiating' ||
    val === 'confirmed' ||
    val === 'cancelled'
  ) {
    return val;
  }
  return 'not_started';
}

export function toRiskCategory(val: unknown): RiskCategory {
  if (val === 'weather' || val === 'vendor' || val === 'budget' || val === 'logistics' || val === 'compliance' || val === 'technical') {
    return val;
  }
  return 'logistics';
}

export function toRiskProbability(val: unknown): RiskProbability {
  if (val === 'low' || val === 'medium' || val === 'high') {
    return val;
  }
  return 'medium';
}

export function toRiskSeverity(val: unknown): RiskSeverity {
  if (val === 'low' || val === 'medium' || val === 'high') {
    return val;
  }
  return 'medium';
}

/**
 * Validates user event creation form
 */
export interface EventFormValidationErrors {
  name?: string;
  targetDate?: string;
  guestCount?: string;
  totalBudget?: string;
  location?: string;
}

export function validateEventInput(data: {
  name?: string;
  category?: string;
  targetDate?: string;
  location?: string;
  guestCount?: number;
  totalBudget?: number;
  currency?: string;
}): { isValid: boolean; errors: EventFormValidationErrors } {
  const errors: EventFormValidationErrors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Event name must be at least 2 characters.';
  } else if (data.name.trim().length > 120) {
    errors.name = 'Event name cannot exceed 120 characters.';
  }

  if (!data.targetDate) {
    errors.targetDate = 'Event date is required.';
  } else {
    const today = getTodayIso();
    if (data.targetDate < today) {
      errors.targetDate = 'Event date must be today or in the future.';
    }
  }

  if (data.guestCount === undefined || data.guestCount === null || isNaN(data.guestCount)) {
    errors.guestCount = 'Guest count is required.';
  } else if (data.guestCount <= 0) {
    errors.guestCount = 'Guest count must be at least 1.';
  } else if (data.guestCount > 100000) {
    errors.guestCount = 'Guest count cannot exceed 100,000.';
  }

  if (data.totalBudget === undefined || data.totalBudget === null || isNaN(data.totalBudget)) {
    errors.totalBudget = 'Budget is required.';
  } else if (data.totalBudget <= 0) {
    errors.totalBudget = 'Total budget must be greater than zero.';
  } else if (data.totalBudget > 1000000000) {
    errors.totalBudget = 'Budget exceeds allowable threshold (1 Billion).';
  }

  if (!data.location || data.location.trim().length < 2) {
    errors.location = 'Location or city is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates and safely normalizes an AI generated plan into our strict EventPlan type
 */
export function normalizeAiPlan(
  rawAiData: unknown,
  userInputs: {
    id?: string;
    name: string;
    category: EventCategory;
    targetDate: string;
    location: string;
    guestCount: number;
    totalBudgetMinor: number;
    currency: string;
    venuePreference?: VenuePreference;
    styleTheme?: string;
    dietaryRequirements?: string[];
    accessibilityRequirements?: string[];
    priorities?: string[];
    naturalLanguagePrompt?: string;
  }
): EventPlan {
  const raw = isRecord(rawAiData) ? (rawAiData as RawAiGeneratedPlan) : null;
  const now = new Date().toISOString();
  const planId = userInputs.id || generateId('plan');

  // 1. Event Details
  const rawEvtName = typeof raw?.eventDetails?.name === 'string' ? raw.eventDetails.name : userInputs.name;
  const rawEvtLoc = typeof raw?.eventDetails?.location === 'string' ? raw.eventDetails.location : userInputs.location;
  const rawEvtTheme = typeof raw?.eventDetails?.styleTheme === 'string'
    ? raw.eventDetails.styleTheme
    : userInputs.styleTheme || 'Elegant & Modern';

  const eventDetails: EventDetails = {
    id: generateId('evt'),
    name: sanitizeText(rawEvtName),
    category: userInputs.category,
    targetDate: userInputs.targetDate,
    location: sanitizeText(rawEvtLoc),
    venueStatus: 'need_to_find',
    venuePreference: userInputs.venuePreference || 'flexible',
    guestCount: Math.max(1, Number(userInputs.guestCount) || 100),
    totalBudgetMinor: userInputs.totalBudgetMinor,
    currency: userInputs.currency || 'INR',
    styleTheme: sanitizeText(rawEvtTheme),
    dietaryRequirements: Array.isArray(userInputs.dietaryRequirements)
      ? userInputs.dietaryRequirements
      : [],
    accessibilityRequirements: Array.isArray(userInputs.accessibilityRequirements)
      ? userInputs.accessibilityRequirements
      : [],
    priorities: Array.isArray(userInputs.priorities) ? userInputs.priorities : [],
    naturalLanguagePrompt: userInputs.naturalLanguagePrompt,
    createdAt: now,
    updatedAt: now,
  };

  // 2. Assumptions
  const rawAssumptions = Array.isArray(raw?.assumptions) ? raw.assumptions : null;
  const assumptions: AssumptionItem[] = rawAssumptions && rawAssumptions.length > 0
    ? rawAssumptions.map((a, idx) => ({
        id: typeof a.id === 'string' ? a.id : generateId(`asmp_${idx}`),
        category: sanitizeText(a.category || 'General'),
        description: sanitizeText(a.description || 'Standard assumption'),
        isConfirmed: Boolean(a.isConfirmed),
        userNote: sanitizeText(a.userNote || ''),
      }))
    : [
        {
          id: generateId('asmp_1'),
          category: 'Guest Attendance',
          description: `Assumed 85% attendance rate (${Math.round(userInputs.guestCount * 0.85)} attending) for catering headcounts.`,
          isConfirmed: false,
        },
        {
          id: generateId('asmp_2'),
          category: 'Venue Schedule',
          description: 'Single day celebration with standard 8-hour access window.',
          isConfirmed: false,
        },
      ];

  // 3. Budget Items
  const rawBudgetItems = Array.isArray(raw?.budget?.items) && raw.budget.items.length > 0
    ? raw.budget.items
    : [
        {
          id: 'bgt_fallback_1',
          category: 'Venue & Staging',
          description: 'Primary event space rental & setup',
          estimatedAmountMinor: Math.round(userInputs.totalBudgetMinor * 0.35),
          quantity: 1,
          priority: 'critical' as const,
        },
        {
          id: 'bgt_fallback_2',
          category: 'Catering & Dining',
          description: 'Food & beverage service per head',
          estimatedAmountMinor: Math.round(userInputs.totalBudgetMinor * 0.30),
          quantity: userInputs.guestCount,
          priority: 'critical' as const,
        },
        {
          id: 'bgt_fallback_3',
          category: 'Decor & Floral',
          description: 'Ambient lighting and floral styling',
          estimatedAmountMinor: Math.round(userInputs.totalBudgetMinor * 0.15),
          quantity: 1,
          priority: 'high' as const,
        },
      ];

  const budgetItems: BudgetItem[] = rawBudgetItems.map((b, idx) => {
    const rawEst = typeof b.estimatedAmountMajor === 'number'
      ? toMinorUnits(b.estimatedAmountMajor, userInputs.currency)
      : typeof b.estimatedAmountMinor === 'number'
      ? b.estimatedAmountMinor
      : 0;
    const estAmount = rawEst > 0 ? rawEst : 100000;

    return {
      id: typeof b.id === 'string' ? b.id : generateId(`bgt_${idx}`),
      category: sanitizeText(b.category || 'General'),
      description: sanitizeText(b.description || 'Budget line item'),
      estimatedAmountMinor: Math.max(0, Math.round(estAmount)),
      actualAmountMinor: Math.max(0, Math.round(b.actualAmountMinor || 0)),
      quantity: Math.max(1, Number(b.quantity) || 1),
      unitCostMinor: Math.max(0, Math.round(b.unitCostMinor || estAmount)),
      priority: toPriorityLevel(b.priority, 'medium'),
      paymentStatus: toPaymentStatus(b.paymentStatus),
      notes: sanitizeText(b.notes || ''),
      isAiEstimated: true,
    };
  });

  const rawContingency = raw?.budget?.contingencyPercentage;
  const contingencyPercentage = typeof rawContingency === 'number'
    ? Math.max(0, Math.min(30, rawContingency))
    : 10;

  const contingencyReserveMinor = Math.round(
    (userInputs.totalBudgetMinor * contingencyPercentage) / 100
  );

  // 4. Timeline Tasks
  const rawTasks = Array.isArray(raw?.timeline?.tasks) && raw.timeline.tasks.length > 0
    ? raw.timeline.tasks
    : [
        {
          id: 'tsk_fallback_1',
          title: 'Finalize Event Venue & Contract',
          category: 'Venue',
          daysBeforeEvent: 45,
          priority: 'critical' as const,
        },
        {
          id: 'tsk_fallback_2',
          title: 'Confirm Catering Menu & Headcount',
          category: 'Catering',
          daysBeforeEvent: 20,
          priority: 'high' as const,
        },
        {
          id: 'tsk_fallback_3',
          title: 'Final Sound & Stage Rehearsal',
          category: 'Production',
          daysBeforeEvent: 2,
          priority: 'high' as const,
        },
      ];

  const timelineTasks: TimelineTask[] = rawTasks.map((t, idx) => {
    const daysBefore = typeof t.daysBeforeEvent === 'number' ? Math.max(0, t.daysBeforeEvent) : 14;
    const calculatedDueDate = t.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)
      ? t.dueDate
      : calculateDateBeforeEvent(userInputs.targetDate, daysBefore);

    return {
      id: typeof t.id === 'string' ? t.id : generateId(`tsk_${idx}`),
      title: sanitizeText(t.title || `Task #${idx + 1}`),
      description: sanitizeText(t.description || ''),
      category: sanitizeText(t.category || 'Planning'),
      dueDate: calculatedDueDate,
      daysBeforeEvent: daysBefore,
      priority: toPriorityLevel(t.priority, 'medium'),
      status: 'todo',
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      notes: sanitizeText(t.notes || ''),
      isAiGenerated: true,
    };
  });

  // 5. Vendor Guidance Items
  const rawVendors = Array.isArray(raw?.vendors?.items) ? raw.vendors.items : [];
  const vendorItems: VendorItem[] = rawVendors.map((v, idx) => {
    const estCost = typeof v.estimatedCostMajor === 'number'
      ? toMinorUnits(v.estimatedCostMajor, userInputs.currency)
      : typeof v.estimatedCostMinor === 'number'
      ? v.estimatedCostMinor
      : 0;

    return {
      id: typeof v.id === 'string' ? v.id : generateId(`vnd_${idx}`),
      category: sanitizeText(v.category || 'Vendor'),
      title: sanitizeText(v.title || 'Vendor Service'),
      selectionGuidance: sanitizeText(v.selectionGuidance || 'Recommended selection criteria.'),
      estimatedCostMinor: Math.max(0, Math.round(estCost)),
      targetBookingDate: v.targetBookingDate || calculateDateBeforeEvent(userInputs.targetDate, 30),
      bookingStatus: toBookingStatus(v.bookingStatus),
      notes: sanitizeText(v.notes || ''),
      selectionCriteria: Array.isArray(v.selectionCriteria)
        ? v.selectionCriteria.map(sanitizeText)
        : ['Check portfolio & past reviews', 'Request written contract and cancellation policy'],
    };
  });

  // 6. Guest Logistics
  const rawGuestPlan = raw?.guestPlan;
  const guestPlan = {
    estimatedGuests: Math.max(1, Number(rawGuestPlan?.estimatedGuests) || userInputs.guestCount),
    cateringPerHeadMinor: typeof rawGuestPlan?.cateringPerHeadMajor === 'number'
      ? toMinorUnits(rawGuestPlan.cateringPerHeadMajor, userInputs.currency)
      : Math.round((userInputs.totalBudgetMinor * 0.35) / (userInputs.guestCount || 1)),
    estimatedSpaceSqFt: Number(rawGuestPlan?.estimatedSpaceSqFt) || userInputs.guestCount * 25,
    seatingStyle: sanitizeText(rawGuestPlan?.seatingStyle || 'Banquet & Round Tables'),
    dietaryBreakdown: rawGuestPlan?.dietaryBreakdown || {
      'Vegetarian': Math.round(userInputs.guestCount * 0.6),
      'Standard Non-Veg': Math.round(userInputs.guestCount * 0.35),
      'Special / Gluten-free / Jain': Math.round(userInputs.guestCount * 0.05),
    },
    accessibilityProvisions: Array.isArray(rawGuestPlan?.accessibilityProvisions)
      ? rawGuestPlan.accessibilityProvisions.map(sanitizeText)
      : ['Wheelchair accessible entrance and ramps', 'Reserved front-row seating for elders'],
    logisticsNotes: Array.isArray(rawGuestPlan?.logisticsNotes)
      ? rawGuestPlan.logisticsNotes.map(sanitizeText)
      : ['Valet / dedicated parking space for guests', 'Guest welcoming desk and coat check'],
  };

  // 7. Ideas and Themes
  const rawThemes = Array.isArray(raw?.ideas?.themeConcepts) ? raw.ideas.themeConcepts : [];
  const ideas = {
    themeConcepts: rawThemes.map((th, idx) => ({
      id: typeof th.id === 'string' ? th.id : generateId(`thm_${idx}`),
      title: sanitizeText(th.title || 'Signature Theme'),
      vibe: sanitizeText(th.vibe || 'Warm & Celebratory'),
      description: sanitizeText(th.description || ''),
      colorPalette: Array.isArray(th.colorPalette) ? th.colorPalette.map(sanitizeText) : ['#B8860B', '#FFF8DC', '#2E8B57'],
      budgetImpact: th.budgetImpact === 'low' || th.budgetImpact === 'high' ? th.budgetImpact : ('medium' as const),
      culturalContext: sanitizeText(th.culturalContext || ''),
    })),
    sustainabilitySuggestions: Array.isArray(raw?.ideas?.sustainabilitySuggestions)
      ? raw.ideas.sustainabilitySuggestions.map(sanitizeText)
      : ['Digital invitations via QR code & WhatsApp', 'Locally sourced seasonal flowers instead of imported plastics'],
    costSavingAlternatives: Array.isArray(raw?.ideas?.costSavingAlternatives)
      ? raw.ideas.costSavingAlternatives.map(sanitizeText)
      : ['Book daytime wedding or weekday reception for up to 20% venue discount', 'Limit alcoholic bar to signature welcome drinks and beer/wine'],
  };

  // 8. Risks
  const rawRisks = Array.isArray(raw?.risks?.items) ? raw.risks.items : [];
  const risks = {
    items: rawRisks.map((r, idx) => ({
      id: typeof r.id === 'string' ? r.id : generateId(`rsk_${idx}`),
      title: sanitizeText(r.title || 'Operational Risk'),
      category: toRiskCategory(r.category),
      probability: toRiskProbability(r.probability),
      severity: toRiskSeverity(r.severity),
      mitigation: sanitizeText(r.mitigation || 'Plan backup options in advance'),
      contingencyAction: sanitizeText(r.contingencyAction || 'Activate contingency buffer'),
      isResolved: false,
    })),
  };

  return {
    id: planId,
    schemaVersion: 1,
    eventDetails,
    assumptions,
    budget: {
      totalBudgetMinor: userInputs.totalBudgetMinor,
      contingencyPercentage,
      contingencyReserveMinor,
      currency: userInputs.currency,
      items: budgetItems,
    },
    timeline: {
      tasks: timelineTasks,
    },
    vendors: {
      items: vendorItems,
    },
    guestPlan,
    ideas,
    risks,
    createdAt: now,
    updatedAt: now,
  };
}
