/**
 * EventPilot AI - Intelligent Event Planning & Budget Optimization Platform
 * Velvet Rose Boutique Event Studio Edition
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { WelcomeHero } from './components/WelcomeHero';
import { SetupWizardModal } from './components/SetupWizardModal';
import { DashboardView } from './components/DashboardView';
import { MyEventsView } from './components/MyEventsView';
import { PlanningHistoryView } from './components/PlanningHistoryView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { TimelineView } from './components/TimelineView';
import { VendorsView } from './components/VendorsView';
import { IdeasView } from './components/IdeasView';
import { GuestLogisticsView } from './components/GuestLogisticsView';
import { RisksView } from './components/RisksView';
import { SettingsView } from './components/SettingsView';
import { ExportModal } from './components/ExportModal';
import { PrintModal } from './components/PrintModal';
import { RegenerateSectionModal } from './components/RegenerateSectionModal';
import { HelpSupportModal } from './components/HelpSupportModal';
import { ToastContainer, ToastMessage } from './components/NotificationToast';
import { EventPlan, EventCategory } from './types/event';
import { eventRepository, PlanIndexEntry } from './storage/eventRepository';
import { aiService, GeneratePlanRequestParams } from './services/aiService';
import { calculateDateBeforeEvent } from './utils/timeline';
import { toMinorUnits } from './utils/currency';
import { isRecord } from './types/api';
import { toPriorityLevel, toPaymentStatus, toBookingStatus, toRiskCategory, toRiskSeverity, toRiskProbability } from './utils/validation';

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<EventPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<PlanIndexEntry[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sidebar controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('eventpilot_sidebar_collapsed') === 'true';
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Modal controls
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Undo / Redo tracking
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('eventpilot_sidebar_collapsed', String(next));
      return next;
    });
  };

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshPlansList = useCallback(() => {
    const list = eventRepository.listPlans();
    setSavedPlans(list);
    setCanUndo(eventRepository.canUndo());
    setCanRedo(eventRepository.canRedo());
  }, []);

  // Initial load
  useEffect(() => {
    const active = eventRepository.getActivePlan();
    if (active) {
      setCurrentPlan(active);
    }
    refreshPlansList();
  }, [refreshPlansList]);

  // Handle plan update and auto-save
  const handleUpdatePlan = (updated: EventPlan, recordHistory = true) => {
    setCurrentPlan(updated);
    eventRepository.savePlan(updated, recordHistory);
    refreshPlansList();
  };

  // Switch plan
  const handleSelectPlan = (id: string) => {
    const found = eventRepository.getPlanById(id);
    if (found) {
      eventRepository.setActivePlanId(id);
      setCurrentPlan(found);
      refreshPlansList();
      addToast('info', 'Event Loaded', `Switched to "${found.eventDetails.name}"`);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (!currentPlan) return;
    const prev = eventRepository.undo(currentPlan);
    if (prev) {
      setCurrentPlan(prev);
      refreshPlansList();
      addToast('info', 'Undo successful', 'Reverted previous change');
    }
  };

  const handleRedo = () => {
    if (!currentPlan) return;
    const next = eventRepository.redo(currentPlan);
    if (next) {
      setCurrentPlan(next);
      refreshPlansList();
      addToast('info', 'Redo successful', 'Reapplied change');
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPlan]);

  // Generate Plan: Creates a NEW event without overwriting previous ones!
  const handleGeneratePlan = async (params: GeneratePlanRequestParams) => {
    setIsLoading(true);
    try {
      const result = await aiService.generatePlan(params);
      // Create new plan with guaranteed unique ID in repository
      const freshPlan = eventRepository.createNewPlan(result.plan);
      setCurrentPlan(freshPlan);
      refreshPlansList();
      setIsWizardOpen(false);
      setActiveTab('dashboard');
      if (result.notice) {
        addToast('warning', 'Plan Created with Benchmark Data', result.notice);
      } else {
        addToast('success', 'Master Plan Generated', `Successfully created ${freshPlan.eventDetails.name}`);
      }
    } catch (err: unknown) {
      console.error('Generation error:', err);
      const msg = err instanceof Error ? err.message : 'Could not connect to AI service';
      addToast('error', 'Generation Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick prompt parser for welcome hero
  const handleQuickGenerate = (promptText: string) => {
    let category: EventCategory = 'wedding';
    const lower = promptText.toLowerCase();

    if (lower.includes('wedding') || lower.includes('engagement') || lower.includes('shaadi') || lower.includes('marriage')) {
      category = 'wedding';
    } else if (lower.includes('college') || lower.includes('fest') || lower.includes('student')) {
      category = 'college_festival';
    } else if (lower.includes('birthday')) {
      category = 'birthday';
    } else if (lower.includes('anniversary')) {
      category = 'anniversary';
    } else if (lower.includes('charity') || lower.includes('fundraiser') || lower.includes('gala')) {
      category = 'fundraiser';
    } else if (lower.includes('corporate') || lower.includes('conference')) {
      category = 'corporate';
    }

    let guestCount = 200;
    const guestMatch = promptText.match(/(\d+[\d,]*)\s*(?:guests?|attendees?|students?|people|donors?)/i);
    if (guestMatch) {
      guestCount = parseInt(guestMatch[1].replace(/,/g, ''), 10) || 200;
    }

    let totalBudget = 800000;
    let currency = 'INR';
    if (promptText.includes('$')) currency = 'USD';
    else if (promptText.includes('€')) currency = 'EUR';
    else if (promptText.includes('£')) currency = 'GBP';

    const budgetMatch = promptText.match(/(?:₹|rs\.?|inr|\$|€|£)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakhs?|lac|cr|crore)?/i);
    if (budgetMatch) {
      let bVal = parseFloat(budgetMatch[1].replace(/,/g, ''));
      if (lower.includes('lakh') && bVal < 1000) bVal *= 100000;
      if (lower.includes('crore') && bVal < 100) bVal *= 10000000;
      if (bVal > 1000) totalBudget = Math.round(bVal);
    }

    let daysAway = 60;
    const daysMatch = promptText.match(/in\s*(\d+)\s*days/i);
    if (daysMatch) {
      daysAway = parseInt(daysMatch[1], 10);
    }

    const today = new Date();
    today.setDate(today.getDate() + daysAway);
    const targetDate = today.toISOString().split('T')[0];

    let location = 'Pune, Maharashtra';
    if (lower.includes('pune')) location = 'Pune, Maharashtra';
    else if (lower.includes('bangalore') || lower.includes('bengaluru')) location = 'Bangalore, Karnataka';
    else if (lower.includes('mumbai')) location = 'Mumbai, Maharashtra';
    else if (lower.includes('delhi')) location = 'New Delhi';

    handleGeneratePlan({
      name: category === 'wedding' ? 'Ananya & Rohan Wedding' : category === 'college_festival' ? 'TechVeda Annual College Fest' : 'Signature Celebration',
      category,
      targetDate,
      location,
      guestCount,
      totalBudget,
      currency,
      venuePreference: lower.includes('outdoor') ? 'outdoor' : lower.includes('indoor') ? 'indoor' : 'flexible',
      styleTheme: lower.includes('traditional') ? 'Traditional Royal Maharashtrian' : 'Contemporary Celebratory',
      dietaryRequirements: lower.includes('vegetarian') ? ['Vegetarian', 'Jain Options'] : ['Standard Accommodations'],
      accessibilityRequirements: ['Wheelchair Ramps & Handrails', 'Reserved Elder Seating'],
      priorities: ['Flawless Catering', 'On-Time Vendor Coordination', 'Budget Discipline'],
      naturalLanguagePrompt: promptText,
    });
  };

  // Selective section re-generation
  const handleRegenerateSectionSubmit = async (
    sectionName: 'budget' | 'timeline' | 'vendors' | 'ideas' | 'risks',
    constraints: string
  ) => {
    if (!currentPlan) return;
    setIsLoading(true);

    try {
      const updatedSectionData = await aiService.regenerateSection(sectionName, currentPlan, constraints);
      let updatedPlan = { ...currentPlan };
      const rawSection = isRecord(updatedSectionData) ? updatedSectionData : {};

      if (sectionName === 'budget') {
        const rawItems = Array.isArray(rawSection.items) ? rawSection.items : updatedPlan.budget.items;
        updatedPlan = {
          ...updatedPlan,
          budget: {
            ...updatedPlan.budget,
            items: rawItems.map((bRaw: unknown, idx: number) => {
              const b = isRecord(bRaw) ? bRaw : {};
              const id = typeof b.id === 'string' && b.id ? b.id : `bgt_ai_${idx}`;
              const category = typeof b.category === 'string' && b.category ? b.category : 'General';
              const description = typeof b.description === 'string' && b.description ? b.description : 'Budget line item';
              const estimatedAmountMinor = typeof b.estimatedAmountMajor === 'number'
                ? toMinorUnits(b.estimatedAmountMajor, currentPlan.budget.currency)
                : typeof b.estimatedAmountMinor === 'number'
                ? b.estimatedAmountMinor
                : 100000;
              const actualAmountMinor = typeof b.actualAmountMinor === 'number' ? b.actualAmountMinor : 0;
              const quantity = typeof b.quantity === 'number' && b.quantity > 0 ? b.quantity : 1;
              const unitCostMinor = typeof b.unitCostMinor === 'number' ? b.unitCostMinor : estimatedAmountMinor;
              const priority = toPriorityLevel(b.priority);
              const paymentStatus = toPaymentStatus(b.paymentStatus);
              const notes = typeof b.notes === 'string' ? b.notes : '';

              return {
                id,
                category,
                description,
                estimatedAmountMinor,
                actualAmountMinor,
                quantity,
                unitCostMinor,
                priority,
                paymentStatus,
                notes,
                isAiEstimated: true,
              };
            }),
          },
        };
      } else if (sectionName === 'timeline') {
        const rawTasks = Array.isArray(rawSection.tasks) ? rawSection.tasks : updatedPlan.timeline.tasks;
        updatedPlan = {
          ...updatedPlan,
          timeline: {
            tasks: rawTasks.map((tRaw: unknown, idx: number) => {
              const t = isRecord(tRaw) ? tRaw : {};
              const id = typeof t.id === 'string' && t.id ? t.id : `tsk_ai_${idx}`;
              const title = typeof t.title === 'string' && t.title ? t.title : 'Task';
              const description = typeof t.description === 'string' ? t.description : '';
              const category = typeof t.category === 'string' && t.category ? t.category : 'Planning';
              const daysBeforeEvent = typeof t.daysBeforeEvent === 'number' ? t.daysBeforeEvent : 14;
              const dueDate = typeof t.dueDate === 'string' && t.dueDate
                ? t.dueDate
                : calculateDateBeforeEvent(currentPlan.eventDetails.targetDate, daysBeforeEvent);
              const priority = toPriorityLevel(t.priority);
              const status = t.status === 'completed' || t.status === 'in_progress' ? t.status : 'todo';
              const dependencies = Array.isArray(t.dependencies) ? t.dependencies.filter((d): d is string => typeof d === 'string') : [];
              const notes = typeof t.notes === 'string' ? t.notes : '';

              return {
                id,
                title,
                description,
                category,
                dueDate,
                daysBeforeEvent,
                priority,
                status,
                dependencies,
                notes,
                isAiGenerated: true,
              };
            }),
          },
        };
      } else if (sectionName === 'vendors') {
        const rawItems = Array.isArray(rawSection.items) ? rawSection.items : updatedPlan.vendors.items;
        updatedPlan = {
          ...updatedPlan,
          vendors: {
            items: rawItems.map((vRaw: unknown, idx: number) => {
              const v = isRecord(vRaw) ? vRaw : {};
              return {
                id: typeof v.id === 'string' && v.id ? v.id : `vnd_ai_${idx}`,
                category: typeof v.category === 'string' ? v.category : 'General',
                title: typeof v.title === 'string' ? v.title : 'Vendor',
                selectionGuidance: typeof v.selectionGuidance === 'string' ? v.selectionGuidance : '',
                estimatedCostMinor: typeof v.estimatedCostMinor === 'number' ? v.estimatedCostMinor : 100000,
                targetBookingDate: typeof v.targetBookingDate === 'string' ? v.targetBookingDate : currentPlan.eventDetails.targetDate,
                bookingStatus: toBookingStatus(v.bookingStatus),
                selectionCriteria: Array.isArray(v.selectionCriteria) ? v.selectionCriteria.filter((c): c is string => typeof c === 'string') : [],
                notes: typeof v.notes === 'string' ? v.notes : '',
              };
            }),
          },
        };
      } else if (sectionName === 'ideas') {
        if (isRecord(updatedSectionData)) {
          updatedPlan = {
            ...updatedPlan,
            ideas: {
              ...updatedPlan.ideas,
              ...(updatedSectionData as Partial<typeof updatedPlan.ideas>),
            },
          };
        }
      } else if (sectionName === 'risks') {
        const rawItems = Array.isArray(rawSection.items) ? rawSection.items : updatedPlan.risks.items;
        updatedPlan = {
          ...updatedPlan,
          risks: {
            items: rawItems.map((rRaw: unknown, idx: number) => {
              const r = isRecord(rRaw) ? rRaw : {};
              return {
                id: typeof r.id === 'string' && r.id ? r.id : `rsk_ai_${idx}`,
                category: toRiskCategory(r.category),
                title: typeof r.title === 'string' ? r.title : 'Risk factor',
                severity: toRiskSeverity(r.severity),
                probability: toRiskProbability(r.probability),
                mitigation: typeof r.mitigation === 'string' ? r.mitigation : '',
                contingencyAction: typeof r.contingencyAction === 'string' ? r.contingencyAction : '',
                isResolved: Boolean(r.isResolved),
              };
            }),
          },
        };
      }

      handleUpdatePlan(updatedPlan, true);
      addToast('success', 'Section Updated', `Re-optimized ${sectionName} based on your new constraints.`);
    } catch (err: unknown) {
      console.error('Section update failed:', err);
      const msg = err instanceof Error ? err.message : 'Failed to update section';
      addToast('error', 'Optimization Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle single task from dashboard
  const handleToggleTask = (taskId: string) => {
    if (!currentPlan) return;
    const updated = currentPlan.timeline.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'completed' ? ('todo' as const) : ('completed' as const) };
      }
      return t;
    });
    handleUpdatePlan({
      ...currentPlan,
      timeline: { tasks: updated },
    });
    addToast('success', 'Task status updated');
  };

  // Confirm assumption from dashboard
  const handleConfirmAssumption = (assumptionId: string) => {
    if (!currentPlan) return;
    const updated = currentPlan.assumptions.map((a) =>
      a.id === assumptionId ? { ...a, isConfirmed: !a.isConfirmed } : a
    );
    handleUpdatePlan({
      ...currentPlan,
      assumptions: updated,
    });
    addToast('info', 'Assumption updated');
  };

  // Delete plan
  const handleDeletePlan = (id: string) => {
    eventRepository.deletePlan(id);
    const active = eventRepository.getActivePlan();
    setCurrentPlan(active);
    refreshPlansList();
    addToast('warning', 'Event Deleted', 'Removed from local storage');
  };

  // Import plan from JSON string
  const handleImportJson = (jsonString: string) => {
    const imported = eventRepository.importPlanJson(jsonString);
    if (imported) {
      setCurrentPlan(imported);
      refreshPlansList();
      addToast('success', 'Plan Imported', `Successfully imported "${imported.eventDetails.name}"`);
    } else {
      addToast('error', 'Import Failed', 'Invalid event plan JSON file format.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5F6] text-[#392832] flex antialiased selection:bg-[#E9B9C9] selection:text-[#392832]">
      {/* 1. Persistent, Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewEvent={() => setIsWizardOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
        currentPlan={currentPlan}
        savedPlans={savedPlans}
        onSelectPlan={handleSelectPlan}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar
          currentPlan={currentPlan}
          savedPlans={savedPlans}
          onSelectPlan={handleSelectPlan}
          onNewEvent={() => setIsWizardOpen(true)}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onOpenExport={() => setIsExportOpen(true)}
          onOpenPrint={() => setIsPrintOpen(true)}
          onOpenRegenerate={() => setIsRegenerateOpen(true)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
        />

        {/* Main Workspace Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!currentPlan && activeTab !== 'my_events' && activeTab !== 'history' ? (
            <WelcomeHero
              onQuickGenerate={handleQuickGenerate}
              onOpenWizard={() => setIsWizardOpen(true)}
              isLoading={isLoading}
            />
          ) : (
            <div className="animate-in fade-in duration-200">
              {/* Overview / Dashboard */}
              {activeTab === 'dashboard' && currentPlan && (
                <DashboardView
                  plan={currentPlan}
                  savedPlans={savedPlans}
                  onNavigateTab={setActiveTab}
                  onToggleTask={handleToggleTask}
                  onConfirmAssumption={handleConfirmAssumption}
                  onNewEvent={() => setIsWizardOpen(true)}
                  onSelectPlan={handleSelectPlan}
                />
              )}

              {/* My Events Portfolio View */}
              {activeTab === 'my_events' && (
                <MyEventsView
                  currentPlan={currentPlan}
                  savedPlans={savedPlans}
                  onSelectPlan={handleSelectPlan}
                  onNewEvent={() => setIsWizardOpen(true)}
                  onNavigateTab={setActiveTab}
                />
              )}

              {/* Dedicated Planning History View */}
              {activeTab === 'history' && (
                <PlanningHistoryView
                  currentPlan={currentPlan}
                  savedPlans={savedPlans}
                  onSelectPlan={handleSelectPlan}
                  onNewEvent={() => setIsWizardOpen(true)}
                  onRefreshPlans={refreshPlansList}
                  onNavigateTab={setActiveTab}
                  addToast={addToast}
                />
              )}

              {/* Inspiration & Design Concepts */}
              {activeTab === 'ideas' && currentPlan && (
                <IdeasView
                  plan={currentPlan}
                  onUpdatePlan={handleUpdatePlan}
                  onOpenRegenerate={() => setIsRegenerateOpen(true)}
                />
              )}

              {/* Budget Planner */}
              {activeTab === 'budget' && currentPlan && (
                <BudgetPlannerView
                  plan={currentPlan}
                  onUpdatePlan={handleUpdatePlan}
                  onOpenRegenerate={() => setIsRegenerateOpen(true)}
                />
              )}

              {/* Vendor Checklist */}
              {activeTab === 'vendors' && currentPlan && (
                <VendorsView
                  plan={currentPlan}
                  onUpdatePlan={handleUpdatePlan}
                  onOpenRegenerate={() => setIsRegenerateOpen(true)}
                />
              )}

              {/* Preparation Timeline */}
              {activeTab === 'timeline' && currentPlan && (
                <TimelineView
                  plan={currentPlan}
                  onUpdatePlan={handleUpdatePlan}
                  onOpenRegenerate={() => setIsRegenerateOpen(true)}
                />
              )}

              {/* Guest & Catering Logistics */}
              {activeTab === 'guests' && currentPlan && (
                <GuestLogisticsView
                  plan={currentPlan}
                  onUpdatePlan={handleUpdatePlan}
                />
              )}

              {/* Contingency & Risks */}
              {activeTab === 'risks' && currentPlan && (
                <RisksView
                  plan={currentPlan}
                  onUpdatePlan={handleUpdatePlan}
                />
              )}

              {/* Studio Settings */}
              {activeTab === 'settings' && currentPlan && (
                <SettingsView
                  plan={currentPlan}
                  onUpdatePlan={handleUpdatePlan}
                  onDeletePlan={handleDeletePlan}
                  onImportPlanJson={handleImportJson}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialog Modals */}
      <SetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleGeneratePlan}
        isLoading={isLoading}
      />

      {currentPlan && (
        <>
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            plan={currentPlan}
          />

          <PrintModal
            isOpen={isPrintOpen}
            onClose={() => setIsPrintOpen(false)}
            plan={currentPlan}
          />

          <RegenerateSectionModal
            isOpen={isRegenerateOpen}
            onClose={() => setIsRegenerateOpen(false)}
            plan={currentPlan}
            onSectionRegenerated={() => {}}
            isLoading={isLoading}
            onSubmitRegenerate={handleRegenerateSectionSubmit}
          />
        </>
      )}

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
