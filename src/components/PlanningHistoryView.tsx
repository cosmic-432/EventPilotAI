import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  PlusCircle,
  Copy,
  Edit3,
  Archive,
  ArchiveRestore,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';
import { EventPlan, EventCategory } from '../types/event';
import { PlanIndexEntry, eventRepository } from '../storage/eventRepository';
import { formatCurrency } from '../utils/currency';
import { formatDisplayDate } from '../utils/timeline';

interface PlanningHistoryViewProps {
  currentPlan: EventPlan | null;
  savedPlans: PlanIndexEntry[];
  onSelectPlan: (id: string) => void;
  onNewEvent: () => void;
  onRefreshPlans: () => void;
  onNavigateTab: (tab: string) => void;
  addToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message?: string) => void;
}

export type HistorySortOption = 'updated' | 'date_asc' | 'date_desc' | 'budget_desc' | 'name_asc';

export const isHistorySortOption = (val: string): val is HistorySortOption => {
  return ['updated', 'date_asc', 'date_desc', 'budget_desc', 'name_asc'].includes(val);
};

export const PlanningHistoryView: React.FC<PlanningHistoryViewProps> = ({
  currentPlan,
  savedPlans,
  onSelectPlan,
  onNewEvent,
  onRefreshPlans,
  onNavigateTab,
  addToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<HistorySortOption>('updated');

  // Rename modal state
  const [renamingPlan, setRenamingPlan] = useState<PlanIndexEntry | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Delete modal state
  const [deletingPlan, setDeletingPlan] = useState<PlanIndexEntry | null>(null);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (renamingPlan) setRenamingPlan(null);
        if (deletingPlan) setDeletingPlan(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [renamingPlan, deletingPlan]);

  // Filter & Sort Logic
  const filteredPlans = useMemo(() => {
    return savedPlans
      .filter((plan) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = plan.name.toLowerCase().includes(q);
          const matchesCat = plan.category.toLowerCase().includes(q);
          const matchesLoc = plan.location ? plan.location.toLowerCase().includes(q) : false;
          if (!matchesName && !matchesCat && !matchesLoc) return false;
        }

        // Category
        if (categoryFilter !== 'all' && plan.category !== categoryFilter) {
          return false;
        }

        // Status
        const status = plan.status || 'active';
        if (statusFilter !== 'all') {
          if (statusFilter === 'archived' && status !== 'archived') return false;
          if (statusFilter === 'active' && status !== 'active') return false;
          if (statusFilter === 'confirmed' && status !== 'confirmed') return false;
          if (statusFilter === 'draft' && status !== 'draft') return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'updated') {
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        }
        if (sortBy === 'date_desc') {
          return new Date(b.targetDate).getTime() - new Date(a.targetDate).getTime();
        }
        if (sortBy === 'budget_desc') {
          return (b.totalBudgetMinor || 0) - (a.totalBudgetMinor || 0);
        }
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [savedPlans, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Handle open & continue planning
  const handleOpenPlan = (id: string) => {
    onSelectPlan(id);
    onNavigateTab('dashboard');
  };

  // Handle duplicate
  const handleDuplicate = (id: string) => {
    const copy = eventRepository.duplicatePlan(id);
    if (copy) {
      onRefreshPlans();
      addToast('success', 'Plan Duplicated', `Created "${copy.eventDetails.name}"`);
    } else {
      addToast('error', 'Duplication Failed', 'Could not duplicate event plan.');
    }
  };

  // Handle rename submit
  const handleConfirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingPlan || !renameInput.trim()) return;
    const ok = eventRepository.renamePlan(renamingPlan.id, renameInput.trim());
    if (ok) {
      onRefreshPlans();
      addToast('success', 'Event Renamed', `Updated name to "${renameInput.trim()}"`);
    } else {
      addToast('error', 'Rename Failed');
    }
    setRenamingPlan(null);
    setRenameInput('');
  };

  // Handle toggle archive
  const handleToggleArchive = (id: string) => {
    const ok = eventRepository.toggleArchivePlan(id);
    if (ok) {
      onRefreshPlans();
      const plan = eventRepository.getPlanById(id);
      const isArchived = plan?.eventDetails.status === 'archived';
      addToast('info', isArchived ? 'Plan Archived' : 'Plan Restored', plan?.eventDetails.name);
    }
  };

  // Handle delete confirm
  const handleConfirmDelete = () => {
    if (!deletingPlan) return;
    const ok = eventRepository.deletePlan(deletingPlan.id);
    if (ok) {
      onRefreshPlans();
      addToast('warning', 'Plan Deleted', `Permanently removed "${deletingPlan.name}"`);
    }
    setDeletingPlan(null);
  };

  // Category Theme visual accent helper in Light Velvet Rose
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'wedding':
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF0F3] to-[#F8E1E8]',
          badgeBg: 'bg-[#FFF0F3] text-[#B85F80] border-[#E9B9C9]',
          symbol: '💍',
          title: 'Wedding & Engagement',
        };
      case 'birthday':
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF8ED] to-[#FFF0F3]',
          badgeBg: 'bg-[#FFF8ED] text-[#B89555] border-[#EADCE1]',
          symbol: '🎂',
          title: 'Birthday & Milestone',
        };
      case 'anniversary':
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF0F3] to-[#F5E9ED]',
          badgeBg: 'bg-[#FFF0F3] text-[#B85F80] border-[#E9B9C9]',
          symbol: '🥂',
          title: 'Anniversary Celebration',
        };
      case 'corporate':
        return {
          headerBg: 'bg-gradient-to-r from-[#F0F7F4] to-[#FFF0F3]',
          badgeBg: 'bg-[#F0F7F4] text-[#477D60] border-[#EADCE1]',
          symbol: '🏛️',
          title: 'Corporate Symposium',
        };
      case 'college_festival':
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF8ED] to-[#F8E1E8]',
          badgeBg: 'bg-[#FFF8ED] text-[#A87531] border-[#EADCE1]',
          symbol: '🎭',
          title: 'Campus & Cultural Fest',
        };
      default:
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF0F3] to-[#F5E9ED]',
          badgeBg: 'bg-white text-[#74616B] border-[#EADCE1]',
          symbol: '✨',
          title: 'Boutique Event',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EADCE1]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Celebration Archive
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#392832] tracking-tight mt-0.5">
            Planning History
          </h2>
          <p className="text-sm text-[#74616B] mt-1">
            Every celebration you design is safely stored, filterable, and ready to resume anytime.
          </p>
        </div>

        <button
          onClick={onNewEvent}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Celebration</span>
        </button>
      </div>

      {/* Search, Filter, and View Controls */}
      <div className="p-4 rounded-2xl bg-white border border-[#EADCE1] shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#998791] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by event title, category, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search events"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-xs text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-1 focus:ring-[#B85F80]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-xs text-[#392832] focus:outline-none focus:ring-1 focus:ring-[#B85F80]"
            >
              <option value="all">All Categories</option>
              <option value="wedding">Weddings</option>
              <option value="birthday">Birthdays</option>
              <option value="anniversary">Anniversaries</option>
              <option value="college_festival">College Festivals</option>
              <option value="corporate">Corporate</option>
              <option value="fundraiser">Fundraisers</option>
              <option value="community">Community</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => {
                if (isHistorySortOption(e.target.value)) {
                  setSortBy(e.target.value);
                }
              }}
              aria-label="Sort events"
              className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-xs text-[#392832] focus:outline-none focus:ring-1 focus:ring-[#B85F80]"
            >
              <option value="updated">Recently Updated</option>
              <option value="date_asc">Event Date (Soonest first)</option>
              <option value="date_desc">Event Date (Latest first)</option>
              <option value="budget_desc">Highest Budget</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EADCE1]/60 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-medium text-[#74616B] mr-1">Status:</span>
            {[
              { id: 'all', label: 'All Plans' },
              { id: 'active', label: 'In Progress' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'draft', label: 'Drafts' },
              { id: 'archived', label: 'Archived' },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#B85F80] text-white font-semibold shadow-2xs'
                      : 'bg-[#FBF5F6] text-[#74616B] hover:bg-[#F8E1E8] hover:text-[#392832]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-[#998791] font-mono">
            Showing {filteredPlans.length} of {savedPlans.length} event plans
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {filteredPlans.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-[#EADCE1] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] border border-[#EADCE1] text-[#B85F80] flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#392832]">
            No celebration plans found
          </h3>
          <p className="text-xs text-[#74616B] max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or clearing filters to see other plans.'
              : 'Create your first event master plan to see it preserved in your planning history.'}
          </p>
          <button
            onClick={onNewEvent}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Plan New Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map((plan) => {
            const isLoaded = currentPlan?.id === plan.id;
            const theme = getCategoryTheme(plan.category);
            const isArchived = plan.status === 'archived';

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isLoaded
                    ? 'bg-white border-[#B85F80] ring-1 ring-[#B85F80]'
                    : 'bg-white border-[#EADCE1] hover:border-[#B85F80]/50'
                } ${isArchived ? 'opacity-70' : ''}`}
              >
                {/* Header Banner */}
                <div className={`p-4 ${theme.headerBg} border-b border-[#EADCE1] flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{theme.symbol}</span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-semibold ${theme.badgeBg}`}
                    >
                      {theme.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isLoaded && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0F3] text-[#B85F80] border border-[#E9B9C9]">
                        Active Now
                      </span>
                    )}
                    {isArchived && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-[#74616B] border border-[#EADCE1]">
                        Archived
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-editorial text-lg font-bold text-[#392832] leading-snug line-clamp-1">
                      {plan.name}
                    </h3>

                    {plan.location && (
                      <p className="text-xs text-[#74616B] flex items-center gap-1.5 truncate mt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B89555] shrink-0" />
                        <span>{plan.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#EADCE1] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#998791]">
                        Event Date
                      </span>
                      <p className="font-semibold text-[#392832] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#B85F80]" />
                        <span>{formatDisplayDate(plan.targetDate)}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono text-[#998791]">
                        Total Budget
                      </span>
                      <p className="font-mono font-bold text-[#392832] tabular-nums mt-0.5">
                        {plan.totalBudgetMinor !== undefined
                          ? formatCurrency(plan.totalBudgetMinor, plan.currency || 'INR')
                          : '₹0'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-[#74616B]">Planning Progress</span>
                      <span className="font-mono font-semibold text-[#B85F80]">
                        {plan.progressPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        style={{ width: `${plan.progressPercentage || 0}%` }}
                        className="h-full bg-gradient-to-r from-[#B85F80] to-[#E9B9C9] rounded-full transition-all duration-300"
                      />
                    </div>
                    <p className="text-[10px] text-[#998791] mt-1.5">
                      Last edited {new Date(plan.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="px-4 py-3 bg-[#FBF5F6] border-t border-[#EADCE1] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenPlan(plan.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-[0.98]"
                  >
                    <span>{isLoaded ? 'Resume Active' : 'Open Studio'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(plan.id)}
                      title="Duplicate as new copy"
                      className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setRenamingPlan(plan);
                        setRenameInput(plan.name);
                      }}
                      title="Rename event"
                      className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleArchive(plan.id)}
                      title={isArchived ? 'Restore to active list' : 'Archive event'}
                      className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] transition-colors"
                    >
                      {isArchived ? (
                        <ArchiveRestore className="w-3.5 h-3.5 text-[#477D60]" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => setDeletingPlan(plan)}
                      title="Delete event permanently"
                      className="p-1.5 rounded-lg text-[#74616B] hover:text-[#B94D5A] hover:bg-[#FFF0F3] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rename Dialog Modal */}
      {renamingPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#EADCE1] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EADCE1]">
              <h3 id="rename-modal-title" className="font-editorial text-lg font-bold text-[#392832]">
                Rename Event Plan
              </h3>
              <button
                onClick={() => setRenamingPlan(null)}
                aria-label="Close rename modal"
                className="p-1 rounded-lg text-[#74616B] hover:bg-[#F8E1E8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRename} className="mt-4 space-y-4">
              <div>
                <label htmlFor="rename-input" className="block text-xs font-medium text-[#74616B] mb-1">
                  Event Title
                </label>
                <input
                  id="rename-input"
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-xs text-[#392832] focus:outline-none focus:ring-1 focus:ring-[#B85F80]"
                  placeholder="e.g., Ananya & Rohan Wedding Gala"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingPlan(null)}
                  className="px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:bg-[#F8E1E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] disabled:opacity-40 text-white text-xs font-bold transition-colors"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPlan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md bg-white border border-[#EADCE1] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] border border-[#EADCE1] text-[#B94D5A] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 id="delete-modal-title" className="font-editorial text-lg font-bold text-[#392832]">
                Delete Celebration Record?
              </h3>
              <p className="text-xs text-[#74616B] mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#392832]">&quot;{deletingPlan.name}&quot;</strong>? All associated budget items, milestones, vendor records, and risk scenarios will be removed from your studio storage.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EADCE1]">
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
                className="px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:bg-[#F8E1E8]"
              >
                Keep Event
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-[#B94D5A] hover:bg-[#9f3f4b] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
