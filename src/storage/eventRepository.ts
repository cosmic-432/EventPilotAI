/**
 * Event Repository Layer
 * Manages persistent local storage with schema versioning, multi-event support,
 * autosave, undo/redo history, and JSON export/import.
 */

import { EventPlan } from '../types/event';

const STORAGE_KEY_ACTIVE_PLAN_ID = 'eventpilot_active_plan_id';
const STORAGE_KEY_PLANS_PREFIX = 'eventpilot_plan_';
const STORAGE_KEY_INDEX = 'eventpilot_plans_index';
const MAX_HISTORY_STEPS = 20;

export interface PlanIndexEntry {
  id: string;
  name: string;
  category: string;
  targetDate: string;
  currency: string;
  updatedAt: string;
}

export class EventRepository {
  private historyStack: EventPlan[] = [];
  private futureStack: EventPlan[] = [];

  /**
   * Retrieves list of all stored event plans
   */
  public listPlans(): PlanIndexEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INDEX);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Loads the currently active plan, or null if none
   */
  public getActivePlan(): EventPlan | null {
    try {
      const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_PLAN_ID);
      if (!activeId) {
        // Fallback: load first from index if available
        const index = this.listPlans();
        if (index.length > 0) {
          return this.getPlanById(index[0].id);
        }
        return null;
      }
      return this.getPlanById(activeId);
    } catch (err) {
      console.error('Failed to get active plan:', err);
      return null;
    }
  }

  /**
   * Loads a specific plan by ID
   */
  public getPlanById(id: string): EventPlan | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PLANS_PREFIX}${id}`);
      if (!raw) return null;
      const plan = JSON.parse(raw) as EventPlan;
      return plan;
    } catch (err) {
      console.error(`Failed to load plan ${id}:`, err);
      return null;
    }
  }

  /**
   * Saves a plan to storage, updates index, and manages undo history
   */
  public savePlan(plan: EventPlan, recordHistory = true): boolean {
    try {
      if (!plan || !plan.id) return false;

      // Capture previous state into history stack for undo
      if (recordHistory) {
        const prev = this.getPlanById(plan.id);
        if (prev) {
          this.historyStack.push(JSON.parse(JSON.stringify(prev)));
          if (this.historyStack.length > MAX_HISTORY_STEPS) {
            this.historyStack.shift();
          }
          // Clear redo stack on new distinct action
          this.futureStack = [];
        }
      }

      const updatedPlan: EventPlan = {
        ...plan,
        updatedAt: new Date().toISOString(),
      };

      // Store plan JSON
      localStorage.setItem(
        `${STORAGE_KEY_PLANS_PREFIX}${plan.id}`,
        JSON.stringify(updatedPlan)
      );

      // Set as active plan
      localStorage.setItem(STORAGE_KEY_ACTIVE_PLAN_ID, plan.id);

      // Update index
      const index = this.listPlans().filter((p) => p.id !== plan.id);
      index.unshift({
        id: updatedPlan.id,
        name: updatedPlan.eventDetails.name,
        category: updatedPlan.eventDetails.category,
        targetDate: updatedPlan.eventDetails.targetDate,
        currency: updatedPlan.budget.currency,
        updatedAt: updatedPlan.updatedAt,
      });
      localStorage.setItem(STORAGE_KEY_INDEX, JSON.stringify(index));

      return true;
    } catch (err) {
      console.error('Failed to save event plan:', err);
      return false;
    }
  }

  /**
   * Switches active plan
   */
  public setActivePlanId(id: string): boolean {
    const exists = this.getPlanById(id);
    if (!exists) return false;
    localStorage.setItem(STORAGE_KEY_ACTIVE_PLAN_ID, id);
    this.historyStack = [];
    this.futureStack = [];
    return true;
  }

  /**
   * Deletes a plan by ID
   */
  public deletePlan(id: string): boolean {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PLANS_PREFIX}${id}`);
      const index = this.listPlans().filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY_INDEX, JSON.stringify(index));

      const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_PLAN_ID);
      if (activeId === id) {
        if (index.length > 0) {
          localStorage.setItem(STORAGE_KEY_ACTIVE_PLAN_ID, index[0].id);
        } else {
          localStorage.removeItem(STORAGE_KEY_ACTIVE_PLAN_ID);
        }
      }
      this.historyStack = [];
      this.futureStack = [];
      return true;
    } catch (err) {
      console.error('Failed to delete plan:', err);
      return false;
    }
  }

  /**
   * Undo last change
   */
  public undo(currentPlan: EventPlan): EventPlan | null {
    if (this.historyStack.length === 0) return null;
    const previous = this.historyStack.pop();
    if (!previous) return null;

    // Push current to future stack
    this.futureStack.push(JSON.parse(JSON.stringify(currentPlan)));
    this.savePlan(previous, false);
    return previous;
  }

  /**
   * Redo last undone change
   */
  public redo(currentPlan: EventPlan): EventPlan | null {
    if (this.futureStack.length === 0) return null;
    const next = this.futureStack.pop();
    if (!next) return null;

    // Push current to history stack
    this.historyStack.push(JSON.parse(JSON.stringify(currentPlan)));
    this.savePlan(next, false);
    return next;
  }

  public canUndo(): boolean {
    return this.historyStack.length > 0;
  }

  public canRedo(): boolean {
    return this.futureStack.length > 0;
  }

  /**
   * Export plan as raw JSON file
   */
  public exportPlanJson(plan: EventPlan): string {
    return JSON.stringify(plan, null, 2);
  }

  /**
   * Imports a plan from parsed JSON, validating schema
   */
  public importPlanJson(jsonString: string): EventPlan | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.eventDetails || !parsed.budget || !parsed.timeline) {
        throw new Error('Invalid event plan structure.');
      }
      const plan: EventPlan = {
        ...parsed,
        id: `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: new Date().toISOString(),
      };
      this.savePlan(plan, true);
      return plan;
    } catch (err) {
      console.error('Failed to import plan JSON:', err);
      return null;
    }
  }
}

export const eventRepository = new EventRepository();
