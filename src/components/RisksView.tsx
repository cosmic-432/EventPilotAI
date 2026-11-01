import React from 'react';
import {
  CheckCircle2,
  Plus,
  Trash2,
  ShieldAlert,
  AlertTriangle,
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
      contingencyAction: formData.contingencyAction || 'Activate reserve protocols',
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EADCE1]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Resilience & Contingency
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#392832] tracking-tight mt-0.5">
            Operational Risk Assessment & Emergency Protocols
          </h2>
          <p className="text-sm text-[#74616B] mt-0.5">
            Pre-flight vulnerability analysis across weather, vendor cancellations, budget overruns, and permits.
          </p>
        </div>

        <button
          onClick={() => setIsAddingRisk(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#B85F80] hover:bg-[#984665] text-white shadow-xs transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-white" /> Add Risk Protocol
        </button>
      </div>

      {/* Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.risks.items.map((risk) => {
          return (
            <div
              key={risk.id}
              className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-4 shadow-xs hover:shadow-md ${
                risk.isResolved
                  ? 'bg-[#FBF5F6]/70 border-[#EADCE1] opacity-70'
                  : 'bg-white border-[#EADCE1] hover:border-[#B85F80]/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFF8ED] text-[#B89555] border border-[#EADCE1]">
                    {risk.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        risk.severity === 'high'
                          ? 'bg-[#FFF0F3] text-[#B94D5A] border border-[#B94D5A]/30'
                          : risk.severity === 'medium'
                          ? 'bg-[#FFF8ED] text-[#A87531] border border-[#A87531]/30'
                          : 'bg-[#F0F7F4] text-[#477D60] border border-emerald-200'
                      }`}
                    >
                      {risk.severity} Severity
                    </span>
                    <span className="text-[10px] text-[#74616B] font-mono">
                      {risk.probability} Prob
                    </span>
                  </div>
                </div>

                <div>
                  <h3
                    className={`font-editorial text-lg font-bold ${
                      risk.isResolved ? 'line-through text-[#998791]' : 'text-[#392832]'
                    }`}
                  >
                    {risk.title}
                  </h3>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FBF5F6] border border-[#EADCE1] space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85F80] block">
                      Preventive Mitigation Strategy:
                    </span>
                    <p className="text-[#74616B] mt-0.5 leading-relaxed">{risk.mitigation}</p>
                  </div>
                  <div className="pt-2 border-t border-[#EADCE1]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89555] block">
                      Emergency Trigger / Plan B:
                    </span>
                    <p className="text-[#74616B] mt-0.5 leading-relaxed">{risk.contingencyAction}</p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#EADCE1] flex items-center justify-between">
                <button
                  onClick={() => handleToggleResolved(risk.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                    risk.isResolved
                      ? 'bg-[#F0F7F4] text-[#477D60] border-emerald-200'
                      : 'bg-white text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8] border-[#EADCE1]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{risk.isResolved ? 'Resolved' : 'Mark Addressed'}</span>
                </button>

                <button
                  onClick={() => handleDeleteRisk(risk.id)}
                  className="p-1.5 rounded-lg text-[#74616B] hover:text-[#B94D5A] hover:bg-[#FFF0F3] transition-colors"
                  aria-label="Delete risk"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#392832]/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-[#EADCE1] space-y-4">
            <h3 className="font-editorial text-base font-bold text-[#392832]">
              Add Operational Risk Scenario
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Scenario Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sudden Monsoon Rain during Lawn Ceremony"
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="weather">Weather</option>
                    <option value="vendor">Vendor</option>
                    <option value="budget">Budget</option>
                    <option value="logistics">Logistics</option>
                    <option value="compliance">Compliance</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Severity</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#74616B] mb-1">Probability</label>
                  <select
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] focus:outline-none focus:ring-2 focus:ring-[#B85F80]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Preventive Mitigation Action</label>
                <textarea
                  rows={2}
                  value={formData.mitigation}
                  onChange={(e) => setFormData({ ...formData, mitigation: e.target.value })}
                  placeholder="Pre-negotiate tent coverage with lawn venue, keep industrial fans ready..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#74616B] mb-1">Emergency Contingency Trigger (Plan B)</label>
                <textarea
                  rows={2}
                  value={formData.contingencyAction}
                  onChange={(e) => setFormData({ ...formData, contingencyAction: e.target.value })}
                  placeholder="Move dinner to adjacent air-conditioned banquet hall within 30 minutes..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EADCE1] bg-[#FBF5F6] text-sm text-[#392832] placeholder:text-[#998791] focus:outline-none focus:ring-2 focus:ring-[#B85F80] resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EADCE1]">
              <button
                type="button"
                onClick={() => setIsAddingRisk(false)}
                className="px-4 py-2 rounded-xl border border-[#EADCE1] bg-white text-xs font-semibold text-[#74616B] hover:text-[#392832] hover:bg-[#F8E1E8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRisk}
                disabled={!formData.title.trim()}
                className="px-5 py-2 rounded-xl bg-[#B85F80] hover:bg-[#984665] disabled:opacity-40 text-white text-xs font-bold shadow-xs active:scale-[0.98]"
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
