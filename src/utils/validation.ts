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
  ThemeIdea,
  RiskRecommendation,
  AssumptionItem,
  EventCategory,
  VenuePreference,
  PriorityLevel,
} from '../types/event';
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
  rawAiData: any,
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
  const now = new Date().toISOString();
  const planId = userInputs.id || generateId('plan');

  // 1. Event Details
  const eventDetails: EventDetails = {
    id: generateId('evt'),
    name: sanitizeText(rawAiData?.eventDetails?.name || userInputs.name),
    category: (rawAiData?.eventDetails?.category || userInputs.category) as EventCategory,
    targetDate: userInputs.targetDate,
    location: sanitizeText(rawAiData?.eventDetails?.location || userInputs.location),
    venueStatus: 'need_to_find',
    venuePreference: (userInputs.venuePreference || 'flexible') as VenuePreference,
    guestCount: Math.max(1, Number(userInputs.guestCount) || 100),
    totalBudgetMinor: userInputs.totalBudgetMinor,
    currency: userInputs.currency || 'INR',
    styleTheme: sanitizeText(rawAiData?.eventDetails?.styleTheme || userInputs.styleTheme || 'Elegant & Modern'),
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
  const assumptions: AssumptionItem[] = Array.isArray(rawAiData?.assumptions)
    ? rawAiData.assumptions.map((a: any, idx: number) => ({
        id: a?.id || generateId(`asmp_${idx}`),
        category: sanitizeText(a?.category || 'General'),
        description: sanitizeText(a?.description || 'Standard assumption'),
        isConfirmed: Boolean(a?.isConfirmed),
        userNote: sanitizeText(a?.userNote || ''),
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
  const budgetItems: BudgetItem[] = Array.isArray(rawAiData?.budget?.items)
    ? rawAiData.budget.items.map((b: any, idx: number) => {
        const estAmount = typeof b?.estimatedAmountMajor === 'number'
          ? toMinorUnits(b.estimatedAmountMajor, userInputs.currency)
          : typeof b?.estimatedAmountMinor === 'number'
          ? b.estimatedAmountMinor
          : 0;
        return {
          id: b?.id || generateId(`bgt_${idx}`),
          category: sanitizeText(b?.category || 'General'),
          description: sanitizeText(b?.description || 'Budget line item'),
          estimatedAmountMinor: Math.max(0, Math.round(estAmount)),
          actualAmountMinor: Math.max(0, Math.round(b?.actualAmountMinor || 0)),
          quantity: Math.max(1, Number(b?.quantity) || 1),
          unitCostMinor: Math.max(0, Math.round(b?.unitCostMinor || estAmount)),
          priority: (b?.priority || 'medium') as PriorityLevel,
          paymentStatus: b?.paymentStatus || 'unpaid',
          notes: sanitizeText(b?.notes || ''),
          isAiEstimated: true,
        };
      })
    : [];

  const contingencyPercentage = typeof rawAiData?.budget?.contingencyPercentage === 'number'
    ? Math.max(0, Math.min(30, rawAiData.budget.contingencyPercentage))
    : 10;

  const contingencyReserveMinor = Math.round(
    (userInputs.totalBudgetMinor * contingencyPercentage) / 100
  );

  // 4. Timeline Tasks
  const timelineTasks: TimelineTask[] = Array.isArray(rawAiData?.timeline?.tasks)
    ? rawAiData.timeline.tasks.map((t: any, idx: number) => {
        const daysBefore = typeof t?.daysBeforeEvent === 'number' ? Math.max(0, t.daysBeforeEvent) : 14;
        const calculatedDueDate = t?.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate)
          ? t.dueDate
          : calculateDateBeforeEvent(userInputs.targetDate, daysBefore);

        return {
          id: t?.id || generateId(`tsk_${idx}`),
          title: sanitizeText(t?.title || `Task #${idx + 1}`),
          description: sanitizeText(t?.description || ''),
          category: sanitizeText(t?.category || 'Planning'),
          dueDate: calculatedDueDate,
          daysBeforeEvent: daysBefore,
          priority: (t?.priority || 'medium') as PriorityLevel,
          status: 'todo',
          dependencies: Array.isArray(t?.dependencies) ? t.dependencies : [],
          notes: sanitizeText(t?.notes || ''),
          isAiGenerated: true,
        };
      })
    : [];

  // 5. Vendor Guidance Items
  const vendorItems: VendorItem[] = Array.isArray(rawAiData?.vendors?.items)
    ? rawAiData.vendors.items.map((v: any, idx: number) => {
        const estCost = typeof v?.estimatedCostMajor === 'number'
          ? toMinorUnits(v.estimatedCostMajor, userInputs.currency)
          : typeof v?.estimatedCostMinor === 'number'
          ? v.estimatedCostMinor
          : 0;

        return {
          id: v?.id || generateId(`vnd_${idx}`),
          category: sanitizeText(v?.category || 'Vendor'),
          title: sanitizeText(v?.title || 'Vendor Service'),
          selectionGuidance: sanitizeText(v?.selectionGuidance || 'Recommended selection criteria.'),
          estimatedCostMinor: Math.max(0, Math.round(estCost)),
          targetBookingDate: v?.targetBookingDate || calculateDateBeforeEvent(userInputs.targetDate, 30),
          bookingStatus: 'not_started',
          notes: sanitizeText(v?.notes || ''),
          selectionCriteria: Array.isArray(v?.selectionCriteria)
            ? v.selectionCriteria.map(sanitizeText)
            : ['Check portfolio & past reviews', 'Request written contract and cancellation policy'],
        };
      })
    : [];

  // 6. Guest Logistics
  const guestPlan = {
    estimatedGuests: Math.max(1, Number(rawAiData?.guestPlan?.estimatedGuests) || userInputs.guestCount),
    cateringPerHeadMinor: typeof rawAiData?.guestPlan?.cateringPerHeadMajor === 'number'
      ? toMinorUnits(rawAiData.guestPlan.cateringPerHeadMajor, userInputs.currency)
      : Math.round(userInputs.totalBudgetMinor * 0.35 / (userInputs.guestCount || 1)),
    estimatedSpaceSqFt: Number(rawAiData?.guestPlan?.estimatedSpaceSqFt) || userInputs.guestCount * 25,
    seatingStyle: sanitizeText(rawAiData?.guestPlan?.seatingStyle || 'Banquet & Round Tables'),
    dietaryBreakdown: rawAiData?.guestPlan?.dietaryBreakdown || {
      'Vegetarian': Math.round(userInputs.guestCount * 0.6),
      'Standard Non-Veg': Math.round(userInputs.guestCount * 0.35),
      'Special / Gluten-free / Jain': Math.round(userInputs.guestCount * 0.05),
    },
    accessibilityProvisions: Array.isArray(rawAiData?.guestPlan?.accessibilityProvisions)
      ? rawAiData.guestPlan.accessibilityProvisions.map(sanitizeText)
      : ['Wheelchair accessible entrance and ramps', 'Reserved front-row seating for elders'],
    logisticsNotes: Array.isArray(rawAiData?.guestPlan?.logisticsNotes)
      ? rawAiData.guestPlan.logisticsNotes.map(sanitizeText)
      : ['Valet / dedicated parking space for guests', 'Guest welcoming desk and coat check'],
  };

  // 7. Ideas and Themes
  const ideas = {
    themeConcepts: Array.isArray(rawAiData?.ideas?.themeConcepts)
      ? rawAiData.ideas.themeConcepts.map((th: any, idx: number) => ({
          id: th?.id || generateId(`thm_${idx}`),
          title: sanitizeText(th?.title || 'Signature Theme'),
          vibe: sanitizeText(th?.vibe || 'Warm & Celebratory'),
          description: sanitizeText(th?.description || ''),
          colorPalette: Array.isArray(th?.colorPalette) ? th.colorPalette.map(sanitizeText) : ['#B8860B', '#FFF8DC', '#2E8B57'],
          budgetImpact: (th?.budgetImpact || 'medium') as 'low' | 'medium' | 'high',
          culturalContext: sanitizeText(th?.culturalContext || ''),
        }))
      : [],
    sustainabilitySuggestions: Array.isArray(rawAiData?.ideas?.sustainabilitySuggestions)
      ? rawAiData.ideas.sustainabilitySuggestions.map(sanitizeText)
      : ['Digital invitations via QR code & WhatsApp', 'Locally sourced seasonal flowers instead of imported plastics'],
    costSavingAlternatives: Array.isArray(rawAiData?.ideas?.costSavingAlternatives)
      ? rawAiData.ideas.costSavingAlternatives.map(sanitizeText)
      : ['Book daytime wedding or weekday reception for up to 20% venue discount', 'Limit alcoholic bar to signature welcome drinks and beer/wine'],
  };

  // 8. Risks
  const risks = {
    items: Array.isArray(rawAiData?.risks?.items)
      ? rawAiData.risks.items.map((r: any, idx: number) => ({
          id: r?.id || generateId(`rsk_${idx}`),
          title: sanitizeText(r?.title || 'Operational Risk'),
          category: r?.category || 'logistics',
          probability: (r?.probability || 'medium') as 'low' | 'medium' | 'high',
          severity: (r?.severity || 'medium') as 'low' | 'medium' | 'high',
          mitigation: sanitizeText(r?.mitigation || 'Plan backup options in advance'),
          contingencyAction: sanitizeText(r?.contingencyAction || 'Activate contingency buffer'),
          isResolved: false,
        }))
      : [],
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
