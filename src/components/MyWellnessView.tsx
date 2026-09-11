import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
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
  Legend,
} from 'recharts';
import {
  Activity,
  BarChart3,
  Moon,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  Heart,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
} from 'lucide-react';
import {
  CheckinData,
  PersonalCopingProfile,
  InterventionOutcome,
  StressForecast,
  AppLanguage,
  CompanionConfig,
} from '../types';
import { PersonalCopingEngineCard } from './PersonalCopingEngineCard';
import { I18N_TEXT } from '../data/mockData';

interface MyWellnessViewProps {
  checkins: CheckinData[];
  copingProfile: PersonalCopingProfile;
  interventionOutcomes: InterventionOutcome[];
  forecast: StressForecast;
  language: AppLanguage;
  companion: CompanionConfig;
  streakDays: number;
  onOpenCheckin: () => void;
  onOpenRelax: () => void;
  onSelectIntervention: (type: any) => void;
  onOpenMoment: () => void;
}

export const MyWellnessView: React.FC<MyWellnessViewProps> = ({
  checkins,
  copingProfile,
  interventionOutcomes,
  forecast,
  language,
  companion,
  streakDays,
  onOpenCheckin,
  onOpenRelax,
  onSelectIntervention,
  onOpenMoment,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [metricTab, setMetricTab] = useState<'overview' | 'sleep-stress' | 'strategies'>('overview');

  // Format data for charts
  const chartData = useMemo(() => {
    const count = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const slice = checkins.slice(-count);

    return slice.map((c, idx) => {
      const dateObj = new Date(c.timestamp || c.dateStr);
      const dayName = isNaN(dateObj.getTime())
        ? `Day ${idx + 1}`
        : dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'short' });
      const shortDate = isNaN(dateObj.getTime())
        ? c.dateStr
        : dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { month: 'short', day: 'numeric' });

      // Calculated composite wellbeing (1 - 5)
      const stressContribution = 6 - (c.stress || 3);
      const sleepContribution = c.sleep || 3;
      const energyContribution = c.energy || 3;
      const socialContribution = c.social || 3;
      const rawWellbeing =
        (stressContribution * 1.2 + sleepContribution * 1.0 + energyContribution * 1.0 + socialContribution * 0.8) /
        4.0;

      return {
        id: c.id,
        day: dayName,
        date: shortDate,
        Wellbeing: Number(Math.max(1, Math.min(5, rawWellbeing)).toFixed(1)),
        Sleep: c.sleep || 3,
        Energy: c.energy || 3,
        Stress: c.stress || 3,
        Workload: c.workload || 3,
        journalNote: c.journalNote,
        isQuietPulse: c.isQuietPulse,
      };
    });
  }, [checkins, timeRange, language]);

  // Summary Metrics
  const summary = useMemo(() => {
    if (!chartData.length) {
      return { avgWellbeing: 3.5, avgStress: 2.8, avgSleep: 3.2, avgEnergy: 3.4 };
    }
    const len = chartData.length;
    return {
      avgWellbeing: Number((chartData.reduce((acc, d) => acc + d.Wellbeing, 0) / len).toFixed(1)),
      avgStress: Number((chartData.reduce((acc, d) => acc + d.Stress, 0) / len).toFixed(1)),
      avgSleep: Number((chartData.reduce((acc, d) => acc + d.Sleep, 0) / len).toFixed(1)),
      avgEnergy: Number((chartData.reduce((acc, d) => acc + d.Energy, 0) / len).toFixed(1)),
    };
  }, [chartData]);

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <div className="bg-linear-to-br from-[#4A8B8D]/15 via-white to-[#E98A72]/10 dark:from-[#1A2528] dark:via-[#161E20] dark:to-[#221C1B] rounded-3xl p-5 sm:p-6 border border-[#E8E4D9] dark:border-[#263539] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                My Wellness Dashboard
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#7A756D] dark:text-[#9BA3AF]">
              Track your emotional rhythm, sleep resilience, and personalized coping outcomes over time.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3.5 py-1.5 bg-white dark:bg-[#1E292B] rounded-2xl border border-[#E8E4D9] dark:border-[#2F3D42] flex items-center gap-1.5 shadow-2xs">
              <Flame className="w-4 h-4 text-[#E98A72] fill-[#E98A72]" />
              <span className="text-xs font-bold font-mono text-[#2D2D2B] dark:text-[#F3F6F8]">
                {streakDays} Day Streak
              </span>
            </div>
            <button
              onClick={onOpenCheckin}
              className="px-3.5 py-1.5 bg-[#4A8B8D] hover:bg-[#376F71] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Log Pulse</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="bg-white/90 dark:bg-[#1E292B]/90 p-3 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9BA3AF] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#4A8B8D]" /> Avg Wellbeing
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#2D2D2B] dark:text-[#F3F6F8]">
                {summary.avgWellbeing}
              </span>
              <span className="text-[10px] text-[#7A756D]">/ 5.0</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#1E292B]/90 p-3 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9BA3AF] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#E98A72]" /> Stress Level
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#2D2D2B] dark:text-[#F3F6F8]">
                {summary.avgStress}
              </span>
              <span className="text-[10px] text-[#7A756D]">/ 5.0</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#1E292B]/90 p-3 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9BA3AF] flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-500" /> Sleep Quality
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#2D2D2B] dark:text-[#F3F6F8]">
                {summary.avgSleep}
              </span>
              <span className="text-[10px] text-[#7A756D]">/ 5.0</span>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-[#1E292B]/90 p-3 rounded-2xl border border-[#E8E4D9]/80 dark:border-[#2F3D42]/80 shadow-2xs">
            <span className="text-[11px] font-semibold text-[#7A756D] dark:text-[#9BA3AF] flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Energy Baseline
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-[#2D2D2B] dark:text-[#F3F6F8]">
                {summary.avgEnergy}
              </span>
              <span className="text-[10px] text-[#7A756D]">/ 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Wellbeing Trajectory Chart */}
      <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E4D9]/60 dark:border-[#2F3D42]/60 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4A8B8D]" /> Wellbeing & Stress Rhythm
            </h3>
            <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF]">
              Continuous trend over your recent check-in periods
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-[#F0EDE4] dark:bg-[#253235] p-1 rounded-xl self-start sm:self-auto">
            {(['7d', '14d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-[#1A2326] text-[#4A8B8D] dark:text-[#63C1C4] shadow-2xs'
                    : 'text-[#7A756D] hover:text-[#2D2D2B]'
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="wellbeingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A8B8D" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4A8B8D" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E98A72" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E98A72" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#88888820" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888' }} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#888' }} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-[#1A2326] p-3 rounded-2xl shadow-xl border border-[#E8E4D9] dark:border-[#2F3D42] text-xs space-y-1">
                        <p className="font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">{d.day} ({d.date})</p>
                        <p className="text-[#4A8B8D] font-semibold">Wellbeing: {d.Wellbeing} / 5</p>
                        <p className="text-[#E98A72] font-semibold">Stress: {d.Stress} / 5</p>
                        <p className="text-indigo-500">Sleep: {d.Sleep} / 5 • Energy: {d.Energy} / 5</p>
                        {d.journalNote && (
                          <p className="text-[#7A756D] italic text-[11px] mt-1 pt-1 border-t border-[#E8E4D9]/40">
                            "{d.journalNote}"
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => <span className="text-[#2D2D2B] dark:text-[#F3F6F8] font-medium">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="Wellbeing"
                name="Overall Wellbeing"
                stroke="#4A8B8D"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#wellbeingGrad)"
              />
              <Line
                type="monotone"
                dataKey="Stress"
                name="Stress Strain"
                stroke="#E98A72"
                strokeWidth={2}
                dot={{ r: 3, fill: '#E98A72' }}
              />
              <Line
                type="monotone"
                dataKey="Sleep"
                name="Rest Quality"
                stroke="#6366F1"
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personal Coping Profile & Strategy Efficacy Leaderboard */}
      <PersonalCopingEngineCard
        copingProfile={copingProfile}
        interventionOutcomes={interventionOutcomes}
        onSelectIntervention={onSelectIntervention}
        onOpenMomentModal={onOpenMoment}
      />

      {/* Recent Check-in Logs Timeline */}
      <div className="bg-white dark:bg-[#161E20] rounded-3xl p-5 border border-[#E8E4D9] dark:border-[#223034] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#2D2D2B] dark:text-[#F3F6F8] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4A8B8D]" /> Check-in History
          </h3>
          <span className="text-xs text-[#7A756D]">{checkins.length} entries recorded</span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {checkins.slice().reverse().map((c, i) => (
            <div
              key={c.id || i}
              className="p-3.5 rounded-2xl bg-[#F9F7F2] dark:bg-[#1C2527] border border-[#E8E4D9] dark:border-[#2F3D42] flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2D2D2B] dark:text-[#F3F6F8]">
                    {new Date(c.timestamp || c.dateStr).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {c.isQuietPulse && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-200 rounded-full font-bold">
                      Quick Pulse
                    </span>
                  )}
                </div>
                {c.journalNote && (
                  <p className="text-xs text-[#7A756D] dark:text-[#9BA3AF] line-clamp-1">"{c.journalNote}"</p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-[#E98A72]" title="Stress">
                  ⚡ {c.stress || 3}/5
                </span>
                <span className="flex items-center gap-1 text-indigo-500" title="Sleep">
                  🌙 {c.sleep || 3}/5
                </span>
                <span className="flex items-center gap-1 text-amber-500" title="Energy">
                  ⚡ {c.energy || 3}/5
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
