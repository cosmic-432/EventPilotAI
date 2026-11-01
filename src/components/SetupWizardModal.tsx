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
    styleTheme: 'Traditional Maharashtrian with Velvet Rose & Contemporary Floral Accents',
    dietaryRequirements: ['Vegetarian', 'Jain Options', 'Live Regional Snacks'],
    accessibilityRequirements: ['Wheelchair Ramps & Handrails', 'Reserved Elder Seating'],
    priorities: ['Memorable guest hospitality', 'Authentic regional catering', 'Vibrant ambient decor'],
    notes: 'Prefer an open lawn venue with evening candle lighting and waterproof marquee backup.',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EADCE1] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EADCE1] flex items-center justify-between bg-white">
          <div>
            <h2 id="wizard-title" className="font-editorial text-xl font-bold text-[#392832] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#B85F80]" />
              Event Setup Wizard
            </h2>
            <p className="text-xs text-[#74616B] mt-0.5">
              Step {step} of {totalSteps} — {step === 1 ? 'Basics & Timing' : step === 2 ? 'Budget & Scale' : step === 3 ? 'Venue & Style' : 'Inclusivity & Review'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85F80]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (Rose Accent) */}
        <div className="w-full bg-[#F5E9ED] h-1.5">
          <div
            className="bg-[#B85F80] h-1.5 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="evtName" className="block text-xs font-bold text-[#74616B] mb-1">
                  Event Name *
                </label>
                <input
                  id="evtName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya & Arjun Wedding, Spring Tech Fest 2026"
                  className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-[#B94D5A] ring-[#B94D5A]/30' : 'border-[#EADCE1] focus:ring-[#B85F80]'
                  }`}
                />
                {errors.name && <p className="text-xs text-[#B94D5A] mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="evtCategory" className="block text-xs font-bold text-[#74616B] mb-1">
                    Category *
                  </label>
                  <select
                    id="evtCategory"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
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
                  <label htmlFor="evtDate" className="block text-xs font-bold text-[#74616B] mb-1">
                    Event Date *
                  </label>
                  <input
                    id="evtDate"
                    type="date"
                    min={getTodayIso()}
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 ${
                      errors.targetDate ? 'border-[#B94D5A] ring-[#B94D5A]/30' : 'border-[#EADCE1] focus:ring-[#B85F80]'
                    }`}
                  />
                  {errors.targetDate && <p className="text-xs text-[#B94D5A] mt-1">{errors.targetDate}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="evtLocation" className="block text-xs font-bold text-[#74616B] mb-1">
                  City or Location *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#74616B] absolute left-3.5 top-3" />
                  <input
                    id="evtLocation"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Pune, Bangalore, Mumbai, New Delhi"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 ${
                      errors.location ? 'border-[#B94D5A] ring-[#B94D5A]/30' : 'border-[#EADCE1] focus:ring-[#B85F80]'
                    }`}
                  />
                </div>
                {errors.location && <p className="text-xs text-[#B94D5A] mt-1">{errors.location}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guestCount" className="block text-xs font-bold text-[#74616B] mb-1">
                    Estimated Guests *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[#74616B] absolute left-3.5 top-3" />
                    <input
                      id="guestCount"
                      type="number"
                      min="1"
                      max="100000"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 ${
                        errors.guestCount ? 'border-[#B94D5A] ring-[#B94D5A]/30' : 'border-[#EADCE1] focus:ring-[#B85F80]'
                      }`}
                    />
                  </div>
                  {errors.guestCount && <p className="text-xs text-[#B94D5A] mt-1">{errors.guestCount}</p>}
                </div>

                <div>
                  <label htmlFor="currencySelect" className="block text-xs font-bold text-[#74616B] mb-1">
                    Currency *
                  </label>
                  <select
                    id="currencySelect"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
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
                <label htmlFor="totalBudget" className="block text-xs font-bold text-[#74616B] mb-1">
                  Total Budget ({SUPPORTED_CURRENCIES[formData.currency]?.symbol || formData.currency}) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-[#74616B] absolute left-3.5 top-3" />
                  <input
                    id="totalBudget"
                    type="number"
                    min="1"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-[#FBF5F6] text-sm font-mono text-[#392832] focus:outline-none focus:ring-2 ${
                      errors.totalBudget ? 'border-[#B94D5A] ring-[#B94D5A]/30' : 'border-[#EADCE1] focus:ring-[#B85F80]'
                    }`}
                  />
                </div>
                {errors.totalBudget && <p className="text-xs text-[#B94D5A] mt-1">{errors.totalBudget}</p>}
                <p className="text-xs text-[#74616B] mt-1">
                  Preview: <span className="font-semibold text-[#B89555]">
                    {formatCurrency(toMinorUnits(formData.totalBudget, formData.currency), formData.currency)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-2">
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
                          ? 'border-[#B85F80] bg-[#FFF0F3] text-[#B85F80] ring-1 ring-[#B85F80]'
                          : 'border-[#EADCE1] bg-[#FBF5F6] hover:bg-[#F8E1E8] text-[#74616B] hover:text-[#392832]'
                      }`}
                    >
                      {pref === 'outdoor' ? '🌲 Outdoor Lawn' : pref === 'indoor' ? '🏛️ Indoor Banquet' : pref === 'hybrid' ? '🌿 Hybrid' : '🔄 Flexible'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="styleTheme" className="block text-xs font-bold text-[#74616B] mb-1">
                  Desired Style or Theme
                </label>
                <input
                  id="styleTheme"
                  type="text"
                  value={formData.styleTheme}
                  onChange={(e) => setFormData({ ...formData, styleTheme: e.target.value })}
                  placeholder="e.g. Royal Heritage, Velvet Rose Romance, Minimalist Sunset"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-2">
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
                            ? 'bg-[#B85F80] text-white font-bold border-[#B85F80]'
                            : 'bg-[#FBF5F6] text-[#74616B] border-[#EADCE1] hover:bg-[#F8E1E8] hover:text-[#392832]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
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
                <label className="block text-xs font-bold text-[#74616B] mb-2">
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
                            ? 'bg-[#477D60] text-white font-bold border-[#477D60]'
                            : 'bg-[#FBF5F6] text-[#74616B] border-[#EADCE1] hover:bg-[#F8E1E8] hover:text-[#392832]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        {diet}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-2">
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
                            ? 'bg-[#B89555] text-white font-bold border-[#B89555]'
                            : 'bg-[#FBF5F6] text-[#74616B] border-[#EADCE1] hover:bg-[#F8E1E8] hover:text-[#392832]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        {acc}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="extraNotes" className="block text-xs font-bold text-[#74616B] mb-1">
                  Additional Notes or Instructions for Gemini AI
                </label>
                <textarea
                  id="extraNotes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any non-negotiables, cultural traditions, or specific vendors already in mind..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-[#EADCE1] bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 1 || isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#B85F80] hover:bg-[#984665] disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B85F80] active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Master Plan...</span>
              </>
            ) : step === totalSteps ? (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Master Plan</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
