import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  TrendingDown,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  RotateCcw,
} from 'lucide-react';
import {
  PersonalCopingProfile,
  InterventionOutcome,
  InterventionType,
} from '../types';

interface PersonalCopingEngineCardProps {
  profile: PersonalCopingProfile;
  outcomes: InterventionOutcome[];
  onSelectIntervention: (type: InterventionType) => void;
  onOpenMoment: () => void;
}

export const PersonalCopingEngineCard: React.FC<PersonalCopingEngineCardProps> = ({
  profile,
  outcomes,
  onSelectIntervention,
  onOpenMoment,
}) => {
  return (
    <div className="space-y-6" id="personal-coping-engine-section">
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold text-xs">
              🎯
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-teal-600 dark:text-teal-400">
              Innovation #2 & #3 • Personal Coping Engine & Closed Loop
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            What Actually Works For You
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Learned from your pre- and post-intervention stress measurements
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <Activity className="w-3.5 h-3.5" />
          <span>Avg Stress Relief: -{profile.avgOverallReduction.toFixed(1)} pts</span>
        </div>
      </div>

      {/* 5-STAGE CLOSED LOOP ARCHITECTURE BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 dark:from-slate-800 dark:via-teal-950/40 dark:to-slate-800 border border-teal-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
            <BrainCircuit className="w-4 h-4 text-teal-600" />
            The MindMitra Closed-Loop Architecture
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase">
            No Guesswork • Pure Evidence
          </span>
        </div>

        <div className="grid grid-cols-5 gap-1 text-center text-[10px] md:text-xs font-bold">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 shadow-xs border border-teal-200/60 dark:border-slate-700 text-teal-700 dark:text-teal-300">
            <p className="text-[9px] uppercase opacity-70">1. Detect</p>
            <p className="truncate">Stress Window</p>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 shadow-xs border border-teal-200/60 dark:border-slate-700 text-teal-700 dark:text-teal-300">
            <p className="text-[9px] uppercase opacity-70">2. Intervene</p>
            <p className="truncate">60s Moment</p>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 shadow-xs border border-teal-200/60 dark:border-slate-700 text-teal-700 dark:text-teal-300">
            <p className="text-[9px] uppercase opacity-70">3. Measure</p>
            <p className="truncate">Did It Help?</p>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 shadow-xs border border-teal-200/60 dark:border-slate-700 text-teal-700 dark:text-teal-300">
            <p className="text-[9px] uppercase opacity-70">4. Learn</p>
            <p className="truncate">Delta Vector</p>
          </div>
          <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm font-bold">
            <p className="text-[9px] uppercase text-teal-200">5. Personalize</p>
            <p className="truncate">Auto-Ranked</p>
          </div>
        </div>
      </div>

      {/* STRATEGIES RANKING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profile.strategies.map((strategy, idx) => (
          <motion.div
            key={strategy.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
              strategy.isTopRecommendation
                ? 'bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-white dark:to-slate-900 border-teal-500/50 shadow-md shadow-teal-500/5 ring-1 ring-teal-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-300'
            }`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-inner">
                  {strategy.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {strategy.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {strategy.sessionsCompleted} sessions evaluated
                  </p>
                </div>
              </div>

              {strategy.isTopRecommendation && (
                <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  #1 Efficacy
                </span>
              )}
            </div>

            {/* Metric Bars */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Avg Stress Reduction</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  -{strategy.avgStressReduction} pts
                </span>
              </div>
              {/* Progress bar visual */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (strategy.avgStressReduction / 25) * 100)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                <span>Success Rate: {strategy.successRate}%</span>
                <span>Clinically Proven</span>
              </div>
            </div>

            {/* Launch CTA */}
            <button
              onClick={() => {
                if (strategy.type === 'mindmitra-moment') {
                  onOpenMoment();
                } else {
                  onSelectIntervention(strategy.type);
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-teal-600 hover:text-white dark:bg-slate-800 dark:hover:bg-teal-600 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center space-x-1.5 group"
            >
              <span>Practice This Technique</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* RECENT "DID IT HELP?" OUTCOMES LOG */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Recent Efficacy Logs</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time measurement records feeding your personalized model
            </p>
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {outcomes.length} Interventions Measured
          </span>
        </div>

        <div className="space-y-2.5">
          {outcomes.slice(0, 4).map((out) => (
            <div
              key={out.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold shrink-0">
                  ✓
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {out.interventionName}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {out.dateStr} • {out.contextTag || 'Routine practice'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Stress Delta</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {out.preStress} → {out.postStress} ({out.delta} pts)
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  Effective
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
