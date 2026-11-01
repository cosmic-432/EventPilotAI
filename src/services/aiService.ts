/**
 * Client-Side AI Service Layer
 * Interfaces securely with server-side AI endpoints (/api/plan/*)
 * and guarantees data normalization before passing to state.
 */

import { EventPlan, EventCategory, VenuePreference } from '../types/event';
import { normalizeAiPlan } from '../utils/validation';
import { toMinorUnits } from '../utils/currency';

export interface GeneratePlanRequestParams {
  name: string;
  category: EventCategory;
  targetDate: string;
  location: string;
  guestCount: number;
  totalBudget: number; // in major units (e.g. 800000)
  currency: string;
  venuePreference?: VenuePreference;
  styleTheme?: string;
  dietaryRequirements?: string[];
  accessibilityRequirements?: string[];
  priorities?: string[];
  naturalLanguagePrompt?: string;
}

export class AiService {
  /**
   * Request full event plan generation from server
   */
  public async generatePlan(params: GeneratePlanRequestParams): Promise<{
    plan: EventPlan;
    notice?: string;
    source: string;
  }> {
    const totalBudgetMinor = toMinorUnits(params.totalBudget, params.currency);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details || errorData.error || `Server responded with status ${response.status}`
        );
      }

      const data = await response.json();
      if (!data.plan) {
        throw new Error('Invalid response structure: missing plan payload.');
      }

      const normalizedPlan = normalizeAiPlan(data.plan, {
        name: params.name,
        category: params.category,
        targetDate: params.targetDate,
        location: params.location,
        guestCount: params.guestCount,
        totalBudgetMinor,
        currency: params.currency,
        venuePreference: params.venuePreference,
        styleTheme: params.styleTheme,
        dietaryRequirements: params.dietaryRequirements,
        accessibilityRequirements: params.accessibilityRequirements,
        priorities: params.priorities,
        naturalLanguagePrompt: params.naturalLanguagePrompt,
      });

      return {
        plan: normalizedPlan,
        notice: data.notice,
        source: data.source || 'gemini',
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('AI request timed out after 60 seconds. Please check your connection and retry.');
      }
      throw err;
    }
  }

  /**
   * Request regeneration of an individual section (e.g., budget, timeline, ideas)
   */
  public async regenerateSection(
    sectionName: 'budget' | 'timeline' | 'vendors' | 'ideas' | 'risks',
    currentPlan: EventPlan,
    newConstraints: string
  ): Promise<any> {
    const response = await fetch('/api/plan/regenerate-section', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sectionName,
        eventContext: {
          name: currentPlan.eventDetails.name,
          category: currentPlan.eventDetails.category,
          location: currentPlan.eventDetails.location,
          guestCount: currentPlan.eventDetails.guestCount,
          totalBudget: currentPlan.budget.totalBudgetMinor / 100,
          currency: currentPlan.budget.currency,
          targetDate: currentPlan.eventDetails.targetDate,
        },
        newConstraints,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || errorData.error || 'Failed to regenerate section');
    }

    const data = await response.json();
    return data.sectionData;
  }
}

export const aiService = new AiService();
