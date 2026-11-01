import React from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MapPin,
  Users,
  DollarSign,
  Check,
} from 'lucide-react';
import { EventCategory, VenuePreference } from '../types/event';
import { SUPPORTED_CURRENCIES, formatCurrency, toMinorUnits } from '../utils/currency';
import { validateEventInput } from '../utils/validation';
import { getTodayIso } from '../utils/timeline';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => void;
  isLoading: boolean;
}

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [step, setStep] = React.useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = React.useState({
    name: 'Ananya & Rohan Wedding',
    category: 'wedding' as EventCategory,
    targetDate: '2026-12-28',
    location: 'Pune, Maharashtra',
    guestCount: 250,
    totalBudget: 800000,
    currency: 'INR',
    venuePreference: 'outdoor' as VenuePreference,
    styleTheme: 'Traditional Maharashtrian with Elegant Contemporary Floral Accents',
    dietaryRequirements: ['Vegetarian', 'Jain Options', 'Live Regional Snacks'],
    accessibilityRequirements: ['Wheelchair Ramps & Handrails', 'Reserved Elder Seating'],
    priorities: ['Memorable guest hospitality', 'Authentic regional catering', 'Vibrant ambient decor'],
    notes: 'Prefer an open lawn venue with waterproof backup marquee.',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      const v = validateEventInput({
        name: formData.name,
        targetDate: formData.targetDate,
        location: formData.location,
        guestCount: formData.guestCount,
        totalBudget: formData.totalBudget,
      });
      if (v.errors.name || v.errors.targetDate || v.errors.location) {
        setErrors(v.errors as Record<string, string>);
        return;
      }
    } else if (step === 2) {
      const v = validateEventInput({
        name: formData.name,
        targetDate: formData.targetDate,
        location: formData.location,
        guestCount: formData.guestCount,
        totalBudget: formData.totalBudget,
      });
      if (v.errors.guestCount || v.errors.totalBudget) {
        setErrors(v.errors as Record<string, string>);
        return;
      }
    }
    setErrors({});
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const toggleArrayItem = (field: 'dietaryRequirements' | 'accessibilityRequirements' | 'priorities', item: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      const exists = arr.includes(item);
      return {
        ...prev,
        [field]: exists ? arr.filter((x) => x !== item) : [...arr, item],
      };
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B10]/80 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-[#15151D] rounded-3xl shadow-2xl border border-[#30303A] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#30303A] flex items-center justify-between bg-[#15151D]">
          <div>
            <h2 id="wizard-title" className="text-lg font-bold text-[#F3EBDD] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C8A96E]" />
              Event Setup Wizard
            </h2>
            <p className="text-xs text-[#A5A3AD] mt-0.5">
              Step {step} of {totalSteps} — {step === 1 ? 'Basics & Timing' : step === 2 ? 'Budget & Scale' : step === 3 ? 'Venue & Style' : 'Inclusivity & Review'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#1D1D27] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Champagne Accent) */}
        <div className="w-full bg-[#1D1D27] h-1.5">
          <div
            className="bg-[#C8A96E] h-1.5 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="evtName" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                  Event Name *
                </label>
                <input
                  id="evtName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya & Arjun Wedding, Spring Tech Fest 2026"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-[#E47777] ring-[#E47777]/30' : 'border-[#30303A] focus:ring-[#C8A96E]'
                  }`}
                />
                {errors.name && <p className="text-xs text-[#E47777] mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="evtCategory" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                    Category *
                  </label>
                  <select
                    id="evtCategory"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    <option value="wedding">Wedding & Engagement</option>
                    <option value="birthday">Birthday & Milestone</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="college_festival">College & Student Festival</option>
                    <option value="community">Community & Cultural Gathering</option>
                    <option value="fundraiser">Fundraiser & Charity Gala</option>
                    <option value="corporate">Corporate & Conference</option>
                    <option value="custom">Custom Event</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="evtDate" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                    Event Date *
                  </label>
                  <input
                    id="evtDate"
                    type="date"
                    min={getTodayIso()}
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 ${
                      errors.targetDate ? 'border-[#E47777] ring-[#E47777]/30' : 'border-[#30303A] focus:ring-[#C8A96E]'
                    }`}
                  />
                  {errors.targetDate && <p className="text-xs text-[#E47777] mt-1">{errors.targetDate}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="evtLocation" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                  City or Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#A5A3AD] absolute left-3.5 top-3" />
                  <input
                    id="evtLocation"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Pune, Bangalore, Mumbai, New Delhi"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 ${
                      errors.location ? 'border-[#E47777] ring-[#E47777]/30' : 'border-[#30303A] focus:ring-[#C8A96E]'
                    }`}
                  />
                </div>
                {errors.location && <p className="text-xs text-[#E47777] mt-1">{errors.location}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guestCount" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                    Estimated Guests *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[#A5A3AD] absolute left-3.5 top-3" />
                    <input
                      id="guestCount"
                      type="number"
                      min="1"
                      max="100000"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 ${
                        errors.guestCount ? 'border-[#E47777] ring-[#E47777]/30' : 'border-[#30303A] focus:ring-[#C8A96E]'
                      }`}
                    />
                  </div>
                  {errors.guestCount && <p className="text-xs text-[#E47777] mt-1">{errors.guestCount}</p>}
                </div>

                <div>
                  <label htmlFor="currencySelect" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                    Currency *
                  </label>
                  <select
                    id="currencySelect"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol.trim()}) - {c.useIndianNumbering ? 'Indian numbering (Lakhs/Crores)' : 'Standard'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="totalBudget" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                  Total Budget ({SUPPORTED_CURRENCIES[formData.currency]?.symbol || formData.currency}) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#A5A3AD] absolute left-3.5 top-3" />
                  <input
                    id="totalBudget"
                    type="number"
                    min="1"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-[#1D1D27] text-sm font-mono text-[#F3EBDD] focus:outline-none focus:ring-2 ${
                      errors.totalBudget ? 'border-[#E47777] ring-[#E47777]/30' : 'border-[#30303A] focus:ring-[#C8A96E]'
                    }`}
                  />
                </div>
                {errors.totalBudget && <p className="text-xs text-[#E47777] mt-1">{errors.totalBudget}</p>}
                <p className="text-xs text-[#A5A3AD] mt-1">
                  Preview: <span className="font-semibold text-[#C8A96E]">
                    {formatCurrency(toMinorUnits(formData.totalBudget, formData.currency), formData.currency)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-2">
                  Venue Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['outdoor', 'indoor', 'hybrid', 'flexible'] as VenuePreference[]).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setFormData({ ...formData, venuePreference: pref })}
                      className={`p-3 rounded-xl border text-xs font-semibold capitalize text-center transition-all ${
                        formData.venuePreference === pref
                          ? 'border-[#C8A96E] bg-[#1D1D27] text-[#C8A96E] ring-1 ring-[#C8A96E]'
                          : 'border-[#30303A] bg-[#1D1D27] hover:bg-[#252533] text-[#A5A3AD] hover:text-[#F3EBDD]'
                      }`}
                    >
                      {pref === 'outdoor' ? '🌲 Outdoor Lawn' : pref === 'indoor' ? '🏛️ Indoor Banquet' : pref === 'hybrid' ? '🌿 Hybrid / Both' : '🔄 Flexible'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="styleTheme" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                  Desired Style or Theme
                </label>
                <input
                  id="styleTheme"
                  type="text"
                  value={formData.styleTheme}
                  onChange={(e) => setFormData({ ...formData, styleTheme: e.target.value })}
                  placeholder="e.g. Royal Heritage, Bohemian Floral, Minimalist Sunset"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-2">
                  Key Priorities (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Exceptional Catering',
                    'Budget Discipline',
                    'Spectacular Decor & Stage',
                    'High-energy Entertainment',
                    'Flawless Photography',
                    'Elder Comfort & Seating',
                    'Eco-Friendly / Sustainable',
                  ].map((prio) => {
                    const isSelected = formData.priorities.includes(prio);
                    return (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => toggleArrayItem('priorities', prio)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#C8A96E] text-[#0B0B10] font-bold border-[#C8A96E]'
                            : 'bg-[#1D1D27] text-[#A5A3AD] border-[#30303A] hover:bg-[#252533] hover:text-[#F3EBDD]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0B0B10]" />}
                        {prio}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-2">
                  Dietary Accommodations
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Vegetarian',
                    'Jain Options',
                    'Non-Vegetarian',
                    'Vegan',
                    'Gluten-Free',
                    'Halal',
                    'Live Chaat / Snack Counters',
                    'Mocktail Bar',
                  ].map((diet) => {
                    const isSelected = formData.dietaryRequirements.includes(diet);
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleArrayItem('dietaryRequirements', diet)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#829879] text-[#0B0B10] font-bold border-[#829879]'
                            : 'bg-[#1D1D27] text-[#A5A3AD] border-[#30303A] hover:bg-[#252533] hover:text-[#F3EBDD]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0B0B10]" />}
                        {diet}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-2">
                  Accessibility & Mobility Requirements
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Wheelchair Ramps & Handrails',
                    'Reserved Elder Seating',
                    'Wide Aisles (5+ ft)',
                    'Accessible Restrooms',
                    'Valet / Step-Free Dropoff',
                    'Quiet / Sensory Resting Area',
                  ].map((acc) => {
                    const isSelected = formData.accessibilityRequirements.includes(acc);
                    return (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => toggleArrayItem('accessibilityRequirements', acc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#C8A96E] text-[#0B0B10] font-bold border-[#C8A96E]'
                            : 'bg-[#1D1D27] text-[#A5A3AD] border-[#30303A] hover:bg-[#252533] hover:text-[#F3EBDD]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#0B0B10]" />}
                        {acc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="extraNotes" className="block text-xs font-bold text-[#A5A3AD] mb-1">
                  Additional Notes or Instructions for Gemini AI
                </label>
                <textarea
                  id="extraNotes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any non-negotiables, cultural traditions, or specific vendors already in mind..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-[#30303A] bg-[#15151D] flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-semibold text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#252533] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 text-[#0B0B10] text-xs font-bold shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#0B0B10]/30 border-t-[#0B0B10] rounded-full animate-spin" />
                <span>Generating Master Plan...</span>
              </>
            ) : step === totalSteps ? (
              <>
                <Sparkles className="w-4 h-4 text-[#0B0B10]" />
                <span>Generate Master Plan</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4 text-[#0B0B10]" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
