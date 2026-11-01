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
import { generateId } from '../utils/validation';

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
  const summary = calculateBudgetSummary(plan.budget);
  const categories = getCategoryBreakdown(plan.budget);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState<string>('all');
  const [editingItem, setEditingItem] = React.useState<BudgetItem | null>(null);
  const [isAddingItem, setIsAddingItem] = React.useState(false);

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
    const unitMinor = Math.round(estMinor / (Math.max(1, formData.quantity)));

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

  const filteredItems = plan.budget.items.filter((item) => {
    if (selectedCategoryFilter === 'all') return true;
    return item.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F3EBDD] tracking-tight">
            Budget Planner & Expense Intelligence
          </h2>
          <p className="text-xs text-[#A5A3AD] mt-0.5">
            Integer minor-unit accuracy in {currency}. Edit line items, log actual bills, and manage contingency buffers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#15151D] text-[#C8A96E] hover:bg-[#1D1D27] border border-[#30303A] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#0B0B10]" /> Add Expense Item
          </button>
        </div>
      </div>

      {/* Contingency Reserve & Budget Overrun Alert */}
      {summary.isOverrun ? (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-[#15151D] border border-[#E47777]/50 text-[#F3EBDD] flex items-start gap-3 shadow-lg"
        >
          <AlertTriangle className="w-5 h-5 text-[#E47777] shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div>
              <p className="text-sm font-bold text-[#E47777]">
                Budget Overrun: {formatCurrency(summary.overrunAmountMinor, currency)} ({summary.overrunPercentage}%)
              </p>
              <p className="text-xs text-[#A5A3AD] mt-0.5">
                Total planned commitments ({formatCurrency(summary.totalCommittedSpendMinor, currency)}) exceed your budget of {formatCurrency(summary.totalBudgetMinor, currency)}.
              </p>
            </div>
            {plan.ideas.costSavingAlternatives.length > 0 && (
              <div className="pt-2 border-t border-[#30303A]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96E]">
                  Recommended Cost-Saving Alternatives:
                </p>
                <ul className="text-xs text-[#A5A3AD] list-disc list-inside mt-1 space-y-0.5">
                  {plan.ideas.costSavingAlternatives.slice(0, 3).map((alt, i) => (
                    <li key={i}>{alt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#15151D] border border-[#829879]/50 text-[#F3EBDD] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#829879] shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">
              Budget on track: <span className="text-[#829879]">{formatCurrency(summary.remainingEstimatedMinor, currency)}</span> unallocated buffer remaining (including {plan.budget.contingencyPercentage}% contingency reserve).
            </p>
          </div>
        </div>
      )}

      {/* Contingency Controller & Financial Health Bar */}
      <div className="p-5 rounded-2xl bg-[#15151D] border border-[#30303A] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#F3EBDD] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#C8A96E]" />
              Contingency Reserve Slider
            </h3>
            <p className="text-xs text-[#A5A3AD] mt-0.5">
              Editable safety buffer separated from planned expense line items.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-[#1D1D27] text-[#C8A96E] border border-[#30303A]">
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
              className="w-36 accent-[#C8A96E] cursor-pointer"
            />
          </div>
        </div>

        {/* Visual Allocation Stack: Champagne Gold + Muted Sage Green */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#A5A3AD] mb-1.5 font-mono">
            <span>Allocated: {formatCurrency(summary.totalEstimatedSpendMinor, currency)}</span>
            <span>Reserve: {formatCurrency(summary.contingencyReserveMinor, currency)}</span>
            <span>Total: {formatCurrency(summary.totalBudgetMinor, currency)}</span>
          </div>
          <div className="w-full bg-[#1D1D27] rounded-full h-3 overflow-hidden flex border border-[#30303A]">
            <div
              className="bg-[#C8A96E] h-full transition-all"
              style={{
                width: `${Math.min(100, (summary.totalEstimatedSpendMinor / (summary.totalBudgetMinor || 1)) * 100)}%`,
              }}
              title="Estimated Expenses (Champagne Gold)"
            />
            <div
              className="bg-[#829879] h-full transition-all"
              style={{
                width: `${Math.min(100, (summary.contingencyReserveMinor / (summary.totalBudgetMinor || 1)) * 100)}%`,
              }}
              title="Contingency Reserve (Muted Sage Green)"
            />
          </div>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategoryFilter === 'all'
              ? 'bg-[#C8A96E] text-[#0B0B10] font-bold shadow-xs'
              : 'bg-[#15151D] text-[#A5A3AD] hover:bg-[#1D1D27] hover:text-[#F3EBDD] border border-[#30303A]'
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
                ? 'bg-[#C8A96E] text-[#0B0B10] font-bold shadow-xs'
                : 'bg-[#15151D] text-[#A5A3AD] hover:bg-[#1D1D27] hover:text-[#F3EBDD] border border-[#30303A]'
            }`}
          >
            <span>{c.category}</span>
            <span className="text-[10px] opacity-75">({c.percentageOfBudget}%)</span>
          </button>
        ))}
      </div>

      {/* Line Items Table & Responsive Cards */}
      <div className="bg-[#15151D] rounded-3xl border border-[#30303A] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1D1D27] border-b border-[#30303A] text-[#A5A3AD] font-bold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-[#30303A]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#A5A3AD]">
                    No budget items found matching filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const estMajor = toMajorUnits(item.estimatedAmountMinor, currency);
                  const actMajor = toMajorUnits(item.actualAmountMinor, currency);

                  return (
                    <tr key={item.id} className="hover:bg-[#1D1D27]/60 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-bold text-[#F3EBDD]">{item.description}</p>
                        {item.notes && (
                          <p className="text-[11px] text-[#A5A3AD] mt-0.5 line-clamp-1">{item.notes}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-[#A5A3AD] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-[#1D1D27] border border-[#30303A] font-medium text-[#F3EBDD]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-[#A5A3AD] font-mono whitespace-nowrap">
                        {item.quantity} × {formatCurrency(item.unitCostMinor, currency)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#F3EBDD] tabular-nums whitespace-nowrap">
                        {formatCurrency(item.estimatedAmountMinor, currency)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                        {item.actualAmountMinor > 0 ? (
                          <span className="font-bold text-[#829879]">
                            {formatCurrency(item.actualAmountMinor, currency)}
                          </span>
                        ) : (
                          <span className="text-[#72707B]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.priority === 'critical'
                              ? 'bg-[rgba(228,119,119,0.15)] text-[#E47777] border border-[#E47777]/30'
                              : item.priority === 'high'
                              ? 'bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border border-[#E4B66A]/30'
                              : 'bg-[#1D1D27] text-[#829879] border border-[#30303A]'
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                            item.paymentStatus === 'paid_in_full'
                              ? 'bg-[rgba(130,152,121,0.15)] text-[#829879] border border-[#829879]/30'
                              : item.paymentStatus === 'deposit_paid'
                              ? 'bg-[rgba(200,169,110,0.15)] text-[#C8A96E] border border-[#C8A96E]/30'
                              : 'bg-[#1D1D27] text-[#A5A3AD] border border-[#30303A]'
                          }`}
                        >
                          {item.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {item.isAiEstimated ? (
                          <span
                            title="AI generated baseline estimate"
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-[#C8A96E] bg-[#1D1D27] px-2 py-0.5 rounded-md border border-[#30303A]"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-[#C8A96E]" /> AI Est.
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[#829879] bg-[rgba(130,152,121,0.15)] px-2 py-0.5 rounded-md border border-[#829879]/30">
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
                            className="p-1.5 rounded-lg text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#1D1D27]"
                            aria-label={`Edit ${item.description}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-[#A5A3AD] hover:text-[#E47777] hover:bg-[rgba(228,119,119,0.1)]"
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
      {isAddingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B10]/80 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-[#15151D] rounded-3xl p-6 shadow-2xl border border-[#30303A] space-y-4">
            <h3 className="text-base font-bold text-[#F3EBDD]">
              {editingItem ? 'Edit Budget Item' : 'Add New Budget Item'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Lawn Lighting Package, Welcome Gift Boxes"
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
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
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
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
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">
                    Estimated ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedAmountMajor}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedAmountMajor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm font-mono text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">
                    Actual Spent ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.actualAmountMajor}
                    onChange={(e) =>
                      setFormData({ ...formData, actualAmountMajor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm font-mono text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Payment Status</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as PaymentStatus })}
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                >
                  <option value="unpaid">Unpaid / Budgeted Only</option>
                  <option value="deposit_paid">Deposit Paid (50%)</option>
                  <option value="paid_in_full">Paid in Full (100%)</option>
                  <option value="waived">Waived / Sponsored</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Terms, vendor contact, invoice numbers..."
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30303A]">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsAddingItem(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-semibold text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#252533]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                disabled={!formData.description.trim()}
                className="px-5 py-2 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 text-[#0B0B10] text-xs font-bold shadow-xs"
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
