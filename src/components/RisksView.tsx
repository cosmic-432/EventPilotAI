import React from 'react';
import {
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react';
import { EventPlan, RiskRecommendation } from '../types/event';
import { generateId } from '../utils/validation';

interface RisksViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
}

export const RisksView: React.FC<RisksViewProps> = ({ plan, onUpdatePlan }) => {
  const [isAddingRisk, setIsAddingRisk] = React.useState(false);
  const [formData, setFormData] = React.useState<{
    title: string;
    category: RiskRecommendation['category'];
    probability: RiskRecommendation['probability'];
    severity: RiskRecommendation['severity'];
    mitigation: string;
    contingencyAction: string;
  }>({
    title: '',
    category: 'weather',
    probability: 'medium',
    severity: 'high',
    mitigation: '',
    contingencyAction: '',
  });

  const handleToggleResolved = (id: string) => {
    const updated = plan.risks.items.map((r) =>
      r.id === id ? { ...r, isResolved: !r.isResolved } : r
    );
    onUpdatePlan({
      ...plan,
      risks: { items: updated },
    });
  };

  const handleDeleteRisk = (id: string) => {
    const updated = plan.risks.items.filter((r) => r.id !== id);
    onUpdatePlan({
      ...plan,
      risks: { items: updated },
    });
  };

  const handleSaveRisk = () => {
    if (!formData.title.trim()) return;

    const newRisk: RiskRecommendation = {
      id: generateId('rsk_usr'),
      title: formData.title,
      category: formData.category,
      probability: formData.probability,
      severity: formData.severity,
      mitigation: formData.mitigation || 'Proactively monitor status',
      contingencyAction: formData.contingencyAction || 'Engage secondary backup supplier',
      isResolved: false,
    };

    onUpdatePlan({
      ...plan,
      risks: {
        items: [newRisk, ...plan.risks.items],
      },
    });

    setIsAddingRisk(false);
    setFormData({
      title: '',
      category: 'weather',
      probability: 'medium',
      severity: 'high',
      mitigation: '',
      contingencyAction: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F3EBDD] tracking-tight">
            Risk Management & Contingency Command
          </h2>
          <p className="text-xs text-[#A5A3AD] mt-0.5">
            Probability × Severity matrix. Prepare preventative mitigations and day-of emergency contingency protocols.
          </p>
        </div>

        <button
          onClick={() => setIsAddingRisk(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-[#0B0B10]" /> Add Risk Protocol
        </button>
      </div>

      {/* Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.risks.items.map((risk) => {
          return (
            <div
              key={risk.id}
              className={`p-5 rounded-3xl bg-[#15151D] border transition-all flex flex-col justify-between ${
                risk.isResolved
                  ? 'border-[#829879]/50 bg-[#15151D]/60 opacity-80'
                  : 'border-[#30303A] hover:border-[#C8A96E]/50 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96E]">
                    Category: {risk.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        risk.probability === 'high'
                          ? 'bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border border-[#E4B66A]/30'
                          : risk.probability === 'medium'
                          ? 'bg-[#1D1D27] text-[#C8A96E] border border-[#30303A]'
                          : 'bg-[#1D1D27] text-[#829879] border border-[#30303A]'
                      }`}
                    >
                      {risk.probability} Prob.
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        risk.severity === 'high'
                          ? 'bg-[rgba(228,119,119,0.15)] text-[#E47777] border border-[#E47777]/30'
                          : risk.severity === 'medium'
                          ? 'bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border border-[#E4B66A]/30'
                          : 'bg-[#1D1D27] text-[#829879] border border-[#30303A]'
                      }`}
                    >
                      {risk.severity} Severity
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#F3EBDD] mb-3">{risk.title}</h3>

                {/* Mitigation Strategy */}
                <div className="p-3 rounded-xl bg-[#1D1D27] border border-[#30303A] mb-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#829879] mb-1">
                    🛡️ Preventative Mitigation:
                  </p>
                  <p className="text-xs text-[#F3EBDD] leading-relaxed">{risk.mitigation}</p>
                </div>

                {/* Day-of Contingency Action */}
                <div className="p-3 rounded-xl bg-[#1D1D27] border border-[#30303A]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#E4B66A] mb-1">
                    ⚡ Day-of Contingency Trigger:
                  </p>
                  <p className="text-xs text-[#F3EBDD] leading-relaxed">{risk.contingencyAction}</p>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-[#30303A] mt-4">
                <button
                  onClick={() => handleToggleResolved(risk.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    risk.isResolved
                      ? 'bg-[#829879] text-[#0B0B10] font-bold'
                      : 'border border-[#30303A] bg-[#1D1D27] hover:bg-[#252533] text-[#F3EBDD]'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{risk.isResolved ? 'Resolved / Protected' : 'Mark as Protected'}</span>
                </button>

                <button
                  onClick={() => handleDeleteRisk(risk.id)}
                  className="p-1.5 rounded-lg text-[#A5A3AD] hover:text-[#E47777] hover:bg-[rgba(228,119,119,0.1)] transition-colors"
                  aria-label={`Delete risk ${risk.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Risk Modal */}
      {isAddingRisk && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0B10]/80 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-[#15151D] rounded-3xl p-6 shadow-2xl border border-[#30303A] space-y-4">
            <h3 className="text-base font-bold text-[#F3EBDD]">Add Risk Protocol</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Risk Scenario Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sudden monsoon downpour during open-air sangeet"
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    <option value="weather">Weather</option>
                    <option value="vendor">Vendor</option>
                    <option value="logistics">Logistics</option>
                    <option value="health_safety">Health & Safety</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Probability</label>
                  <select
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs text-[#F3EBDD] focus:outline-none focus:ring-2 focus:ring-[#C8A96E]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Preventative Mitigation</label>
                <textarea
                  rows={2}
                  value={formData.mitigation}
                  onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                  placeholder="Actions taken in advance to prevent or lessen probability..."
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A5A3AD] mb-1">Day-of Contingency Protocol</label>
                <textarea
                  rows={2}
                  value={formData.contingencyAction}
                  onChange={(e) => setFormData({ ...formData, contingencyAction: e.target.value })}
                  placeholder="Immediate emergency trigger if the event occurs..."
                  className="w-full px-3 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-sm text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30303A]">
              <button
                type="button"
                onClick={() => setIsAddingRisk(false)}
                className="px-4 py-2 rounded-xl border border-[#30303A] bg-[#1D1D27] text-xs font-semibold text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#252533]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRisk}
                disabled={!formData.title.trim()}
                className="px-5 py-2 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 text-[#0B0B10] text-xs font-bold shadow-xs"
              >
                Save Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
