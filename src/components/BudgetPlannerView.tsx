import React from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { EventPlan, BudgetItem, PriorityLevel, PaymentStatus } from '../types/event';
import {
  calculateBudgetSummary,
  getCategoryBreakdown,
  formatCurrency,
  toMajorUnits,
  toMinorUnits,
} from '../utils/currency';
import { generateId, toPriorityLevel, toPaymentStatus } from '../utils/validation';
import { useFocusTrap } from '../utils/useFocusTrap';

interface BudgetPlannerViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenRegenerate: () => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  plan,
  onUpdatePlan,
  onOpenRegenerate,
}) => {
  const currency = plan.budget.currency || 'INR';
  const summary = React.useMemo(() => calculateBudgetSummary(plan.budget), [plan.budget]);
  const categories = React.useMemo(() => getCategoryBreakdown(plan.budget), [plan.budget]);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>('all');
  const [editingItem, setEditingItem] = React.useState<BudgetItem | null>(null);
  const [isAddingItem, setIsAddingItem] = React.useState(false);
  const trapRef = useFocusTrap(isAddingItem, () => {
    setIsAddingItem(false);
    setEditingItem(null);
  });

  // Form state for add/edit modal
  const [formData, setFormData] = React.useState<{
    category: string;
    description: string;
    estimatedAmountMajor: number;
    actualAmountMajor: number;
    quantity: number;
    priority: PriorityLevel;
    paymentStatus: PaymentStatus;
    notes: string;
  }>({
    category: 'Venue',
    description: '',
    estimatedAmountMajor: 50000,
    actualAmountMajor: 0,
    quantity: 1,
    priority: 'medium',
    paymentStatus: 'unpaid',
    notes: '',
  });

  const handleSaveItem = () => {
    if (!formData.description.trim()) return;

    const estMinor = toMinorUnits(formData.estimatedAmountMajor, currency);
    const actMinor = toMinorUnits(formData.actualAmountMajor, currency);
    const unitMinor = Math.round(estMinor / Math.max(1, formData.quantity));

    let updatedItems = [...plan.budget.items];

    if (editingItem) {
      updatedItems = updatedItems.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              category: formData.category,
              description: formData.description,
              estimatedAmountMinor: estMinor,
              actualAmountMinor: actMinor,
              quantity: formData.quantity,
              unitCostMinor: unitMinor,
              priority: formData.priority,
              paymentStatus: formData.paymentStatus,
              notes: formData.notes,
              isAiEstimated: false,
            }
          : item
      );
    } else {
      const newItem: BudgetItem = {
        id: generateId('bgt_usr'),
        category: formData.category,
        description: formData.description,
        estimatedAmountMinor: estMinor,
        actualAmountMinor: actMinor,
        quantity: formData.quantity,
        unitCostMinor: unitMinor,
        priority: formData.priority,
        paymentStatus: formData.paymentStatus,
        notes: formData.notes,
        isAiEstimated: false,
      };
      updatedItems.push(newItem);
    }

    onUpdatePlan({
      ...plan,
      budget: {
        ...plan.budget,
        items: updatedItems,
      },
    });

    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id: string) => {
    const updated = plan.budget.items.filter((i) => i.id !== id);
    onUpdatePlan({
      ...plan,
      budget: {
        ...plan.budget,
        items: updated,
      },
    });
  };

  const handleContingencyChange = (percentage: number) => {
    const clamped = Math.max(0, Math.min(30, percentage));
    const reserve = Math.round((plan.budget.totalBudgetMinor * clamped) / 100);
    onUpdatePlan({
      ...plan,
      budget: {
        ...plan.budget,
        contingencyPercentage: clamped,
        contingencyReserveMinor: reserve,
      },
    });
  };

  const filteredItems = React.useMemo(() => {
    return plan.budget.items.filter((item) => {
      if (selectedCategoryFilter === 'all') return true;
      return item.category === selectedCategoryFilter;
    });
  }, [plan.budget.items, selectedCategoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADCE1]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Financial Management
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#392832] tracking-tight mt-0.5">
            Budget Planner & Expense Ledger
          </h2>
          <p className="text-sm text-[#74616B] mt-0.5">
            Precision calculations in {currency}. Edit line items, log actual vendor receipts, and maintain your contingency reserve.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white text-[#B85F80] hover:bg-[#FFF0F3] border border-[#EADCE1] transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B85F80]" />
            <span>AI Re-balance</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setFormData({
                category: 'Venue',
                description: '',
                estimatedAmountMajor: 25000,
                actualAmountMajor: 0,
                quantity: 1,
                priority: 'medium',
                paymentStatus: 'unpaid',
                notes: '',
              });
              setIsAddingItem(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white shadow-xs transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white" /> Add Expense Item
          </button>
        </div>
      </div>

      {/* Contingency Reserve & Budget Overrun Alert */}
      {summary.isOverrun ? (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#B94D5A]/50 text-[#392832] flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-[#B94D5A] shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div>
              <p className="text-sm font-bold text-[#B94D5A]">
                Budget Overrun: {formatCurrency(summary.overrunAmountMinor, currency)} ({summary.overrunPercentage.toFixed(1)}%)
              </p>
              <p className="text-xs text-[#74616B] mt-0.5">
                Total planned commitments ({formatCurrency(summary.totalCommittedSpendMinor, currency)}) exceed your budget of {formatCurrency(summary.totalBudgetMinor, currency)}.
              </p>
            </div>
            {plan.ideas.costSavingAlternatives.length > 0 && (
              <div className="pt-2 border-t border-[#EADCE1]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#B89555]">
                  Recommended Cost-Saving Alternatives:
                </p>
                <ul className="text-xs text-[#74616B] list-disc list-inside mt-1 space-y-0.5">
                  {plan.ideas.costSavingAlternatives.slice(0, 3).map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-emerald-200 text-[#392832] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#477D60] shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              Budget on track: <span className="text-[#477D60]">{formatCurrency(summary.remainingEstimatedMinor, currency)}</span> unallocated buffer remaining (including {plan.budget.contingencyPercentage}% contingency reserve).
            </p>
          </div>
        </div>
      )}

      {/* Contingency Controller & Financial Health Bar */}
      <div className="p-5 rounded-2xl bg-white border border-[#EADCE1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-editorial text-base font-bold text-[#392832] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#B89555]" />
              Contingency Reserve Slider
            </h3>
            <p className="text-xs text-[#74616B] mt-0.5">
              Dedicated emergency reserve fund separated from active operational line items.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#FFF8ED] text-[#B89555] border border-[#EADCE1]">
              {plan.budget.contingencyPercentage}% = {formatCurrency(summary.contingencyReserveMinor, currency)}
            </span>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={plan.budget.contingencyPercentage}
              onChange={(e) => handleContingencyChange(Number(e.target.value))}
              aria-label="Contingency percentage slider"
              className="w-36 accent-[#B85F80] cursor-pointer"
            />
          </div>
        </div>

        {/* Visual Allocation Stack: Rose + Gold */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#74616B] mb-1.5 font-mono">
            <span>Allocated: {formatCurrency(summary.totalEstimatedSpendMinor, currency)}</span>
            <span>Reserve: {formatCurrency(summary.contingencyReserveMinor, currency)}</span>
            <span>Total: {formatCurrency(summary.totalBudgetMinor, currency)}</span>
          </div>
          <div className="w-full bg-[#F5E9ED] rounded-full h-3 overflow-hidden flex border border-[#EADCE1]">
            <div
              className="bg-[#B85F80] h-full transition-all"
              style={{
                width: `${Math.min(100, (summary.totalEstimatedSpendMinor / (summary.totalBudgetMinor || 1)) * 100)}%`,
              }}
              title="Estimated Expenses (Rose)"
            />
            <div
              className="bg-[#B89555] h-full transition-all"
              style={{
                width: `${Math.min(100, (summary.contingencyReserveMinor / (summary.totalBudgetMinor || 1)) * 100)}%`,
              }}
              title="Contingency Reserve (Gold)"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategoryFilter === 'all'
              ? 'bg-[#B85F80] text-white font-bold shadow-xs'
              : 'bg-white text-[#74616B] hover:bg-[#F8E1E8] hover:text-[#392832] border border-[#EADCE1]'
          }`}
        >
          All Categories ({plan.budget.items.length})
        </button>
        {categories.map((c) => (
          <button
            key={c.category}
            onClick={() => setSelectedCategoryFilter(c.category)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              selectedCategoryFilter === c.category
                ? 'bg-[#B85F80] text-white font-bold shadow-xs'
                : 'bg-white text-[#74616B] hover:bg-[#F8E1E8] hover:text-[#392832] border border-[#EADCE1]'
            }`}
          >
            <span>{c.category}</span>
            <span className="text-[10px] opacity-75">({c.percentageOfBudget}%)</span>
          </button>
        ))}
      </div>

      {/* Line Items Table */}
      <div className="bg-white rounded-3xl border border-[#EADCE1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FBF5F6] border-b border-[#EADCE1] text-[#74616B] font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Item & Description</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Qty & Unit Cost</th>
                <th className="py-3.5 px-3 text-right">Estimated</th>
                <th className="py-3.5 px-3 text-right">Actual Spend</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Payment</th>
                <th className="py-3.5 px-3 text-center">Source</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADCE1]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#74616B]">
                    No budget items found matching filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const estMajor = toMajorUnits(item.estimatedAmountMinor, currency);
                  const actMajor = toMajorUnits(item.actualAmountMinor, currency);

                  return (
                    <tr key={item.id} className="hover:bg-[#FFF0F3]/50 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-[#392832]">{item.description}</p>
                        {item.notes && (
                          <p className="text-[11px] text-[#74616B] mt-0.5 line-clamp-1">{item.notes}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-[#74616B] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#FBF5F6] border border-[#EADCE1] font-medium text-[#392832]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#74616B] font-mono whitespace-nowrap">
                        {item.quantity} × {formatCurrency(item.unitCostMinor, currency)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#392832] tabular-nums whitespace-nowrap">
                        {formatCurrency(item.estimatedAmountMinor, currency)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {item.actualAmountMinor > 0 ? (
                          <span className="font-bold text-[#477D60]">
                            {formatCurrency(item.actualAmountMinor, currency)}
                          </span>
                        ) : (
                          <span className="text-[#998791]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.priority === 'critical'
                              ? 'bg-[#FFF0F3] text-[#B94D5A] border border-[#B94D5A]/30'
                              : item.priority === 'high'
                              ? 'bg-[#FFF8ED] text-[#A87531] border border-[#A87531]/30'
                              : 'bg-[#FBF5F6] text-[#74616B] border border-[#EADCE1]'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                            item.paymentStatus === 'paid_in_full'
                              ? 'bg-[#F0F7F4] text-[#477D60] border border-emerald-200'
                              : item.paymentStatus === 'deposit_paid'
                              ? 'bg-[#FFF8ED] text-[#B89555] border border-[#EADCE1]'
                              : 'bg-[#FBF5F6] text-[#74616B] border border-[#EADCE1]'
                          }`}
                        >
                          {item.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {item.isAiEstimated ? (
                          <span
                            title="AI generated baseline estimate"
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-[#B85F80] bg-[#FFF0F3] px-2 py-0.5 rounded-md border border-[#E9B9C9]"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#B85F80]" /> AI Est.
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[#477D60] bg-[#F0F7F4] px-2 py-0.5 rounded-md border border-emerald-200">
                            Confirmed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setFormData({
                                category: item.category,
                                description: item.description,
                                estimatedAmountMajor: estMajor,
                                actualAmountMajor: actMajor,
                                quantity: item.quantity,
                                priority: item.priority,
                                paymentStatus: item.paymentStatus,
                                notes: item.notes || '',
                              });
                              setIsAddingItem(true);
                            }}
                            className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
                            aria-label={`Edit ${item.description}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-[#74616B] hover:text-[#B94D5A] hover:bg-[#FFF0F3]"
                            aria-label={`Delete ${item.description}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {/* Add / Edit Modal */}
      {isAddingItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="budget-item-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs"
        >
          <div
            ref={trapRef}
            className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EADCE1] space-y-4"
          >
            <h3 id="budget-item-modal-title" className="font-editorial text-base font-bold text-[#392832]">
              {editingItem ? 'Edit Budget Item' : 'Add New Budget Item'}
            </h3>

            <div className="space-y-3">
              <div>
                <label htmlFor="bgt-desc-input" className="block text-xs font-bold text-[#74616B] mb-1">Description *</label>
                <input
                  id="bgt-desc-input"
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Lawn Lighting Package, Welcome Gift Boxes"
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bgt-category-select" className="block text-xs font-bold text-[#74616B] mb-1">Category</label>
                  <select
                    id="bgt-category-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor & Styling">Decor & Styling</option>
                    <option value="Photography & Video">Photography & Video</option>
                    <option value="Entertainment & Sound">Entertainment & Sound</option>
                    <option value="Invitations & Marketing">Invitations & Marketing</option>
                    <option value="Attire & Makeup">Attire & Makeup</option>
                    <option value="Logistics & Permissions">Logistics & Permissions</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="bgt-priority-select" className="block text-xs font-bold text-[#74616B] mb-1">Priority</label>
                  <select
                    id="bgt-priority-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: toPriorityLevel(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="nice_to_have">Nice to have</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="bgt-est-input" className="block text-xs font-bold text-[#74616B] mb-1">
                    Estimated ({currency})
                  </label>
                  <input
                    id="bgt-est-input"
                    type="number"
                    min="0"
                    value={formData.estimatedAmountMajor}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedAmountMajor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm font-mono text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                </div>

                <div>
                  <label htmlFor="bgt-act-input" className="block text-xs font-bold text-[#74616B] mb-1">
                    Actual Spent ({currency})
                  </label>
                  <input
                    id="bgt-act-input"
                    type="number"
                    min="0"
                    value={formData.actualAmountMajor}
                    onChange={(e) =>
                      setFormData({ ...formData, actualAmountMajor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm font-mono text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                </div>

                <div>
                  <label htmlFor="bgt-qty-input" className="block text-xs font-bold text-[#74616B] mb-1">Quantity</label>
                  <input
                    id="bgt-qty-input"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bgt-status-select" className="block text-xs font-bold text-[#74616B] mb-1">Payment Status</label>
                <select
                  id="bgt-status-select"
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: toPaymentStatus(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                >
                  <option value="unpaid">Unpaid / Budgeted Only</option>
                  <option value="deposit_paid">Deposit Paid (50%)</option>
                  <option value="paid_in_full">Paid in Full (100%)</option>
                  <option value="waived">Waived / Sponsored</option>
                </select>
              </div>

              <div>
                <label htmlFor="bgt-notes-input" className="block text-xs font-bold text-[#74616B] mb-1">Notes</label>
                <textarea
                  id="bgt-notes-input"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Terms, vendor contact, invoice numbers..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADCE1]">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingItem(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                disabled={!formData.description.trim()}
                className="px-5 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] disabled:opacity-40 text-white text-xs font-bold shadow-xs active:scale-[0.98]"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
