import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  TrendingUp,
  Wind,
  Gamepad2,
  Headphones,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  ShieldAlert,
  HeartHandshake,
} from 'lucide-react';
import { StressPredictionResult } from '../types';

interface StressPredictorAssessmentProps {
  onLaunchFeature: (targetTab: string) => void;
  onOpenCounsellorBooking?: () => void;
}

interface QuestionItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'academic' | 'sleep' | 'focus' | 'tension' | 'emotion';
}

const QUESTIONS: QuestionItem[] = [
  {
    id: 'q1',
    title: 'Academic Deadlines & Exam Pressure',
    subtitle: 'Feeling overwhelmed by assignments, exams, or upcoming lab viva dates?',
    category: 'academic',
  },
  {
    id: 'q2',
    title: 'Sleep Quality & Waking Fatigue',
    subtitle: 'Waking up unrefreshed, struggling with delayed sleep, or morning exhaustion?',
    category: 'sleep',
  },
  {
    id: 'q3',
    title: 'Racing Thoughts & Brain Fog',
    subtitle: 'Mind spinning with worries or unable to maintain concentration on code/books?',
    category: 'focus',
  },
  {
    id: 'q4',
    title: 'Physical Strain & Tension',
    subtitle: 'Noticing tight shoulders, clenched jaw, headache, or shallow breathing?',
    category: 'tension',
  },
  {
    id: 'q5',
    title: 'Emotional Exhaustion & Overload',
    subtitle: 'Feeling emotionally drained, socially isolated, or needing someone to talk to?',
    category: 'emotion',
  },
];

export const StressPredictorAssessment: React.FC<StressPredictorAssessmentProps> = ({
  onLaunchFeature,
  onOpenCounsellorBooking,
}) => {
  // 5 question ratings (1: Very Low/Calm to 5: High/Intense)
  const [ratings, setRatings] = useState<number[]>([3, 3, 3, 2, 2]);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleRatingChange = (qIndex: number, val: number) => {
    const updated = [...ratings];
    updated[qIndex] = val;
    setRatings(updated);
  };

  // Compute prediction
  const totalRaw = ratings.reduce((a, b) => a + b, 0); // 5 to 25
  const stressPercent = Math.round(((totalRaw - 5) / 20) * 100); // 0 to 100%

  let level: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
  let levelColor = 'text-emerald-600 dark:text-emerald-400';
  let levelBg = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';

  if (stressPercent >= 75) {
    level = 'Severe';
    levelColor = 'text-rose-600 dark:text-rose-400';
    levelBg = 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  } else if (stressPercent >= 50) {
    level = 'High';
    levelColor = 'text-amber-600 dark:text-amber-400';
    levelBg = 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
  } else if (stressPercent >= 25) {
    level = 'Moderate';
    levelColor = 'text-blue-600 dark:text-blue-400';
    levelBg = 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800';
  }

  // Determine smart recommendation based on dominant factors
  let recommendedFeatureName = 'Pranayama 4-7-8 Breathing';
  let recommendedTab = 'relax';
  let recommendedIcon = Wind;
  let recommendedReason = 'Your physical tension score is elevated. A 3-minute vagus nerve pacer will quickly down-regulate physiological fight-or-flight.';

  // If focus/racing thoughts is highest
  if (ratings[2] >= ratings[3] && ratings[2] >= ratings[1] && ratings[2] >= 4) {
    recommendedFeatureName = 'Zen Mandala & Kolam Drawing';
    recommendedTab = 'games';
    recommendedIcon = Gamepad2;
    recommendedReason = 'Racing thoughts detected. Interactive tactile art and zen ripple mechanics gently disrupt ruminative thought loops.';
  } else if (ratings[1] >= ratings[3] && ratings[1] >= 4) {
    recommendedFeatureName = '432Hz Sound Lounge & Deep Sleep Audio';
    recommendedTab = 'relax';
    recommendedIcon = Headphones;
    recommendedReason = 'Sleep debt & sensory fatigue detected. Alpha-theta binaural soundscapes ease neuro-muscular restlessness.';
  } else if (ratings[4] >= 4 || ratings[0] >= 4) {
    recommendedFeatureName = 'Talk with Mithra (AI Empathetic Trainer)';
    recommendedTab = 'talk-mithra';
    recommendedIcon = Bot;
    recommendedReason = 'Emotional and academic overload detected. Mithra will listen warmly, validate your feelings, and guide cognitive reframing.';
  }

  const handleAutoConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      onLaunchFeature(recommendedTab);
    }, 600);
  };

  const handleReset = () => {
    setRatings([2, 2, 2, 2, 2]);
    setIsCalculated(false);
  };

  return (
    <div className="bg-white/95 dark:bg-[#182326]/95 rounded-[32px] border border-[#E8E4D9] dark:border-[#28383D] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4D9]/70 dark:border-[#28383D]/70 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#2D2D2B] dark:text-white">
                5-Question AI Stress Predictor
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                Auto-Connecting Engine
              </span>
            </div>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              Instant assessment predicting stress surge and matching the exact tool to overcome it.
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#7A756D] hover:text-[#2D2D2B] dark:text-[#9BA3AF] dark:hover:text-white transition cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Questions</span>
        </button>
      </div>

      {/* 5 Questions Matrix */}
      <div className="space-y-3">
        {QUESTIONS.map((q, idx) => {
          const currentVal = ratings[idx];
          return (
            <div
              key={q.id}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C282C] border border-[#E8E4D9]/80 dark:border-[#2D3E42]/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-teal-600/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                    {q.title}
                  </h4>
                </div>
                <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF] pl-7">
                  {q.subtitle}
                </p>
              </div>

              {/* 1 - 5 Discrete Rating Selector */}
              <div className="flex items-center gap-1.5 self-end md:self-center">
                {[1, 2, 3, 4, 5].map((val) => {
                  const isSelected = currentVal === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleRatingChange(idx, val)}
                      className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? val >= 4
                            ? 'bg-rose-500 text-white shadow-xs scale-105'
                            : val === 3
                            ? 'bg-amber-500 text-white shadow-xs scale-105'
                            : 'bg-teal-600 text-white shadow-xs scale-105'
                          : 'bg-white dark:bg-[#161F22] border border-[#E8E4D9] dark:border-[#2B3B3F] text-[#555] dark:text-[#AAA] hover:border-teal-500'
                      }`}
                      title={`Level ${val}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prediction Output & Recommendation Panel */}
      <div className={`p-5 rounded-3xl border ${levelBg} space-y-4 transition-all`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A554D] dark:text-[#9BA3AF]">
                Predicted Real-Time Stress Index:
              </span>
              <span className={`text-base font-extrabold ${levelColor}`}>
                {stressPercent}% ({level})
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full sm:w-64 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  stressPercent >= 75
                    ? 'bg-rose-500'
                    : stressPercent >= 50
                    ? 'bg-amber-500'
                    : 'bg-teal-600'
                }`}
                style={{ width: `${Math.max(5, stressPercent)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stressPercent >= 70 && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-rose-500 text-white flex items-center gap-1 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" /> High Strain Alert
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Tool Recommendation */}
        <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#162124]/90 border border-teal-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
              {React.createElement(recommendedIcon, { className: 'w-5 h-5' })}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                  Recommended In-App Session
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200">
                  Instant Match
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-white">
                {recommendedFeatureName}
              </h4>
              <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] leading-relaxed">
                {recommendedReason}
              </p>
            </div>
          </div>

          {/* Action Button: Automatically Connects and Launches */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              onClick={handleAutoConnect}
              disabled={isConnecting}
              className="py-2.5 px-5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{isConnecting ? 'Connecting...' : 'Auto-Connect & Launch Session ⚡'}</span>
            </button>

            {stressPercent >= 75 && onOpenCounsellorBooking && (
              <button
                onClick={onOpenCounsellorBooking}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Priority Counsellor Slot</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
