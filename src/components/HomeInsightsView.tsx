import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Wind,
  Plus,
  Mail,
  Lock,
  Heart,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  Smile,
  Coffee,
  BedDouble,
  Compass,
  Calendar,
  Zap,
  Activity,
  BarChart3,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  CheckinData,
  FutureMessage,
  CompanionConfig,
  AppLanguage,
  AcademicEvent,
  StressForecast,
  PersonalCopingProfile,
  InterventionOutcome,
  InterventionType,
} from '../types';
import { CompanionAvatar } from './CompanionAvatar';
import { I18N_TEXT } from '../data/mockData';
import { StressForecastRadar } from './StressForecastRadar';
import { PersonalCopingEngineCard } from './PersonalCopingEngineCard';
import { SmartEscalationBanner } from './SmartEscalationBanner';
import { StudentStreakMaintenanceHub } from './StudentStreakMaintenanceHub';
import { StressPredictorAssessment } from './StressPredictorAssessment';
import { VoiceMoodJournalNLP } from './VoiceMoodJournalNLP';
import { EmergencySupportModal } from './EmergencySupportModal';

interface HomeInsightsViewProps {
  checkins: CheckinData[];
  futureMessages: FutureMessage[];
  onSaveFutureMessage: (msg: FutureMessage) => void;
  companion: CompanionConfig;
  language: AppLanguage;
  onOpenCheckin: () => void;
  onOpenCompanionChat: () => void;
  onOpenRelax?: () => void;
  onNavigateTab?: (tab: string) => void;
  streakDays?: number;
  forecast: StressForecast;
  academicEvents: AcademicEvent[];
  onAddAcademicEvent: (event: AcademicEvent) => void;
  onDeleteAcademicEvent: (id: string) => void;
  copingProfile: PersonalCopingProfile;
  interventionOutcomes: InterventionOutcome[];
  onSelectIntervention: (type: InterventionType) => void;
  onOpenMoment: () => void;
  onOpenCounsellorBooking: () => void;
  onOpenCrisisBar: () => void;
}

export const HomeInsightsView: React.FC<HomeInsightsViewProps> = ({
  checkins,
  futureMessages,
  onSaveFutureMessage,
  companion = { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true },
  language = 'en',
  onOpenCheckin,
  onOpenCompanionChat,
  onOpenRelax,
  onNavigateTab,
  streakDays = 6,
  forecast,
  academicEvents,
  onAddAcademicEvent,
  onDeleteAcademicEvent,
  copingProfile,
  interventionOutcomes,
  onSelectIntervention,
  onOpenMoment,
  onOpenCounsellorBooking,
  onOpenCrisisBar,
}) => {
  const safeCompanion = companion || { name: 'Mithra', avatar: 'blob', tone: 'gentle', voiceEnabled: true };
  const t = I18N_TEXT[language] || I18N_TEXT.en;

  // Emergency Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Feature launch helper (auto-connect)
  const handleLaunchFeature = (targetTab: string) => {
    if (onNavigateTab) {
      onNavigateTab(targetTab);
    } else if (targetTab === 'relax' && onOpenRelax) {
      onOpenRelax();
    } else if (targetTab === 'talk-mithra' && onOpenCompanionChat) {
      onOpenCompanionChat();
    } else if (targetTab === 'counselling-prep' && onOpenCounsellorBooking) {
      onOpenCounsellorBooking();
    }
  };

  // Chart Visualization State
  const [chartViewMode, setChartViewMode] = useState<'mood' | 'breakdown' | 'balance'>('mood');
  const [timeRange, setTimeRange] = useState<'7d' | '14d'>('7d');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  // Breathing visual pacer state
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhaseIndex, setBreathPhaseIndex] = useState<0 | 1 | 2>(0); // 0: Inhale, 1: Hold, 2: Exhale

  // Future message modal state
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [msgTrigger, setMsgTrigger] = useState<'hard-day' | 'exam-anxiety' | 'lonely' | 'self-doubt' | 'general'>('hard-day');
  const [selectedMessageToView, setSelectedMessageToView] = useState<FutureMessage | null>(null);

  // Active breathing loop
  React.useEffect(() => {
    let timer: any;
    if (isBreathingActive) {
      const cycle = () => {
        setBreathPhaseIndex(0);
        timer = setTimeout(() => {
          setBreathPhaseIndex(1);
          timer = setTimeout(() => {
            setBreathPhaseIndex(2);
            timer = setTimeout(cycle, 8000);
          }, 7000);
        }, 4000);
      };
      cycle();
    }
    return () => clearTimeout(timer);
  }, [isBreathingActive]);

  const getBreathLabel = () => {
    if (breathPhaseIndex === 0) return t.breatheIn || 'Inhale (4s)';
    if (breathPhaseIndex === 1) return t.breatheHold || 'Hold (7s)';
    return t.breatheOut || 'Exhale (8s)';
  };

  // Aggregated week-long check-in data calculation
  const { weekData, weekAverages, dominantPattern } = useMemo(() => {
    const sliceCount = timeRange === '7d' ? 7 : 14;
    const rawSlice = checkins.slice(-sliceCount);

    const formatted = rawSlice.map((c, idx) => {
      // Calculate composite mood score (1.0 to 5.0)
      // Positive factors: sleep, energy, social
      // Inverted negative factor: stress
      const stressContribution = 6 - (c.stress || 3);
      const sleepContribution = c.sleep || 3;
      const energyContribution = c.energy || 3;
      const socialContribution = c.social || 3;

      const rawMood =
        (stressContribution * 1.25 + sleepContribution * 1.0 + energyContribution * 1.0 + socialContribution * 0.75) /
        4.0;
      const compositeMood = Number(Math.max(1, Math.min(5, rawMood)).toFixed(1));

      // Parse day of week and friendly date
      const dateObj = new Date(c.timestamp || c.dateStr);
      const dayName = isNaN(dateObj.getTime())
        ? `Day ${idx + 1}`
        : dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'short' });
      const formattedDate = isNaN(dateObj.getTime())
        ? c.dateStr
        : dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric' });

      // Determine qualitative mood badge
      let moodLabel = 'Balanced';
      let moodEmoji = '🌿';
      if (compositeMood >= 4.2) {
        moodLabel = language === 'ta' ? 'ஆற்றல் நிறைந்தது' : language === 'tanglish' ? 'Super Energized' : 'Energized & Thriving';
        moodEmoji = '✨';
      } else if (compositeMood >= 3.4) {
        moodLabel = language === 'ta' ? 'அமைதியான சமநிலை' : language === 'tanglish' ? 'Calm & Grounded' : 'Calm & Grounded';
        moodEmoji = '🌿';
      } else if (compositeMood >= 2.6) {
        moodLabel = language === 'ta' ? 'மிதமான அழுத்தம்' : language === 'tanglish' ? 'Moderate Stress' : 'Moderate Strain';
        moodEmoji = '☕';
      } else {
        moodLabel = language === 'ta' ? 'அதிக சோர்வு' : language === 'tanglish' ? 'High Exam Pressure' : 'Exam / Viva Crunch';
        moodEmoji = '🌧️';
      }

      return {
        id: c.id,
        index: idx,
        day: dayName,
        shortDate: formattedDate,
        fullDate: c.dateStr,
        rawTimestamp: c.timestamp,
        Mood: compositeMood,
        Rest: c.sleep || 3,
        Energy: c.energy || 3,
        Stress: c.stress || 3,
        Social: c.social || 3,
        Workload: c.workload || 3,
        moodLabel,
        moodEmoji,
        journalNote: c.journalNote,
        isQuietPulse: c.isQuietPulse,
      };
    });

    // Compute aggregated weekly averages
    const count = formatted.length || 1;
    const avgMood = Number((formatted.reduce((acc, d) => acc + d.Mood, 0) / count).toFixed(1));
    const avgRest = Number((formatted.reduce((acc, d) => acc + d.Rest, 0) / count).toFixed(1));
    const avgStress = Number((formatted.reduce((acc, d) => acc + d.Stress, 0) / count).toFixed(1));
    const avgEnergy = Number((formatted.reduce((acc, d) => acc + d.Energy, 0) / count).toFixed(1));

    // Find highest and lowest mood days
    let highestDay = formatted[0];
    let lowestDay = formatted[0];
    formatted.forEach((d) => {
      if (d.Mood > (highestDay?.Mood ?? 0)) highestDay = d;
      if (d.Mood < (lowestDay?.Mood ?? 5)) lowestDay = d;
    });

    // Dominant weekly rhythm diagnosis
    let patternDescription = '';
    if (avgStress >= 3.8) {
      patternDescription =
        language === 'ta'
          ? 'இந்த வாரம் அதிக கல்விப் பணிச்சுமை காணப்படுகிறது. வழக்கமான இடைவேளைகளைத் திட்டமிடுங்கள்.'
          : language === 'tanglish'
          ? 'Indha week academic crunch konjam heavy. Small chai & breathing breaks eduthukonga.'
          : 'High academic tension logged this week. Prioritizing 10-minute mindful walks between study blocks will protect your focus.';
    } else if (avgRest < 2.8) {
      patternDescription =
        language === 'ta'
          ? 'தூக்கத்தின் அளவு சற்று குறைவாக உள்ளது. படுக்கைக்கு முன் நீல ஒளியைத் தவிர்க்கவும்.'
          : language === 'tanglish'
          ? 'Sleep rhythm kammiya irukku. Night phone screen time reduce panna sleep improve aagum.'
          : 'Lighter sleep detected over recent nights. Setting a calming 11 PM hostel wind-down routine can restore natural circadian recharge.';
    } else {
      patternDescription =
        language === 'ta'
          ? 'உங்கள் மனநிலை சீராகவும் சமநிலையாகவும் உள்ளது. தொடர் நல்வாழ்வுப் பழக்கங்கள் உதவுகின்றன.'
          : language === 'tanglish'
          ? 'Unga weekly mood super-aa steady-aa irukku. Healthy balance maintain pannunga!'
          : 'Your emotional rhythm is nurturing and steady. You are maintaining strong resilience through your semester routines.';
    }

    return {
      weekData: formatted,
      weekAverages: { avgMood, avgRest, avgStress, avgEnergy, highestDay, lowestDay, totalLogged: count },
      dominantPattern: patternDescription,
    };
  }, [checkins, timeRange, language]);

  // Selected Day Details for the interactive bottom panel
  const activeDayDetail = selectedDayIndex !== null ? weekData[selectedDayIndex] : weekData[weekData.length - 1];
  const latestTodayCheckin = checkins && checkins.length > 0 ? checkins[checkins.length - 1] : null;

  const handleCreateFutureMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgContent.trim()) return;

    const newMsg: FutureMessage = {
      id: `msg-${Date.now()}`,
      title: msgTitle.trim(),
      content: msgContent.trim(),
      triggerTag: msgTrigger,
      createdAt: new Date().toISOString(),
      isOpened: false,
    };

    onSaveFutureMessage(newMsg);
    setMsgTitle('');
    setMsgContent('');
    setIsNewMessageOpen(false);
  };

  // Custom Recharts Tooltip with accessible styling & rich data
  const CustomMoodTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-white dark:bg-[#192225] p-3.5 sm:p-4 rounded-2xl border border-[#E8E4D9] dark:border-[#2B383C] shadow-lg max-w-xs space-y-2 text-[#2D2D2B] dark:text-[#F8FAFC]">
          <div className="flex items-center justify-between border-b border-[#E8E4D9] dark:border-[#2B383C] pb-2">
            <span className="font-bold text-xs">
              {data?.day} • {data?.shortDate}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#D1E5E6]/50 dark:bg-[#193639] text-[#1F4647] dark:text-[#63C1C4] font-semibold">
              {data?.moodEmoji} {data?.moodLabel}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#7A756D] dark:text-[#9DB0B5]">Overall Mood:</span>
              <span className="font-bold text-[#4A8B8D] dark:text-[#63C1C4]">{data?.Mood} / 5.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7A756D] dark:text-[#9DB0B5]">Rest & Sleep:</span>
              <span className="font-medium text-[#5B8DEF]">{data?.Rest} / 5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7A756D] dark:text-[#9DB0B5]">Energy Vitality:</span>
              <span className="font-medium text-[#E5A93C]">{data?.Energy} / 5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7A756D] dark:text-[#9DB0B5]">Stress / Pressure:</span>
              <span className="font-medium text-[#E98A72]">{data?.Stress} / 5</span>
            </div>
          </div>

          {data?.journalNote && (
            <div className="pt-2 border-t border-[#E8E4D9] dark:border-[#2B383C] text-[11px] text-[#7A756D] dark:text-[#9DB0B5] italic line-clamp-2">
              "{data.journalNote}"
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-7 pb-12">
      {/* 🌟 1. HOME HERO: Welcome, Emotional Pulse, Status & Quick Action Hub */}
      <div className="bg-linear-to-br from-[#4A8B8D]/15 via-white to-[#E98A72]/10 dark:from-[#192225] dark:via-[#161D20] dark:to-[#221C1B] rounded-3xl sm:rounded-[36px] p-5 sm:p-7 border border-[#E8E4D9] dark:border-[#2B383C] shadow-xs space-y-5 transition-colors">
        {/* Companion Welcome & Greeting */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="p-3 bg-[#D1E5E6]/50 dark:bg-[#193639] rounded-2xl border border-[#4A8B8D]/20 shrink-0 shadow-2xs">
              <CompanionAvatar avatar={safeCompanion.avatar} emotion="happy" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#2D2D2B] dark:text-[#F8FAFC]">
                  MindMitra Home
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-[#4A8B8D]/15 text-[#4A8B8D] dark:text-[#63C1C4] rounded-full">
                  Campus Wellbeing
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9DB0B5] mt-0.5">
                Understand. Relax. Talk. Get Support.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              id="home-moment-cta"
              onClick={onOpenMoment}
              className="py-2 px-4 bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>60s Moment</span>
            </button>
            <button
              id="home-checkin-cta"
              onClick={onOpenCheckin}
              className="py-2 px-4 bg-[#4A8B8D] hover:bg-[#376F71] active:scale-95 text-white rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Log Pulse</span>
            </button>
          </div>
        </div>

        {/* 📊 Today's Emotional Pulse & 3 Core Vital Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Today's Emotional Pulse */}
          <div className="bg-white/95 dark:bg-[#1E292B]/95 p-3.5 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-[#4A8B8D]" /> Emotional Pulse
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-[#2D2D2B] dark:text-[#F8FAFC]">
                {latestTodayCheckin ? `${weekAverages.avgMood}/5` : 'Balanced'}
              </span>
            </div>
            <span className="text-[10px] text-[#4A8B8D] dark:text-[#63C1C4] font-medium truncate mt-0.5">
              {latestTodayCheckin ? 'Logged today' : 'Tap Log Pulse'}
            </span>
          </div>

          {/* Current Stress Level */}
          <div className="bg-white/95 dark:bg-[#1E292B]/95 p-3.5 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#E98A72]" /> Stress Level
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#2D2D2B] dark:text-[#F8FAFC]">
                {weekAverages.avgStress}
              </span>
              <span className="text-[10px] text-[#7A756D]">/ 5.0</span>
            </div>
            <span className="text-[10px] text-[#E98A72] font-medium truncate mt-0.5">
              {weekAverages.avgStress > 3.2 ? '⚡ Elevated Pressure' : '🌿 Normal Baseline'}
            </span>
          </div>

          {/* Sleep Quality */}
          <div className="bg-white/95 dark:bg-[#1E292B]/95 p-3.5 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-indigo-500" /> Sleep Rhythm
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#2D2D2B] dark:text-[#F8FAFC]">
                {weekAverages.avgRest}
              </span>
              <span className="text-[10px] text-[#7A756D]">/ 5.0</span>
            </div>
            <span className="text-[10px] text-indigo-500 font-medium truncate mt-0.5">
              {weekAverages.avgRest >= 3.5 ? '✨ Good Rest' : '😴 Mild Sleep Debt'}
            </span>
          </div>

          {/* Energy Vitality */}
          <div className="bg-white/95 dark:bg-[#1E292B]/95 p-3.5 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Energy Vitality
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#2D2D2B] dark:text-[#F8FAFC]">
                {weekAverages.avgEnergy}
              </span>
              <span className="text-[10px] text-[#7A756D]">/ 5.0</span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate mt-0.5">
              {weekAverages.avgEnergy >= 3.5 ? '⚡ High Energy' : '🌱 Steady Pace'}
            </span>
          </div>
        </div>

        {/* 🎯 Personalized Recommendation Card */}
        <div className="p-4 bg-white/90 dark:bg-[#1E292B]/90 rounded-2xl border border-[#4A8B8D]/25 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#4A8B8D] dark:text-[#63C1C4] block">
                Personalized Recommendation
              </span>
              <p className="text-xs text-[#2D2D2B] dark:text-[#F3F6F8] font-medium leading-relaxed">
                {forecast?.recommendedInterventionName
                  ? `Based on your upcoming ${forecast.upcomingWindowName}, taking 2 minutes of ${forecast.recommendedInterventionName} will buffer stress surge.`
                  : 'Start with 60 seconds of gentle diaphragmatic pacing to center your focus for the day.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenMoment}
            className="px-3 py-1.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <span>Try Recommendation →</span>
          </button>
        </div>

        {/* 🚀 3 Key Navigation Action Buttons: Talk to Mithra, Prepare for Counselling, Mind Relax */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <button
            id="home-btn-talk-mithra"
            onClick={onOpenCompanionChat}
            className="p-3.5 bg-white dark:bg-[#1E292B] hover:bg-[#F9F7F2] dark:hover:bg-[#253337] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] flex items-center justify-between gap-2 shadow-2xs hover:border-[#4A8B8D]/50 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">🤖</span>
              <div>
                <span className="font-bold text-xs text-[#2D2D2B] dark:text-[#F3F6F8] block">
                  Talk to Mithra
                </span>
                <span className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF]">
                  Empathetic AI listener
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A756D] group-hover:text-[#4A8B8D] transition-colors" />
          </button>

          <button
            id="home-btn-counselling-prep"
            onClick={onOpenCounsellorBooking}
            className="p-3.5 bg-white dark:bg-[#1E292B] hover:bg-[#F9F7F2] dark:hover:bg-[#253337] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] flex items-center justify-between gap-2 shadow-2xs hover:border-[#4A8B8D]/50 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
              <div>
                <span className="font-bold text-xs text-[#2D2D2B] dark:text-[#F3F6F8] block">
                  Prepare for Counselling
                </span>
                <span className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF]">
                  Free & confidential booking
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A756D] group-hover:text-[#4A8B8D] transition-colors" />
          </button>

          <button
            id="home-btn-mind-relax"
            onClick={onOpenRelax}
            className="p-3.5 bg-white dark:bg-[#1E292B] hover:bg-[#F9F7F2] dark:hover:bg-[#253337] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] flex items-center justify-between gap-2 shadow-2xs hover:border-[#4A8B8D]/50 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">🧘</span>
              <div>
                <span className="font-bold text-xs text-[#2D2D2B] dark:text-[#F3F6F8] block">
                  Mind Relax
                </span>
                <span className="text-[10px] text-[#7A756D] dark:text-[#9BA3AF]">
                  Breathing, sounds & grounding
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#7A756D] group-hover:text-[#4A8B8D] transition-colors" />
          </button>
        </div>
      </div>

      {/* 🆘 EMERGENCY SUPPORT & KIND MESSAGE DISPATCHER BANNER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-rose-50 via-pink-50/70 to-amber-50/50 dark:from-rose-950/30 dark:via-pink-950/20 dark:to-amber-950/10 border border-rose-200/80 dark:border-rose-900/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5 border border-rose-500/20">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#2D2D2B] dark:text-white">
                Emergency Support & Kind Outreach Circle
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-900 dark:bg-rose-900 dark:text-rose-200">
                Safe & Confidential
              </span>
            </div>
            <p className="text-xs text-[#7A756D] dark:text-[#CBD5E1] mt-0.5 max-w-xl leading-relaxed">
              Feeling overwhelmed or in crisis? Dispatch a kind, comforting check-in message to your personal favorite person, parent, or instantly link with your campus counsellor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="w-full sm:w-auto py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-white" />
            <span>Open Kind Support Dispatcher</span>
          </button>
        </div>
      </div>

      {/* 📅 1. DAILY, WEEKLY, MONTHLY & STREAK MAINTENANCE */}
      <StudentStreakMaintenanceHub
        checkins={checkins}
        streakDays={streakDays}
        outcomes={interventionOutcomes}
        onOpenCheckin={onOpenCheckin}
        onOpenRelax={onOpenRelax}
      />

      {/* 🧠 2. 5-QUESTION AI STRESS PREDICTOR & AUTO-CONNECTING ENGINE */}
      <StressPredictorAssessment
        onLaunchFeature={handleLaunchFeature}
        onOpenCounsellorBooking={onOpenCounsellorBooking}
      />

      {/* 🎙️ 3. VOICE MOOD JOURNAL WITH NLP (RELAX • CALM • OVERCOME) */}
      <VoiceMoodJournalNLP
        onLaunchFeature={handleLaunchFeature}
      />

      {/* 🤖 4. MITRA: EMPATHETIC AI MENTAL HEALTH TRAINER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-teal-50/80 via-emerald-50/40 to-cyan-50/50 dark:from-teal-950/30 dark:via-emerald-950/20 dark:to-cyan-950/10 border border-teal-200/80 dark:border-teal-800/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-[#162225] rounded-2xl border border-teal-300/40 dark:border-teal-700/50 shadow-xs shrink-0">
            <CompanionAvatar avatar={safeCompanion.avatar} emotion="happy" size="lg" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                Personal Mental Trainer
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Pre-Counselling Coach
              </span>
            </div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#2D2D2B] dark:text-white">
              Mitra — Your Healing AI Companion Before A Real Counsellor
            </h3>
            <p className="text-xs text-[#555] dark:text-[#CBD5E1] max-w-xl leading-relaxed">
              Mitra acts as your confidential personal trainer to de-escalate college friction, exam anxiety, and daily overwhelm. Work through healing conversations, cognitive reframing, and calming drills. If needed, Mitra smoothly connects you to Dr. S. Radhakrishnan or your campus clinical team.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={onOpenCompanionChat}
            className="py-2.5 px-5 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Talk to Mitra Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onOpenCounsellorBooking}
            className="py-2 px-4 bg-white dark:bg-[#162124] border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 hover:bg-teal-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Meet Campus Counsellor</span>
          </button>
        </div>
      </div>

      {/* RENDER EMERGENCY SUPPORT MODAL */}
      <EmergencySupportModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onConnectCounsellor={onOpenCounsellorBooking}
        studentName="Student"
      />

      {/* 🔮 INNOVATION #1: STRESS FORECAST RADAR */}
      {forecast && (
        <StressForecastRadar
          forecast={forecast}
          academicEvents={academicEvents}
          onTriggerMoment={onOpenMoment}
          onAddAcademicEvent={onAddAcademicEvent}
          onDeleteAcademicEvent={onDeleteAcademicEvent}
        />
      )}

      {/* 🎯 INNOVATIONS #2 & #3: PERSONAL COPING ENGINE & CLOSED-LOOP ANALYTICS */}
      {copingProfile && (
        <PersonalCopingEngineCard
          profile={copingProfile}
          outcomes={interventionOutcomes}
          onSelectIntervention={onSelectIntervention}
          onOpenMoment={onOpenMoment}
        />
      )}

      {/* 2. Week-Long Mood Trend Visualization with Recharts */}
      <div className="bg-white dark:bg-[#192225] p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] dark:border-[#2B383C] shadow-sm space-y-6 transition-colors">
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D1E5E6]/40 dark:bg-[#193639] flex items-center justify-center text-[#4A8B8D] dark:text-[#63C1C4]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-serif italic text-xl sm:text-2xl text-[#2D2D2B] dark:text-[#F8FAFC]">
                {language === 'ta'
                  ? 'வாராந்திர மனநிலை போக்குகள்'
                  : language === 'tanglish'
                  ? 'Weekly Mood & Wellbeing Trend'
                  : 'Weekly Mood & Wellbeing Trend'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9DB0B5] mt-1">
              {language === 'ta'
                ? 'உங்கள் கடந்த 7 நாட்களின் அமைதியான பதிவுகளின் தொகுப்பு. மருத்துவ மதிப்பீடு இல்லை.'
                : language === 'tanglish'
                ? 'Past 7 days-oda aggregated mood rhythm. No clinical labels or pressure.'
                : 'Aggregated mood, rest, and energy from your daily reflections. Completely private.'}
            </p>
          </div>

          {/* View Toggles */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Time Range Selector */}
            <div className="inline-flex p-1 bg-[#F0EDE4] dark:bg-[#161D20] rounded-full border border-[#E8E4D9] dark:border-[#2B383C]">
              <button
                id="filter-7d-btn"
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  timeRange === '7d'
                    ? 'bg-white dark:bg-[#192225] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                    : 'text-[#7A756D] dark:text-[#9DB0B5] hover:text-[#2D2D2B]'
                }`}
              >
                7 Days
              </button>
              <button
                id="filter-14d-btn"
                onClick={() => setTimeRange('14d')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  timeRange === '14d'
                    ? 'bg-white dark:bg-[#192225] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                    : 'text-[#7A756D] dark:text-[#9DB0B5] hover:text-[#2D2D2B]'
                }`}
              >
                14 Days
              </button>
            </div>

            {/* Chart Mode Pill Group */}
            <div className="inline-flex p-1 bg-[#F0EDE4] dark:bg-[#161D20] rounded-full border border-[#E8E4D9] dark:border-[#2B383C]">
              <button
                id="chart-mode-mood"
                onClick={() => setChartViewMode('mood')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  chartViewMode === 'mood'
                    ? 'bg-[#4A8B8D] text-white shadow-2xs'
                    : 'text-[#7A756D] dark:text-[#9DB0B5] hover:text-[#2D2D2B]'
                }`}
                title="Composite Mood Wave"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Mood Wave</span>
              </button>
              <button
                id="chart-mode-breakdown"
                onClick={() => setChartViewMode('breakdown')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  chartViewMode === 'breakdown'
                    ? 'bg-[#4A8B8D] text-white shadow-2xs'
                    : 'text-[#7A756D] dark:text-[#9DB0B5] hover:text-[#2D2D2B]'
                }`}
                title="All Metrics Comparison"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Dimensions</span>
              </button>
              <button
                id="chart-mode-balance"
                onClick={() => setChartViewMode('balance')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  chartViewMode === 'balance'
                    ? 'bg-[#4A8B8D] text-white shadow-2xs'
                    : 'text-[#7A756D] dark:text-[#9DB0B5] hover:text-[#2D2D2B]'
                }`}
                title="Energy vs Stress Balance"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Balance</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Key Weekly Summary Aggregates */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#161D20] rounded-2xl border border-[#E8E4D9] dark:border-[#2B383C] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] uppercase tracking-wider flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-[#4A8B8D] dark:text-[#63C1C4]" /> Avg Mood
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#2D2D2B] dark:text-[#F8FAFC]">{weekAverages.avgMood}</span>
              <span className="text-xs text-[#7A756D] dark:text-[#9DB0B5]">/ 5.0</span>
            </div>
            <span className="text-[10px] text-[#4A8B8D] dark:text-[#63C1C4] font-medium mt-0.5 truncate">
              {weekAverages.avgMood >= 3.5 ? '🌿 Grounded & Steady' : '☕ Gentle Recovery'}
            </span>
          </div>

          <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#161D20] rounded-2xl border border-[#E8E4D9] dark:border-[#2B383C] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] uppercase tracking-wider flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 text-[#5B8DEF]" /> Sleep Index
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#2D2D2B] dark:text-[#F8FAFC]">{weekAverages.avgRest}</span>
              <span className="text-xs text-[#7A756D] dark:text-[#9DB0B5]">/ 5</span>
            </div>
            <span className="text-[10px] text-[#5B8DEF] font-medium mt-0.5 truncate">
              {weekAverages.avgRest >= 3.5 ? '✨ Good Night Recharge' : '😴 Rest Debt'}
            </span>
          </div>

          <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#161D20] rounded-2xl border border-[#E8E4D9] dark:border-[#2B383C] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#E5A93C]" /> Energy Level
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#2D2D2B] dark:text-[#F8FAFC]">{weekAverages.avgEnergy}</span>
              <span className="text-xs text-[#7A756D] dark:text-[#9DB0B5]">/ 5</span>
            </div>
            <span className="text-[10px] text-[#E5A93C] font-medium mt-0.5 truncate">
              {weekAverages.avgEnergy >= 3.5 ? '⚡ High Vitality' : '🌱 Low Battery'}
            </span>
          </div>

          <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#161D20] rounded-2xl border border-[#E8E4D9] dark:border-[#2B383C] flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9DB0B5] uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#E98A72]" /> Stress Pressure
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#2D2D2B] dark:text-[#F8FAFC]">{weekAverages.avgStress}</span>
              <span className="text-xs text-[#7A756D] dark:text-[#9DB0B5]">/ 5</span>
            </div>
            <span className="text-[10px] text-[#E98A72] font-medium mt-0.5 truncate">
              {weekAverages.avgStress <= 2.5 ? '🧘 Low Campus Strain' : '📚 Academic Crunch'}
            </span>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium pt-1">
          <div className="flex flex-wrap items-center gap-4">
            {chartViewMode === 'mood' && (
              <>
                <span className="flex items-center gap-1.5 text-[#4A8B8D] dark:text-[#63C1C4]">
                  <span className="w-3 h-3 rounded-full bg-[#4A8B8D] dark:bg-[#63C1C4] inline-block"></span>
                  Overall Mood Index (1.0 - 5.0)
                </span>
                <span className="flex items-center gap-1.5 text-[#7A756D] dark:text-[#9DB0B5]">
                  <span className="w-3 h-0.5 border-b border-dashed border-[#7A756D] inline-block"></span>
                  Calm Baseline (3.0)
                </span>
              </>
            )}
            {chartViewMode === 'breakdown' && (
              <>
                <span className="flex items-center gap-1.5 text-[#4A8B8D] dark:text-[#63C1C4]">
                  <span className="w-3 h-3 rounded-full bg-[#4A8B8D] dark:bg-[#63C1C4] inline-block"></span> Mood Index
                </span>
                <span className="flex items-center gap-1.5 text-[#5B8DEF]">
                  <span className="w-3 h-3 rounded-full bg-[#5B8DEF] inline-block"></span> Rest / Sleep
                </span>
                <span className="flex items-center gap-1.5 text-[#E5A93C]">
                  <span className="w-3 h-3 rounded-full bg-[#E5A93C] inline-block"></span> Energy
                </span>
                <span className="flex items-center gap-1.5 text-[#E98A72]">
                  <span className="w-3 h-3 rounded-full bg-[#E98A72] inline-block"></span> Stress
                </span>
              </>
            )}
            {chartViewMode === 'balance' && (
              <>
                <span className="flex items-center gap-1.5 text-[#4A8B8D] dark:text-[#63C1C4]">
                  <span className="w-3 h-3 rounded-full bg-[#4A8B8D] inline-block"></span> Energy & Recharge
                </span>
                <span className="flex items-center gap-1.5 text-[#E98A72]">
                  <span className="w-3 h-3 rounded-full bg-[#E98A72] inline-block"></span> Stress & Workload
                </span>
              </>
            )}
          </div>
          <span className="text-[11px] text-[#7A756D] dark:text-[#9DB0B5]">
            Logged: <strong className="text-[#2D2D2B] dark:text-[#F8FAFC]">{weekAverages.totalLogged} days</strong> in view
          </span>
        </div>

        {/* Dynamic Recharts Canvas */}
        <div className="h-60 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartViewMode === 'mood' ? (
              <AreaChart
                data={weekData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <defs>
                  <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#4A8B8D" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#4A8B8D" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D9" strokeOpacity={0.4} />
                <XAxis
                  dataKey="day"
                  stroke="#7A756D"
                  fontSize={11}
                  tickLine={false}
                  tick={{ fill: '#7A756D' }}
                  dy={6}
                />
                <YAxis
                  stroke="#7A756D"
                  fontSize={11}
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tickLine={false}
                  tick={{ fill: '#7A756D' }}
                />
                <ReferenceLine
                  y={3.0}
                  stroke="#7A756D"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{
                    value: 'Calm Baseline',
                    position: 'insideTopLeft',
                    fill: '#7A756D',
                    fontSize: 10,
                  }}
                />
                <Tooltip content={<CustomMoodTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Mood"
                  stroke="#4A8B8D"
                  strokeWidth={3.5}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                  activeDot={{ r: 6, fill: '#4A8B8D', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : chartViewMode === 'breakdown' ? (
              <LineChart
                data={weekData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D9" strokeOpacity={0.4} />
                <XAxis dataKey="day" stroke="#7A756D" fontSize={11} tickLine={false} dy={6} />
                <YAxis stroke="#7A756D" fontSize={11} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickLine={false} />
                <Tooltip content={<CustomMoodTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Mood"
                  stroke="#4A8B8D"
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: '#4A8B8D' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Rest"
                  stroke="#5B8DEF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#5B8DEF' }}
                />
                <Line
                  type="monotone"
                  dataKey="Energy"
                  stroke="#E5A93C"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#E5A93C' }}
                />
                <Line
                  type="monotone"
                  dataKey="Stress"
                  stroke="#E98A72"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#E98A72' }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={weekData}
                margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
                onClick={(e: any) => {
                  if (e && e.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(e.activeTooltipIndex);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D9" strokeOpacity={0.4} />
                <XAxis dataKey="day" stroke="#7A756D" fontSize={11} tickLine={false} dy={6} />
                <YAxis stroke="#7A756D" fontSize={11} domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tickLine={false} />
                <Tooltip content={<CustomMoodTooltip />} />
                <Bar dataKey="Energy" fill="#4A8B8D" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Stress" fill="#E98A72" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Interactive 7-Day Day Selector Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#7A756D] dark:text-[#9DB0B5]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">
              Tap any day to inspect reflections
            </span>
            <span>
              Peak Day:{' '}
              <strong className="text-[#4A8B8D] dark:text-[#63C1C4]">
                {weekAverages.highestDay?.day} ({weekAverages.highestDay?.Mood}/5)
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {weekData.slice(-7).map((d) => {
              const isSelected = activeDayDetail?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDayIndex(d.index)}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1 shadow-2xs ${
                    isSelected
                      ? 'bg-[#4A8B8D] text-white border-[#4A8B8D] scale-102 shadow-sm'
                      : 'bg-[#F9F7F2] dark:bg-[#161D20] border-[#E8E4D9] dark:border-[#2B383C] text-[#2D2D2B] dark:text-[#F8FAFC] hover:border-[#4A8B8D]/50'
                  }`}
                >
                  <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/80' : 'text-[#7A756D] dark:text-[#9DB0B5]'}`}>
                    {d.day}
                  </span>
                  <span className="text-base font-serif">{d.moodEmoji}</span>
                  <span className="text-xs font-bold">{d.Mood}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Expanded Reflection Note & Companion Insight */}
        {activeDayDetail && (
          <div className="p-4 sm:p-5 bg-[#F9F7F2] dark:bg-[#161D20] rounded-[24px] border border-[#E8E4D9] dark:border-[#2B383C] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E4D9] dark:border-[#2B383C] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{activeDayDetail.moodEmoji}</span>
                <div>
                  <span className="font-bold text-sm text-[#2D2D2B] dark:text-[#F8FAFC]">
                    {activeDayDetail.day}, {activeDayDetail.shortDate}
                  </span>
                  <span className="mx-2 text-[#7A756D] dark:text-[#9DB0B5]">•</span>
                  <span className="text-xs font-semibold text-[#4A8B8D] dark:text-[#63C1C4]">
                    {activeDayDetail.moodLabel} ({activeDayDetail.Mood} / 5.0)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#7A756D] dark:text-[#9DB0B5]">
                <span>Rest: <strong>{activeDayDetail.Rest}/5</strong></span>
                <span>Energy: <strong>{activeDayDetail.Energy}/5</strong></span>
                <span>Stress: <strong>{activeDayDetail.Stress}/5</strong></span>
              </div>
            </div>

            {/* Note if logged */}
            {activeDayDetail.journalNote ? (
              <div className="p-3 bg-white dark:bg-[#192225] rounded-xl border border-[#E8E4D9] dark:border-[#2B383C] text-xs sm:text-sm text-[#3D3A35] dark:text-[#F8FAFC] leading-relaxed italic">
                "{activeDayDetail.journalNote}"
              </div>
            ) : (
              <p className="text-xs text-[#7A756D] dark:text-[#9DB0B5]">
                No written journal note was logged for this reflection.
              </p>
            )}

            {/* Weekly Companion Insight Summary */}
            <div className="flex items-start gap-2.5 pt-1 text-xs text-[#3D3A35] dark:text-[#F8FAFC]">
              <Lightbulb className="w-4 h-4 text-[#E98A72] shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong>{safeCompanion.name}'s Weekly Synthesis: </strong>
                {dominantPattern}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Non-Clinical Personalized Gentle Nudges & 4-7-8 Breathing Pacer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive 4-7-8 Breathing Card in Warm Teal */}
        <div className="bg-[#4A8B8D] text-white p-6 sm:p-8 rounded-[36px] shadow-sm space-y-5 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-widest text-[#D1E5E6] flex items-center gap-1.5">
                <Wind className="w-4 h-4" /> 4-7-8 Calming Reset
              </span>
              <span className="text-xs bg-white/20 px-3 py-0.5 rounded-full text-white font-medium">
                2 Minutes
              </span>
            </div>
            <h4 className="font-serif italic text-2xl text-white">{t.breathingPacer || 'Vagus Nerve Calming Pacer'}</h4>
            <p className="text-xs sm:text-sm text-[#D1E5E6] leading-relaxed">
              {language === 'ta' ? 'தேர்வு அல்லது வைவாவுக்கு முன் இதயத் துடிப்பை சீராக்கி மனதை அமைதிப்படுத்துகிறது.' : language === 'tanglish' ? 'Lab viva or exam munnadi mind and heartbeat-ah relax panna help pannum.' : 'Gently slows heart rate and centers your mind before a lab viva or exam.'}
            </p>
          </div>

          {/* Animated Visual Breathing Orb */}
          <div className="flex flex-col items-center justify-center py-4">
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000 border-2 border-white/40 ${
                isBreathingActive
                  ? breathPhaseIndex === 0
                    ? 'scale-125 bg-white/30 shadow-[0_0_30px_rgba(255,255,255,0.4)]'
                    : breathPhaseIndex === 1
                    ? 'scale-125 bg-[#F5D5CB]/40'
                    : 'scale-90 bg-white/15'
                  : 'bg-white/20'
              }`}
            >
              <span className="text-xs font-bold text-white text-center px-2">
                {isBreathingActive ? getBreathLabel() : (language === 'ta' ? 'தொடங்க தயாரா?' : language === 'tanglish' ? 'Start pannalaama?' : 'Ready to begin?')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="flex-1 py-3 px-4 bg-white hover:bg-[#F0EDE4] text-[#4A8B8D] rounded-full font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBreathingActive ? (
                <>
                  <Pause className="w-4 h-4" /> {t.stopExercise || 'Pause Pacer'}
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-[#4A8B8D]" /> {t.startExercise || 'Start 4-7-8 Breathing'}
                </>
              )}
            </button>

            {onOpenRelax && (
              <button
                onClick={onOpenRelax}
                className="py-3 px-4 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap border border-white/30"
                title="Open full Interactive Mind Relax Room"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5D5CB]" />
                <span>All Activities →</span>
              </button>
            )}
          </div>
        </div>

        {/* Gentle College Wellbeing Tips */}
        <div className="bg-white dark:bg-[#192225] p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] dark:border-[#2B383C] shadow-sm space-y-4 flex flex-col justify-between transition-colors">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#E98A72] flex items-center gap-1.5">
              <Compass className="w-4 h-4" /> Gentle Campus Rhythms
            </span>
            <h4 className="font-serif italic text-2xl text-[#2D2D2B] dark:text-[#F8FAFC] mt-1.5">
              Hostel & Study Nudges
            </h4>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#161D20] rounded-[20px] border border-[#E8E4D9] dark:border-[#2B383C] flex items-start gap-3">
              <BedDouble className="w-4 h-4 text-[#4A8B8D] dark:text-[#63C1C4] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#2D2D2B] dark:text-[#F8FAFC]">Hostel Blue-Light Cutoff: </span>
                <span className="text-[#7A756D] dark:text-[#9DB0B5]">Set your phone on Do Not Disturb 20 mins before bed during exam weeks.</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#161D20] rounded-[20px] border border-[#E8E4D9] dark:border-[#2B383C] flex items-start gap-3">
              <Coffee className="w-4 h-4 text-[#E98A72] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#2D2D2B] dark:text-[#F8FAFC]">Chai & Walk Interval: </span>
                <span className="text-[#7A756D] dark:text-[#9DB0B5]">Continuous 5-hour desk sprints reduce retention by 40%. Take a 10-min tea stroll.</span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenCompanionChat}
            className="w-full py-2.5 px-4 bg-[#F0EDE4] dark:bg-[#161D20] hover:bg-[#E8E4D9] dark:hover:bg-[#1C2527] text-[#4A8B8D] dark:text-[#63C1C4] rounded-full font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Ask {companion.name} for study-pacing ideas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🤝 INNOVATION #7: SMART HUMAN ESCALATION PROTOCOL */}
      <SmartEscalationBanner
        onOpenCounsellorBooking={onOpenCounsellorBooking}
        onOpenCrisisBar={onOpenCrisisBar}
      />

      {/* 4. "LEAVE A MESSAGE FOR FUTURE YOU" TIME CAPSULE */}
      <div className="bg-white dark:bg-[#192225] p-6 sm:p-8 rounded-[36px] border border-[#E8E4D9] dark:border-[#2B383C] shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0EDE4] dark:bg-[#161D20] rounded-full flex items-center justify-center text-[#4A8B8D] dark:text-[#63C1C4]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic text-xl sm:text-2xl text-[#2D2D2B] dark:text-[#F8FAFC]">
                Messages For Future You
              </h3>
              <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9DB0B5]">
                Comfort notes the app resurfaces on harder days so your own words uplift you.
              </p>
            </div>
          </div>

          <button
            id="create-future-msg-btn"
            onClick={() => setIsNewMessageOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Capsule Note</span>
          </button>
        </div>

        {/* Message Capsules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {futureMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => setSelectedMessageToView(msg)}
              className="p-4 bg-[#F9F7F2] dark:bg-[#161D20] hover:bg-[#F0EDE4] dark:hover:bg-[#1C2527] rounded-[24px] border border-[#E8E4D9] dark:border-[#2B383C] hover:border-[#4A8B8D]/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-2xs"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-white dark:bg-[#192225] border border-[#E8E4D9] dark:border-[#2B383C] rounded-full text-[#4A8B8D] dark:text-[#63C1C4] inline-block">
                  Trigger: {msg.triggerTag.replace('-', ' ')}
                </span>
                <h5 className="font-bold text-xs sm:text-sm text-[#2D2D2B] dark:text-[#F8FAFC] line-clamp-1">{msg.title}</h5>
                <p className="text-xs text-[#7A756D] dark:text-[#9DB0B5] line-clamp-2 leading-relaxed">
                  {msg.content}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7A756D] dark:text-[#9DB0B5] pt-2 border-t border-[#E8E4D9] dark:border-[#2B383C]">
                <span>{new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                <span className="text-[#4A8B8D] dark:text-[#63C1C4] font-semibold hover:underline">Open capsule →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Future Message Creation Modal */}
      <AnimatePresence>
        {isNewMessageOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#192225] w-full max-w-md rounded-[32px] shadow-2xl border border-[#E8E4D9] dark:border-[#2B383C] overflow-hidden"
            >
              <div className="p-5 bg-[#4A8B8D] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-[#F5D5CB]" />
                  <h4 className="font-serif italic text-lg font-bold">Leave a message for future you</h4>
                </div>
                <button
                  onClick={() => setIsNewMessageOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full cursor-pointer text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateFutureMessage} className="p-5 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F8FAFC] mb-1.5">
                    When should the app resurface this note?
                  </label>
                  <select
                    value={msgTrigger}
                    onChange={(e) => setMsgTrigger(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F9F7F2] dark:bg-[#161D20] border border-[#E8E4D9] dark:border-[#2B383C] rounded-xl text-xs font-medium text-[#2D2D2B] dark:text-[#F8FAFC]"
                  >
                    <option value="hard-day">On an overwhelming / low-energy day</option>
                    <option value="exam-anxiety">When exam / viva anxiety is high</option>
                    <option value="lonely">When feeling lonely in the hostel</option>
                    <option value="self-doubt">During placement / comparison self-doubt</option>
                    <option value="general">Surprise me randomly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F8FAFC] mb-1.5">Note Title</label>
                  <input
                    type="text"
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    placeholder="e.g. You survived 1st year viva, you can do this too!"
                    className="w-full p-3 bg-[#F9F7F2] dark:bg-[#161D20] border border-[#E8E4D9] dark:border-[#2B383C] rounded-xl text-xs font-medium text-[#2D2D2B] dark:text-[#F8FAFC]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D2D2B] dark:text-[#F8FAFC] mb-1.5">
                    What would you tell yourself right now?
                  </label>
                  <textarea
                    value={msgContent}
                    onChange={(e) => setMsgContent(e.target.value)}
                    rows={4}
                    placeholder="Write honest, encouraging words from your calm state to your future stressed self..."
                    className="w-full p-3 bg-[#F9F7F2] dark:bg-[#161D20] border border-[#E8E4D9] dark:border-[#2B383C] rounded-xl text-xs font-medium text-[#2D2D2B] dark:text-[#F8FAFC] resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewMessageOpen(false)}
                    className="flex-1 py-2.5 bg-[#F0EDE4] dark:bg-[#161D20] hover:bg-[#E8E4D9] text-[#3D3A35] dark:text-[#F8FAFC] text-xs font-semibold rounded-full"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white text-xs font-semibold rounded-full shadow-xs"
                  >
                    Seal Note in Vault
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Selected Message Modal */}
      <AnimatePresence>
        {selectedMessageToView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#2D2D2B]/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#192225] w-full max-w-md rounded-[32px] shadow-2xl border border-[#E8E4D9] dark:border-[#2B383C] overflow-hidden"
            >
              <div className="p-5 bg-[#F0EDE4] dark:bg-[#161D20] border-b border-[#E8E4D9] dark:border-[#2B383C] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#4A8B8D] dark:text-[#63C1C4]" />
                  <span className="font-bold text-xs text-[#4A8B8D] dark:text-[#63C1C4] uppercase tracking-wider">
                    Message from Past You
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMessageToView(null)}
                  className="p-1 hover:bg-[#E8E4D9] dark:hover:bg-[#253235] rounded-full text-[#7A756D] dark:text-[#9DB0B5] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <h4 className="font-serif italic text-lg font-bold text-[#2D2D2B] dark:text-[#F8FAFC]">
                  {selectedMessageToView.title}
                </h4>
                <div className="p-4 bg-[#F9F7F2] dark:bg-[#161D20] rounded-2xl border border-[#E8E4D9] dark:border-[#2B383C] text-xs sm:text-sm text-[#3D3A35] dark:text-[#F8FAFC] leading-relaxed italic whitespace-pre-wrap">
                  "{selectedMessageToView.content}"
                </div>

                <div className="text-[11px] text-[#7A756D] dark:text-[#9DB0B5] text-right">
                  Written on {new Date(selectedMessageToView.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>

                <button
                  onClick={() => setSelectedMessageToView(null)}
                  className="w-full py-3 bg-[#4A8B8D] hover:bg-[#376F71] text-white rounded-full font-bold text-xs shadow-xs cursor-pointer"
                >
                  Thank you, past me ❤️
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

