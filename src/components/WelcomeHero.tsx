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
      title: 'Pune Wedding (Benchmark)',
      category: 'Wedding',
      budget: '₹8,00,000',
      guests: '250 Guests',
      timeline: '60 Days',
      text: 'I want to organize a wedding for 250 guests in Pune, with a budget of ₹8,00,000, in 60 days. I prefer an elegant traditional theme, vegetarian catering, and an outdoor venue if possible.',
    },
    {
      title: 'College Tech & Cultural Festival',
      category: 'College Festival',
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
      title: 'Non-Profit Charity Gala & Fundraiser',
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15151D] border border-[#30303A] text-[#C8A96E] text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C8A96E]" />
          <span>GenAI-Powered Event Engineering</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#F3EBDD] tracking-tight leading-tight">
          From idea to organized event <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C8A96E] via-[#DFC490] to-[#E4B66A]">
            with clear budget & timeline.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-[#A5A3AD] max-w-2xl mx-auto leading-relaxed">
          EventPilot AI builds realistic, date-aware plans with exact rupee/currency calculations,
          categorized vendor checklists, and contingency recommendations.
        </p>
      </div>

      {/* Main Input Box (Elevated Surface) */}
      <div className="mt-8 bg-[#15151D] rounded-3xl p-4 sm:p-6 shadow-2xl border border-[#30303A] transition-all">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label htmlFor="naturalPrompt" className="block text-xs font-bold uppercase tracking-wider text-[#A5A3AD]">
            Describe your event in plain language:
          </label>
          <div className="relative">
            <textarea
              id="naturalPrompt"
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. I want to organize a wedding for 250 guests in Pune, with a budget of ₹8,00,000, in 60 days. Traditional theme, vegetarian catering..."
              className="w-full rounded-2xl border border-[#30303A] bg-[#1D1D27] p-4 text-sm sm:text-base text-[#F3EBDD] placeholder:text-[#72707B] focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent resize-none leading-relaxed transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#30303A]">
            <button
              type="button"
              onClick={onOpenWizard}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#30303A] bg-[#1D1D27] hover:bg-[#252533] text-[#F3EBDD] text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#A5A3AD]" />
              <span>Use Guided Wizard Instead</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !promptText.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#C8A96E] hover:bg-[#DFC490] disabled:opacity-40 disabled:cursor-not-allowed text-[#0B0B10] text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B10]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0B0B10]/30 border-t-[#0B0B10] rounded-full animate-spin" />
                  <span>Generating Complete Master Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#0B0B10]" />
                  <span>Generate Master Plan</span>
                  <ArrowRight className="w-4 h-4 text-[#0B0B10]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Preset Cards */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#A5A3AD]">
            Or quick-launch with realistic benchmarks:
          </p>
          <span className="text-[11px] text-[#C8A96E] font-medium">Click any card to load</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setPromptText(preset.text);
              }}
              className="group text-left p-4 rounded-2xl bg-[#15151D] border border-[#30303A] hover:border-[#C8A96E] hover:bg-[#1D1D27] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96E]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#F3EBDD] group-hover:text-[#C8A96E] transition-colors">
                  {preset.title}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1D1D27] text-[#C8A96E] border border-[#30303A]">
                  {preset.category}
                </span>
              </div>
              <p className="text-xs text-[#A5A3AD] line-clamp-2 leading-relaxed mb-3">
                {preset.text}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#A5A3AD] font-mono">
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
        <div className="p-3.5 rounded-2xl bg-[#15151D] border border-[#30303A]">
          <PieChart className="w-5 h-5 mx-auto text-[#C8A96E] mb-1.5" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Precision Budgeting</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">Integer minor math in rupees with zero rounding errors</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#15151D] border border-[#30303A]">
          <CalendarCheck2 className="w-5 h-5 mx-auto text-[#C8A96E] mb-1.5" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Date-Aware Milestones</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">Tasks scheduled backward from your exact event date</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#15151D] border border-[#30303A]">
          <Users2 className="w-5 h-5 mx-auto text-[#829879] mb-1.5" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Vendor Guidance</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">Selection checklists, booking target dates & quote tracking</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-[#15151D] border border-[#30303A]">
          <ShieldAlert className="w-5 h-5 mx-auto text-[#E4B66A] mb-1.5" />
          <h4 className="text-xs font-bold text-[#F3EBDD]">Risk & Contingency</h4>
          <p className="text-[11px] text-[#A5A3AD] mt-0.5">Dedicated reserve fund and automated weather alerts</p>
        </div>
      </div>
    </div>
  );
};
