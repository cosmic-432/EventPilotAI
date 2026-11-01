import React from 'react';
import {
  Users,
  Utensils,
  Maximize2,
  Accessibility,
  CheckCircle2,
} from 'lucide-react';
import { EventPlan } from '../types/event';
import { formatCurrency, toMajorUnits, toMinorUnits } from '../utils/currency';

interface GuestLogisticsViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const GuestLogisticsView: React.FC<GuestLogisticsViewProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const currency = plan.budget.currency || 'INR';
  const guestPlan = plan.guestPlan;

  const handleUpdateGuestCount = (count: number) => {
    const validCount = Math.max(1, count);
    const updatedPlan: EventPlan = {
      ...plan,
      eventDetails: {
        ...plan.eventDetails,
        guestCount: validCount,
      },
      guestPlan: {
        ...plan.guestPlan,
        estimatedGuests: validCount,
        estimatedSpaceSqFt: validCount * 22,
        dietaryBreakdown: {
          'Vegetarian': Math.round(validCount * 0.65),
          'Non-Vegetarian': Math.round(validCount * 0.3),
          'Special / Jain': Math.round(validCount * 0.05),
        },
      },
    };
    onUpdatePlan(updatedPlan);
  };

  const handleUpdatePerHead = (majorVal: number) => {
    const minor = toMinorUnits(majorVal, currency);
    onUpdatePlan({
      ...plan,
      guestPlan: {
        ...plan.guestPlan,
        cateringPerHeadMinor: minor,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#EEDCD7]">
        <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
          Hospitality Architecture
        </span>
        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight mt-0.5">
          Guest Experience & Logistics Engineering
        </h2>
        <p className="text-sm text-[#57534E] mt-0.5">
          Venue capacity math, catering per-plate projections, dietary headcounts, and accessibility provisions.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Headcount */}
        <div className="p-5 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Guests</span>
            <Users className="w-4 h-4 text-[#FF6F61]" />
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min="1"
              value={guestPlan.estimatedGuests}
              onChange={(e) => handleUpdateGuestCount(Number(e.target.value))}
              aria-label="Total guest count"
              className="text-3xl font-bold text-[#1C1917] w-28 border-b border-dashed border-[#FF6F61] focus:outline-none focus:border-[#E05345] tabular-nums font-mono bg-transparent"
            />
            <span className="text-xs text-[#57534E]">Attendees</span>
          </div>
          <p className="text-[11px] text-[#57534E] mt-2">
            Estimated 85% attendance rate = ~{Math.round(guestPlan.estimatedGuests * 0.85)} active heads.
          </p>
        </div>

        {/* Metric 2: Space Calculation */}
        <div className="p-5 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Venue Space Required</span>
            <Maximize2 className="w-4 h-4 text-[#B89555]" />
          </div>
          <p className="text-3xl font-bold text-[#1C1917] tabular-nums font-mono">
            {guestPlan.estimatedSpaceSqFt.toLocaleString()} <span className="text-sm font-sans font-semibold text-[#57534E]">sq. ft.</span>
          </p>
          <p className="text-[11px] text-[#57534E] mt-2">
            Based on ~22 sq.ft/guest for banquet dining, circulation, and stage.
          </p>
        </div>

        {/* Metric 3: Catering Per Plate */}
        <div className="p-5 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs">
          <div className="flex items-center justify-between text-[#57534E] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catering Per-Head Target</span>
            <Utensils className="w-4 h-4 text-[#477D60]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#1C1917]">{currency}</span>
            <input
              type="number"
              min="0"
              value={toMajorUnits(guestPlan.cateringPerHeadMinor, currency)}
              onChange={(e) => handleUpdatePerHead(Number(e.target.value))}
              aria-label="Catering per head cost"
              className="text-3xl font-bold text-[#1C1917] w-32 border-b border-dashed border-[#FF6F61] focus:outline-none focus:border-[#E05345] tabular-nums font-mono bg-transparent"
            />
          </div>
          <p className="text-[11px] text-[#57534E] mt-2">
            Total projected catering = {formatCurrency(guestPlan.cateringPerHeadMinor * guestPlan.estimatedGuests, currency)}.
          </p>
        </div>
      </div>

      {/* Two Column Section: Dietary Breakdown & Accessibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dietary Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-[#B89555]" />
            <h3 className="font-editorial text-base font-bold text-[#1C1917]">Dietary Portions & Menu Allocations</h3>
          </div>
          <p className="text-xs text-[#57534E] mb-4">
            Share these verified numbers with your catering manager to eliminate food waste.
          </p>

          <div className="space-y-4">
            {Object.entries(guestPlan.dietaryBreakdown).map(([diet, count]) => {
              const pct = Math.round((count / (guestPlan.estimatedGuests || 1)) * 100);
              return (
                <div key={diet} className="p-3 rounded-2xl bg-[#FCF8F7] border border-[#EEDCD7]">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-[#1C1917]">{diet}</span>
                    <span className="font-mono text-[#B89555]">
                      {count} guests ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#F8EFEB] rounded-full h-2 overflow-hidden border border-[#EEDCD7]">
                    <div
                      className="bg-[#FF6F61] h-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accessibility Provisions */}
        <div className="p-6 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Accessibility className="w-5 h-5 text-[#477D60]" />
            <h3 className="font-editorial text-base font-bold text-[#1C1917]">Accessibility & Inclusivity Protocols</h3>
          </div>
          <p className="text-xs text-[#57534E] mb-4">
            Ensuring comfortable seating, ramp access, and parking convenience for all guests.
          </p>

          <div className="space-y-2.5">
            {plan.eventDetails.accessibilityRequirements.length > 0 ? (
              plan.eventDetails.accessibilityRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FCF8F7] border border-[#EEDCD7] flex items-center gap-2.5 text-xs text-[#1C1917]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#477D60] shrink-0" />
                  <span>{req}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#57534E] italic py-4">No specific accessibility flags recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
