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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EEDCD7]">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#B89555] font-semibold">
            Aesthetics & Concepts
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight mt-0.5">
            Personalized Themes, Moodboards & Green Practices
          </h2>
          <p className="text-sm text-[#57534E] mt-0.5">
            Tailored suggestions calibrated for your budget, guest count ({plan.eventDetails.guestCount}), and regional atmosphere.
          </p>
        </div>

        <button
          onClick={onOpenRegenerate}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white text-[#FF6F61] hover:bg-[#FFF2EF] border border-[#EEDCD7] transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF6F61]" />
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
              className="p-5 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs flex flex-col justify-between hover:border-[#FF6F61]/50 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89555] block mb-0.5 font-mono">
                      Vibe: {concept.vibe}
                    </span>
                    <h3 className="font-editorial text-lg font-bold text-[#1C1917]">{concept.title}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      concept.budgetImpact === 'low'
                        ? 'bg-[#F0F7F4] text-[#477D60] border border-emerald-200'
                        : concept.budgetImpact === 'medium'
                        ? 'bg-[#FFF8ED] text-[#B89555] border border-[#EEDCD7]'
                        : 'bg-[#FFF8ED] text-[#A87531] border border-[#A87531]/30'
                    }`}
                  >
                    {concept.budgetImpact} Cost Impact
                  </span>
                </div>

                <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                  {concept.description}
                </p>

                {concept.culturalContext && (
                  <p className="text-xs text-[#1C1917] bg-[#FFF8ED] p-2.5 rounded-xl border border-[#EEDCD7] mb-4">
                    🏛️ <strong className="text-[#B89555]">Cultural Harmony:</strong> {concept.culturalContext}
                  </p>
                )}

                {/* Color Palette Chips */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#57534E] mb-1.5 font-mono">
                    Suggested Color Swatches:
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {concept.colorPalette.map((color, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FCF8F7] border border-[#EEDCD7] text-xs font-medium text-[#1C1917]"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-black/15 shadow-2xs"
                          style={{
                            backgroundColor: color.toLowerCase().replace(/[^a-z0-9#]/g, ''),
                          }}
                        />
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Adopt Button */}
              <div className="pt-3 border-t border-[#EEDCD7] flex justify-end">
                <button
                  onClick={() => handleAdoptIdea(concept)}
                  disabled={isAdopted}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isAdopted
                      ? 'bg-[#F0F7F4] text-[#477D60] border border-emerald-200 cursor-default'
                      : 'bg-[#FF6F61] hover:bg-[#E05345] text-white font-bold shadow-xs active:scale-[0.98]'
                  }`}
                >
                  {isAdopted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#477D60]" /> Adopted into Timeline
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-white" /> Adopt into Plan
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
        <div className="p-6 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-5 h-5 text-[#477D60]" />
            <h3 className="font-editorial text-base font-bold text-[#1C1917]">Sustainable & Green Recommendations</h3>
          </div>
          <p className="text-xs text-[#57534E] mb-4">
            Practical eco-friendly actions that lower environmental footprint without inflating budgets.
          </p>

          <div className="space-y-2.5">
            {plan.ideas.sustainabilitySuggestions.map((practice, index) => {
              const isAdopted = adoptedIdeas.has(`sust_${index}`);

              return (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-[#FCF8F7] border border-[#EEDCD7] flex items-start justify-between gap-3 hover:border-[#477D60]/50 transition-colors"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Leaf className="w-4 h-4 text-[#477D60] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#1C1917] leading-relaxed">{practice}</p>
                  </div>
                  <button
                    onClick={() => handleAdoptSustainability(practice, index)}
                    disabled={isAdopted}
                    className={`shrink-0 p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isAdopted
                        ? 'text-[#477D60] bg-[#F0F7F4]'
                        : 'border border-[#EEDCD7] text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3]'
                    }`}
                    title={isAdopted ? 'Task added' : 'Add to task schedule'}
                  >
                    {isAdopted ? <CheckCircle2 className="w-4 h-4 text-[#477D60]" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cost-Saving Alternatives */}
        <div className="p-6 rounded-3xl bg-white border border-[#EEDCD7] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-[#B89555]" />
            <h3 className="font-editorial text-base font-bold text-[#1C1917]">Creative Cost-Saving Adjustments</h3>
          </div>
          <p className="text-xs text-[#57534E] mb-4">
            Smart ways to optimize expenses without diminishing guest hospitality or aesthetic quality.
          </p>

          <div className="space-y-2.5">
            {plan.ideas.costSavingAlternatives.map((alt, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-[#FCF8F7] border border-[#EEDCD7] flex items-start gap-2.5 hover:border-[#B89555]/50 transition-colors"
              >
                <DollarSign className="w-4 h-4 text-[#B89555] mt-0.5 shrink-0" />
                <p className="text-xs text-[#1C1917] leading-relaxed">{alt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
