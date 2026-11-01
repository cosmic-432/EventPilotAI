/**
 * Event Repository Layer
 * Manages persistent local storage with multi-event support, planning history,
 * duplication, renaming, archiving, autosave, undo/redo, and JSON export/import.
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
  totalBudgetMinor?: number;
  guestCount?: number;
  location?: string;
  status?: 'active' | 'draft' | 'confirmed' | 'archived';
  progressPercentage?: number;
}

export class EventRepository {
  private historyStack: EventPlan[] = [];
  private futureStack: EventPlan[] = [];

  /**
   * Retrieves list of all stored event plans from index
   */
  public listPlans(): PlanIndexEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INDEX);
      if (!raw) return [];
      const list = JSON.parse(raw) as PlanIndexEntry[];
      return Array.isArray(list) ? list : [];
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
        // Fallback: load first non-archived from index if available
        const index = this.listPlans();
        if (index.length > 0) {
          const first = index.find((p) => p.status !== 'archived') || index[0];
          return this.getPlanById(first.id);
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
   * Loads all plans from storage (for Planning History view)
   */
  public getAllPlans(): EventPlan[] {
    const index = this.listPlans();
    const plans: EventPlan[] = [];
    for (const entry of index) {
      const p = this.getPlanById(entry.id);
      if (p) plans.push(p);
    }
    return plans;
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

      // Update index with full search/filter attributes
      const existingIndex = this.listPlans();
      const existingEntry = existingIndex.find((p) => p.id === plan.id);
      const filteredIndex = existingIndex.filter((p) => p.id !== plan.id);

      const tasks = updatedPlan.timeline?.tasks || [];
      const completedTasks = tasks.filter((t) => t.status === 'completed').length;
      const progressPercentage = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

      const newEntry: PlanIndexEntry = {
        id: updatedPlan.id,
        name: updatedPlan.eventDetails.name,
        category: updatedPlan.eventDetails.category,
        targetDate: updatedPlan.eventDetails.targetDate,
        currency: updatedPlan.budget.currency,
        updatedAt: updatedPlan.updatedAt,
        totalBudgetMinor: updatedPlan.budget.totalBudgetMinor,
        guestCount: updatedPlan.eventDetails.guestCount,
        location: updatedPlan.eventDetails.location,
        status: updatedPlan.eventDetails.status || existingEntry?.status || 'active',
        progressPercentage,
      };

      filteredIndex.unshift(newEntry);
      localStorage.setItem(STORAGE_KEY_INDEX, JSON.stringify(filteredIndex));

      return true;
    } catch (err) {
      console.error('Failed to save event plan:', err);
      return false;
    }
  }

  /**
   * Creates a new plan, ensuring a guaranteed unique ID so existing events are never overwritten
   */
  public createNewPlan(plan: EventPlan): EventPlan {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const uniqueId = `plan_${timestamp}_${randomSuffix}`;

    const freshPlan: EventPlan = {
      ...plan,
      id: uniqueId,
      eventDetails: {
        ...plan.eventDetails,
        id: uniqueId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.savePlan(freshPlan, false);
    return freshPlan;
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
   * Renames an event plan
   */
  public renamePlan(id: string, newName: string): boolean {
    const plan = this.getPlanById(id);
    if (!plan || !newName.trim()) return false;
    plan.eventDetails.name = newName.trim();
    return this.savePlan(plan, true);
  }

  /**
   * Duplicates an existing event plan with an independent copy
   */
  public duplicatePlan(id: string): EventPlan | null {
    const source = this.getPlanById(id);
    if (!source) return null;

    const timestamp = Date.now();
    const newId = `plan_${timestamp}_copy_${Math.random().toString(36).substring(2, 6)}`;
    const copyName = `${source.eventDetails.name} (Copy)`;

    const duplicatedPlan: EventPlan = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      eventDetails: {
        ...source.eventDetails,
        id: newId,
        name: copyName,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.savePlan(duplicatedPlan, false);
    return duplicatedPlan;
  }

  /**
   * Toggles archive status of a plan
   */
  public toggleArchivePlan(id: string): boolean {
    const plan = this.getPlanById(id);
    if (!plan) return false;
    const currentStatus = plan.eventDetails.status || 'active';
    const nextStatus = currentStatus === 'archived' ? 'active' : 'archived';
    plan.eventDetails.status = nextStatus;
    return this.savePlan(plan, false);
  }

  /**
   * Updates plan status
   */
  public updatePlanStatus(id: string, status: 'active' | 'draft' | 'confirmed' | 'archived'): boolean {
    const plan = this.getPlanById(id);
    if (!plan) return false;
    plan.eventDetails.status = status;
    return this.savePlan(plan, true);
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
