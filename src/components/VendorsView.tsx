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

    const costMinor = toMinorUnits(formData.estimatedCostMajor, currency);
    let updated = [...plan.vendors.items];

    if (editingVendor) {
      updated = updated.map((v) =>
        v.id === editingVendor.id
          ? {
              ...v,
              title: formData.title,
              category: formData.category,
              selectionGuidance: formData.selectionGuidance,
              estimatedCostMinor: costMinor,
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
      const newV: VendorItem = {
        id: generateId('vnd_usr'),
        title: formData.title,
        category: formData.category,
        selectionGuidance: formData.selectionGuidance,
        estimatedCostMinor: costMinor,
        targetBookingDate: formData.targetBookingDate,
        bookingStatus: formData.bookingStatus,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        notes: formData.notes,
        selectionCriteria: [],
      };
      updated.push(newV);
    }

    onUpdatePlan({
      ...plan,
      vendors: { items: updated },
    });

    setEditingVendor(null);
    setIsAddingVendor(false);
  };

  const handleDeleteVendor = (id: string) => {
    const updated = plan.vendors.items.filter((v) => v.id !== id);
    onUpdatePlan({
      ...plan,
      vendors: { items: updated },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADCE1]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Partner Directory
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#392832] tracking-tight mt-0.5">
            Vendor Guidance & Quotation Tracker
          </h2>
          <p className="text-sm text-[#74616B] mt-0.5">
            AI-recommended partner selection criteria, contract lock dates, and communication phonebook.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRegenerate}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white text-[#B85F80] hover:bg-[#FFF0F3] border border-[#EADCE1] transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B85F80]" />
            <span>AI Refresh Criteria</span>
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
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white shadow-xs transition-colors active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white" /> Add Service Partner
          </button>
        </div>
      </div>

      {/* Notice box */}
      <div className="p-4 rounded-2xl bg-white border border-[#EADCE1] text-xs text-[#74616B] flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-[#B89555] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-[#392832]">Studio Privacy Guarantee:</strong> Real local vendor pricing and contact details entered below are stored strictly on your local device. EventPilot AI uses anonymized market benchmarks when optimizing budgets.
        </p>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plan.vendors.items.map((vendor) => {
          const estMajor = toMajorUnits(vendor.estimatedCostMinor, currency);

          return (
            <div
              key={vendor.id}
              className="p-5 rounded-3xl bg-white border border-[#EADCE1] hover:border-[#B85F80]/50 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF8ED] text-[#B89555] border border-[#EADCE1]">
                    {vendor.category}
                  </span>

                  <select
                    value={vendor.bookingStatus}
                    onChange={(e) => handleStatusChange(vendor.id, e.target.value as BookingStatus)}
                    aria-label={`Booking status for ${vendor.title}`}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                      vendor.bookingStatus === 'confirmed'
                        ? 'bg-[#F0F7F4] text-[#477D60] border-emerald-200'
                        : vendor.bookingStatus === 'quotation_received'
                        ? 'bg-[#FFF0F3] text-[#B85F80] border-[#E9B9C9]'
                        : vendor.bookingStatus === 'negotiating'
                        ? 'bg-[#FFF8ED] text-[#A87531] border-[#EADCE1]'
                        : vendor.bookingStatus === 'cancelled'
                        ? 'bg-[#FFF0F3] text-[#B94D5A] border-[#B94D5A]/30'
                        : 'bg-[#FBF5F6] text-[#74616B] border-[#EADCE1]'
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

                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#392832]">{vendor.title}</h3>
                  <p className="text-xs text-[#74616B] mt-1 leading-relaxed">{vendor.selectionGuidance}</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#FBF5F6] border border-[#EADCE1] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#74616B]">
                    <span>Target Booking Date:</span>
                    <strong className="text-[#392832] font-mono">{formatDisplayDate(vendor.targetBookingDate)}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#74616B]">
                    <span>Est. Allocation:</span>
                    <strong className="text-[#B89555] font-mono">{formatCurrency(vendor.estimatedCostMinor, currency)}</strong>
                  </div>
                </div>

                {/* Contact phonebook snippet */}
                <div className="space-y-1 text-xs">
                  {vendor.contactName && (
                    <p className="font-semibold text-[#392832]">{vendor.contactName}</p>
                  )}
                  {vendor.contactPhone && (
                    <p className="text-[#74616B] flex items-center gap-1.5 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-[#B85F80]" /> {vendor.contactPhone}
                    </p>
                  )}
                  {vendor.contactEmail && (
                    <p className="text-[#74616B] flex items-center gap-1.5 font-mono text-[11px] truncate">
                      <Mail className="w-3 h-3 text-[#B89555]" /> {vendor.contactEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#EADCE1] flex items-center justify-end gap-2">
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
                  className="p-1.5 rounded-lg text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
                  aria-label={`Edit ${vendor.title}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteVendor(vendor.id)}
                  className="p-1.5 rounded-lg text-[#74616B] hover:text-[#B94D5A] hover:bg-[#FFF0F3]"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EADCE1] space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-editorial text-base font-bold text-[#392832]">
              {editingVendor ? 'Edit Partner Details' : 'Add New Service Partner'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Partner / Deliverable *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Heritage Fort Lawn, Royal Dhol Ensemble"
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decor">Decor</option>
                    <option value="Photography">Photography</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Status</label>
                  <select
                    value={formData.bookingStatus}
                    onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value as BookingStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
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
                  <label className="block text-xs font-bold text-[#74616B] mb-1">
                    Est. Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedCostMajor}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedCostMajor: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm font-mono text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Lock Date</label>
                  <input
                    type="date"
                    value={formData.targetBookingDate}
                    onChange={(e) => setFormData({ ...formData, targetBookingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Selection Guidance</label>
                <textarea
                  rows={2}
                  value={formData.selectionGuidance}
                  onChange={(e) => setFormData({ ...formData, selectionGuidance: e.target.value })}
                  placeholder="Key criteria, insurance requirements, acoustic restrictions..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80] resize-none"
                />
              </div>

              {/* Contact info fields */}
              <div className="pt-2 border-t border-[#EADCE1] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#74616B]">
                  Contact Information (Stored Locally)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Contact Name"
                    className="px-2.5 py-1.5 rounded-lg border border-[#EADCE1] bg-[#FBF5F6] text-xs text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="Phone"
                    className="px-2.5 py-1.5 rounded-lg border border-[#EADCE1] bg-[#FBF5F6] text-xs font-mono text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="Email"
                    className="px-2.5 py-1.5 rounded-lg border border-[#EADCE1] bg-[#FBF5F6] text-xs font-mono text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADCE1]">
              <button
                type="button"
                onClick={() => {
                  setEditingVendor(null);
                  setIsAddingVendor(false);
                }}
                className="px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveVendor}
                disabled={!formData.title.trim()}
                className="px-5 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] disabled:opacity-40 text-white text-xs font-bold shadow-xs active:scale-[0.98]"
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
