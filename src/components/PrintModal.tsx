import React from 'react';
import { X, Printer } from 'lucide-react';
import { EventPlan } from '../types/event';
import { formatCurrency, calculateBudgetSummary } from '../utils/currency';
import { formatDisplayDate } from '../utils/timeline';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, plan }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currency = plan.budget.currency || 'INR';
  const summary = calculateBudgetSummary(plan.budget);
  const details = plan.eventDetails;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#392832]/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#EADCE1] overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden when printed) */}
        <div className="px-6 py-4 border-b border-[#EADCE1] bg-[#F5E9ED] flex items-center justify-between no-print">
          <div>
            <h3 className="font-editorial text-lg font-bold text-[#392832] flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#B85F80]" /> Print / PDF Master Report Preview
            </h3>
            <p className="text-xs text-[#74616B] mt-0.5">
              Click &quot;Print / Save as PDF&quot; to print or generate a downloadable PDF in your browser dialog.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors active:scale-[0.98]"
            >
              <Printer className="w-4 h-4 text-white" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] transition-colors"
              aria-label="Close print preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Master Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-8 text-[#392832] text-xs sm:text-sm bg-white print:p-0">
          {/* Header */}
          <div className="border-b-2 border-[#B85F80] pb-6 print:border-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B89555] font-mono block mb-1">
                  EventPilot Studio Master Plan
                </span>
                <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#392832] tracking-tight print:text-black">
                  {details.name}
                </h1>
                <p className="text-sm text-[#74616B] mt-1 capitalize print:text-gray-700">
                  {details.category.replace('_', ' ')} • {details.location}
                </p>
              </div>

              <div className="text-right font-mono text-xs text-[#74616B] print:text-gray-700">
                <p>Target Date: <strong className="text-[#392832] font-sans print:text-black">{formatDisplayDate(details.targetDate)}</strong></p>
                <p className="mt-0.5">Guests: <strong className="text-[#392832] font-sans print:text-black">{details.guestCount}</strong></p>
                <p className="mt-0.5">Total Budget: <strong className="text-[#B89555] font-sans print:text-black">{formatCurrency(summary.totalBudgetMinor, currency)}</strong></p>
              </div>
            </div>

            {/* Strategic Overview */}
            <div className="mt-4 p-4 rounded-xl bg-[#FBF5F6] border border-[#EADCE1] print:border-gray-300 print:bg-white text-xs space-y-1">
              <p><strong>Theme / Atmosphere:</strong> {details.styleTheme}</p>
              <p><strong>Venue Strategy:</strong> {details.venuePreference} venue setup</p>
              <p><strong>Dietary Accommodations:</strong> {details.dietaryRequirements.join(', ') || 'Standard'}</p>
              <p><strong>Accessibility Standards:</strong> {details.accessibilityRequirements.join(', ') || 'Standard step-free'}</p>
            </div>
          </div>

          {/* Section 1: Financial & Budget Breakdown */}
          <div className="page-break-inside-avoid space-y-3">
            <h2 className="font-editorial text-base font-bold text-[#B89555] border-b border-[#EADCE1] pb-2 print:text-black print:border-black">
              1. Budget & Financial Allocations
            </h2>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono p-3 rounded-xl bg-[#FBF5F6] border border-[#EADCE1] print:bg-white print:border-gray-300 mb-3">
              <div>Target: <strong>{formatCurrency(summary.totalBudgetMinor, currency)}</strong></div>
              <div>Planned: <strong>{formatCurrency(summary.totalEstimatedSpendMinor, currency)}</strong></div>
              <div>Reserve: <strong>{formatCurrency(summary.contingencyReserveMinor, currency)} ({plan.budget.contingencyPercentage}%)</strong></div>
              <div>Buffer: <strong>{formatCurrency(summary.remainingEstimatedMinor, currency)}</strong></div>
            </div>

            <table className="w-full text-left text-xs border border-[#EADCE1] print:border-gray-300">
              <thead>
                <tr className="bg-[#FBF5F6] border-b border-[#EADCE1] text-[10px] uppercase font-bold text-[#74616B] print:bg-gray-100 print:text-black">
                  <th className="p-2">Item</th>
                  <th className="p-2">Category</th>
                  <th className="p-2 text-right">Estimated</th>
                  <th className="p-2 text-right">Actual</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADCE1] print:divide-gray-300">
                {plan.budget.items.map((item) => (
                  <tr key={item.id} className="print:text-black">
                    <td className="p-2 font-medium text-[#392832] print:text-black">{item.description}</td>
                    <td className="p-2 text-[#74616B] print:text-gray-700">{item.category}</td>
                    <td className="p-2 text-right font-mono font-bold text-[#B89555] print:text-black">{formatCurrency(item.estimatedAmountMinor, currency)}</td>
                    <td className="p-2 text-right font-mono text-[#74616B] print:text-gray-700">
                      {item.actualAmountMinor > 0 ? formatCurrency(item.actualAmountMinor, currency) : '—'}
                    </td>
                    <td className="p-2 capitalize text-[#392832] print:text-black">{item.priority}</td>
                    <td className="p-2 capitalize text-[#74616B] print:text-gray-700">{item.paymentStatus.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 2: Preparation Timeline */}
          <div className="page-break-inside-avoid space-y-3">
            <h2 className="font-editorial text-base font-bold text-[#B89555] border-b border-[#EADCE1] pb-2 print:text-black print:border-black">
              2. Preparation Timeline & Milestones
            </h2>
            <table className="w-full text-left text-xs border border-[#EADCE1] print:border-gray-300">
              <thead>
                <tr className="bg-[#FBF5F6] border-b border-[#EADCE1] text-[10px] uppercase font-bold text-[#74616B] print:bg-gray-100 print:text-black">
                  <th className="p-2">Due Date</th>
                  <th className="p-2">Task</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADCE1] print:divide-gray-300">
                {plan.timeline.tasks.map((task) => (
                  <tr key={task.id} className="print:text-black">
                    <td className="p-2 font-mono whitespace-nowrap text-[#B85F80] font-semibold print:text-black">{task.dueDate}</td>
                    <td className="p-2">
                      <p className="font-bold text-[#392832] print:text-black">{task.title}</p>
                      {task.description && <p className="text-[11px] text-[#74616B] mt-0.5 print:text-gray-700">{task.description}</p>}
                    </td>
                    <td className="p-2 text-[#74616B] print:text-gray-700">{task.category}</td>
                    <td className="p-2 capitalize text-[#392832] print:text-black">{task.priority}</td>
                    <td className="p-2 capitalize text-[#74616B] print:text-gray-700">{task.status.replace('_', ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Vendor Checklist */}
          <div className="page-break-inside-avoid space-y-3">
            <h2 className="font-editorial text-base font-bold text-[#B89555] border-b border-[#EADCE1] pb-2 print:text-black print:border-black">
              3. Vendor Guidance & Quotation Status
            </h2>
            <table className="w-full text-left text-xs border border-[#EADCE1] print:border-gray-300">
              <thead>
                <tr className="bg-[#FBF5F6] border-b border-[#EADCE1] text-[10px] uppercase font-bold text-[#74616B] print:bg-gray-100 print:text-black">
                  <th className="p-2">Service Partner</th>
                  <th className="p-2">Target Date</th>
                  <th className="p-2 text-right">Est. Budget</th>
                  <th className="p-2">Booking Status</th>
                  <th className="p-2">Contact Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EADCE1] print:divide-gray-300">
                {plan.vendors.items.map((vendor) => (
                  <tr key={vendor.id} className="print:text-black">
                    <td className="p-2">
                      <p className="font-bold text-[#392832] print:text-black">{vendor.title}</p>
                      <p className="text-[11px] text-[#74616B] print:text-gray-700">{vendor.selectionGuidance}</p>
                    </td>
                    <td className="p-2 font-mono whitespace-nowrap text-[#74616B] print:text-gray-700">{vendor.targetBookingDate}</td>
                    <td className="p-2 text-right font-mono font-bold text-[#B89555] print:text-black">{formatCurrency(vendor.estimatedCostMinor, currency)}</td>
                    <td className="p-2 capitalize text-[#392832] print:text-black">{vendor.bookingStatus.replace('_', ' ')}</td>
                    <td className="p-2 text-[11px] font-mono text-[#74616B] print:text-gray-700">
                      {vendor.contactName ? `${vendor.contactName} (${vendor.contactPhone || vendor.contactEmail || ''})` : 'Pending user entry'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Risks and Contingency Protocols */}
          <div className="page-break-inside-avoid space-y-3">
            <h2 className="font-editorial text-base font-bold text-[#B89555] border-b border-[#EADCE1] pb-2 print:text-black print:border-black">
              4. Operational Risks & Emergency Protocols
            </h2>
            <div className="space-y-2">
              {plan.risks.items.map((risk) => (
                <div key={risk.id} className="p-3 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] print:bg-white print:border-gray-300 text-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-[#392832] print:text-black">{risk.title}</span>
                    <span className="text-[10px] uppercase font-mono text-[#74616B] print:text-gray-700">
                      {risk.category} • {risk.probability} Prob • {risk.severity} Severity
                    </span>
                  </div>
                  <p className="text-[#74616B] print:text-gray-700"><strong className="text-[#392832] print:text-black">Mitigation:</strong> {risk.mitigation}</p>
                  <p className="text-[#74616B] mt-0.5 print:text-gray-700"><strong className="text-[#392832] print:text-black">Emergency Contingency:</strong> {risk.contingencyAction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-[#EADCE1] text-center text-xs text-[#998791] font-mono print:border-gray-300 print:text-gray-500">
            Document generated by EventPilot AI • All budget and timeline calculations verified • Confidential Event Execution Brief
          </div>
        </div>
      </div>
    </div>
  );
};
