import React, { useState } from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FolderHeart,
  History,
  Sparkles,
  Wallet,
  CheckSquare,
  Calendar,
  Users,
  ShieldAlert,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sliders,
  Check,
} from 'lucide-react';
import { PlanIndexEntry } from '../storage/eventRepository';
import { EventPlan } from '../types/event';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewEvent: () => void;
  onOpenHelp: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentPlan: EventPlan | null;
  savedPlans: PlanIndexEntry[];
  onSelectPlan: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onNewEvent,
  onOpenHelp,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  currentPlan,
  savedPlans,
  onSelectPlan,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEventSwitcher, setShowEventSwitcher] = useState(false);

  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      tooltip: 'Dashboard & Event Summary',
    },
    {
      id: 'my_events',
      label: 'My Events',
      icon: FolderHeart,
      badge: savedPlans.length > 0 ? savedPlans.length : undefined,
      tooltip: 'View all saved studio events',
    },
    {
      id: 'history',
      label: 'Planning History',
      icon: History,
      tooltip: 'Every celebration, all in one place',
    },
    {
      id: 'ideas',
      label: 'Inspiration',
      icon: Sparkles,
      tooltip: 'AI themes, decor concepts & color palettes',
    },
    {
      id: 'budget',
      label: 'Budget Planner',
      icon: Wallet,
      tooltip: 'Budget allocation & expense tracker',
    },
    {
      id: 'vendors',
      label: 'Vendor Checklist',
      icon: CheckSquare,
      tooltip: 'Vendor scouting, quotes & contracts',
    },
    {
      id: 'timeline',
      label: 'Preparation Timeline',
      icon: Calendar,
      tooltip: 'Milestones & date-aware schedule',
    },
    {
      id: 'guests',
      label: 'Guest & Catering',
      icon: Users,
      tooltip: 'Headcount & dietary accommodations',
    },
    {
      id: 'risks',
      label: 'Contingency & Risks',
      icon: ShieldAlert,
      tooltip: 'Operational risks & protocols',
    },
  ];

  const handleNavClick = (id: string) => {
    onTabChange(id);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu backdrop"
          onClick={onCloseMobile}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter') onCloseMobile();
          }}
          className="fixed inset-0 z-40 bg-[#1C1917]/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container: Permanently visible on desktop */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-[#F8EFEB] border-r border-[#EEDCD7] flex flex-col justify-between transition-all duration-300 ease-in-out select-none shadow-xs ${
          isMobileOpen
            ? 'translate-x-0 w-72 shadow-xl'
            : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Top: Brand Section & Collapse Toggle */}
        <div className="p-4 border-b border-[#EEDCD7] flex items-center justify-between">
          <div
            onClick={() => handleNavClick('dashboard')}
            className={`flex items-center gap-3 cursor-pointer group ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            {/* Elegant Coral & Peach Studio Monogram */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6F61] via-[#FF9A8B] to-[#FF6F61] p-[1.5px] shrink-0 shadow-xs transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span className="font-editorial text-lg font-bold text-[#FF6F61] tracking-tight">EP</span>
              </div>
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-editorial text-lg font-bold text-[#1C1917] tracking-tight truncate">
                    EventPilot
                  </h1>
                  <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-md bg-[#FFF2EF] text-[#FF6F61] border border-[#FF9A8B] shrink-0">
                    AI
                  </span>
                </div>
                <p className="text-[11px] text-[#57534E] tracking-wide truncate">
                  Your Event Planning Studio
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6F61]"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Action Button: Prominent + New Event (Primary Rose #FF6F61 with white text) */}
        <div className="px-3 pt-3">
          <button
            onClick={() => {
              onNewEvent();
              if (isMobileOpen) onCloseMobile();
            }}
            className={`w-full py-2.5 px-3 rounded-xl bg-[#FF6F61] hover:bg-[#E05345] text-white font-semibold text-xs transition-all duration-150 shadow-sm flex items-center justify-center gap-2 group active:scale-[0.98] ${
              isCollapsed ? 'px-0' : ''
            }`}
            title="Start fresh event planning wizard"
          >
            <PlusCircle className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-90 duration-200" />
            {!isCollapsed && <span className="tracking-wide">+ New Event</span>}
          </button>
        </div>

        {/* Active Event Quick Selector (when not collapsed and active plan exists) */}
        {!isCollapsed && currentPlan && (
          <div className="px-3 pt-3 relative">
            <div
              onClick={() => setShowEventSwitcher(!showEventSwitcher)}
              className="p-2.5 rounded-xl bg-white border border-[#EEDCD7] hover:border-[#FF6F61]/50 hover:bg-[#FFF2EF]/40 cursor-pointer transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8A827D]">
                  Active Studio Event
                </span>
                <span className="w-2 h-2 rounded-full bg-[#477D60]" />
              </div>
              <p className="text-xs font-bold text-[#1C1917] truncate mt-0.5">
                {currentPlan.eventDetails.name}
              </p>
              <p className="text-[11px] text-[#57534E] capitalize truncate">
                {currentPlan.eventDetails.category.replace('_', ' ')} • {currentPlan.eventDetails.location}
              </p>
            </div>

            {/* Switcher Dropdown */}
            {showEventSwitcher && (
              <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white border border-[#EEDCD7] rounded-xl shadow-xl p-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 text-[10px] font-bold text-[#8A827D] uppercase">
                  Switch Plan
                </div>
                {savedPlans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPlan(p.id);
                      setShowEventSwitcher(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      p.id === currentPlan.id
                        ? 'bg-[#FFF2EF] text-[#E05345] font-semibold'
                        : 'text-[#57534E] hover:bg-[#FDE8E3] hover:text-[#1C1917]'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === currentPlan.id && <Check className="w-3.5 h-3.5 text-[#FF6F61] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Middle: Navigation Links */}
        <div className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.tooltip : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#FFF2EF] text-[#E05345] font-semibold border-l-3 border-[#FF6F61] shadow-2xs'
                    : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#FF6F61]' : 'text-[#57534E] group-hover:text-[#1C1917]'
                  }`}
                />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white text-[#B89555] border border-[#EEDCD7]">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip on collapsed desktop view */}
                {isCollapsed && (
                  <div className="hidden group-hover:block absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#1C1917] text-white text-xs font-normal shadow-lg z-50 pointer-events-none whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Settings, Help & Support, User Profile */}
        <div className="p-3 border-t border-[#EEDCD7] space-y-1 bg-[#F8EFEB]">
          {/* Settings Nav Item */}
          <button
            onClick={() => handleNavClick('settings')}
            title={isCollapsed ? 'Studio Settings' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
              activeTab === 'settings'
                ? 'bg-[#FFF2EF] text-[#E05345] font-semibold border-l-3 border-[#FF6F61]'
                : 'text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3]'
            } ${isCollapsed ? 'justify-center px-0' : ''}`}
          >
            <Settings className="w-4 h-4 shrink-0 text-[#57534E] group-hover:text-[#1C1917]" />
            {!isCollapsed && <span className="truncate flex-1 text-left">Settings</span>}
            {isCollapsed && (
              <div className="hidden group-hover:block absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#1C1917] text-white text-xs font-normal shadow-lg z-50 pointer-events-none whitespace-nowrap">
                Settings
              </div>
            )}
          </button>

          {/* Help & Support Item */}
          <button
            onClick={onOpenHelp}
            title={isCollapsed ? 'Help & Support' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#57534E] hover:text-[#1C1917] hover:bg-[#FDE8E3] transition-all group relative ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0 text-[#57534E] group-hover:text-[#B89555]" />
            {!isCollapsed && <span className="truncate flex-1 text-left">Help & Support</span>}
            {isCollapsed && (
              <div className="hidden group-hover:block absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#1C1917] text-white text-xs font-normal shadow-lg z-50 pointer-events-none whitespace-nowrap">
                Help & Support
              </div>
            )}
          </button>

          {/* User Profile Area */}
          <div className="pt-2 relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`p-2 rounded-xl bg-white border border-[#EEDCD7] hover:border-[#FF6F61]/50 hover:bg-[#FFF2EF]/40 cursor-pointer flex items-center gap-2.5 transition-colors shadow-2xs ${
                isCollapsed ? 'justify-center px-1' : ''
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF6F61] to-[#FF9A8B] p-[1px] shrink-0 shadow-2xs">
                <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center font-bold text-[10px] text-[#FF6F61]">
                  OJ
                </div>
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1C1917] truncate">Om Jadhav</p>
                  <p className="text-[10px] text-[#57534E] truncate">Studio Director</p>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute left-0 bottom-full mb-2 w-56 bg-white border border-[#EEDCD7] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-[#EEDCD7] mb-1">
                  <p className="text-xs font-bold text-[#1C1917]">Om Jadhav</p>
                  <p className="text-[11px] text-[#57534E] truncate">432omjadhav@gmail.com</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-[#FFF2EF] text-[#B89555] border border-[#EEDCD7] font-semibold">
                    Studio Director Account
                  </span>
                </div>

                <button
                  onClick={() => {
                    handleNavClick('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#57534E] hover:bg-[#FDE8E3] hover:text-[#1C1917] flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" /> Studio Preferences
                </button>

                <button
                  onClick={() => {
                    onOpenHelp();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#57534E] hover:bg-[#FDE8E3] hover:text-[#1C1917] flex items-center gap-2"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Documentation & Shortcuts
                </button>

                <div className="pt-1 mt-1 border-t border-[#EEDCD7]">
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#57534E] hover:bg-[#FDE8E3] hover:text-[#1C1917] flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-[#B94D5A]" /> Close Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
