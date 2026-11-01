import React, { useState, useMemo } from 'react';
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
  const [sortBy, setSortBy] = useState<'updated' | 'date_asc' | 'date_desc' | 'budget_desc' | 'name_asc'>('updated');

  // Rename modal state
  const [renamingPlan, setRenamingPlan] = useState<PlanIndexEntry | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Delete modal state
  const [deletingPlan, setDeletingPlan] = useState<PlanIndexEntry | null>(null);

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
          headerBg: 'bg-gradient-to-r from-[#FFF2EF] to-[#FDE8E3]',
          badgeBg: 'bg-[#FFF2EF] text-[#FF6F61] border-[#FF9A8B]',
          symbol: '💍',
          title: 'Wedding & Engagement',
        };
      case 'birthday':
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF8ED] to-[#FFF2EF]',
          badgeBg: 'bg-[#FFF8ED] text-[#B89555] border-[#EEDCD7]',
          symbol: '🎂',
          title: 'Birthday & Milestone',
        };
      case 'anniversary':
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF2EF] to-[#F8EFEB]',
          badgeBg: 'bg-[#FFF2EF] text-[#FF6F61] border-[#FF9A8B]',
          symbol: '🥂',
          title: 'Anniversary Celebration',
        };
      case 'corporate':
        return {
          headerBg: 'bg-gradient-to-r from-[#F0F7F4] to-[#FFF2EF]',
          badgeBg: 'bg-[#F0F7F4] text-[#477D60] border-[#EEDCD7]',
          symbol: '🏛️',
          title: 'Corporate Symposium',
        };
      case 'college_festival':
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF8ED] to-[#FDE8E3]',
          badgeBg: 'bg-[#FFF8ED] text-[#A87531] border-[#EEDCD7]',
          symbol: '🎭',
          title: 'Campus & Cultural Fest',
        };
      default:
        return {
          headerBg: 'bg-gradient-to-r from-[#FFF2EF] to-[#F8EFEB]',
          badgeBg: 'bg-white text-[#57534E] border-[#EEDCD7]',
          symbol: '✨',
          title: 'Boutique Event',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EEDCD7]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Celebration Archive
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight mt-0.5">
            Planning History
          </h2>
          <p className="text-sm text-[#57534E] mt-1">
            Every celebration, all in one place.
          </p>
        </div>

        <button
          onClick={onNewEvent}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ New Event</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EEDCD7] shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#8A827D] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event name, category, or location..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#EEDCD7] bg-[#FCF8F7] text-xs text-[#1C1917] placeholder:text-[#8A827D] focus:outline-none focus:ring-1 focus:ring-[#FF6F61]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter events by category"
              className="w-full px-3 py-2 rounded-xl border border-[#EEDCD7] bg-[#FCF8F7] text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#FF6F61]"
            >
              <option value="all">All Categories ({savedPlans.length})</option>
              <option value="wedding">Weddings</option>
              <option value="birthday">Birthdays</option>
              <option value="anniversary">Anniversaries</option>
              <option value="corporate">Corporate</option>
              <option value="college_festival">Festivals</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort events by criteria"
              className="w-full px-3 py-2 rounded-xl border border-[#EEDCD7] bg-[#FCF8F7] text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#FF6F61]"
            >
              <option value="updated">Recently Updated</option>
              <option value="date_asc">Event Date (Earliest First)</option>
              <option value="date_desc">Event Date (Latest First)</option>
              <option value="budget_desc">Highest Budget</option>
              <option value="name_asc">Event Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Status Pills Filter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EEDCD7]/60 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-medium text-[#57534E] mr-1">Status:</span>
            {[
              { id: 'all', label: `All (${savedPlans.length})` },
              { id: 'active', label: 'Active' },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'draft', label: 'Drafts' },
              { id: 'archived', label: 'Archived' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st.id
                    ? 'bg-[#FF6F61] text-white font-semibold shadow-2xs'
                    : 'bg-[#FCF8F7] text-[#57534E] hover:bg-[#FDE8E3] hover:text-[#1C1917]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-[#8A827D]">
            Showing {filteredPlans.length} of {savedPlans.length} records
          </span>
        </div>
      </div>

      {/* Events Card Grid */}
      {filteredPlans.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-[#EEDCD7] text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2EF] border border-[#EEDCD7] text-[#FF6F61] flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
            No matching events found
          </h3>
          <p className="text-xs text-[#57534E] max-w-sm mx-auto">
            Try adjusting your search query, status filters, or start a new event plan.
          </p>
          <button
            onClick={onNewEvent}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Start New Celebration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const theme = getCategoryTheme(plan.category);
            const isCurrentlyActive = currentPlan?.id === plan.id;
            const isArchived = plan.status === 'archived';

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isCurrentlyActive
                    ? 'bg-white border-[#FF6F61] ring-1 ring-[#FF6F61]'
                    : 'bg-white border-[#EEDCD7] hover:border-[#FF6F61]/50'
                }`}
              >
                {/* Visual Header / Tasteful Illustration Bar */}
                <div className={`p-4 ${theme.headerBg} border-b border-[#EEDCD7] flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={plan.category}>
                      {theme.symbol}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border capitalize ${theme.badgeBg}`}>
                      {plan.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-1.5">
                    {isCurrentlyActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF2EF] text-[#FF6F61] border border-[#FF9A8B]">
                        Active
                      </span>
                    )}
                    {isArchived ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-[#57534E] border border-[#EEDCD7]">
                        Archived
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-[#477D60] border border-emerald-200">
                        {plan.status || 'Active'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-editorial text-lg font-bold text-[#1C1917] leading-snug line-clamp-1">
                      {plan.name}
                    </h3>

                    {plan.location && (
                      <p className="text-xs text-[#57534E] flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#B89555] shrink-0" />
                        <span>{plan.location}</span>
                      </p>
                    )}
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-[#EEDCD7] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8A827D]">
                        Target Date
                      </span>
                      <p className="font-semibold text-[#1C1917] flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-[#FF6F61]" />
                        <span>{formatDisplayDate(plan.targetDate)}</span>
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#8A827D]">
                        Budget
                      </span>
                      <p className="font-mono font-bold text-[#1C1917] tabular-nums mt-0.5">
                        {formatCurrency(plan.totalBudgetMinor || 0, plan.currency || 'INR')}
                      </p>
                    </div>
                  </div>

                  {/* Planning Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#57534E]">Planning Progress</span>
                      <span className="font-mono font-semibold text-[#FF6F61]">
                        {plan.progressPercentage || 0}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#F8EFEB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#FF6F61] to-[#FF9A8B] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(5, plan.progressPercentage || 0))}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-[#8A827D] flex items-center justify-between pt-1">
                    <span>{plan.guestCount} invited guests</span>
                    <span>Updated {new Date(plan.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-3 bg-[#FCF8F7] border-t border-[#EEDCD7] flex items-center justify-between gap-2">
                  {/* Primary: Open and continue planning */}
                  <button
                    onClick={() => handleOpenPlan(plan.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs active:scale-[0.98]"
                  >
                    <span>Open & Continue</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Tool Action Buttons: Rename, Duplicate, Archive, Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRenamingPlan(plan);
                        setRenameInput(plan.name);
                      }}
                      title="Rename plan"
                      className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(plan.id)}
                      title="Duplicate this plan"
                      className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3] transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleArchive(plan.id)}
                      title={isArchived ? 'Restore from archive' : 'Archive event'}
                      className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3] transition-colors"
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
                      className="p-1.5 rounded-lg text-[#57534E] hover:text-[#B94D5A] hover:bg-[#FFF2EF] transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#EEDCD7] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EEDCD7]">
              <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                Rename Event Plan
              </h3>
              <button
                onClick={() => setRenamingPlan(null)}
                className="p-1 rounded-lg text-[#57534E] hover:bg-[#FDE8E3]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRename} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EEDCD7] bg-[#FCF8F7] text-xs text-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#FF6F61]"
                  placeholder="e.g., Ananya & Rohan Wedding Gala"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenamingPlan(null)}
                  className="px-4 py-2 rounded-xl border border-[#EEDCD7] bg-white text-xs font-semibold text-[#57534E] hover:bg-[#FDE8E3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameInput.trim()}
                  className="px-4 py-2 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] disabled:opacity-40 text-white text-xs font-bold transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1917]/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#EEDCD7] rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF2EF] border border-[#EEDCD7] text-[#B94D5A] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-editorial text-lg font-bold text-[#1C1917]">
                Delete Celebration Record?
              </h3>
              <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-[#1C1917]">&quot;{deletingPlan.name}&quot;</strong>? All associated budget items, milestones, vendor records, and risk scenarios will be removed from your studio storage.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEDCD7]">
              <button
                type="button"
                onClick={() => setDeletingPlan(null)}
                className="px-4 py-2 rounded-xl border border-[#EEDCD7] bg-white text-xs font-semibold text-[#57534E] hover:bg-[#FDE8E3]"
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
