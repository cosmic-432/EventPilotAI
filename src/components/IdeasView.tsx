import React from 'react';
import {
  Sparkles,
  Leaf,
  DollarSign,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { EventPlan, ThemeIdea } from '../types/event';
import { generateId } from '../utils/validation';

interface IdeasViewProps {
  plan: EventPlan;
  onUpdatePlan: (updatedPlan: EventPlan) => void;
  onOpenRegenerate: () => void;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  plan,
  onUpdatePlan,
  onOpenRegenerate,
}) => {
  const [adoptedIdeas, setAdoptedIdeas] = React.useState<Set<string>>(new Set());

  const handleAdoptIdea = (idea: ThemeIdea) => {
    // Add as a task in timeline
    const newTask = {
      id: generateId('tsk_idea'),
      title: `Implement Theme Element: ${idea.title}`,
      description: `${idea.description} (Vibe: ${idea.vibe})`,
      category: 'Decor & Styling',
      dueDate: plan.eventDetails.targetDate,
      daysBeforeEvent: 10,
      priority: 'high' as const,
      status: 'todo' as const,
      dependencies: [],
      notes: `Adopted from AI Idea board. Palette: ${idea.colorPalette.join(', ')}`,
      isAiGenerated: true,
    };

    onUpdatePlan({
      ...plan,
      timeline: {
        tasks: [newTask, ...plan.timeline.tasks],
      },
    });

    setAdoptedIdeas((prev) => new Set(prev).add(idea.id));
  };

  const handleAdoptSustainability = (text: string, index: number) => {
    const key = `sust_${index}`;
    const newTask = {
      id: generateId('tsk_sust'),
      title: `Sustainable Action: ${text.substring(0, 45)}...`,
      description: text,
      category: 'Logistics',
      dueDate: plan.eventDetails.targetDate,
      daysBeforeEvent: 7,
      priority: 'medium' as const,
      status: 'todo' as const,
      dependencies: [],
      notes: 'Adopted from Sustainability suggestions',
      isAiGenerated: true,
    };

    onUpdatePlan({
      ...plan,
      timeline: {
        tasks: [newTask, ...plan.timeline.tasks],
      },
    });

    setAdoptedIdeas((prev) => new Set(prev).add(key));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#F3EBDD] tracking-tight">
            Personalized Themes, Aesthetics & Green Practices
          </h2>
          <p className="text-xs text-[#A5A3AD] mt-0.5">
            Tailored suggestions calibrated for your budget, guest count ({plan.eventDetails.guestCount}), and regional vibe.
          </p>
        </div>

        <button
          onClick={onOpenRegenerate}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#15151D] text-[#C8A96E] hover:bg-[#1D1D27] border border-[#30303A] transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
          <span>Regenerate New Concepts</span>
        </button>
      </div>

      {/* Theme Concepts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.ideas.themeConcepts.map((concept) => {
          const isAdopted = adoptedIdeas.has(concept.id);

          return (
            <div
              key={concept.id}
              className="p-5 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs flex flex-col justify-between hover:border-[#C8A96E]/50 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A96E] block mb-0.5">
                      Vibe: {concept.vibe}
                    </span>
                    <h3 className="text-base font-bold text-[#F3EBDD]">{concept.title}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      concept.budgetImpact === 'low'
                        ? 'bg-[rgba(130,152,121,0.15)] text-[#829879] border border-[#829879]/30'
                        : concept.budgetImpact === 'medium'
                        ? 'bg-[rgba(200,169,110,0.15)] text-[#C8A96E] border border-[#C8A96E]/30'
                        : 'bg-[rgba(228,182,106,0.15)] text-[#E4B66A] border border-[#E4B66A]/30'
                    }`}
                  >
                    {concept.budgetImpact} Cost Impact
                  </span>
                </div>

                <p className="text-xs text-[#A5A3AD] leading-relaxed mb-4">
                  {concept.description}
                </p>

                {concept.culturalContext && (
                  <p className="text-xs text-[#F3EBDD] bg-[#1D1D27] p-2.5 rounded-xl border border-[#30303A] mb-4">
                    🏛️ <strong className="text-[#C8A96E]">Cultural Harmony:</strong> {concept.culturalContext}
                  </p>
                )}

                {/* Color Palette Chips */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#A5A3AD] mb-1.5">
                    Suggested Color Swatches:
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {concept.colorPalette.map((color, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1D1D27] border border-[#30303A] text-xs font-medium text-[#F3EBDD]"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-[#30303A] shadow-2xs"
                          style={{
                            backgroundColor: color.toLowerCase().replace(/[^a-z]/g, ''),
                          }}
                        />
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Adopt Button */}
              <div className="pt-3 border-t border-[#30303A] flex justify-end">
                <button
                  onClick={() => handleAdoptIdea(concept)}
                  disabled={isAdopted}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isAdopted
                      ? 'bg-[#1D1D27] text-[#829879] border border-[#829879]/40 cursor-default'
                      : 'bg-[#C8A96E] hover:bg-[#DFC490] text-[#0B0B10] font-bold shadow-xs'
                  }`}
                >
                  {isAdopted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#829879]" /> Adopted into Timeline
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-[#0B0B10]" /> Adopt into Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Grid: Sustainability & Cost-Saving Hacks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sustainable & Eco-Friendly Practices */}
        <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-[#829879]" />
            <h3 className="text-sm font-bold text-[#F3EBDD]">Sustainable & Zero-Waste Event Recommendations</h3>
          </div>
          <p className="text-xs text-[#A5A3AD] mb-4">
            Practical eco-friendly actions that lower environmental footprint without inflating budgets.
          </p>

          <div className="space-y-2.5">
            {plan.ideas.sustainabilitySuggestions.map((practice, index) => {
              const isAdopted = adoptedIdeas.has(`sust_${index}`);

              return (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-[#1D1D27] border border-[#30303A] flex items-start justify-between gap-3 hover:border-[#829879]/50 transition-colors"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Leaf className="w-4 h-4 text-[#829879] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#F3EBDD] leading-relaxed">{practice}</p>
                  </div>
                  <button
                    onClick={() => handleAdoptSustainability(practice, index)}
                    disabled={isAdopted}
                    className={`shrink-0 p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isAdopted
                        ? 'text-[#829879] bg-[#15151D]'
                        : 'border border-[#30303A] text-[#A5A3AD] hover:text-[#F3EBDD] hover:bg-[#252533]'
                    }`}
                    title={isAdopted ? 'Task added' : 'Add to task schedule'}
                  >
                    {isAdopted ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost-Saving Alternatives */}
        <div className="p-6 rounded-3xl bg-[#15151D] border border-[#30303A] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-[#C8A96E]" />
            <h3 className="text-sm font-bold text-[#F3EBDD]">Creative Cost-Saving Adjustments</h3>
          </div>
          <p className="text-xs text-[#A5A3AD] mb-4">
            Smart ways to optimize expenses without diminishing guest enjoyment or aesthetic quality.
          </p>

          <div className="space-y-2.5">
            {plan.ideas.costSavingAlternatives.map((alt, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-[#1D1D27] border border-[#30303A] flex items-start gap-2.5 hover:border-[#C8A96E]/50 transition-colors"
              >
                <DollarSign className="w-4 h-4 text-[#C8A96E] mt-0.5 shrink-0" />
                <p className="text-xs text-[#F3EBDD] leading-relaxed">{alt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
