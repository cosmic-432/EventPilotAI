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
      <div>
        <h2 className="text-xl font-extrabold text-[#F3EBDD] tracking-tight">
          Guest Experience & Logistics Engineering
        </h2>
        <p className="text-xs text-[#A5A3AD] mt-0.5">
          Venue capacity math, catering per-plate projections, dietary headcounts, and accessibility provisions.
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Headcount */}
        <div className="p-5 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center justify-between text-[#A5A3AD] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Guests</span>
            <Users className="w-4 h-4 text-[#C8A96E]" />
          </div>
          <div className="flex items-baseline gap-2">
            <input
              type="number"
              min="1"
              value={guestPlan.estimatedGuests}
              onChange={(e) => handleUpdateGuestCount(Number(e.target.value))}
              aria-label="Total guest count"
              className="text-3xl font-extrabold text-[#F3EBDD] w-28 border-b border-dashed border-[#A5A3AD] focus:outline-none focus:border-[#C8A96E] tabular-nums font-mono bg-transparent"
            />
            <span className="text-xs text-[#A5A3AD]">Attendees</span>
          </div>
          <p className="text-[11px] text-[#A5A3AD] mt-2">
            Estimated 85% attendance rate = ~{Math.round(guestPlan.estimatedGuests * 0.85)} active heads.
          </p>
        </div>

        {/* Metric 2: Space Calculation */}
        <div className="p-5 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center justify-between text-[#A5A3AD] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Venue Space Required</span>
            <Maximize2 className="w-4 h-4 text-[#C8A96E]" />
          </div>
          <p className="text-3xl font-extrabold text-[#F3EBDD] tabular-nums font-mono">
            {guestPlan.estimatedSpaceSqFt.toLocaleString()} <span className="text-sm font-sans font-semibold text-[#A5A3AD]">sq. ft.</span>
          </p>
          <p className="text-[11px] text-[#A5A3AD] mt-2">
            Based on ~22 sq.ft/guest for banquet dining, circulation, and stage.
          </p>
        </div>

        {/* Metric 3: Catering Per Plate */}
        <div className="p-5 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center justify-between text-[#A5A3AD] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Catering Per-Head Target</span>
            <Utensils className="w-4 h-4 text-[#829879]" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-[#F3EBDD]">{currency}</span>
            <input
              type="number"
              min="0"
              value={toMajorUnits(guestPlan.cateringPerHeadMinor, currency)}
              onChange={(e) => handleUpdatePerHead(Number(e.target.value))}
              aria-label="Catering per head cost"
              className="text-3xl font-extrabold text-[#F3EBDD] w-32 border-b border-dashed border-[#A5A3AD] focus:outline-none focus:border-[#C8A96E] tabular-nums font-mono bg-transparent"
            />
          </div>
          <p className="text-[11px] text-[#A5A3AD] mt-2">
            Total projected catering = {formatCurrency(guestPlan.cateringPerHeadMinor * guestPlan.estimatedGuests, currency)}.
          </p>
        </div>
      </div>

      {/* Two Column Section: Dietary Breakdown & Accessibility */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dietary Distribution */}
        <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Utensils className="w-5 h-5 text-[#C8A96E]" />
            <h3 className="text-sm font-bold text-[#F3EBDD]">Dietary Portions & Menu Allocations</h3>
          </div>
          <p className="text-xs text-[#A5A3AD] mb-4">
            Share these verified numbers with your catering manager to eliminate food waste.
          </p>

          <div className="space-y-4">
            {Object.entries(guestPlan.dietaryBreakdown).map(([diet, count]) => {
              const pct = Math.round((count / (guestPlan.estimatedGuests || 1)) * 100);
              return (
                <div key={diet} className="p-3 rounded-2xl bg-[#1D1D27] border border-[#30303A]">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-[#F3EBDD]">{diet}</span>
                    <span className="font-mono text-[#C8A96E]">
                      {count} guests ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#15151D] rounded-full h-2 overflow-hidden border border-[#30303A]">
                    <div
                      className="bg-[#C8A96E] h-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Accessibility Provisions */}
        <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Accessibility className="w-5 h-5 text-[#829879]" />
            <h3 className="text-sm font-bold text-[#F3EBDD]">Accessibility & Inclusivity Protocols</h3>
          </div>
          <p className="text-xs text-[#A5A3AD] mb-4">
            Ensuring comfortable seating, ramp access, and parking convenience for all guests.
          </p>

          <div className="space-y-2.5">
            {plan.eventDetails.accessibilityRequirements.length > 0 ? (
              plan.eventDetails.accessibilityRequirements.map((req, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#1D1D27] border border-[#30303A] flex items-center gap-2.5 text-xs text-[#F3EBDD]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#829879] shrink-0" />
                  <span>{req}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#A5A3AD] italic py-4">No specific accessibility flags recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
