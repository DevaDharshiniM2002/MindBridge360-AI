import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Activity,
  Heart,
  Bot,
  GraduationCap,
  Users,
  BarChart3,
  School,
  LifeBuoy,
  X,
  ChevronRight,
  Sparkles,
  MessageSquareHeart,
  Mic,
} from 'lucide-react';
import { AppLanguage } from '../types';

export type MindMitraTabId =
  | 'home'
  | 'checkin'
  | 'relax'
  | 'talk-mithra'
  | 'counselling-prep'
  | 'community'
  | 'my-wellness'
  | 'parent-bridge'
  | 'campus-insights'
  | 'professional-support'
  | 'landing';

export interface NavSection {
  id: MindMitraTabId;
  number: number;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  description: string;
  tag?: string;
}

export const MINDMITRA_SECTIONS: NavSection[] = [
  {
    id: 'landing',
    number: 0,
    label: 'About & Vision',
    shortLabel: 'Overview',
    icon: Sparkles,
    emoji: '✨',
    description: 'Mission, vision, platform guide, and the 4 co-founders (Deva, Anusha, Astra, Priya)',
    tag: '4 Founders',
  },
  {
    id: 'home',
    number: 1,
    label: 'Home',
    shortLabel: 'Home',
    icon: Home,
    emoji: '🏠',
    description: "Today's pulse, forecast radar, vital metrics, and personalized care actions",
  },
  {
    id: 'checkin',
    number: 2,
    label: 'Quick Pulse',
    shortLabel: 'Pulse',
    icon: Activity,
    emoji: '🧠',
    description: '30-second quiet check-in for mood, sleep, and energy reflection',
  },
  {
    id: 'relax',
    number: 3,
    label: 'Mind Relax',
    shortLabel: 'Relax',
    icon: Heart,
    emoji: '🧘',
    description: '4-7-8 breathing, kinetic zen sand, monsoon soundscapes, and sensory bubbles',
  },
  {
    id: 'talk-mithra',
    number: 4,
    label: 'Talk to Mithra',
    shortLabel: 'Mithra',
    icon: Bot,
    emoji: '🤖',
    description: 'Empathetic AI listener with voice narration, Tamil/Tanglish, and private chat',
    tag: 'AI Ally',
  },
  {
    id: 'counselling-prep',
    number: 5,
    label: 'Counselling Preparation',
    shortLabel: 'Counselling',
    icon: GraduationCap,
    emoji: '🎓',
    description: 'Session thought clarifier notes, confidential booking, and 4-week follow-up',
    tag: 'Free',
  },
  {
    id: 'parent-bridge',
    number: 6,
    label: 'Parent Bridge',
    shortLabel: 'Parent Bridge',
    icon: MessageSquareHeart,
    emoji: '👨‍👩‍👧',
    description: 'Explain difficult college situations respectfully; practice conversations with Mithra',
    tag: 'Bridge',
  },
  {
    id: 'community',
    number: 7,
    label: 'Anonymous Community',
    shortLabel: 'Community',
    icon: Users,
    emoji: '👥',
    description: 'Moderated peer support rooms for exam stress, placement anxiety, and hostel life',
  },
  {
    id: 'my-wellness',
    number: 8,
    label: 'My Wellness',
    shortLabel: 'Wellness',
    icon: BarChart3,
    emoji: '📊',
    description: 'Personal coping profile, intervention efficacy rankings, and check-in timeline',
  },
  {
    id: 'campus-insights',
    number: 9,
    label: 'Admin Command & Student Registry',
    shortLabel: 'Admin Radar',
    icon: School,
    emoji: '🏛️',
    description: 'Real-time student ID registry (AI & DS Final Year), app usage effectiveness, adaptive alternative sessions, and NAAC/NBA accreditation reports',
    tag: 'Admin Suite',
  },
  {
    id: 'professional-support',
    number: 10,
    label: 'Professional Support',
    shortLabel: 'Support',
    icon: LifeBuoy,
    emoji: '🆘',
    description: '24/7 Tele-MANAS, NIMHANS helplines, campus health desk, and crisis escalation',
    tag: '24/7',
  },
];


interface NavigationBarProps {
  activeTab: MindMitraTabId;
  onSelectTab: (tabId: MindMitraTabId) => void;
  language: AppLanguage;
  isDrawerOpen: boolean;
  onToggleDrawer: (open: boolean) => void;
}

export const TopSectionTabStrip: React.FC<{
  activeTab: MindMitraTabId;
  onSelectTab: (tabId: MindMitraTabId) => void;
}> = ({ activeTab, onSelectTab }) => {
  return (
    <div className="w-full bg-white/90 dark:bg-[#161E20]/90 border-b border-[#E8E4D9] dark:border-[#223034] px-2 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 select-none">
      {MINDMITRA_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeTab === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectTab(sec.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              isActive
                ? 'bg-[#4A8B8D] text-white shadow-2xs font-bold'
                : 'bg-[#F0EDE4]/60 dark:bg-[#253235]/60 text-[#7A756D] dark:text-[#9BA3AF] hover:text-[#2D2D2B] dark:hover:text-white hover:bg-[#E8E4D9]'
            }`}
          >
            <span>{sec.emoji}</span>
            <span>{sec.number}. {sec.shortLabel}</span>
            {sec.tag && !isActive && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold">
                {sec.tag}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const AllSectionsDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  activeTab: MindMitraTabId;
  onSelectTab: (tabId: MindMitraTabId) => void;
  onOpenJudgeFeedback?: () => void;
}> = ({ isOpen, onClose, activeTab, onSelectTab, onOpenJudgeFeedback }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#161E20] w-full max-w-xl rounded-3xl border border-[#E8E4D9] dark:border-[#223034] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E4D9] dark:border-[#223034] flex items-center justify-between bg-[#F9F7F2] dark:bg-[#1A2326]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧭</span>
              <h3 className="font-serif font-bold text-lg text-[#2D2D2B] dark:text-[#F3F6F8]">
                MindBridge 360 Sections (10)
              </h3>
            </div>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              Understand. Relax. Talk. Get Support.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-[#253235] border border-[#E8E4D9] dark:border-[#2F3D42] flex items-center justify-center text-[#7A756D] hover:text-[#2D2D2B] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-Time Judge Feedback Card Highlight */}
        {onOpenJudgeFeedback && (
          <div className="px-3 pt-3 sm:px-4 sm:pt-4 shrink-0">
            <button
              onClick={() => {
                onClose();
                onOpenJudgeFeedback();
              }}
              className="w-full p-3 rounded-2xl border border-amber-300 dark:border-amber-700/80 bg-linear-to-r from-amber-50 via-orange-50/50 to-amber-100/30 dark:from-amber-950/40 dark:to-orange-950/20 text-left flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
                  <span>⭐</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                      Live Judge & Community Ratings
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold uppercase animate-pulse">
                      Real-Time DB
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                    Rate MindBridge 360, submit evaluator feedback & view live Firestore stream
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}

        {/* 10 Sections List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2">
          {MINDMITRA_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  onSelectTab(sec.id);
                  onClose();
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#4A8B8D] bg-teal-50/70 dark:bg-teal-950/40 shadow-xs'
                    : 'border-[#E8E4D9] dark:border-[#2F3D42] bg-[#F9F7F2]/60 dark:bg-[#1C2527]/60 hover:bg-[#F0EDE4] dark:hover:bg-[#253235]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                      isActive
                        ? 'bg-[#4A8B8D] text-white'
                        : 'bg-white dark:bg-[#253235] border border-[#E8E4D9] dark:border-[#2F3D42]'
                    }`}
                  >
                    <span>{sec.emoji}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#7A756D] dark:text-[#9BA3AF]">
                        0{sec.number}.
                      </span>
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isActive ? 'text-[#4A8B8D] dark:text-[#63C1C4]' : 'text-[#2D2D2B] dark:text-[#F3F6F8]'
                        }`}
                      >
                        {sec.label}
                      </h4>
                      {sec.tag && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 font-bold uppercase">
                          {sec.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] mt-0.5 line-clamp-1">
                      {sec.description}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-[#4A8B8D] translate-x-0.5' : 'text-[#7A756D]'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
