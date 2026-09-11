import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  TrendingUp,
  Heart,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Bike,
  Wind,
  Droplets,
  Waves,
  Feather,
  Cloud,
  Flower2,
  Layers
} from 'lucide-react';
import { AppLanguage, CheckinData } from '../../types';

export interface FeedbackLog {
  gameId: string;
  gameTitle: string;
  feeling: 'better' | 'same' | 'stressed';
  timestamp: string;
  note?: string;
}

interface PersonalizedRelaxRecommenderProps {
  latestCheckin?: CheckinData | null;
  language: AppLanguage;
  onSelectActivity: (activityId: string) => void;
}

export const PersonalizedRelaxRecommender: React.FC<PersonalizedRelaxRecommenderProps> = ({
  latestCheckin,
  language,
  onSelectActivity,
}) => {
  // Read historical feedback logs from localStorage
  const feedbackLogs: FeedbackLog[] = (() => {
    try {
      const raw = localStorage.getItem('mb_relax_feedback_logs');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        gameId: 'mind-ride',
        gameTitle: 'Mind Ride',
        feeling: 'better',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        note: 'Felt my breath slow down during the ride.',
      },
      {
        gameId: 'worry-river',
        gameTitle: 'Worry Bubble River',
        feeling: 'better',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        gameId: 'breathing',
        gameTitle: '4-7-8 Vagus Reset',
        feeling: 'better',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
      },
    ];
  })();

  // Compute what helped most often
  const betterCounts: Record<string, { title: string; count: number; total: number }> = {};
  feedbackLogs.forEach((log) => {
    if (!betterCounts[log.gameId]) {
      betterCounts[log.gameId] = { title: log.gameTitle, count: 0, total: 0 };
    }
    betterCounts[log.gameId].total++;
    if (log.feeling === 'better') {
      betterCounts[log.gameId].count++;
    }
  });

  const sortedBest = Object.entries(betterCounts).sort(
    (a, b) => b[1].count - a[1].count
  );
  const topHelpful = sortedBest[0] ? sortedBest[0][1] : { title: 'Mind Ride', count: 4, total: 5 };

  // Calculate Smart Recommendation based on voluntary check-in
  const getSmartRecommendations = () => {
    const stress = latestCheckin?.stress ?? 3;
    const energy = latestCheckin?.energy ?? 3;
    const mood = latestCheckin?.quietPulseMood;
    const note = latestCheckin?.journalNote?.toLowerCase() || '';

    if (stress >= 4) {
      return {
        tag: 'High Tension Reset',
        reason: 'Recommended to help downregulate acute physical and mental pressure without demanding high concentration.',
        primaryId: 'mind-ride',
        primaryTitle: 'Mind Ride (Signature Ride)',
        primaryIcon: Bike,
        primaryColor: 'from-[#4A8B8D] to-[#3B7274]',
        secondaryId: 'breathing',
        secondaryTitle: '4-7-8 Deep Vagus Reset',
      };
    }

    if (note.includes('worry') || note.includes('exam') || note.includes('future') || mood === 'hanging-on') {
      return {
        tag: 'Overthinking & Worry Release',
        reason: 'Visual externalization helps unload repetitive exam and placement thoughts into gentle floating streams.',
        primaryId: 'worry-river',
        primaryTitle: 'Worry Bubble River',
        primaryIcon: Droplets,
        primaryColor: 'from-[#5C9496] to-[#2B5456]',
        secondaryId: 'cloud-release',
        secondaryTitle: 'Cloud Release',
      };
    }

    if (energy <= 2 || mood === 'exhausted') {
      return {
        tag: 'Gentle Energy & Sensory Grounding',
        reason: 'Low-effort, soothing visuals to rest eye fatigue and reset neural pace without any tasks.',
        primaryId: 'calm-aquarium',
        primaryTitle: 'Calm Aquarium',
        primaryIcon: Waves,
        primaryColor: 'from-[#1A4D62] to-[#0E3141]',
        secondaryId: 'star-breathing',
        secondaryTitle: 'Star Breathing',
      };
    }

    if (stress === 3 && energy >= 3) {
      return {
        tag: 'Focus & Attention Centering',
        reason: 'Gentle pattern flow to redirect wandering thoughts into rhythmic calm focus.',
        primaryId: 'focus-flow',
        primaryTitle: 'Focus Flow',
        primaryIcon: Layers,
        primaryColor: 'from-[#4A8B8D] to-[#588157]',
        secondaryId: 'feather-balance',
        secondaryTitle: 'Feather Balance',
      };
    }

    return {
      tag: 'Mindful Garden Sanctuary',
      reason: 'Nurture a calming tree with your breath pace for restorative baseline balance.',
      primaryId: 'calm-garden',
      primaryTitle: 'Calm Garden',
      primaryIcon: Flower2,
      primaryColor: 'from-[#3D6B57] to-[#204033]',
      secondaryId: 'light-trail',
      secondaryTitle: 'Light Trail',
    };
  };

  const rec = getSmartRecommendations();
  const PrimaryIcon = rec.primaryIcon;

  return (
    <div className="space-y-4">
      {/* Smart Personalized Recommendation Card */}
      <div className="bg-linear-to-br from-white via-[#FBF9F4] to-[#F5F2EB] dark:from-[#182022] dark:via-[#161D1F] dark:to-[#12181A] p-5 sm:p-6 rounded-[28px] border border-[#E8E4D9] dark:border-[#223034] shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#4A8B8D]/10 dark:bg-[#4A8B8D]/20 text-[#4A8B8D] dark:text-[#63C1C4] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Personalized Relaxation Recommendation
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                {rec.tag}
              </span>
            </div>

            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#2D2D2B] dark:text-[#F3F6F8]">
              {rec.primaryTitle}
            </h3>

            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] max-w-xl leading-relaxed">
              {rec.reason}
            </p>

            <p className="text-[10px] text-[#7A756D]/70 dark:text-[#9BA3AF]/70 italic">
              * Non-diagnostic voluntary suggestion based on your latest check-in.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={() => onSelectActivity(rec.primaryId)}
              className="px-5 py-2.5 rounded-full bg-[#4A8B8D] text-white font-bold text-xs shadow-sm hover:bg-[#3B7274] transition-all flex items-center gap-2 cursor-pointer hover:scale-102"
            >
              <PrimaryIcon className="w-4 h-4" />
              <span>Begin Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* "What Helps You?" Historical Reflection Section */}
      <div className="bg-white dark:bg-[#161E20] p-4 sm:p-5 rounded-[24px] border border-[#E8E4D9] dark:border-[#223034] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current opacity-80" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#2D2D2B] dark:text-[#F3F6F8]">
                What Helps You?
              </h4>
              <p className="text-[11px] text-[#7A756D] dark:text-[#9BA3AF]">
                Based on your previous check-ins and session reflections
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
            {feedbackLogs.filter((f) => f.feeling === 'better').length} Moments of Relief Recorded
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F9F8F5] dark:bg-[#1A2426] border border-[#EAE6DC] dark:border-[#243336] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#2D2D2B] dark:text-[#E2E8F0] leading-relaxed">
            Based on your previous check-ins, you often reported feeling better after{' '}
            <strong className="text-[#4A8B8D] dark:text-[#63C1C4]">{topHelpful.title}</strong>{' '}
            and rhythmic breathing sessions.
          </p>

          <span className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF] shrink-0 italic">
            Non-clinical self-reflection insight
          </span>
        </div>
      </div>
    </div>
  );
};
