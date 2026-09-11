import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  PhoneCall,
  UserCheck,
  Sparkles,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface SmartEscalationBannerProps {
  onOpenCounsellorBooking: () => void;
  onOpenCrisisBar: () => void;
}

export const SmartEscalationBanner: React.FC<SmartEscalationBannerProps> = ({
  onOpenCounsellorBooking,
  onOpenCrisisBar,
}) => {
  return (
    <div className="space-y-4" id="smart-human-escalation-section">
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-indigo-500/20 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 text-sm font-bold">
              🤝
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-300">
              Innovation #7 • Smart Human Escalation Protocol
            </span>
          </div>

          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-900/60 text-indigo-200 border border-indigo-400/30">
            Responsible AI Architecture
          </span>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-bold text-white">
            AI When You Need a Moment. Real Humans When You Need Care.
          </h3>
          <p className="text-xs md:text-sm text-indigo-100/80 mt-1.5 leading-relaxed max-w-2xl">
            MindMitra bridges non-clinical micro-relief directly to university wellness counsellors and 24x7 crisis hotlines with zero friction and 100% student privacy.
          </p>
        </div>

        {/* 4-Tier Transparent Escalation Ladder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tier 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Tier 1 • Baseline
            </span>
            <h4 className="text-sm font-bold text-white">Self-Care & Pulse</h4>
            <p className="text-xs text-slate-300">
              Voluntary daily check-ins, sleep tracking, and breathing pacers.
            </p>
          </div>

          {/* Tier 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
              Tier 2 • Mild/Mod
            </span>
            <h4 className="text-sm font-bold text-white">AI Companion & 60s Moment</h4>
            <p className="text-xs text-slate-300">
              Mithra chat, sensory grounding, stress forecasts.
            </p>
          </div>

          {/* Tier 3 */}
          <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-left space-y-1.5 ring-1 ring-indigo-500/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
              Tier 3 • Persistent
            </span>
            <h4 className="text-sm font-bold text-white">Campus Counsellor</h4>
            <p className="text-xs text-indigo-200">
              1-on-1 confidential booking with qualified student counsellor.
            </p>
          </div>

          {/* Tier 4 */}
          <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-left space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
              Tier 4 • Emergency
            </span>
            <h4 className="text-sm font-bold text-white">24x7 Tele-MANAS</h4>
            <p className="text-xs text-rose-200">
              Govt 14416 & iCall toll-free mental health support.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs text-indigo-200">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Anonymous & Encrypted • Zero Academic Repercussions</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenCrisisBar}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs border border-rose-500/30 transition flex items-center space-x-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency 14416</span>
            </button>

            <button
              onClick={onOpenCounsellorBooking}
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center space-x-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Book Campus Counsellor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
