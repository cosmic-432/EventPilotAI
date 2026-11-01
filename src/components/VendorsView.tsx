import React from 'react';
import {
  Phone,
  Mail,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Info,
} from 'lucide-react';
import { EventPlan, VendorItem, BookingStatus } from '../types/event';
import { formatCurrency, toMajorUnits, toMinorUnits } from '../utils/currency';
import { formatDisplayDate } from '../utils/timeline';
import { generateId } from '../utils/validation';

interface VendorsViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenRegenerate: () => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  plan,
  onUpdatePlan,
  onOpenRegenerate,
}) => {
  const currency = plan.budget.currency || 'INR';

  const [editingVendor, setEditingVendor] = React.useState<VendorItem | null>(null);
  const [isAddingVendor, setIsAddingVendor] = React.useState(false);

  const [formData, setFormData] = React.useState<{
    title: string;
    category: string;
    selectionGuidance: string;
    estimatedCostMajor: number;
    targetBookingDate: string;
    bookingStatus: BookingStatus;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    notes: string;
  }>({
    title: '',
    category: 'Catering',
    selectionGuidance: '',
    estimatedCostMajor: 50000,
    targetBookingDate: plan.eventDetails.targetDate,
    bookingStatus: 'not_started',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    notes: '',
  });

  const handleStatusChange = (vendorId: string, status: BookingStatus) => {
    const updated = plan.vendors.items.map((v) =>
      v.id === vendorId ? { ...v, bookingStatus: status } : v
    );
    onUpdatePlan({
      ...plan,
      vendors: { items: updated },
    });
  };

  const handleSaveVendor = () => {
    if (!formData.title.trim()) return;

    const estCostMinor = toMinorUnits(formData.estimatedCostMajor, currency);
    let updated = [...plan.vendors.items];

    if (editingVendor) {
      updated = updated.map((v) =>
        v.id === editingVendor.id
          ? {
              ...v,
              title: formData.title,
              category: formData.category,
              selectionGuidance: formData.selectionGuidance,
              estimatedCostMinor: estCostMinor,
              targetBookingDate: formData.targetBookingDate,
              bookingStatus: formData.bookingStatus,
              contactName: formData.contactName,
              contactPhone: formData.contactPhone,
              contactEmail: formData.contactEmail,
              notes: formData.notes,
            }
          : v
      );
    } else {
      const newVendor: VendorItem = {
        id: generateId('vnd_usr'),
        title: formData.title,
        category: formData.category,
        selectionGuidance: formData.selectionGuidance || 'Self-sourced service partner.',
        estimatedCostMinor: estCostMinor,
        targetBookingDate: formData.targetBookingDate,
        bookingStatus: formData.bookingStatus,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        notes: formData.notes,
        selectionCriteria: ['Verify business portfolio & reviews', 'Request transparent written quote'],
      };
      updated.push(newVendor);
    }

    onUpdatePlan({
      ...plan,
      vendors: { items: updated },
    });

    setEditingVendor(null);
    setIsAddingVendor(false);
  };

  const handleDeleteVendor = (vendorId: string) => {
    const updated = plan.vendors.items.filter((v) => v.id !== vendorId);
    onUpdatePlan({
      ...plan,
      vendors: { items: updated },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F3EBDD] tracking-tight">
            Vendor Sourcing Checklist & Quotation Tracker
          </h2>
          <p className="text-xs text-[#A5A3AD] mt-0.5">
            Track quotations, interviews, and contact info for every service category.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#15151D] text-[#C8A96E] hover:bg-[#1D1D27] border border-[#30303A] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
            <span>AI Criteria Refresh</span>
          </button>

          <button
            onClick={() => {
              setEditingVendor(null);
              setFormData({
                title: '',
                category: 'Catering',
                selectionGuidance: '',
                estimatedCostMajor: 50000,
                targetBookingDate: plan.eventDetails.targetDate,
                bookingStatus: 'not_started',
                contactName: '',
                contactPhone: '',
                contactEmail: '',
                notes: '',
              });
              setIsAddingVendor(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#0B0B10]" /> Add Vendor Partner
          </button>
        </div>
      </div>

      {/* Honest AI Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#15151D] border border-[#30303A] text-[#A5A3AD] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#C8A96E] mt-0.5 shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-[#F3EBDD]">
            Vendor Guidance Notice:
          </p>
          <p className="leading-relaxed text-[#A5A3AD]">
            AI-generated recommendations provide professional selection criteria, negotiation tips, and cost benchmarks based on your event scale. They are not paid advertisements or verified listings. You can record your actual contracted vendors and contacts below.
          </p>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plan.vendors.items.map((vendor) => {
          const estMajor = toMajorUnits(vendor.estimatedCostMinor, currency);

          return (
            <div
              key={vendor.id}
              className="p-5 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs hover:border-[#C8A96E]/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96E] block mb-0.5">
                      {vendor.category}
                    </span>
                    <h3 className="text-base font-bold text-[#F3EBDD]">{vendor.title}</h3>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={vendor.bookingStatus}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as BookingStatus)}
                    aria-label={`Booking status for ${vendor.title}`}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-[#C8A96E] capitalize ${
                      vendor.bookingStatus === 'confirmed'
                        ? 'bg-[rgba(130,152,121,0.15)] text-[#829879] border-[#829879]/30'
                        : vendor.bookingStatus === 'quotation_received'
                        ? 'bg-[rgba(200,169,110,0.15)] text-[#C8A96E] border-[#C8A96E]/30'
                        : vendor.bookingStatus === 'negotiating'
                        ? 'bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border-[#E4B66A]/30'
                        : vendor.bookingStatus === 'cancelled'
                        ? 'bg-[rgba(228,119,119,0.15)] text-[#E47777] border-[#E47777]/30'
                        : 'bg-[#1D1D27] text-[#A5A3AD] border-[#30303A]'
                    }`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="contacted">Contacted</option>
                    <option value="quotation_received">Quote Received</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Target Date & Cost Benchmark */}
                <div className="flex items-center gap-4 text-xs text-[#A5A3AD] mb-3 font-mono">
                  <span>💰 Est: <strong className="text-[#C8A96E] font-bold">{formatCurrency(vendor.estimatedCostMinor, currency)}</strong></span>
                  <span>📅 Target Lock: <strong className="text-[#F3EBDD] font-bold">{formatDisplayDate(vendor.targetBookingDate)}</strong></span>
                </div>

                {/* Selection Guidance */}
                <p className="text-xs text-[#F3EBDD] leading-relaxed bg-[#1D1D27] p-3 rounded-xl border border-[#30303A] mb-3">
                  💡 {vendor.selectionGuidance}
                </p>

                {/* Selection Criteria Checklist */}
                {vendor.selectionCriteria && vendor.selectionCriteria.length > 0 && (
                  <div className="mb-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#A5A3AD]">
                      Vetting Criteria:
                    </p>
                    <ul className="text-xs text-[#A5A3AD] space-y-1">
                      {vendor.selectionCriteria.map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#829879] mt-0.5 shrink-0" />
                          <span className="text-[#F3EBDD]">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contact Information (if entered by user) */}
                {(vendor.contactName || vendor.contactPhone || vendor.contactEmail) && (
                  <div className="p-2.5 rounded-xl bg-[#1D1D27] border border-[#30303A] text-xs text-[#F3EBDD] space-y-1 mb-2">
                    <span className="text-[10px] font-bold uppercase text-[#C8A96E] block">
                      Contracted Contact Info:
                    </span>
                    {vendor.contactName && <p className="font-semibold text-[#F3EBDD]">{vendor.contactName}</p>}
                    <div className="flex flex-wrap items-center gap-3 text-[#A5A3AD]">
                      {vendor.contactPhone && (
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3 h-3 text-[#C8A96E]" /> {vendor.contactPhone}
                        </span>
                      )}
                      {vendor.contactEmail && (
                        <span className="flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-[#C8A96E]" /> {vendor.contactEmail}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {vendor.notes && (
                  <p className="text-[11px] text-[#72707B] italic mt-1">
                    Notes: {vendor.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30303A] mt-3">
                <button
                  onClick={() => {
                    setEditingVendor(vendor);
                    setFormData({
                      title: vendor.title,
                      category: vendor.category,
                      selectionGuidance: vendor.selectionGuidance,
                      estimatedCostMajor: estMajor,
                      targetBookingDate: vendor.targetBookingDate,
                      bookingStatus: vendor.bookingStatus,
                      contactName: vendor.contactName || '',
                      contactPhone: vendor.contactPhone || '',
                      contactEmail: vendor.contactEmail || '',
                      notes: vendor.notes || '',
                    });
                    setIsAddingVendor(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#30303A] bg-[#1D1D27] hover:bg-[#252533] text-xs font-medium text-[#F3EBDD] flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#C8A96E]" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="p-1.5 rounded-lg text-[#A5A3AD] hover:text-[#E47777] hover:bg-[rgba(228,119,119,0.1)] transition-colors"
                  aria-label={`Delete ${vendor.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isAddingVendor && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B10]/80 backdrop-blur-xs overflow-y-auto"
        >
          <div className="w-full max-w-lg bg-[#15151D] rounded-3xl p-6 shadow-2xl border border-[#30303A] space-y-4 my-8">
            <h3 className="text-base font-bold text-[#F3EBDD]">
              {editingVendor ? 'Edit Vendor Partner' : 'Add New Vendor Partner'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Service / Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Traditional Dhol Tasha Troupe, Marquee Pavilion setup"
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Booking Status</label>
                  <select
                    value={formData.bookingStatus}
                    onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value as BookingStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="contacted">Contacted</option>
                    <option value="quotation_received">Quote Received</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">
                    Estimated Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedCostMajor}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedCostMajor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm font-mono text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Target Lock Date</label>
                  <input
                    type="date"
                    value={formData.targetBookingDate}
                    onChange={(e) => setFormData({ ...formData, targetBookingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Selection Guidance</label>
                <textarea
                  rows={2}
                  value={formData.selectionGuidance}
                  onChange={(e) => setFormData({ ...formData, selectionGuidance: e.target.value })}
                  placeholder="Key considerations, vetting notes, or portfolio checklist..."
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[#30303A]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#C8A96E] mb-2">
                  Direct Contact Information (Optional)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Contact Name"
                    className="px-2.5 py-1.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="Phone Number"
                    className="px-2.5 py-1.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-mono text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="Email Address"
                    className="px-2.5 py-1.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-mono text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30303A]">
              <button
                type="button"
                onClick={() => {
                  setEditingVendor(null);
                  setIsAddingVendor(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-semibold text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#252533]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVendor}
                disabled={!formData.title.trim()}
                className="px-5 py-2 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 text-[#0B0B10] text-xs font-bold shadow-xs"
              >
                Save Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
