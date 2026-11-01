import React from 'react';
import {
  Save,
  Trash2,
  Download,
  Upload,
  ShieldCheck,
} from 'lucide-react';
import { EventPlan, EventCategory, VenuePreference } from '../types/event';
import { SUPPORTED_CURRENCIES } from '../utils/currency';
import { downloadFile } from '../utils/export';
import { generateId } from '../utils/validation';

interface SettingsViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onDeletePlan: (id: string) => void;
  onImportPlanJson: (json: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  plan,
  onUpdatePlan,
  onDeletePlan,
  onImportPlanJson,
}) => {
  const [details, setDetails] = React.useState({
    name: plan.eventDetails.name,
    category: plan.eventDetails.category,
    targetDate: plan.eventDetails.targetDate,
    location: plan.eventDetails.location,
    guestCount: plan.eventDetails.guestCount,
    currency: plan.budget.currency,
    venuePreference: plan.eventDetails.venuePreference,
    styleTheme: plan.eventDetails.styleTheme,
  });

  const [newAssumptionText, setNewAssumptionText] = React.useState('');
  const [newAssumptionCat, setNewAssumptionCat] = React.useState('General');
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSaveDetails = () => {
    onUpdatePlan({
      ...plan,
      eventDetails: {
        ...plan.eventDetails,
        name: details.name,
        category: details.category,
        targetDate: details.targetDate,
        location: details.location,
        guestCount: details.guestCount,
        venuePreference: details.venuePreference,
        styleTheme: details.styleTheme,
      },
      budget: {
        ...plan.budget,
        currency: details.currency,
      },
    });
  };

  const handleAddAssumption = () => {
    if (!newAssumptionText.trim()) return;
    const newAsmp = {
      id: generateId('asmp_usr'),
      category: newAssumptionCat,
      description: newAssumptionText.trim(),
      isConfirmed: true,
    };
    onUpdatePlan({
      ...plan,
      assumptions: [...plan.assumptions, newAsmp],
    });
    setNewAssumptionText('');
  };

  const handleDeleteAssumption = (id: string) => {
    onUpdatePlan({
      ...plan,
      assumptions: plan.assumptions.filter((a) => a.id !== id),
    });
  };

  const handleToggleAssumption = (id: string) => {
    onUpdatePlan({
      ...plan,
      assumptions: plan.assumptions.map((a) =>
        a.id === id ? { ...a, isConfirmed: !a.isConfirmed } : a
      ),
    });
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(plan, null, 2);
    downloadFile(
      jsonStr,
      `${plan.eventDetails.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_master_plan.json`,
      'application/json'
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportPlanJson(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-[#F3EBDD] tracking-tight">
          Event Settings & Workspace Configuration
        </h2>
        <p className="text-xs text-[#A5A3AD] mt-0.5">
          Update event metadata, change currency, manage assumptions, and export backups.
        </p>
      </div>

      {/* Basic Event Settings Card */}
      <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#F3EBDD]">Event Details & Core Parameters</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Event Name</label>
            <input
              type="text"
              value={details.name}
              onChange={(e) => setDetails({ ...details, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Event Category</label>
            <select
              value={details.category}
              onChange={(e) => setDetails({ ...details, category: e.target.value as EventCategory })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
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
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Target Event Date</label>
            <input
              type="date"
              value={details.targetDate}
              onChange={(e) => setDetails({ ...details, targetDate: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Location / City</label>
            <input
              type="text"
              value={details.location}
              onChange={(e) => setDetails({ ...details, location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Currency Standard</label>
            <select
              value={details.currency}
              onChange={(e) => setDetails({ ...details, currency: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
            >
              {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol.trim()}) - {c.useIndianNumbering ? 'Indian notation' : 'Standard'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Venue Preference</label>
            <select
              value={details.venuePreference}
              onChange={(e) => setDetails({ ...details, venuePreference: e.target.value as VenuePreference })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] capitalize"
            >
              <option value="outdoor">Outdoor Lawn</option>
              <option value="indoor">Indoor Banquet</option>
              <option value="hybrid">Hybrid</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Theme / Atmosphere</label>
          <input
            type="text"
            value={details.styleTheme}
            onChange={(e) => setDetails({ ...details, styleTheme: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
          />
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveDetails}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-[#0B0B10]" /> Save Changes
          </button>
        </div>
      </div>

      {/* Assumptions Management */}
      <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-[#F3EBDD]">Planning Assumptions Tracker</h3>
        <p className="text-xs text-[#A5A3AD]">
          Baseline hypotheses about attendance, tax rates, access hours, and vendor policies.
        </p>

        <div className="space-y-2">
          {plan.assumptions.map((asmp) => (
            <div
              key={asmp.id}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                asmp.isConfirmed
                  ? 'bg-[#1D1D27] border-[#829879]/50'
                  : 'bg-[#1D1D27] border-[#30303A]'
              }`}
            >
              <div className="flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96E] block mb-0.5">
                  {asmp.category}
                </span>
                <p className="text-[#F3EBDD] leading-relaxed">{asmp.description}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleAssumption(asmp.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    asmp.isConfirmed
                      ? 'bg-[#829879] text-[#0B0B10] font-bold'
                      : 'border border-[#30303A] bg-[#15151D] text-[#F3EBDD] hover:bg-[#252533]'
                  }`}
                >
                  {asmp.isConfirmed ? 'Confirmed' : 'Mark Confirmed'}
                </button>
                <button
                  onClick={() => handleDeleteAssumption(asmp.id)}
                  className="p-1 rounded-lg text-[#A5A3AD] hover:text-[#E47777]"
                  aria-label="Delete assumption"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add custom assumption */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={newAssumptionCat}
            onChange={(e) => setNewAssumptionCat(e.target.value)}
            placeholder="Category (e.g. Weather, Transit)"
            className="w-full sm:w-40 px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
          />
          <input
            type="text"
            value={newAssumptionText}
            onChange={(e) => setNewAssumptionText(e.target.value)}
            placeholder="Describe new assumption or policy..."
            className="flex-1 w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
          />
          <button
            onClick={handleAddAssumption}
            disabled={!newAssumptionText.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 text-[#0B0B10] text-xs font-bold whitespace-nowrap"
          >
            + Add Assumption
          </button>
        </div>
      </div>

      {/* Data Backup & Privacy Protection */}
      <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#829879]" />
          <h3 className="text-sm font-bold text-[#F3EBDD]">Privacy, Portability & Backups</h3>
        </div>
        <p className="text-xs text-[#A5A3AD] leading-relaxed">
          EventPilot AI operates with client-side zero-leak storage. Your plans, vendor notes, and guest numbers are saved locally in your browser storage. You can download complete JSON files to transfer plans across machines or keep permanent offline records.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJson}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] hover:bg-[#252533] text-[#F3EBDD] text-xs font-semibold"
          >
            <Download className="w-4 h-4 text-[#C8A96E]" />
            <span>Export Plan as JSON</span>
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] hover:bg-[#252533] text-[#F3EBDD] text-xs font-semibold"
          >
            <Upload className="w-4 h-4 text-[#C8A96E]" />
            <span>Import Plan from JSON</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Delete Plan */}
      <div className="p-6 rounded-3xl bg-[#15151D] border border-[#E47777]/40 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-[#E47777]">Danger Zone</h3>
        <p className="text-xs text-[#A5A3AD]">
          Permanently delete this event plan from local storage. This action cannot be undone.
        </p>

        {showDeleteConfirm ? (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onDeletePlan(plan.id)}
              className="px-4 py-2 rounded-xl bg-[#E47777] hover:bg-[#E47777]/80 text-[#0B0B10] text-xs font-bold"
            >
              Yes, Delete Permanently
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-[#A5A3AD] hover:text-[#F3EBDD] text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-xl border border-[#E47777]/50 bg-[#1D1D27] hover:bg-[rgba(228,119,119,0.15)] text-[#E47777] text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Delete Event Plan
          </button>
        )}
      </div>
    </div>
  );
};
