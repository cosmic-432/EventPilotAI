import React from 'react';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  CalendarCheck2,
  PieChart,
  ShieldAlert,
  Users2,
} from 'lucide-react';

interface WelcomeHeroProps {
  onQuickGenerate: (promptText: string) => void;
  onOpenWizard: () => void;
  isLoading: boolean;
}

export const WelcomeHero: React.FC<WelcomeHeroProps> = ({
  onQuickGenerate,
  onOpenWizard,
  isLoading,
}) => {
  const [promptText, setPromptText] = React.useState('');

  const PRESETS = [
    {
      title: 'Pune Heritage Wedding',
      category: 'Wedding',
      budget: '₹8,00,000',
      guests: '250 Guests',
      timeline: '60 Days',
      text: 'I want to organize a wedding for 250 guests in Pune, with a budget of ₹8,00,000, in 60 days. I prefer an elegant traditional theme, vegetarian catering, and an outdoor lawn venue with evening candle lighting.',
    },
    {
      title: 'Campus Tech & Cultural Festival',
      category: 'Festival',
      budget: '₹5,00,000',
      guests: '1,200 Students',
      timeline: '45 Days',
      text: 'Organize a 2-day College Tech & Cultural Fest for 1,200 students in Bangalore with ₹5,00,000 budget in 45 days. Include hackathon facilities, stage audio/DJ, guest speaker honorarium, and sponsor branding.',
    },
    {
      title: 'Golden 50th Anniversary Gala',
      category: 'Anniversary',
      budget: '₹3,50,000',
      guests: '80 Guests',
      timeline: '30 Days',
      text: 'Golden 50th Anniversary celebration for 80 close family and friends in Mumbai. Budget ₹3,50,000 in 30 days. Nostalgic retro golden vibe, indoor AC banquet, live acoustic violin/vocals, and customized photo memory wall.',
    },
    {
      title: 'Charity Auction & Benefactor Gala',
      category: 'Fundraiser',
      budget: '₹6,00,000',
      guests: '150 Donors',
      timeline: '40 Days',
      text: 'High-impact Charity Auction & Gala dinner for 150 benefactors in Delhi with ₹6,00,000 budget. Need AV projection for keynote video, silent auction display, plated dinner, and tax deduction receipts station.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onQuickGenerate(promptText.trim());
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#EEDCD7] text-[#FF6F61] text-xs font-semibold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6F61]" />
          <span>Boutique AI Event Architecture</span>
        </div>

        <h1 className="font-editorial text-4xl sm:text-6xl font-bold text-[#1C1917] tracking-tight leading-tight">
          From vision to unforgettable celebration <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6F61] via-[#FF9A8B] to-[#FF6F61]">
            with flawless budget & timeline.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#57534E] max-w-2xl mx-auto leading-relaxed">
          EventPilot AI builds realistic, date-aware plans with exact currency calculations,
          categorized vendor checklists, and contingency recommendations.
        </p>
      </div>

      {/* Main Input Box (Light Velvet Rose Card) */}
      <div className="mt-8 bg-white rounded-3xl p-4 sm:p-6 shadow-xs border border-[#EEDCD7] transition-all">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="naturalPrompt" className="block text-xs font-bold uppercase tracking-wider text-[#57534E]">
            Describe your event in plain language:
          </label>
          <div className="relative">
            <textarea
              id="naturalPrompt"
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. I want to organize a wedding for 250 guests in Pune, with a budget of ₹8,00,000, in 60 days. Traditional theme, vegetarian catering, velvet rose florals..."
              className="w-full rounded-2xl border border-[#EEDCD7] bg-[#FCF8F7] p-4 text-sm sm:text-base text-[#1C1917] placeholder:text-[#8A827D] focus:outline-none focus:ring-2 focus:ring-[#FF6F61] focus:border-transparent resize-none leading-relaxed transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#EEDCD7]">
            <button
              type="button"
              onClick={onOpenWizard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#EEDCD7] bg-white hover:bg-[#FDE8E3] text-[#1C1917] text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F61] shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#57534E]" />
              <span>Use Guided Wizard Instead</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !promptText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F61] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Complete Master Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Master Plan</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preset Cards */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
            Or quick-launch with realistic benchmarks:
          </p>
          <span className="text-[11px] text-[#FF6F61] font-medium">Click any card to load</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setPromptText(preset.text);
              }}
              className="group text-left p-4 rounded-2xl bg-white border border-[#EEDCD7] hover:border-[#FF6F61] hover:bg-[#FFF2EF]/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F61] shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-editorial text-base font-bold text-[#1C1917] group-hover:text-[#FF6F61] transition-colors">
                  {preset.title}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#FFF8ED] text-[#B89555] border border-[#EEDCD7]">
                  {preset.category}
                </span>
              </div>
              <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed mb-3">
                {preset.text}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#57534E] font-mono">
                <span>💰 {preset.budget}</span>
                <span>👥 {preset.guests}</span>
                <span>⏳ {preset.timeline}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trust & Architecture Pillars */}
      <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-3.5 rounded-2xl bg-white border border-[#EEDCD7] shadow-2xs">
          <PieChart className="w-5 h-5 mx-auto text-[#B89555] mb-1.5" />
          <h4 className="text-xs font-bold text-[#1C1917]">Precision Budgeting</h4>
          <p className="text-[11px] text-[#57534E] mt-0.5">Integer minor math in rupees with zero rounding errors</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-[#EEDCD7] shadow-2xs">
          <CalendarCheck2 className="w-5 h-5 mx-auto text-[#FF6F61] mb-1.5" />
          <h4 className="text-xs font-bold text-[#1C1917]">Date-Aware Milestones</h4>
          <p className="text-[11px] text-[#57534E] mt-0.5">Tasks scheduled backward from your exact event date</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-[#EEDCD7] shadow-2xs">
          <Users2 className="w-5 h-5 mx-auto text-[#477D60] mb-1.5" />
          <h4 className="text-xs font-bold text-[#1C1917]">Vendor Guidance</h4>
          <p className="text-[11px] text-[#57534E] mt-0.5">Selection checklists, booking target dates & quote tracking</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-white border border-[#EEDCD7] shadow-2xs">
          <ShieldAlert className="w-5 h-5 mx-auto text-[#A87531] mb-1.5" />
          <h4 className="text-xs font-bold text-[#1C1917]">Risk & Contingency</h4>
          <p className="text-[11px] text-[#57534E] mt-0.5">Dedicated reserve fund and automated weather alerts</p>
        </div>
      </div>
    </div>
  );
};
